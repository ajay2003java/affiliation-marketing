import * as XLSX from 'xlsx';
import { Referral, ProviderOffering } from '../types';

export interface ParsedReconciliationRow {
  referralCode: string;
  customerName: string;
  action: 'qualify' | 'convert' | 'reject' | 'none';
  saleAmount?: number;
  invoiceRef?: string;
  notes?: string;
  rowNumber: number;
}

/**
 * Downloads a pre-filled Excel reconciliation worksheet of current leads for this provider
 */
export const downloadReferralReconciliationWorksheet = (
  providerBusinessName: string,
  referrals: Referral[],
  offerings: ProviderOffering[]
) => {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Referral Code (DO NOT MODIFY)',
    'Customer / Patient Name',
    'Customer Mobile',
    'Service Requested',
    'Current Lead Status',
    'Current Conversion Status',
    'Action (qualified / converted / rejected)',
    'Final Bill / Sale Amount (₹)',
    'Invoice Number / Bill No.',
    'Provider Hospital Notes'
  ];

  const rows = referrals.map((ref) => {
    const off = offerings.find((o) => o.id === ref.offeringId);
    return [
      ref.referralCode,
      ref.customerName,
      ref.customerPhone,
      off?.title || 'Diagnostic Service',
      ref.leadStatus,
      ref.conversionStatus,
      ref.conversionStatus === 'converted' ? 'converted' : ref.leadStatus === 'qualified' ? 'qualified' : '',
      ref.saleValueRupees || off?.customerPriceRupees || '',
      ref.qualificationNotes?.match(/INV-[A-Z0-9-]+/)?.[0] || '',
      ref.qualificationNotes || ref.conversionNotes || ''
    ];
  });

  const sampleData = [headers, ...rows];
  if (rows.length === 0) {
    sampleData.push([
      'REF-2026-SAMPLE-01',
      'Sample Patient Name',
      '+91 98765 43210',
      'Master Health Checkup',
      'submitted',
      'follow_up_in_progress',
      'converted',
      '3999',
      'INV-2026-0042',
      'Patient visited clinic, test performed & invoiced.'
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(sampleData);

  ws['!cols'] = [
    { wch: 30 }, // Referral Code
    { wch: 25 }, // Customer Name
    { wch: 18 }, // Phone
    { wch: 40 }, // Service
    { wch: 20 }, // Current Lead Status
    { wch: 25 }, // Current Conv Status
    { wch: 32 }, // Action
    { wch: 24 }, // Sale Amount
    { wch: 26 }, // Invoice No
    { wch: 50 }  // Notes
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Referral Reconciliation');

  const safeName = providerBusinessName.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `${safeName}_Referral_Reconciliation_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Parses an uploaded Excel reconciliation sheet
 */
export const parseReferralReconciliationExcel = async (file: File): Promise<ParsedReconciliationRow[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The uploaded file contains no sheets.');
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const results: ParsedReconciliationRow[] = [];

  rows.forEach((row, idx) => {
    const keyMap: Record<string, any> = {};
    Object.keys(row).forEach((k) => {
      keyMap[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = row[k];
    });

    const code = String(
      keyMap['referralcode'] ||
      keyMap['referralcodedonotmodify'] ||
      keyMap['code'] ||
      keyMap['refcode'] ||
      ''
    ).trim();

    const name = String(keyMap['customerpatientname'] || keyMap['customername'] || keyMap['patientname'] || '').trim();

    const actionRaw = String(
      keyMap['actionqualifiedconvertedrejected'] ||
      keyMap['action'] ||
      keyMap['status'] ||
      keyMap['updatestatus'] ||
      ''
    ).toLowerCase().trim();

    let action: 'qualify' | 'convert' | 'reject' | 'none' = 'none';
    if (actionRaw.includes('convert') || actionRaw.includes('sale') || actionRaw.includes('done') || actionRaw.includes('closed')) {
      action = 'convert';
    } else if (actionRaw.includes('qualif') || actionRaw.includes('approved') || actionRaw.includes('valid')) {
      action = 'qualify';
    } else if (actionRaw.includes('reject') || actionRaw.includes('lost') || actionRaw.includes('cancel') || actionRaw.includes('invalid')) {
      action = 'reject';
    }

    const saleAmountRaw = parseFloat(
      String(keyMap['finalbillsaleamount'] || keyMap['saleamount'] || keyMap['amount'] || keyMap['billingamount'] || '0').replace(/[^0-9.]/g, '')
    );
    const saleAmount = isNaN(saleAmountRaw) ? undefined : saleAmountRaw;

    const invoiceRef = String(keyMap['invoicenumberbillno'] || keyMap['invoiceno'] || keyMap['billno'] || keyMap['invoice'] || '').trim();
    const notes = String(keyMap['providerhospitalnotes'] || keyMap['notes'] || keyMap['remarks'] || '').trim();

    if (code) {
      results.push({
        referralCode: code,
        customerName: name,
        action,
        saleAmount,
        invoiceRef,
        notes,
        rowNumber: idx + 2
      });
    }
  });

  return results;
};

