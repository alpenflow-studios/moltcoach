/** Supabase database types — matches schema from docs/SUPABASE_SETUP.md */
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
        Relationships: [];
      };
      agents: {
        Row: {
          id: string;
          user_id: string;
          agent_id_onchain: number;
          name: string;
          coaching_style: string;
          agent_uri: string;
          onboarding_complete: boolean;
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
          onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          coaching_style?: string;
          agent_uri?: string;
          onboarding_complete?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string | null;
          workout_type: string;
          duration_minutes: number;
          calories_burned: number | null;
          clawc_earned: string;
          source: string;
          verified: boolean;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id?: string | null;
          workout_type: string;
          duration_minutes: number;
          calories_burned?: number | null;
          clawc_earned?: string;
          source: string;
          verified?: boolean;
          completed_at: string;
          created_at?: string;
        };
        Update: {
          workout_type?: string;
          duration_minutes?: number;
          calories_burned?: number | null;
          clawc_earned?: string;
          verified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workouts_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
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
          session_type?: string;
          summary?: string | null;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          summary?: string | null;
          ended_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coaching_sessions_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: number;
          payment_token: "CLAWC" | "USDC" | "ETH";
          amount: string;
          tx_hash: string | null;
          starts_at: string;
          expires_at: string | null;
          auto_renew: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier: number;
          payment_token: "CLAWC" | "USDC" | "ETH";
          amount: string;
          tx_hash?: string | null;
          starts_at?: string;
          expires_at?: string | null;
          auto_renew?: boolean;
          created_at?: string;
        };
        Update: {
          tier?: number;
          expires_at?: string | null;
          auto_renew?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      telegram_links: {
        Row: {
          id: string;
          telegram_chat_id: string;
          wallet_address: string;
          telegram_username: string | null;
          linked_at: string;
        };
        Insert: {
          id?: string;
          telegram_chat_id: string;
          wallet_address: string;
          telegram_username?: string | null;
          linked_at?: string;
        };
        Update: {
          wallet_address?: string;
          telegram_username?: string | null;
        };
        Relationships: [];
      };
      agent_personas: {
        Row: {
          id: string;
          agent_id: string;
          fitness_level: string | null;
          goals: string | null;
          motivation: string | null;
          schedule: string | null;
          injuries: string | null;
          preferred_workout_types: string | null;
          communication_preferences: string | null;
          additional_context: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          fitness_level?: string | null;
          goals?: string | null;
          motivation?: string | null;
          schedule?: string | null;
          injuries?: string | null;
          preferred_workout_types?: string | null;
          communication_preferences?: string | null;
          additional_context?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          fitness_level?: string | null;
          goals?: string | null;
          motivation?: string | null;
          schedule?: string | null;
          injuries?: string | null;
          preferred_workout_types?: string | null;
          communication_preferences?: string | null;
          additional_context?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_personas_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: true;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      agent_memory_notes: {
        Row: {
          id: string;
          agent_id: string;
          content: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          content: string;
          category?: string;
          created_at?: string;
        };
        Update: {
          content?: string;
          category?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_memory_notes_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
