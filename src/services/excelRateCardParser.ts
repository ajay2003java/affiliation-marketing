import * as XLSX from 'xlsx';

export interface ParsedExcelServiceItem {
  id: string;
  selected: boolean;
  title: string;
  category: string;
  price: number;
  affiliateLeadReward: number;
  affiliateConvReward: number;
  description: string;
  features: string[];
}

// Clean string helper
const cleanStr = (val: any): string => {
  if (val === null || val === undefined) return '';
  return String(val).trim();
};

// Clean number helper
const cleanNum = (val: any, fallback = 0): number => {
  if (typeof val === 'number' && !isNaN(val)) return Math.max(0, Math.round(val));
  if (!val) return fallback;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : Math.max(0, Math.round(num));
};

/**
 * Robustly parse any uploaded Excel or CSV file containing rate cards / service menus,
 * supporting multi-row title banners, varying column names (Investigation, Rate, Charges, etc.),
 * and applying the provider's exact onboarded MoU percentage (e.g. 40%).
 */
export const parseExcelRateCard = async (
  file: File,
  mouPercent: number = 40
): Promise<ParsedExcelServiceItem[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The uploaded Excel spreadsheet contains no visible worksheets.');
  }

  // 50/50 Revenue Split: Provider fee is mouPercent (e.g. 30%), Affiliate share is 50% of provider fee (e.g. 15%)
  const totalProviderFeePct = mouPercent > 0 ? mouPercent : 30;
  const affiliatePct = totalProviderFeePct * 0.5;

  const items: ParsedExcelServiceItem[] = [];

  // Read worksheets (scan up to first 2 sheets)
  for (const sheetName of workbook.SheetNames.slice(0, 2)) {
    const worksheet = workbook.Sheets[sheetName];
    // Convert to 2D array of rows
    const grid: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (!grid || grid.length === 0) continue;

    // 1. Search for header row in the first 15 rows
    let headerRowIdx = -1;
    let titleColIdx = -1;
    let priceColIdx = -1;

    for (let r = 0; r < Math.min(15, grid.length); r++) {
      const row = grid[r];
      if (!Array.isArray(row)) continue;

      let foundPrice = -1;
      let foundTitle = -1;

      // STEP 1: Find Price Column FIRST (must contain a pricing indicator like amount, mrp, price, rate, charges)
      row.forEach((cell, cIdx) => {
        const text = String(cell || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!text) return;

        if (
          foundPrice === -1 &&
          (text.includes('amount') ||
            text.includes('mrp') ||
            text.includes('price') ||
            text.includes('rate') ||
            text.includes('charge') ||
            text.includes('cost') ||
            text.includes('fee') ||
            text.includes('tariff') ||
            text.includes('b2c') ||
            text.includes('retail'))
        ) {
          foundPrice = cIdx;
        }
      });

      // STEP 2: Find Title Column (cannot be the price column, looks for test, investigation, name, service, particulars)
      row.forEach((cell, cIdx) => {
        if (cIdx === foundPrice) return;
        const text = String(cell || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!text) return;

        if (
          foundTitle === -1 &&
          (text.includes('name') ||
            text.includes('test') ||
            text.includes('investigation') ||
            text.includes('service') ||
            text.includes('particular') ||
            text.includes('profile') ||
            text.includes('package') ||
            text.includes('exam') ||
            text.includes('procedure') ||
            text.includes('item') ||
            text.includes('desc') ||
            text.includes('title'))
        ) {
          foundTitle = cIdx;
        }
      });

      if (foundTitle !== -1 && foundPrice !== -1) {
        headerRowIdx = r;
        titleColIdx = foundTitle;
        priceColIdx = foundPrice;
        break;
      }
    }

    // 2. Extract rows based on detected header columns
    if (headerRowIdx !== -1 && titleColIdx !== -1 && priceColIdx !== -1) {
      for (let r = headerRowIdx + 1; r < grid.length; r++) {
        const row = grid[r];
        if (!Array.isArray(row)) continue;

        const rawTitle = cleanStr(row[titleColIdx]);
        const rawPriceVal = row[priceColIdx];
        const numPrice = cleanNum(rawPriceVal, 0);

        // Filter out headers, empty rows, or summary totals
        const isHeaderLike = /^(s\.?no|total|grand total|department|investigation|test name|rate|mrp)$/i.test(rawTitle);
        if (rawTitle.length >= 2 && !isHeaderLike && numPrice > 10 && numPrice < 1000000) {
          const providerFee = Math.round(numPrice * (totalProviderFeePct / 100));
          const affiliateReward = Math.round(providerFee * 0.5);

          items.push({
            id: `xl_item_${Date.now()}_${items.length}`,
            selected: true,
            title: rawTitle,
            category: 'Healthcare',
            price: numPrice,
            affiliateLeadReward: 0,
            affiliateConvReward: affiliateReward,
            description: `${rawTitle} diagnostic investigation.`,
            features: ['NABL Accredited Standard', 'Digital Report within 24 Hours']
          });
        }
      }
    } else {
      // 3. Fallback: Cell-by-cell inspection if unlabelled table
      for (let r = 0; r < grid.length; r++) {
        const row = grid[r];
        if (!Array.isArray(row)) continue;

        let detectedTitle = '';
        let detectedPrice = 0;

        for (let c = 0; c < row.length; c++) {
          const cell = row[c];
          if (cell === null || cell === undefined || cell === '') continue;

          // Check if numeric price
          if (typeof cell === 'number' && !isNaN(cell) && cell > 15 && cell < 500000 && !detectedPrice) {
            detectedPrice = Math.round(cell);
            continue;
          }

          const strVal = String(cell).trim();
          // Check if string contains rupee or price pattern (e.g. "500/-", "₹750")
          const priceMatch = strVal.match(/^(?:₹|Rs\.?)?\s*(\d{2,6})(?:\s*\/-\s*)?$/i);
          if (priceMatch && !detectedPrice) {
            detectedPrice = parseInt(priceMatch[1], 10);
            continue;
          }

          // Check if string has alphabetic characters (Test Name)
          const lettersOnly = strVal.replace(/[^a-zA-Z]/g, '');
          if (lettersOnly.length >= 3 && !/^(total|grand total|s\.?no|sl\.?no|code|date)$/i.test(strVal) && !detectedTitle) {
            detectedTitle = strVal;
          }
        }

        if (detectedTitle && detectedPrice > 0) {
          const providerFee = Math.round(detectedPrice * (totalProviderFeePct / 100));
          const affiliateReward = Math.round(providerFee * 0.5);

          items.push({
            id: `xl_fallback_${Date.now()}_${items.length}`,
            selected: true,
            title: detectedTitle,
            category: 'Healthcare',
            price: detectedPrice,
            affiliateLeadReward: 0,
            affiliateConvReward: affiliateReward,
            description: `${detectedTitle} diagnostic investigation.`,
            features: ['NABL Accredited Standard', 'Digital Report within 24 Hours']
          });
        }
      }
    }

    if (items.length > 0) break; // Finished reading primary sheet
  }

  if (items.length === 0) {
    throw new Error('No service rows with prices could be detected in this spreadsheet. Please ensure columns include test names and pricing.');
  }

  return items;
};

/**
 * Downloads a clean 2-column Excel template (.xlsx) with sample packages:
 * Column 1: Service / Test Name
 * Column 2: Price / MRP (₹)
 */
export const downloadSampleRateCardTemplate = (providerBusinessName: string = 'Provider Facility') => {
  const wb = XLSX.utils.book_new();

  const sampleData = [
    ['Service / Test Name', 'Price / MRP (₹)'],
    ['Comprehensive Master Health Checkup (85+ Tests)', 3999],
    ['Executive Cardiac & Diabetic Screening Package', 4999],
    ['High-Field 1.5T MRI Spine & Brain Screening', 4500],
    ['Complete Blood Picture (CBP) with ESR', 350],
    ['Lipid Profile Panel (Cholesterol & Triglycerides)', 650],
    ['Diabetes Care Profile (HbA1c + Fasting Blood Sugar)', 850],
    ['Thyroid Profile (Total T3, Total T4, TSH)', 550],
    ['Liver Function Test (LFT - 11 Parameters)', 750],
    ['Kidney / Renal Function Test (KFT / RFT)', 750],
    ['Vitamin D3 & Vitamin B12 Screening Combo', 1499]
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);

  // Set column widths for readability
  ws['!cols'] = [
    { wch: 50 }, // Service Name
    { wch: 20 }  // Price / MRP
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Rate Card Template');

  const safeName = providerBusinessName.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `${safeName}_Rate_Card_Template.xlsx`);
};

