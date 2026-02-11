import { createServerClient } from "@/lib/supabase";

type UpsertBody = {
  walletAddress: string;
};

function isValidBody(body: unknown): body is UpsertBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return typeof b.walletAddress === "string" && b.walletAddress.length > 0;
}

/** Upsert a user record by wallet address. Returns the user row. */
export async function POST(req: Request): Promise<Response> {
  try {
    const body: unknown = await req.json();
    if (!isValidBody(body)) {
      return Response.json({ error: "walletAddress is required" }, { status: 400 });
    }

    const db = createServerClient();
    const wallet = body.walletAddress.toLowerCase();

    const { data, error } = await db
      .from("users")
      .upsert({ wallet_address: wallet }, { onConflict: "wallet_address" })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
