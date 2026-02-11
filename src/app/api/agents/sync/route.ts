import { createServerClient } from "@/lib/supabase";

type SyncBody = {
  walletAddress: string;
  agentIdOnchain: number;
  name: string;
  coachingStyle: string;
  agentUri: string;
};

function isValidBody(body: unknown): body is SyncBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.walletAddress === "string" &&
    typeof b.agentIdOnchain === "number" &&
    typeof b.name === "string" &&
    typeof b.coachingStyle === "string" &&
    typeof b.agentUri === "string"
  );
}

/** Upsert agent record in Supabase (idempotent sync from on-chain data) */
export async function POST(req: Request): Promise<Response> {
  try {
    const body: unknown = await req.json();
    if (!isValidBody(body)) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = createServerClient();
    const wallet = body.walletAddress.toLowerCase();

    // Ensure user exists
    const { data: user } = await db
      .from("users")
      .upsert({ wallet_address: wallet }, { onConflict: "wallet_address" })
      .select("id")
      .single();

    if (!user) {
      return Response.json({ error: "Failed to resolve user" }, { status: 500 });
    }

    // Map coaching style to DB enum (drill-sergeant → drill_sergeant)
    const dbStyle = body.coachingStyle.replace("-", "_");

    // Upsert agent
    const { data: agent, error } = await db
      .from("agents")
      .upsert(
        {
          user_id: user.id,
          agent_id_onchain: body.agentIdOnchain,
          name: body.name,
          coaching_style: dbStyle,
          agent_uri: body.agentUri,
        },
        { onConflict: "agent_id_onchain" },
      )
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(agent);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
