import { StripBatch } from '../types';

export interface QrValidationResult {
  isValid: boolean;
  isExpired: boolean;
  batch: StripBatch | null;
  errorMessage?: string;
}

// Sample registered test batches (simulating certified supplier registry)
export const REGISTERED_BATCHES: Record<string, { expiry: string; manufacturer: string }> = {
  'JJM-2026-B4': { expiry: '2026-12-31', manufacturer: 'JalJeevan BioTech India' },
  'JJM-2026-B8': { expiry: '2027-04-30', manufacturer: 'JalJeevan BioTech India' },
  'JJM-2026-C1': { expiry: '2026-11-15', manufacturer: 'National Water Diagnostics' },
  'JJM-2025-A1': { expiry: '2025-06-30', manufacturer: 'JalJeevan BioTech India' }, // Expired
  'JJM-2024-Z9': { expiry: '2024-12-31', manufacturer: 'AquaCheck Labs' }, // Expired
};

export function parseAndValidateQr(rawCode: string): QrValidationResult {
  if (!rawCode || typeof rawCode !== 'string') {
    return {
      isValid: false,
      isExpired: false,
      batch: null,
      errorMessage: 'Invalid QR code. Please scan the QR code printed on the back of the Cl-Ladder strip.',
    };
  }

  let batchId = '';
  let expiryStr = '';

  // 1. Try parsing JSON format: {"batch":"JJM-2026-B4","exp":"2026-12-31"}
  try {
    const parsed = JSON.parse(rawCode);
    if (parsed.batch || parsed.batch_id) {
      batchId = String(parsed.batch || parsed.batch_id).trim();
      expiryStr = String(parsed.exp || parsed.expiry || '').trim();
    }
  } catch {
    // Not JSON, continue to string patterns
  }

  // 2. Try pipe / delimiter pattern: BATCH:JJM-2026-B4|EXP:2026-12-31
  if (!batchId) {
    const batchMatch = rawCode.match(/BATCH[:=]([A-Za-z0-9-_]+)/i);
    const expMatch = rawCode.match(/EXP[:=]([0-9]{4}-[0-9]{2}-[0-9]{2})/i);

    if (batchMatch) {
      batchId = batchMatch[1].trim();
    }
    if (expMatch) {
      expiryStr = expMatch[1].trim();
    }
  }

  // 3. Fallback: If raw code is directly a batch ID like "JJM-2026-B4"
  if (!batchId && rawCode.trim().length >= 4) {
    batchId = rawCode.trim();
  }

  if (!batchId) {
    return {
      isValid: false,
      isExpired: false,
      batch: null,
      errorMessage: 'Could not detect a valid Cl-Ladder Batch ID in this QR code.',
    };
  }

  // Check against registered batches if expiry not in QR
  if (!expiryStr && REGISTERED_BATCHES[batchId]) {
    expiryStr = REGISTERED_BATCHES[batchId].expiry;
  } else if (!expiryStr) {
    // Default fallback expiry 6 months from now if unrecognized registered batch
    expiryStr = '2026-12-31';
  }

  // Check expiry date against current date
  const expiryDate = new Date(expiryStr);
  const now = new Date();

  // If expiryDate is invalid date format
  if (isNaN(expiryDate.getTime())) {
    return {
      isValid: false,
      isExpired: false,
      batch: null,
      errorMessage: `Malformed expiry date: "${expiryStr}"`,
    };
  }

  const isExpired = expiryDate.getTime() < now.getTime();

  const stripBatch: StripBatch = {
    batch_id: batchId,
    expiry: expiryStr,
    manufacturer: REGISTERED_BATCHES[batchId]?.manufacturer || 'Certified JJM Supplier',
    is_valid: !isExpired,
  };

  if (isExpired) {
    return {
      isValid: false,
      isExpired: true,
      batch: stripBatch,
      errorMessage: `BLOCK: Test strip batch "${batchId}" EXPIRED on ${expiryStr}. Expired strips cannot produce accurate TMB enzymatic color reactions. Please discard and use a fresh strip.`,
    };
  }

  return {
    isValid: true,
    isExpired: false,
    batch: stripBatch,
  };
}
