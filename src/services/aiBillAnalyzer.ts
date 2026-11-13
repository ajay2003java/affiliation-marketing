import { getClaudeApiKey } from './aiRateCardScanner';

export interface ScannedBillResult {
  success: boolean;
  totalBilledAmount?: number;
  invoiceNumber?: string;
  itemsDetected?: string[];
  billDate?: string;
  detectedCustomerName?: string;
  providerName?: string;
  summaryNotes?: string;
  rawText?: string;
  error?: string;
}

/**
 * Convert a browser File object to Base64
 */
const fileToBase64 = (file: File): Promise<{ base64: string; mediaType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const match = result.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        resolve({ mediaType: match[1], base64: match[2] });
      } else {
        const parts = result.split(',');
        resolve({
          mediaType: file.type || 'image/jpeg',
          base64: parts[1] || parts[0]
        });
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Call Anthropic Claude Messages API with Vision to inspect a bill / receipt photo
 */
async function callClaudeVisionForBill(
  apiKey: string,
  base64Data: string,
  mediaType: string
): Promise<string | null> {
  const modelsToTry = [
    'claude-sonnet-4-5-20250929',
    'claude-haiku-4-5-20251001',
    'claude-3-5-sonnet-20241022',
    'claude-3-haiku-20240307'
  ];

  const isPdf = mediaType === 'application/pdf';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true'
  };

  if (isPdf) {
    headers['anthropic-beta'] = 'pdfs-2024-09-25';
  }

  const promptText = `You are an expert receipt, invoice, and bill verification AI for a referral platform.
Carefully examine this customer bill / receipt / cash memo image.

Extract the following financial details strictly as a JSON object:
{
  "totalBilledAmount": <number - the final grand total / net payable amount in INR (e.g. 100, 140, 1500). Must be a pure number without commas or currency symbols>,
  "invoiceNumber": <string - bill / invoice / memo reference number, e.g. "INV-9821" or "BILL-42">,
  "billDate": <string - date on the bill, e.g. "12/11/2026">,
  "customerName": <string - customer / patient name if printed, otherwise null>,
  "providerName": <string - business / shop / clinic name if printed, otherwise null>,
  "items": [
    <string - item or test name with price, e.g. "Banana Juice (₹40)", "Apple Juice (₹60)">
  ],
  "summaryNotes": <string - brief explanation of how total was computed>
}

RULES:
1. Return ONLY the raw JSON object. Do not wrap with conversational prose.
2. If multiple numbers exist, totalBilledAmount MUST be the final Net Payable / Grand Total that the customer actually paid.
3. If the receipt has itemized lines, list them in the "items" array.`;

  const contentPayload: any[] = [];

  if (isPdf) {
    contentPayload.push({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: base64Data
      }
    });
  } else {
    contentPayload.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: base64Data
      }
    });
  }

  contentPayload.push({
    type: 'text',
    text: promptText
  });

  for (const model of modelsToTry) {
    try {
      const payload = {
        model,
        max_tokens: 1500,
        temperature: 0.1,
        messages: [{ role: 'user', content: contentPayload }]
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

      console.warn(`[Claude Bill Analyzer] Model ${model} returned ${response.status}, trying next model...`);
    } catch (err: any) {
      console.warn(`[Claude Bill Analyzer] Model ${model} network error:`, err?.message || err);
    }
  }

  return null;
}

/**
 * Main entry point: Analyze an uploaded receipt / bill photo using Claude Vision
 */
export async function analyzeCustomerBillWithClaude(file: File): Promise<ScannedBillResult> {
  const apiKey = getClaudeApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'Claude API key is not configured in .env (claude_api_key).'
    };
  }

  try {
    const { base64, mediaType } = await fileToBase64(file);
    const rawResponse = await callClaudeVisionForBill(apiKey, base64, mediaType);

    if (!rawResponse) {
      return {
        success: false,
        error: 'Claude Vision could not analyze the bill. Please enter the amount manually.'
      };
    }

    // Strip optional markdown ```json ... ``` wrapper
    let cleanJson = rawResponse.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanJson);

    const totalAmount = typeof parsed.totalBilledAmount === 'number'
      ? parsed.totalBilledAmount
      : parseFloat(String(parsed.totalBilledAmount || '').replace(/[^0-9.]/g, '')) || undefined;

    return {
      success: true,
      totalBilledAmount: totalAmount,
      invoiceNumber: parsed.invoiceNumber || undefined,
      itemsDetected: Array.isArray(parsed.items) ? parsed.items : [],
      billDate: parsed.billDate || undefined,
      detectedCustomerName: parsed.customerName || undefined,
      providerName: parsed.providerName || undefined,
      summaryNotes: parsed.summaryNotes || undefined,
      rawText: rawResponse
    };
  } catch (err: any) {
    console.error('Exception analyzing bill with Claude:', err);
    return {
      success: false,
      error: err?.message || 'Error processing bill with Claude Vision.'
    };
  }
}

