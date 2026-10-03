export const Colors = {
  // JJM Brand & Primary
  primary: '#0D9488', // Teal
  primaryDark: '#0F766E',
  primaryLight: '#CCFBF1',
  primaryMuted: '#14B8A6',
  
  // Status Colors
  safe: '#16A34A', // Green (0.2 - 1.0 ppm)
  safeLight: '#DCFCE7',
  safeBorder: '#86EFAC',

  low: '#DC2626', // Red (<0.2 ppm) - Alert
  lowLight: '#FEE2E2',
  lowBorder: '#FCA5A5',

  high: '#D97706', // Amber (>1.0 ppm)
  highLight: '#FEF3C7',
  highBorder: '#FCD34D',

  // Neutrals & Base
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  surface: '#F1F5F9',
  border: '#E2E8F0',
  borderDark: '#CBD5E1',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Interactive
  accent: '#0284C7',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Pad colors
  padInactive: '#F1EAD9', // Off-white/cream paper strip pad
  padInactiveBorder: '#D1C7B7',
  padActive: '#2563EB', // Blue TMB reaction
  padActiveBorder: '#1D4ED8',
  stripBody: '#FFFBEB', // Light cream paper strip
};

export const PAD_LADDER_CONFIG = [
  { index: 1, ppmLabel: '0.1-0.2 ppm', label: 'Pad 1: 0.1-0.2 ppm', description: 'Trace chlorine (Low)' },
  { index: 2, ppmLabel: '0.2-0.5 ppm', label: 'Pad 2: 0.2-0.5 ppm', description: 'Minimum safe limit (Safe)' },
  { index: 3, ppmLabel: '0.5-1.0 ppm', label: 'Pad 3: 0.5-1.0 ppm', description: 'Optimal safe limit (Safe)' },
  { index: 4, ppmLabel: '1.0-2.0 ppm', label: 'Pad 4: 1.0-2.0 ppm', description: 'Elevated limit (High)' },
  { index: 5, ppmLabel: '2.0-5.0 ppm', label: 'Pad 5: 2.0-5.0 ppm', description: 'Shock / post-monsoon (High)' },
  { index: 6, ppmLabel: '>=5.0 ppm', label: 'Pad 6: >=5.0 ppm', description: 'Excess chlorine (High)' },
] as const;

export const JJM_STANDARDS = {
  MIN_SAFE_PPM: 0.2,
  MAX_SAFE_PPM: 1.0,
  SAFE_LABEL: 'Safe (0.2 - 1.0 ppm, 2-3 pads)',
  LOW_LABEL: 'Low (<0.2 ppm, 0-1 pads) - Action Required',
  HIGH_LABEL: 'High (>1.0 ppm, 4-6 pads) - Overdose Monitor',
};
