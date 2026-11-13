import * as XLSX from 'xlsx';

/**
 * STRICT GUARDRAILED AI VISION & SPREADSHEET RATE-CARD SCANNER
 *
 * Scope Constraint:
 * - This service is strictly used ONLY for extracting service offerings and prices
 *   from pictures, PDFs, or Excel rate card documents uploaded by a service provider.
 * - Uses Claude AI with the configured API key upfront.
 */

export interface ScannedServiceItem {
  id: string;
  selected: boolean;
  title: string;
  category: string;
  price: number;
  affiliateLeadReward: number;
  affiliateConvReward: number;
  description: string;
}

/** Check if a Claude API key is present in environment */
export function getClaudeApiKey(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const key =
      import.meta.env.VITE_CLAUDE_API_KEY ||
      import.meta.env.claude_api_key ||
      import.meta.env.VITE_ANTHROPIC_API_KEY ||
      '';
    return typeof key === 'string' ? key.trim() : '';
  }
  return '';
}

export function isClaudeConfigured(): boolean {
  const key = getClaudeApiKey();
  return Boolean(key && key.length > 5);
}

/**
 * Helper to call Anthropic Messages API with automated model fallback:
 * Tries modern active Claude models ('claude-sonnet-4-5-20250929', 'claude-haiku-4-5-20251001')
 * and legacy models ('claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307')
 */
async function callClaudeMessagesApi(
  apiKey: string,
  content: any,
  isPdf = false,
  maxTokens = 2500
): Promise<string | null> {
  const modelsToTry = [
    'claude-sonnet-4-5-20250929',
    'claude-haiku-4-5-20251001',
    'claude-3-5-sonnet-20241022',
    'claude-3-haiku-20240307'
  ];

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true'
  };

  if (isPdf) {
    headers['anthropic-beta'] = 'pdfs-2024-09-25';
  }

  for (const model of modelsToTry) {
    try {
      const payload = {
        model,
        max_tokens: maxTokens,
        temperature: 0.1,
        messages: [{ role: 'user', content }]
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        return data?.content?.[0]?.text || null;
      }

      console.warn(`[Claude Scanner] Model ${model} returned ${response.status}, checking next candidate...`);
    } catch (err: any) {
      console.warn(`[Claude Scanner] Model ${model} network error:`, err?.message || err);
    }
  }

  return null;
}

/** Convert a browser File object to Base64 */
const fileToBase64 = (file: File): Promise<{ base64: string; mediaType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const match = result.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        resolve({ mediaType: match[1], base64: match[2] });
      } else {
        reject(new Error('Invalid data URL format'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Scan an uploaded rate card photo or PDF strictly using Anthropic Claude Vision
 */
export async function scanRateCardWithClaude(
  file: File,
  businessName: string,
  targetCategory = 'cat_health',
  mouPercent = 40,
  onProgress?: (status: string) => void
): Promise<ScannedServiceItem[] | null> {
  const apiKey = getClaudeApiKey();
  if (!apiKey) {
    console.warn('[Claude Scanner] No API key detected. Using local fallback.');
    return null;
  }

  // 50/50 Revenue Split: Provider fee is mouPercent (e.g. 30%), Affiliate share is 50% of provider fee (e.g. 15%)
  const totalProviderFeePct = mouPercent > 0 ? mouPercent : 30;
  const affiliatePct = totalProviderFeePct * 0.5;

  onProgress?.('Preparing rate card image for Claude Vision analysis...');

  try {
    const { base64, mediaType } = await fileToBase64(file);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name);

    if (!isImage && !isPdf) {
      console.warn('[Claude Scanner] Unsupported file format for vision.');
      return null;
    }

    onProgress?.('Claude Vision is reading services, packages, and tariff prices...');

    // Construct Claude Multimodal Content Block
    const contentBlocks: any[] = [];

    if (isImage) {
      // Normalize media type for Claude (image/jpeg, image/png, image/webp, image/gif)
      let normalizedMediaType = mediaType;
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(normalizedMediaType)) {
        normalizedMediaType = 'image/jpeg';
      }

      contentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: normalizedMediaType,
          data: base64
        }
      });
    } else if (isPdf) {
      contentBlocks.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64
        }
      });
    }

    // Strict instructions: Output JSON array only with intelligent column & terminology recognition
    contentBlocks.push({
      type: 'text',
      text: `You are an expert rate card extractor scanning an uploaded rate card, tariff menu, or document image for "${businessName}".
Extract all service offerings, diagnostic tests, consultation packages, or medical menu items along with their numerical retail price / MRP in Indian Rupees (INR).

INTELLIGENT RECOGNITION RULES (ANY NAMING CONVENTION OR LAYOUT):
1. TEST / SERVICE NAMES can be written with any wording:
   - "Test", "Test Name", "Investigation", "Particulars", "Service", "Profile", "Package", "Exam", "Procedure", "Description", "Item", or unlabelled columns.
   - Clean the name: Remove numbering prefixes (e.g. "1. Lipid Profile" -> "Lipid Profile"), lab sample codes (e.g. "TC-014"), and extra punctuation.
2. PRICING / MRP can appear with any label or symbol:
   - "Price", "Amount", "Test Amount", "MRP", "Rate", "Charges", "Fee", "Tariff", "Cost", "Retail", "B2C", or with symbols like "₹", "Rs.", "/-".
   - If multiple price columns exist (e.g. "B2B" vs "B2C / MRP"), ALWAYS pick the customer retail / patient MRP price.
   - "price" in your output MUST be a clean positive integer number only (e.g. 350, not "₹350" or "350/-").
3. IGNORE NON-SERVICE TEXT:
   - Skip headers, footers, phone numbers, addresses, disclaimers, or summary totals.
4. Extract EVERY legitimate priced service or test present in the document.

Return ONLY a valid JSON array in this exact schema without any conversational text or markdown codeblock wrappers:
[
  {
    "title": "Complete Blood Picture (CBP)",
    "price": 350,
    "description": "Routine clinical pathology blood count"
  }
]`
    });

    const textOutput = await callClaudeMessagesApi(apiKey, contentBlocks, isPdf, 2500);
    if (!textOutput) {
      console.warn('[Claude Scanner] Failed to get response from Claude API.');
      return null;
    }

    // Robust JSON bracket extraction (immune to any conversational preamble or trailing markdown)
    const firstBracket = textOutput.indexOf('[');
    const lastBracket = textOutput.lastIndexOf(']');
    if (firstBracket === -1 || lastBracket === -1 || lastBracket <= firstBracket) {
      console.warn('[Claude Scanner] No JSON array brackets found in Claude output:', textOutput);
      return null;
    }

    const jsonSubstring = textOutput.slice(firstBracket, lastBracket + 1);
    const parsedArray = JSON.parse(jsonSubstring);
    if (!Array.isArray(parsedArray)) {
      console.warn('[Claude Scanner] Response was not an array');
      return null;
    }

    const results: ScannedServiceItem[] = [];

    parsedArray.forEach((item: any, idx: number) => {
      const title = String(item.title || '').trim();
      const rawPrice = typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/[^\d]/g, ''), 10);

      if (title.length >= 2 && !isNaN(rawPrice) && rawPrice > 0 && rawPrice < 1000000) {
        const providerFee = Math.round(rawPrice * (totalProviderFeePct / 100));
        const affiliateReward = Math.round(providerFee * 0.5);

        results.push({
          id: `claude_item_${Date.now()}_${idx}`,
          selected: true, // Pre-selected for provider review
          title,
          category: targetCategory,
          price: rawPrice,
          affiliateLeadReward: 0,
          affiliateConvReward: affiliateReward,
          description: item.description ? String(item.description).trim() : `${title} offered by ${businessName}.`
        });
      }
    });

    onProgress?.(`Claude successfully detected ${results.length} services & prices!`);
    return results.length > 0 ? results : null;
  } catch (err: any) {
    console.warn('[Claude Scanner] Vision extraction failed, using fallback:', err?.message || err);
    return null;
  }
}

/**
 * Scan an uploaded Excel (.xlsx, .xls) or CSV rate card file strictly using Claude AI with the configured API key
 */
export async function scanExcelWithClaude(
  file: File,
  businessName: string,
  targetCategory = 'cat_health',
  mouPercent = 40,
  onProgress?: (status: string) => void
): Promise<ScannedServiceItem[] | null> {
  const apiKey = getClaudeApiKey();
  if (!apiKey) {
    console.warn('[Claude Excel Scanner] No API key detected. Using local spreadsheet fallback.');
    return null;
  }

  // 50/50 Revenue Split: Provider fee is mouPercent (e.g. 30%), Affiliate share is 50% of provider fee (e.g. 15%)
  const totalProviderFeePct = mouPercent > 0 ? mouPercent : 30;
  const affiliatePct = totalProviderFeePct * 0.5;

  onProgress?.('Reading spreadsheet contents for Claude AI analysis...');

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return null;
    }

    // Convert worksheets to clean CSV/text representation for Claude
    let combinedText = '';
    for (const name of workbook.SheetNames.slice(0, 3)) {
      const sheet = workbook.Sheets[name];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      if (csv && csv.trim().length > 0) {
        combinedText += `\n[SHEET: ${name}]\n` + csv.trim() + '\n';
      }
    }

    if (!combinedText.trim()) {
      return null;
    }

    // Cap at 45,000 characters to stay safely within token limits
    if (combinedText.length > 45000) {
      combinedText = combinedText.slice(0, 45000) + '\n...[REMAINDER TRUNCATED FOR TOKEN LIMIT]...';
    }

    onProgress?.('Claude AI is extracting services and pricing with API key...');

    const prompt = `You are an expert rate card extractor scanning an uploaded Excel/CSV tariff sheet for "${businessName}".
Extract all service offerings, diagnostic tests, consultation packages, or medical menu items along with their numerical retail price / MRP in Indian Rupees (INR).

INTELLIGENT RECOGNITION RULES (ANY ARBITRARY NAMING CONVENTION OR SPREADSHEET STRUCTURE):
1. TEST / SERVICE NAMES can be written with any wording:
   - "Test", "Test Name", "Investigation", "Particulars", "Service", "Profile", "Package", "Exam", "Procedure", "Description", "Item", or unlabelled columns.
   - Clean the name: Remove serial numbering (e.g. "1. Complete Hemogram" -> "Complete Hemogram"), lab codes (e.g. "LAB-102"), and extra punctuation.
2. PRICING / MRP can appear with any label, abbreviation, or symbol:
   - "Test Amount", "Amount", "Price", "MRP", "Rate", "Charges", "Fee", "Tariff", "Cost", "Retail", "B2C", or with symbols like "₹", "Rs.", "/-".
   - If multiple price columns exist (e.g. "B2B / Net" vs "B2C / MRP / Test Amount"), ALWAYS pick the customer retail / patient MRP price.
   - "price" in your JSON output MUST be a clean positive integer number only (e.g. 350, not "₹350" or "350/-").
3. IGNORE NON-SERVICE DATA:
   - Skip metadata, category header rows, blank rows, footers, phone numbers, disclaimers, or summary totals.
4. Extract EVERY legitimate priced service or test present in the spreadsheet.

Return ONLY a valid JSON array in this exact schema without any conversational text or markdown codeblock wrappers:
[
  {
    "title": "Complete Blood Picture (CBP)",
    "price": 350,
    "description": "Routine diagnostic hematology profile"
  }
]

Here is the raw spreadsheet data:
${combinedText}`;

    const textOutput = await callClaudeMessagesApi(apiKey, prompt, false, 2500);
    if (!textOutput) {
      console.warn('[Claude Excel Scanner] Failed to get response from Claude API.');
      return null;
    }

    // Robust JSON bracket extraction (immune to any conversational preamble or trailing text)
    const firstBracket = textOutput.indexOf('[');
    const lastBracket = textOutput.lastIndexOf(']');
    if (firstBracket === -1 || lastBracket === -1 || lastBracket <= firstBracket) {
      console.warn('[Claude Excel Scanner] No JSON array brackets found in Claude output:', textOutput);
      return null;
    }

    const jsonSubstring = textOutput.slice(firstBracket, lastBracket + 1);
    const parsedArray = JSON.parse(jsonSubstring);
    if (!Array.isArray(parsedArray)) {
      return null;
    }

    const results: ScannedServiceItem[] = [];
    parsedArray.forEach((item: any, idx: number) => {
      const title = String(item.title || '').trim();
      const rawPrice = typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/[^\d]/g, ''), 10);

      if (title.length >= 2 && !isNaN(rawPrice) && rawPrice > 0 && rawPrice < 1000000) {
        const providerFee = Math.round(rawPrice * (totalProviderFeePct / 100));
        const affiliateReward = Math.round(providerFee * 0.5);

        results.push({
          id: `claude_xl_${Date.now()}_${idx}`,
          selected: true,
          title,
          category: targetCategory,
          price: rawPrice,
          affiliateLeadReward: 0,
          affiliateConvReward: affiliateReward,
          description: item.description ? String(item.description).trim() : `${title} offered by ${businessName}.`
        });
      }
    });

    onProgress?.(`Claude AI successfully extracted ${results.length} services & prices from spreadsheet!`);
    return results.length > 0 ? results : null;
  } catch (err: any) {
    console.warn('[Claude Excel Scanner] Extraction failed, using fallback:', err?.message || err);
    return null;
  }
}

