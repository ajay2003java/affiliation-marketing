const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const url = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(url, key);

async function run() {
  console.log('Updating provider records in Supabase...');

  // 1. SMS Diagnostics
  const { data: sms, error: smsErr } = await sb.from('providers').update({
    city: 'Visakhapatnam',
    service_areas: ['Visakhapatnam', 'Maharanipeta', 'KGH Area', 'Pan-City']
  }).eq('id', 'cc2072e6-981f-4bc5-a0a7-1071b2e16d15').select();
  console.log('SMS Diagnostics updated:', sms, smsErr);

  // 2. Bhavya Laboratory (Eluru)
  const { data: bhavya, error: bErr } = await sb.from('providers').update({
    city: 'Eluru',
    service_areas: ['Eluru', 'Tangellamudi']
  }).eq('id', 'da5b832b-fff9-43fa-b385-7cf7d0806373').select();
  console.log('Bhavya Laboratory updated:', bhavya, bErr);

  // 3. Medicare Diagnostics (Eluru)
  const { data: medi, error: mErr } = await sb.from('providers').update({
    city: 'Eluru',
    service_areas: ['Eluru', 'Hanuman Nagar']
  }).eq('id', 'bbd7a7d2-6ade-451b-84d9-50a21ccbdbb7').select();
  console.log('Medicare Diagnostics updated:', medi, mErr);

  // 4. Nagarjuna's Diagnostics (Piduguralla)
  const { data: nag, error: nErr } = await sb.from('providers').update({
    city: 'Piduguralla',
    service_areas: ['Piduguralla', 'Palnadu']
  }).eq('id', '4cf50a7e-acc1-4407-a522-6419c5fd2226').select();
  console.log('Nagarjuna Diagnostics updated:', nag, nErr);

  // 5. Aseervadam's Dental (Visakhapatnam)
  const { data: aseer, error: aErr } = await sb.from('providers').update({
    city: 'Visakhapatnam',
    service_areas: ['Visakhapatnam', 'Jagadamba Junction', 'KGH Area', 'Pan-City']
  }).eq('id', '166759cd-34b3-4edb-b70f-72b781044e31').select();
  console.log('Aseervadam Dental updated:', aseer, aErr);

  // Verify
  const { data: all } = await sb.from('providers').select('id, business_name, city, address');
  console.log('\nAll updated providers:');
  console.table(all);
}

run();

