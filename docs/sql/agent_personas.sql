-- Agent persona table — stores onboarding interview results
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/agvdivapnrqpstvhkbmk/sql

CREATE TABLE IF NOT EXISTS agent_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
  fitness_level TEXT,
  goals TEXT,
  motivation TEXT,
  schedule TEXT,
  injuries TEXT,
  preferred_workout_types TEXT,
  communication_preferences TEXT,
  additional_context TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_personas_agent_id ON agent_personas (agent_id);

ALTER TABLE agent_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON agent_personas
  FOR ALL
  USING (auth.role() = 'service_role');
