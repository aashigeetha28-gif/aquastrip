import { FrcStatus } from '../types';

export interface FrcCalculation {
  bluePadCount: number;
  frcRange: string;
  numericPpm: number;
  status: FrcStatus;
  statusLabel: string;
  actionRequired: boolean;
  actionDescription: string;
}

/**
 * Strict JJM Mapping Rule:
 * 0 -> <0.1 (Low, <0.2 ppm)
 * 1 -> 0.1-0.2 (Low, <0.2 ppm)
 * 2 -> 0.2-0.5 (Safe, 0.2-1.0 ppm)
 * 3 -> 0.5-1.0 (Safe, 0.2-1.0 ppm)
 * 4 -> 1.0-2.0 (High, >1.0 ppm)
 * 5 -> 2.0-5.0 (High, >1.0 ppm)
 * 6 -> >=5.0 ppm (High, >1.0 ppm)
 */
export function calculateFrc(bluePadCount: number): FrcCalculation {
  const count = Math.max(0, Math.min(6, Math.round(bluePadCount)));

  switch (count) {
    case 0:
      return {
        bluePadCount: 0,
        frcRange: '<0.1 ppm',
        numericPpm: 0.05,
        status: 'low',
        statusLabel: 'Low Chlorine (<0.2 ppm)',
        actionRequired: true,
        actionDescription: 'No reactive pads. Water has no disinfection residual. High risk of pathogens.',
      };
    case 1:
      return {
        bluePadCount: 1,
        frcRange: '0.1-0.2 ppm',
        numericPpm: 0.15,
        status: 'low',
        statusLabel: 'Low Chlorine (<0.2 ppm)',
        actionRequired: true,
        actionDescription: 'Chlorine below JJM safe limit (0.2 ppm). Booster rechlorination required.',
      };
    case 2:
      return {
        bluePadCount: 2,
        frcRange: '0.2-0.5 ppm',
        numericPpm: 0.35,
        status: 'safe',
        statusLabel: 'Safe (0.2-1.0 ppm)',
        actionRequired: false,
        actionDescription: 'Meets minimum safe residual chlorine standard for rural drinking water distribution.',
      };
    case 3:
      return {
        bluePadCount: 3,
        frcRange: '0.5-1.0 ppm',
        numericPpm: 0.75,
        status: 'safe',
        statusLabel: 'Safe (0.2-1.0 ppm)',
        actionRequired: false,
        actionDescription: 'Optimal residual chlorine. Water is bacteriologically safe and pleasant to drink.',
      };
    case 4:
      return {
        bluePadCount: 4,
        frcRange: '1.0-2.0 ppm',
        numericPpm: 1.5,
        status: 'high',
        statusLabel: 'High Chlorine (>1.0 ppm)',
        actionRequired: false,
        actionDescription: 'Elevated residual chlorine. Safe against pathogens, mild chlorine odor/taste.',
      };
    case 5:
      return {
        bluePadCount: 5,
        frcRange: '2.0-5.0 ppm',
        numericPpm: 3.5,
        status: 'high',
        statusLabel: 'High Chlorine (>1.0 ppm)',
        actionRequired: false,
        actionDescription: 'High chlorine (shock/monsoon dose). Monitor dosing pump at pump house.',
      };
    case 6:
      return {
        bluePadCount: 6,
        frcRange: '>=5.0 ppm',
        numericPpm: 5.0,
        status: 'high',
        statusLabel: 'High Chlorine (>1.0 ppm)',
        actionRequired: true,
        actionDescription: 'Excess chlorine concentration. Immediate adjustment of chemical dosing needed.',
      };
    default:
      return {
        bluePadCount: 0,
        frcRange: '<0.1 ppm',
        numericPpm: 0.05,
        status: 'low',
        statusLabel: 'Low Chlorine (<0.2 ppm)',
        actionRequired: true,
        actionDescription: 'Invalid count. Assumed low chlorine.',
      };
  }
}
