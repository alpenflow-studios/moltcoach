import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic();

const MemoryNoteSchema = z.object({
  content: z.string(),
  category: z.enum(["general", "preference", "achievement", "health", "schedule"]),
});

const MemoryExtractionSchema = z.object({
  notes: z.array(MemoryNoteSchema).max(3),
});

export type MemoryNote = z.infer<typeof MemoryNoteSchema>;

/** Strip markdown code fences from LLM output */
function cleanJsonResponse(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return fenceMatch ? fenceMatch[1]!.trim() : trimmed;
}

/**
 * Extract 0-3 memory notes from the latest chat exchange using Haiku.
 * Returns empty array if nothing notable or on failure.
 */
export async function extractMemoryNotes(
  userMessage: string,
  assistantMessage: string,
): Promise<MemoryNote[]> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: `You extract key facts worth remembering from fitness coaching conversations. Return ONLY valid JSON with a "notes" array (0-3 items). Each note has:
- content: a concise fact (1-2 sentences)
- category: one of "general", "preference", "achievement", "health", "schedule"

Only extract genuinely memorable information: personal details, preferences, achievements, health updates, schedule changes. Return {"notes": []} if nothing notable.

Return JSON only, no markdown.`,
      messages: [
        {
          role: "user",
          content: `Extract memorable facts from this exchange:\n\nUser: ${userMessage}\n\nCoach: ${assistantMessage}`,
        },
      ],
    });

    const firstBlock = response.content[0];
    if (!firstBlock || firstBlock.type !== "text") return [];

    const cleaned = cleanJsonResponse(firstBlock.text);
    const parsed: unknown = JSON.parse(cleaned);
    const result = MemoryExtractionSchema.parse(parsed);
    return result.notes;
  } catch {
    return [];
  }
}
