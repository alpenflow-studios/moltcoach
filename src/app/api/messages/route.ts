import { createServerClient } from "@/lib/supabase";

type SaveBody = {
  walletAddress: string;
  agentIdOnchain: number;
  messages: { role: "user" | "assistant"; content: string }[];
};

function isValidBody(body: unknown): body is SaveBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.walletAddress === "string" &&
    typeof b.agentIdOnchain === "number" &&
    Array.isArray(b.messages) &&
    b.messages.length > 0
  );
}

/** GET — Load chat history for a wallet + agent */
export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const wallet = url.searchParams.get("wallet")?.toLowerCase();
    const agentIdOnchain = url.searchParams.get("agentId");

    if (!wallet || !agentIdOnchain) {
      return Response.json({ error: "wallet and agentId params required" }, { status: 400 });
    }

    const db = createServerClient();

    // Look up user + agent IDs
    const { data: user } = await db
      .from("users")
      .select("id")
      .eq("wallet_address", wallet)
      .single();

    if (!user) {
      return Response.json([]);
    }

    const { data: agent } = await db
      .from("agents")
      .select("id")
      .eq("agent_id_onchain", Number(agentIdOnchain))
      .single();

    if (!agent) {
      return Response.json([]);
    }

    const { data: messages } = await db
      .from("messages")
      .select("role, content, created_at")
      .eq("user_id", user.id)
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: true })
      .limit(100);

    return Response.json(
      (messages ?? []).map((m) => ({ role: m.role, content: m.content })),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}

/** POST — Save new message pairs (user + assistant) */
export async function POST(req: Request): Promise<Response> {
  try {
    const body: unknown = await req.json();
    if (!isValidBody(body)) {
      return Response.json(
        { error: "walletAddress, agentIdOnchain, and messages required" },
        { status: 400 },
      );
    }

    const db = createServerClient();
    const wallet = body.walletAddress.toLowerCase();

    // Look up user
    const { data: user } = await db
      .from("users")
      .select("id")
      .eq("wallet_address", wallet)
      .single();

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Look up agent
    const { data: agent } = await db
      .from("agents")
      .select("id")
      .eq("agent_id_onchain", body.agentIdOnchain)
      .single();

    if (!agent) {
      return Response.json({ error: "Agent not found" }, { status: 404 });
    }

    // Insert messages
    const rows = body.messages.map((m) => ({
      user_id: user.id,
      agent_id: agent.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const { error } = await db.from("messages").insert(rows);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ saved: rows.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
