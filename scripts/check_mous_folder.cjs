const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const url = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(url, key);

async function run() {
  const { data: files } = await sb.storage.from('mou-documents').list('mous', { limit: 100 });
  console.log('Files in mou-documents/mous:', JSON.stringify(files, null, 2));
}
run();

