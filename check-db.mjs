import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.includes('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].replace(/['";]/g, '').trim();
  if (line.includes('VITE_SUPABASE_PUBLISHABLE_KEY=')) supabaseKey = line.split('=')[1].replace(/['";]/g, '').trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('content').select('*').limit(5);
  console.log('CONTENT ROWS:');
  console.log(JSON.stringify(data, null, 2));
  if (error) console.error('ERROR:', error);
}

check();
