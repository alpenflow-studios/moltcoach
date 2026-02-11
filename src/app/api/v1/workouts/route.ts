import { verifyAgentRequest } from "@/middleware/agent-auth";
import { NextResponse } from "next/server";

type WorkoutBody = {
  workoutType: string;
  durationMinutes: number;
  caloriesBurned?: number;
  source: string;
  completedAt: string;
};

function isValidWorkoutBody(body: unknown): body is WorkoutBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.workoutType === "string" &&
    typeof b.durationMinutes === "number" &&
    typeof b.source === "string" &&
    typeof b.completedAt === "string"
  );
}

export async function POST(request: Request): Promise<Response> {
  const auth = await verifyAgentRequest(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { error: "Unauthorized", reason: auth.reason },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!isValidWorkoutBody(body)) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        expected: {
          workoutType: "string",
          durationMinutes: "number",
          source: "string",
          completedAt: "string (ISO 8601)",
          caloriesBurned: "number (optional)",
        },
      },
      { status: 400 },
    );
  }

  // TODO: Store in Supabase when TASK-009 completes
  return NextResponse.json({
    success: true,
    agentId: auth.agentId.toString(),
    address: auth.address,
    workout: body,
    message: "Workout logged (storage pending Supabase integration)",
  });
}
