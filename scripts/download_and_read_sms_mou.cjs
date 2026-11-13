const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const url = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(url, key);

async function run() {
  const { data, error } = await sb.storage.from('mou-documents').download('mous/sms_mou_1793706545663_SMS_MOU_.pdf');
  if (error) {
    console.error('Download error:', error);
    return;
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync('scripts/sms_mou.pdf', buffer);
  console.log('Saved sms_mou.pdf, size:', buffer.length);

  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  console.log('PDF pages:', doc.numPages);
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');
    console.log(`=== PAGE ${i} ===`);
    console.log(text);
  }
}
run();

