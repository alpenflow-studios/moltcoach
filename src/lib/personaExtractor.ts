import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ChatMessage } from "@/types/chat";

const anthropic = new Anthropic();

const PersonaExtractionSchema = z.object({
  fitness_level: z.string().nullable(),
  goals: z.string().nullable(),
  motivation: z.string().nullable(),
  schedule: z.string().nullable(),
  injuries: z.string().nullable(),
  preferred_workout_types: z.string().nullable(),
  communication_preferences: z.string().nullable(),
  additional_context: z.string().nullable(),
  onboarding_complete: z.boolean(),
});

export type PersonaExtraction = z.infer<typeof PersonaExtractionSchema>;

/** Strip markdown code fences from LLM output */
function cleanJsonResponse(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return fenceMatch ? fenceMatch[1]!.trim() : trimmed;
}

/**
 * Extract persona fields from an onboarding conversation using Haiku.
 * Returns null if extraction fails (network error, parse error, etc.).
 */
export async function extractPersona(
  messages: ChatMessage[],
): Promise<PersonaExtraction | null> {
  try {
    const conversation = messages
      .map((m) => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`)
      .join("\n\n");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `You extract fitness persona data from coaching conversations. Return ONLY valid JSON with these fields:
- fitness_level: beginner/intermediate/advanced or null if not mentioned
- goals: comma-separated goals or null
- motivation: what drives them or null
- schedule: workout frequency and timing or null
- injuries: limitations or "none" or null if not discussed
- preferred_workout_types: exercise preferences or null
- communication_preferences: how they like to be coached or null
- additional_context: anything else relevant or null
- onboarding_complete: true ONLY when at least fitness_level, goals, AND schedule are all filled

Return JSON only, no markdown.`,
      messages: [
        {
          role: "user",
          content: `Extract persona from this conversation:\n\n${conversation}`,
        },
      ],
    });

    const firstBlock = response.content[0];
    if (!firstBlock || firstBlock.type !== "text") return null;

    const cleaned = cleanJsonResponse(firstBlock.text);
    const parsed: unknown = JSON.parse(cleaned);
    return PersonaExtractionSchema.parse(parsed);
  } catch {
    return null;
  }
}
