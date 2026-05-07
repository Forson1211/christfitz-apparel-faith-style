import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://txhovpomafiomlfbegpx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aG92cG9tYWZpb21sZmJlZ3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDEzMTUsImV4cCI6MjA5MzExNzMxNX0.OJhaN3dyGupd_4eQNQg7KGSewX95fx1SkJEBZUI5b2s";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkTable() {
  console.log("Checking for 'subscribers' table...");
  const { data, error } = await supabase.from("subscribers").select("*").limit(1);
  
  if (error) {
    console.error("Error:", error.message);
    if (error.message.includes("relation \"subscribers\" does not exist")) {
      console.log("Table does not exist. Migration needs to be applied.");
    }
  } else {
    console.log("Success! Table exists and is accessible.");
  }
}

checkTable();
