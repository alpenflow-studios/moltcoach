-- Agent memory notes — extracted facts from conversations
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/agvdivapnrqpstvhkbmk/sql

CREATE TABLE IF NOT EXISTS agent_memory_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_memory_notes_agent_id ON agent_memory_notes (agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_notes_created_at ON agent_memory_notes (created_at);

ALTER TABLE agent_memory_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON agent_memory_notes
  FOR ALL
  USING (auth.role() = 'service_role');
