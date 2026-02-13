import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import Anthropic from "@anthropic-ai/sdk";
import { resolveSystemPrompt } from "@/lib/systemPrompt";
import { x402Server, chatPaymentConfig } from "@/lib/x402";
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

/**
 * Paid coaching endpoint — identical to /api/chat but gated behind x402.
 * Users pay ~$0.01 USDC per interaction on Base (Sepolia for testnet).
 *
 * Flow:
 * 1. Client sends POST without payment → gets 402 with payment requirements
 * 2. Client signs USDC permit via wallet → retries with X-PAYMENT header
 * 3. x402 validates payment, runs handler, settles on-chain if status < 400
 */
type PaidChatResponse = { content: string | null; error: string | null };

const handler = async (req: NextRequest): Promise<NextResponse<PaidChatResponse>> => {
  try {
    const body: unknown = await req.json();

    if (!isValidBody(body)) {
      return NextResponse.json(
        { content: null, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { messages, agentName, coachingStyle, agentDbId } = body;
    const systemPrompt = await resolveSystemPrompt(agentName, coachingStyle, agentDbId);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const firstBlock = response.content[0];
    const text =
      firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

    return NextResponse.json({ content: text, error: null });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ content: null, error: message }, { status: 500 });
  }
};

export const POST = withX402(handler, chatPaymentConfig, x402Server);
