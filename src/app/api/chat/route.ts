import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { checkRateLimit } from "@/lib/rateLimit";
import type { ChatMessage } from "@/types/chat";

const anthropic = new Anthropic();

type ChatRequestBody = {
  messages: ChatMessage[];
  agentName: string;
  coachingStyle: string;
};

function isValidBody(body: unknown): body is ChatRequestBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    Array.isArray(b.messages) &&
    typeof b.agentName === "string" &&
    typeof b.coachingStyle === "string" &&
    b.messages.length > 0
  );
}

export async function POST(req: Request): Promise<Response> {
  try {
    // Rate limit by wallet address (cost protection for Anthropic API)
    const walletAddress = req.headers.get("x-wallet-address");
    if (walletAddress) {
      const rl = await checkRateLimit(walletAddress);
      if (!rl.success) {
        const retryAfterSec = rl.reset
          ? Math.ceil((rl.reset - Date.now()) / 1000)
          : 60;
        const timeStr =
          retryAfterSec > 60
            ? `${Math.ceil(retryAfterSec / 60)} minutes`
            : `${retryAfterSec} seconds`;
        return Response.json(
          { error: `You've hit the ${rl.window} message limit (${rl.limit}). Try again in ${timeStr}.` },
          { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
        );
      }
    }

    const body: unknown = await req.json();

    if (!isValidBody(body)) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { messages, agentName, coachingStyle } = body;

    const systemPrompt = buildSystemPrompt(agentName, coachingStyle);

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
