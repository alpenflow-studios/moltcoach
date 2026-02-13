import Anthropic from "@anthropic-ai/sdk";
import { resolveSystemPrompt } from "@/lib/systemPrompt";
import { checkRateLimit } from "@/lib/rateLimit";
import { checkFreeMessages } from "@/lib/freeMessages";
import { createServerClient } from "@/lib/supabase";
import type { ChatMessage } from "@/types/chat";

const anthropic = new Anthropic();

type ChatRequestBody = {
  messages: ChatMessage[];
  agentName: string;
  coachingStyle: string;
  agentDbId?: string;
};

function isValidBody(body: unknown): body is ChatRequestBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    Array.isArray(b.messages) &&
    typeof b.agentName === "string" &&
    typeof b.coachingStyle === "string" &&
    b.messages.length > 0 &&
    (b.agentDbId === undefined || typeof b.agentDbId === "string")
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

    const { messages, agentName, coachingStyle, agentDbId } = body;

    // Check free message quota (x402 paywall after limit)
    // Skip during onboarding — new users shouldn't hit paywall before setup completes
    if (walletAddress) {
      let isOnboarding = false;

      if (agentDbId) {
        const db = createServerClient();
        const { data: agent } = await db
          .from("agents")
          .select("onboarding_complete")
          .eq("id", agentDbId)
          .single();

        if (agent && !agent.onboarding_complete) {
          isOnboarding = true;
        }
      }

      if (!isOnboarding) {
        const free = await checkFreeMessages(walletAddress);
        if (!free.allowed) {
          return Response.json(
            {
              error: "free_tier_exceeded",
              used: free.used,
              limit: free.limit,
              paidEndpoint: "/api/chat/paid",
              message: `You've used ${free.limit} free messages. Continue coaching with x402 micro-payments ($0.01/message in USDC on Base).`,
            },
            { status: 402 },
          );
        }
      }
    }

    const systemPrompt = await resolveSystemPrompt(agentName, coachingStyle, agentDbId);

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
