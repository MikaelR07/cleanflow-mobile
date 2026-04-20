import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Try to find .env files
const envPath = path.resolve(process.cwd(), 'apps/agent/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Env vars not found at', envPath);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns in profiles table:', Object.keys(data[0]));
  } else {
    console.log('No profiles found to check schema.');
  }
}

checkSchema();
