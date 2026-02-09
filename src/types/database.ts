/** Supabase database types — update when tables are created */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          wallet_address?: string;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          user_id: string;
          agent_id_onchain: number;
          name: string;
          coaching_style: string;
          agent_uri: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id_onchain: number;
          name: string;
          coaching_style: string;
          agent_uri: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          coaching_style?: string;
          agent_uri?: string;
          updated_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          workout_type: string;
          duration_minutes: number;
          calories_burned: number | null;
          fit_earned: string;
          source: string;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          workout_type: string;
          duration_minutes: number;
          calories_burned?: number | null;
          fit_earned: string;
          source: string;
          completed_at: string;
          created_at?: string;
        };
        Update: {
          workout_type?: string;
          duration_minutes?: number;
          calories_burned?: number | null;
          fit_earned?: string;
        };
      };
      coaching_sessions: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          session_type: string;
          summary: string | null;
          started_at: string;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          session_type: string;
          summary?: string | null;
          started_at: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          summary?: string | null;
          ended_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
