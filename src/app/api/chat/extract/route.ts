import { z } from "zod";
import { createServerClient } from "@/lib/supabase";
import { extractPersona } from "@/lib/personaExtractor";
import { extractMemoryNotes } from "@/lib/memoryExtractor";

const MAX_MEMORY_NOTES = 50;

const ExtractRequestSchema = z.object({
  agentDbId: z.string().uuid(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
  latestUser: z.string(),
  latestAssistant: z.string(),
});

export async function POST(req: Request): Promise<Response> {
  try {
    const body: unknown = await req.json();
    const parsed = ExtractRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { agentDbId, messages, latestUser, latestAssistant } = parsed.data;
    const db = createServerClient();

    // Fetch agent's current onboarding status
    const { data: agent } = await db
      .from("agents")
      .select("id, onboarding_complete")
      .eq("id", agentDbId)
      .single();

    if (!agent) {
      return Response.json({ error: "Agent not found" }, { status: 404 });
    }

    if (!agent.onboarding_complete) {
      // --- ONBOARDING MODE: extract persona ---
      const persona = await extractPersona(messages);

      if (persona) {
        // Build upsert payload with only non-null fields
        const personaFields: Record<string, string> = {};
        if (persona.fitness_level) personaFields.fitness_level = persona.fitness_level;
        if (persona.goals) personaFields.goals = persona.goals;
        if (persona.motivation) personaFields.motivation = persona.motivation;
        if (persona.schedule) personaFields.schedule = persona.schedule;
        if (persona.injuries) personaFields.injuries = persona.injuries;
        if (persona.preferred_workout_types) personaFields.preferred_workout_types = persona.preferred_workout_types;
        if (persona.communication_preferences) personaFields.communication_preferences = persona.communication_preferences;
        if (persona.additional_context) personaFields.additional_context = persona.additional_context;

        if (Object.keys(personaFields).length > 0) {
          await db
            .from("agent_personas")
            .upsert(
              { agent_id: agentDbId, ...personaFields },
              { onConflict: "agent_id" },
            );
        }

        if (persona.onboarding_complete) {
          await db
            .from("agents")
            .update({ onboarding_complete: true })
            .eq("id", agentDbId);

          return Response.json({ onboardingComplete: true });
        }
      }

      return Response.json({ onboardingComplete: false });
    }

    // --- MEMORY MODE: extract notes from latest exchange ---
    const notes = await extractMemoryNotes(latestUser, latestAssistant);

    if (notes.length > 0) {
      // Check current count
      const { count } = await db
        .from("agent_memory_notes")
        .select("id", { count: "exact", head: true })
        .eq("agent_id", agentDbId);

      const currentCount = count ?? 0;
      const overflow = currentCount + notes.length - MAX_MEMORY_NOTES;

      // Prune oldest notes if exceeding cap
      if (overflow > 0) {
        const { data: oldest } = await db
          .from("agent_memory_notes")
          .select("id")
          .eq("agent_id", agentDbId)
          .order("created_at", { ascending: true })
          .limit(overflow);

        if (oldest && oldest.length > 0) {
          await db
            .from("agent_memory_notes")
            .delete()
            .in("id", oldest.map((n) => n.id));
        }
      }

      // Insert new notes
      await db.from("agent_memory_notes").insert(
        notes.map((n) => ({
          agent_id: agentDbId,
          content: n.content,
          category: n.category,
        })),
      );
    }

    return Response.json({ onboardingComplete: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
