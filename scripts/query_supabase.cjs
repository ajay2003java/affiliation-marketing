const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const url = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(url, key);

async function run() {
  console.log('--- Providers table ---');
  const { data: p, error: pErr } = await sb.from('providers').select('*');
  console.log('Providers:', JSON.stringify(p, null, 2), pErr);

  console.log('--- Storage mou-documents ---');
  const { data: files, error: fErr } = await sb.storage.from('mou-documents').list('', { limit: 100 });
  console.log('Files in mou-documents:', JSON.stringify(files, null, 2), fErr);

  console.log('--- Storage provider-rate-cards ---');
  const { data: rFiles, error: rErr } = await sb.storage.from('provider-rate-cards').list('', { limit: 100 });
  console.log('Rate card files:', JSON.stringify(rFiles, null, 2), rErr);
}
run();

