import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://heqxpcrguaopiimsuqmk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlcXhwY3JndWFvcGlpbXN1cW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjM2NjgsImV4cCI6MjA5MTkzOTY2OH0.vGES_grqNJDhSJJPvodzAEn02uF7wScNIOk9AhIbczI'
);
async function run() {
  const { data, error } = await supabase.from('profiles').select('*').eq('phone', '0783962989');
  console.log(data, error);
}
run();
