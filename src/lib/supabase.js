import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://itcabbgtcbziwoorxtxh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Y2FiYmd0Y2J6aXdvb3J4dHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTY4OTQsImV4cCI6MjA4Njk5Mjg5NH0.D5IeVqVUgRjBDzdTAHReZd2STR0Cy4LmstXYD-0FfKE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
