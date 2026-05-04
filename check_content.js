import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://txhovpomafiomlfbegpx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aG92cG9tYWZpb21sZmJlZ3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDEzMTUsImV4cCI6MjA5MzExNzMxNX0.OJhaN3dyGupd_4eQNQg7KGSewX95fx1SkJEBZUI5b2s";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkContent() {
  console.log("Checking ALL content table rows...");
  const { data, error } = await supabase
    .from('content')
    .select('*');
    
  if (error) {
    console.error("Error fetching content:", error);
    return;
  }
  
  console.log("Total items in content table:", data?.length);
  data?.forEach((item, i) => {
    console.log(`[${i}] ID: ${item.id}, Cat: ${item.category}, Pos: ${item.position}, Active: ${item.is_active}, URL: ${item.url}`);
  });
}

checkContent();
