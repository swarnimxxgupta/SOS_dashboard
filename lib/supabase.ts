import { createClient } from "@supabase/supabase-js";

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are missing. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file."
  );
}

// Create a single supabase client for the entire app
// Only create the client if both URL and key are available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Types for our database tables
export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  status: "active" | "inactive" | "on_leave";
  orders_today: number;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: number;
  patient: string;
  destination: string;
  time: string;
  status: "pending" | "accepted" | "rejected";
  driver_id?: string;
  created_at: string;
  updated_at: string;
};

export type OrderHistory = {
  id: number;
  order_id: number;
  patient: string;
  destination: string;
  time: string;
  status: "accepted" | "rejected";
  driver_id: string;
  action_time: string;
};
