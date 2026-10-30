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
 * Decompress deflate bytes using standard browser DecompressionStream (fallback)
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
 * Extracts text from a PDF file using pdfjs-dist with multi-tier fallback:
 * Tier 1: pdfjs-dist standard text stream extraction (handles Identity-H, CMaps, ToUnicode)
 * Tier 2: Canvas render + OCR vision for scanned/image PDFs
 * Tier 3: Direct stream decompression & regex scan
 */
async function extractTextFromPdf(
  file: File,
  onProgress?: (step: string) => void
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);

  // ---------------------------------------------------------
  // TIER 1: pdfjs-dist PDF text stream parser
  // ---------------------------------------------------------
  try {
    onProgress?.('Extracting document pages and font glyphs with PDF engine...');
    const pdfjsLib = await import('pdfjs-dist');

    // Configure workerSrc if available or fallback
    try {
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
      }
    } catch {
      // Ignore worker setup notice
    }

    const loadingTask = pdfjsLib.getDocument({
      data: pdfBytes,
      useSystemFonts: true,
    } as any);

    const doc = await loadingTask.promise;
    let fullPdfJsText = '';

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      onProgress?.(`Reading text stream from page ${pageNum} of ${doc.numPages}...`);
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const pageStrings = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter((s: string) => Boolean(s));
      fullPdfJsText += `\n--- PAGE ${pageNum} ---\n` + pageStrings.join(' ');
    }

    if (fullPdfJsText.trim().length > 30) {
      return fullPdfJsText;
    }

    // TIER 2: If doc has pages but zero text (scanned image PDF), render to canvas & OCR
    if (doc.numPages > 0 && typeof document !== 'undefined') {
      onProgress?.('Scanned PDF detected. Running OCR Vision on document pages...');
      const ocrPages: string[] = [];
      const pagesToScan = Math.min(doc.numPages, 3); // Scan up to first 3 pages
      for (let p = 1; p <= pagesToScan; p++) {
        const page = await doc.getPage(p);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await (page.render({ canvasContext: context, viewport } as any) as any).promise;
          const dataUrl = canvas.toDataURL('image/png');
          const { createWorker } = await import('tesseract.js');
          const worker = await createWorker('eng');
          const ret = await worker.recognize(dataUrl);
          await worker.terminate();
          if (ret.data.text) {
            ocrPages.push(ret.data.text);
          }
        }
      }
      if (ocrPages.join('\n').trim().length > 10) {
        return ocrPages.join('\n');
      }
    }
  } catch (pdfJsErr) {
    console.warn('pdfjs-dist engine notice, trying direct stream parser', pdfJsErr);
  }

  // ---------------------------------------------------------
  // TIER 3: Fallback stream decompression & raw byte scan
  // ---------------------------------------------------------
  const latin1 = new TextDecoder('latin1').decode(pdfBytes);
  const textPieces: string[] = [];

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const directEmails = latin1.match(emailRegex) || [];
  textPieces.push(...directEmails);

  const streamStartRegex = /stream\r?\n/g;
  let match: RegExpExecArray | null;

  while ((match = streamStartRegex.exec(latin1)) !== null) {
    const startIdx = match.index + match[0].length;
    const endIdx = latin1.indexOf('endstream', startIdx);
    if (endIdx === -1) break;

    const streamBytes = pdfBytes.subarray(startIdx, endIdx);
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
    onProgress?.('Scanning PDF document structure and signatures...');
    try {
      const pdfText = await extractTextFromPdf(file, onProgress);
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
 * business name, contact person, phone, address, and agreed referral %.
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
  // 1. SIGNATURE BLOCK EXTRACTION ("FOR <CLIENT COMPANY NAME>")
  // =========================================================================
  const signatureBlocks = rawText.split(/FOR\s+/i).slice(1);
  let clientBlock = '';
  let clientBlockHeader = '';

  for (const block of signatureBlocks) {
    const header = block.split(/\n|Name:/i)[0].trim().replace(/\s+/g, ' ');
    if (header && !header.toLowerCase().includes('ottobon') && (header.length > 3 && header.length < 60)) {
      clientBlock = block;
      clientBlockHeader = header;
      break;
    }
  }

  if (clientBlock) {
    // Extract contact person name
    const nameMatch = clientBlock.match(/Name:\s*([^\r\n]+?)(?=\s+(?:Designation|Address|Email|Phone|Signature|Date))/i);
    if (nameMatch && nameMatch[1].trim().length > 2) {
      result.contactPerson = nameMatch[1].trim();
    }

    // Extract address
    const addrMatch = clientBlock.match(/Address:\s*([^\r\n]+?)(?=\s+(?:Email|Phone|Signature|Date))/i);
    if (addrMatch && addrMatch[1].trim().length > 5) {
      result.address = addrMatch[1].trim();
    }

    // Extract email from client block
    const emailMatch = clientBlock.match(/Email:\s*([^\r\n\s]+?)(?=\s+(?:Phone|Signature|Date|$))/i);
    if (emailMatch && emailMatch[1].trim().includes('@')) {
      result.email = emailMatch[1].trim().toLowerCase();
      result.hasExtractedEmail = true;
    }

    // Extract phone from client block
    const phoneMatch = clientBlock.match(/Phone:\s*([^\r\n]+?)(?=\s+(?:Signature|Date|$))/i);
    if (phoneMatch && phoneMatch[1].trim().length >= 10) {
      result.phone = phoneMatch[1].trim();
    }
  }

  // =========================================================================
  // 2. REAL CLIENT EMAIL EXTRACTION & AUDIT TRAIL FILTERING
  // =========================================================================
  if (!result.email) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    const rawEmails = rawText.match(emailRegex) || [];

    // Filter out Ottobon platform internal emails and system domains
    const validClientEmails = rawEmails.filter((em) => {
      const lower = em.toLowerCase();
      return (
        !lower.includes('ottobon') &&
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
  }

  // =========================================================================
  // 3. CLIENT BUSINESS NAME DISCOVERY
  // =========================================================================
  if (clientBlockHeader) {
    // Format Title Case e.g. DHANVIKA DIAGNOSTICS -> Dhanvika Diagnostics
    result.businessName = clientBlockHeader
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Pattern A: Labeled under CLIENT header (e.g. CLIENT \n Dhanvika Diagnostics)
  if (!result.businessName || result.businessName === fallbackBizName) {
    const clientHeaderMatch = rawText.match(
      /\bCLIENT\s+([A-Z][A-Za-z0-9\s&.,'-]{2,50}?)(?=\s+(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*(?:Founder|Director|Representative)|[a-zA-Z0-9._%+-]+@|\+?\d{10}|[0-9]\.))/i
    );
    if (clientHeaderMatch && clientHeaderMatch[1]) {
      result.businessName = clientHeaderMatch[1].trim();
    }
  }

  // Pattern B: Between [Ottobon] and [Client]
  if (!result.businessName || result.businessName === fallbackBizName) {
    const betweenMatch = rawText.match(/(?:between|with)\s+([^\r\n,]+?)\s+(?:and|&)\s+([^\r\n,]+)/i);
    if (betweenMatch) {
      const p1 = betweenMatch[1].trim().replace(/\s+(?:on|dated|having|is).*/i, '');
      const p2 = betweenMatch[2].trim().replace(/\s+(?:on|dated|having|is).*/i, '');
      const candidate = p1.toLowerCase().includes('ottobon') ? p2 : p1;
      if (candidate.length >= 3 && candidate.length <= 60 && !candidate.toLowerCase().includes('ottobon')) {
        result.businessName = candidate;
      }
    }
  }

  // Pattern C: Party B / Second Party / Provider / Hospital
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
  // 4. AUTHORIZED SIGNATORY / CONTACT PERSON FALLBACK
  // =========================================================================
  if (!result.contactPerson) {
    // Check CLIENT section title line (e.g. "Kumar Chenagalla, Founder")
    const clientTitleMatch = rawText.match(
      /\bCLIENT\s+[^\r\n]+\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),\s*(?:Founder|Director|CEO|Proprietor|Managing|Representative)/i
    );
    if (clientTitleMatch && clientTitleMatch[1]) {
      result.contactPerson = clientTitleMatch[1].trim();
    }
  }

  if (!result.contactPerson) {
    const signatoryRegex =
      /(?:Authorized\s+Signatory|Signatory|Contact\s+Person|Representative|Managing\s+Director|Director|Proprietor|SPOC)(?:\s*[:\-\–]\s*)([^\r\n,]+)/i;
    const sigMatch = rawText.match(signatoryRegex);
    if (sigMatch && sigMatch[1]) {
      const cleanSig = sigMatch[1].trim().replace(/\s+(?:on|dated|for|email|phone).*/i, '');
      if (cleanSig.length >= 3 && cleanSig.length <= 45 && !cleanSig.toLowerCase().includes('radhika')) {
        result.contactPerson = cleanSig;
      }
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
  // 5. CONTACT PHONE NUMBER FALLBACK
  // =========================================================================
  if (!result.phone) {
    // Check pipe separated in client header (e.g. Email | +91 8885282637)
    const inlinePhoneMatch = rawText.match(/\|\s*(\+?[\d\s-]{10,15})/);
    if (inlinePhoneMatch && inlinePhoneMatch[1]) {
      result.phone = inlinePhoneMatch[1].trim();
    } else {
      const phoneRegex = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}|\+?\d{10,12}/g;
      const phones = rawText.match(phoneRegex) || [];
      const validPhones = phones.filter((p) => {
        const clean = p.replace(/\D/g, '');
        return clean.length >= 10 && !clean.includes('8045679912');
      });
      if (validPhones.length > 0) {
        result.phone = validPhones[0].trim();
      }
    }
  }

  // =========================================================================
  // 6. AGREED REFERRAL COMMISSION %
  // =========================================================================
  // Format 1: "Referral amount: 40 %"
  const refMatch = rawText.match(/Referral\s*amount:\s*(\d{1,2})\s*%/i);
  if (refMatch && refMatch[1]) {
    result.commissionPercent = refMatch[1];
  } else {
    // Format 2: "40% commission / referral"
    const pctMatch = rawText.match(/(\d{1,2})\s*%\s*(?:of\s+MRP|referral|commission|payout|margin|share|fee)?/i);
    if (pctMatch && pctMatch[1]) {
      const val = parseInt(pctMatch[1], 10);
      if (val >= 5 && val <= 90) {
        result.commissionPercent = val.toString();
      }
    }
  }

  // =========================================================================
  // 7. CITY & SERVICE AREAS
  // =========================================================================
  const cityRegex =
    /\b(Hyderabad|Secunderabad|Cyberabad|Bangalore|Bengaluru|Mumbai|Delhi|Chennai|Pune|Kolkata|Ahmedabad|Noida|Gurgaon|Visakhapatnam)\b/i;
  const searchStr = result.address || rawText;
  const cityMatch = searchStr.match(cityRegex);
  if (cityMatch && cityMatch[1]) {
    result.city = cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1).toLowerCase();
    result.serviceAreas = `${result.city}, Pan-City`;
  }

  // Refine Tagline according to business nature
  const bLower = result.businessName.toLowerCase();
  if (
    bLower.includes('diagnostics') ||
    bLower.includes('pathology') ||
    bLower.includes('scan') ||
    bLower.includes('lab') ||
    bLower.includes('blood')
  ) {
    result.tagline = 'Diagnostics, Imaging & Clinical Pathology (Verified via Signed MoU)';
  } else if (bLower.includes('hospital') || bLower.includes('clinic') || bLower.includes('care') || bLower.includes('health')) {
    result.tagline = 'Healthcare, Clinical & Specialty Care (Verified via Signed MoU)';
  } else if (bLower.includes('cloud') || bLower.includes('tech') || bLower.includes('software')) {
    result.tagline = 'IT, Cloud & Cybersecurity Services (Verified via Signed MoU)';
  } else if (bLower.includes('legal') || bLower.includes('tax') || bLower.includes('advisory')) {
    result.tagline = 'Legal, Tax & Corporate Advisory (Verified via Signed MoU)';
  }

  return result;
}
