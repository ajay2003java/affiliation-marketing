/**
 * MoU Document Parser & Intelligence Service
 * Extracts real partner credentials, client email, contact details,
 * and commercial % from signed MoUs (PDF, Scanned Images, DOCX, TXT).
 */

export interface ExtractedMouData {
  businessName: string;
  tagline: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  serviceAreas: string;
  commissionPercent: string;
  description: string;
  hasExtractedEmail: boolean;
  rawTextPreview: string;
}

/**
 * Decompress deflate bytes using standard browser DecompressionStream
 */
async function decompressDeflate(bytes: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === 'undefined') {
    return '';
  }

  // 1. Try 'deflate' (zlib RFC 1950 header)
  try {
    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    writer.write(bytes as any);
    writer.close();
    const reader = ds.readable.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return new TextDecoder('utf-8').decode(merged);
  } catch {
    // 2. Try 'deflate-raw' (raw deflate RFC 1951)
    try {
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      writer.write(bytes as any);
      writer.close();
      const reader = ds.readable.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
      const merged = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      return new TextDecoder('utf-8').decode(merged);
    } catch {
      return '';
    }
  }
}

/**
 * Extracts raw text from a PDF file
 */
async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const latin1 = new TextDecoder('latin1').decode(bytes);

  const textPieces: string[] = [];

  // 1. Direct regex scan of uncompressed chunks (emails, phones, metadata)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const directEmails = latin1.match(emailRegex) || [];
  textPieces.push(...directEmails);

  // 2. Extract PDF stream blocks (FlateDecode compressed text)
  const streamStartRegex = /stream\r?\n/g;
  let match: RegExpExecArray | null;

  while ((match = streamStartRegex.exec(latin1)) !== null) {
    const startIdx = match.index + match[0].length;
    const endIdx = latin1.indexOf('endstream', startIdx);
    if (endIdx === -1) break;

    const streamBytes = bytes.subarray(startIdx, endIdx);
    if (streamBytes.length > 0) {
      try {
        const decompressed = await decompressDeflate(streamBytes);
        if (decompressed && decompressed.length > 0) {
          textPieces.push(decompressed);
        }
      } catch {
        // Continue if single stream fails
      }
    }
  }

  // 3. Extract text inside PDF (text) Tj or [(text)] TJ operators
  const combined = textPieces.join('\n');
  const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
  let tjMatch: RegExpExecArray | null;
  const tjTexts: string[] = [];

  while ((tjMatch = tjRegex.exec(combined)) !== null) {
    const clean = tjMatch[1]
      .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
      .replace(/\\([()nrtb\\])/g, '$1');
    tjTexts.push(clean);
  }

  return `${latin1}\n${combined}\n${tjTexts.join(' ')}`;
}

/**
 * Extracts raw text from an uploaded MoU file (PDF, Image, Docx, or Text)
 */
export async function extractRawTextFromMouFile(
  file: File,
  onProgress?: (step: string) => void
): Promise<string> {
  const fileName = file.name.toLowerCase();

  // A. Plain text files (.txt, .md, .csv)
  if (file.type.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    onProgress?.('Reading text contents from document...');
    return await file.text();
  }

  // B. PDF Files (.pdf)
  if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
    onProgress?.('Scanning PDF streams and extracting contract clauses...');
    try {
      const pdfText = await extractTextFromPdf(file);
      if (pdfText && pdfText.trim().length > 10) {
        return pdfText;
      }
    } catch (err) {
      console.warn('PDF parser warning, falling back to text scan', err);
    }
  }

  // C. Scanned Images (.png, .jpg, .jpeg, .webp) -> OCR Vision Engine
  if (file.type.startsWith('image/') || fileName.match(/\.(png|jpe?g|webp)$/i)) {
    onProgress?.('Scanning document with OCR Vision Engine (tesseract.js)...');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      await worker.terminate();
      return ret.data.text || '';
    } catch (ocrErr) {
      console.warn('OCR error during MoU image scan', ocrErr);
    }
  }

  // D. DOCX Word Documents (.docx) -> XML stream extraction
  if (fileName.endsWith('.docx')) {
    onProgress?.('Parsing Word document XML structure...');
    try {
      const buf = await file.arrayBuffer();
      const rawStr = new TextDecoder('latin1').decode(new Uint8Array(buf));
      const wtMatches = rawStr.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
      const extracted = wtMatches.map((m) => m.replace(/<[^>]+>/g, '')).join(' ');
      if (extracted.trim().length > 0) return extracted;
      return rawStr;
    } catch (docxErr) {
      console.warn('DOCX parse warning', docxErr);
    }
  }

  // Fallback: Read raw buffer as text
  try {
    return await file.text();
  } catch {
    return '';
  }
}

/**
 * Parses extracted text and filename to discover real client email,
 * business name, contact person, phone, and agreed referral %.
 */
export function parseMouDetails(rawText: string, originalFileName: string): ExtractedMouData {
  // Clean base name from filename as initial fallback
  const cleanBaseName = originalFileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b(mou|agreement|signed|contract|executed|doc|pdf|scan|final)\b/gi, '')
    .trim();

  const fallbackBizName = cleanBaseName
    ? cleanBaseName.charAt(0).toUpperCase() + cleanBaseName.slice(1)
    : '';

  const result: ExtractedMouData = {
    businessName: fallbackBizName,
    tagline: 'Commercial Service Provider (Verified via Signed MoU)',
    contactPerson: '',
    email: '',
    phone: '',
    city: 'Hyderabad',
    address: '',
    serviceAreas: 'Hyderabad, Secunderabad',
    commissionPercent: '40',
    description: 'Partner onboarded through verified bilateral commercial agreement / signed MoU.',
    hasExtractedEmail: false,
    rawTextPreview: rawText.slice(0, 500)
  };

  if (!rawText || rawText.trim().length === 0) {
    return result;
  }

  // =========================================================================
  // 1. REAL CLIENT EMAIL EXTRACTION (Crucial)
  // =========================================================================
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const rawEmails = rawText.match(emailRegex) || [];

  // Filter out internal platform domains and irrelevant technical domains
  const validClientEmails = rawEmails.filter((em) => {
    const lower = em.toLowerCase();
    return (
      !lower.includes('ottobon.in') &&
      !lower.includes('example.com') &&
      !lower.includes('w3.org') &&
      !lower.includes('adobe.com') &&
      !lower.includes('schema.org') &&
      !lower.includes('github.com') &&
      !lower.includes('sentry.io')
    );
  });

  if (validClientEmails.length > 0) {
    result.email = validClientEmails[0].toLowerCase();
    result.hasExtractedEmail = true;
  }

  // =========================================================================
  // 2. CONTACT PHONE NUMBER
  // =========================================================================
  const phoneRegex = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}|\+?\d{10,12}/g;
  const phones = rawText.match(phoneRegex) || [];
  const validPhones = phones.filter((p) => {
    const clean = p.replace(/\D/g, '');
    return clean.length >= 10 && !clean.includes('8045679912'); // Filter platform telephony bridge
  });
  if (validPhones.length > 0) {
    result.phone = validPhones[0].trim();
  }

  // =========================================================================
  // 3. AUTHORIZED SIGNATORY / CONTACT PERSON
  // =========================================================================
  const signatoryRegex =
    /(?:Authorized\s+Signatory|Signatory|Contact\s+Person|Representative|Managing\s+Director|Director|Proprietor|SPOC)(?:\s*[:\-\–]\s*)([^\r\n,]+)/i;
  const sigMatch = rawText.match(signatoryRegex);

  if (sigMatch && sigMatch[1]) {
    const cleanSig = sigMatch[1].trim().replace(/\s+(?:on|dated|for|email|phone).*/i, '');
    if (cleanSig.length >= 3 && cleanSig.length <= 45) {
      result.contactPerson = cleanSig;
    }
  }

  // Dr. Name match fallback
  if (!result.contactPerson) {
    const drMatch = rawText.match(/Dr\.\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,2}/);
    if (drMatch) {
      result.contactPerson = drMatch[0].trim();
    }
  }

  // =========================================================================
  // 4. CLIENT LEGAL ENTITY / BUSINESS NAME
  // =========================================================================
  // Pattern 1: Between [Ottobon] and [Client]
  const betweenMatch = rawText.match(/(?:between|with)\s+([^\r\n,]+?)\s+(?:and|&)\s+([^\r\n,]+)/i);
  if (betweenMatch) {
    const p1 = betweenMatch[1].trim().replace(/\s+(?:on|dated|having|is).*/i, '');
    const p2 = betweenMatch[2].trim().replace(/\s+(?:on|dated|having|is).*/i, '');
    const candidate = p1.toLowerCase().includes('ottobon') ? p2 : p1;
    if (candidate.length >= 3 && candidate.length <= 60 && !candidate.toLowerCase().includes('ottobon')) {
      result.businessName = candidate;
    }
  }

  // Pattern 2: Party B / Second Party / Provider / Client / Hospital
  if (!result.businessName || result.businessName === fallbackBizName) {
    const bizRegex =
      /(?:Party\s*(?:B|2|Two)|Second\s+Party|Service\s+Provider|Partner|Client|Hospital|Clinic|Company|Entity)(?:\s*[:\-\–]\s*)([^\r\n,]+)/i;
    const bMatch = rawText.match(bizRegex);
    if (bMatch && bMatch[1]) {
      const cleanBiz = bMatch[1].trim().replace(/\s+(?:on|dated|having|is).*/i, '');
      if (cleanBiz.length >= 3 && cleanBiz.length <= 60 && !cleanBiz.toLowerCase().includes('ottobon')) {
        result.businessName = cleanBiz;
      }
    }
  }

  // =========================================================================
  // 5. AGREED MOU REFERRAL COMMISSION %
  // =========================================================================
  const pctRegex = /(\d{1,2})\s*%\s*(?:of\s+MRP|referral|commission|payout|margin|share|fee)?/i;
  const pctMatch = rawText.match(pctRegex);
  if (pctMatch && pctMatch[1]) {
    const val = parseInt(pctMatch[1], 10);
    if (val >= 5 && val <= 90) {
      result.commissionPercent = val.toString();
    }
  }

  // =========================================================================
  // 6. CITY & ADDRESS
  // =========================================================================
  const cityRegex = /\b(Hyderabad|Secunderabad|Cyberabad|Bangalore|Bengaluru|Mumbai|Delhi|Chennai|Pune|Kolkata|Ahmedabad|Noida|Gurgaon)\b/i;
  const cityMatch = rawText.match(cityRegex);
  if (cityMatch && cityMatch[1]) {
    result.city = cityMatch[1];
    result.serviceAreas = `${cityMatch[1]}, Pan-City`;
  }

  // Tagline refinement
  if (result.businessName.toLowerCase().includes('hospital') || result.businessName.toLowerCase().includes('diagnostics') || result.businessName.toLowerCase().includes('clinic')) {
    result.tagline = 'Healthcare & Clinical Services (Verified via Signed MoU)';
  } else if (result.businessName.toLowerCase().includes('cloud') || result.businessName.toLowerCase().includes('tech') || result.businessName.toLowerCase().includes('software')) {
    result.tagline = 'IT, Cloud & Cybersecurity Services (Verified via Signed MoU)';
  } else if (result.businessName.toLowerCase().includes('legal') || result.businessName.toLowerCase().includes('tax') || result.businessName.toLowerCase().includes('advisory')) {
    result.tagline = 'Legal, Tax & Corporate Advisory (Verified via Signed MoU)';
  }

  return result;
}
