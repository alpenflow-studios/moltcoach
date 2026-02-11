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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
