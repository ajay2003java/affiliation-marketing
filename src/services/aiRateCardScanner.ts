/**
 * STRICT GUARDRAILED AI VISION RATE-CARD SCANNER
 *
 * Scope Constraint:
 * - This service is strictly used ONLY for extracting service offerings and prices
 *   from pictures or rate card documents uploaded by a service provider.
 * - It is NEVER called for any other feature, chat, or customer request.
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
  onProgress?: (status: string) => void
): Promise<ScannedServiceItem[] | null> {
  const apiKey = getClaudeApiKey();
  if (!apiKey) {
    console.warn('[Claude Scanner] No API key detected. Using local fallback.');
    return null;
  }

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

    // Strict instructions: Output JSON array only
    contentBlocks.push({
      type: 'text',
      text: `You are scanning an uploaded commercial rate card / service price list for "${businessName}".
Extract all service offerings, diagnostic tests, consultation packages, or menu items along with their numerical price in Indian Rupees (INR).

Return ONLY a valid JSON array in this exact schema without any conversational text or markdown codeblock wrappers:
[
  {
    "title": "Complete Blood Picture (CBP)",
    "price": 350,
    "description": "Routine clinical pathology blood count"
  }
]

Extraction Rules:
1. "price" MUST be an integer/number only (e.g. 450, not "₹450" or "450/-").
2. "title" must be the clean, exact service name legible from the rate card.
3. If tests are listed in multiple columns or tabular formats, scan row-by-row accurately.
4. Extract every legitimate priced service present in the document.
5. If no prices are present, return an empty array [].
6. Output raw JSON ONLY. No prelude, no explanation.`
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    };

    if (isPdf) {
      headers['anthropic-beta'] = 'pdfs-2024-09-25';
    }

    // State-of-the-art vision model (best for complex lab menus, tables, and tariff sheets)
    // Fall back to claude-3-haiku-20240307 if not available on key tier
    const payload = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1800,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: contentBlocks
        }
      ]
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000); // 35s guardrail timeout

    let response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    // If model not found or key tier mismatch, retry with standard claude-3-haiku-20240307
    if (!response.ok && (response.status === 404 || response.status === 400)) {
      payload.model = 'claude-3-haiku-20240307';
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`[Claude Scanner] API responded with ${response.status}:`, errBody);
      return null;
    }

    const data = await response.json();
    const textOutput = data?.content?.[0]?.text || '';

    // Clean JSON response (strip any ```json ... ``` markdown if present)
    const cleanedJson = textOutput
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsedArray = JSON.parse(cleanedJson);
    if (!Array.isArray(parsedArray)) {
      console.warn('[Claude Scanner] Response was not an array');
      return null;
    }

    const results: ScannedServiceItem[] = [];

    parsedArray.forEach((item: any, idx: number) => {
      const title = String(item.title || '').trim();
      const rawPrice = typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/[^\d]/g, ''), 10);

      if (title.length >= 2 && !isNaN(rawPrice) && rawPrice > 0 && rawPrice < 1000000) {
        const leadReward = Math.max(25, Math.round(rawPrice * 0.10));
        const convReward = Math.max(50, Math.round(rawPrice * 0.22));

        results.push({
          id: `claude_item_${Date.now()}_${idx}`,
          selected: false, // Provider must tick to save into database
          title,
          category: targetCategory,
          price: rawPrice,
          affiliateLeadReward: leadReward,
          affiliateConvReward: convReward,
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

