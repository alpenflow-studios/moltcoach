-- Add onboarding_complete flag to agents table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/agvdivapnrqpstvhkbmk/sql

ALTER TABLE agents ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false NOT NULL;
