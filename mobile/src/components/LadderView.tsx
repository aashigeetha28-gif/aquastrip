import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PAD_LADDER_CONFIG, Colors } from '../constants/theme';
import { PadClassification } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface LadderViewProps {
  pads?: PadClassification[];
  bluePadCount?: number;
  interactive?: boolean;
  onPadPress?: (padIndex: number) => void;
  orientation?: 'vertical' | 'horizontal';
}

export const LadderView: React.FC<LadderViewProps> = ({
  pads,
  bluePadCount = 0,
  interactive = false,
  onPadPress,
  orientation = 'vertical',
}) => {
  // If pads array is provided, use it; otherwise construct from bluePadCount
  const padItems = PAD_LADDER_CONFIG.map((cfg) => {
    const fromPads = pads?.find((p) => p.index === cfg.index);
    const isBlue = fromPads ? fromPads.isBlue : cfg.index <= bluePadCount;
    return {
      ...cfg,
      isBlue,
    };
  });

  const isVertical = orientation === 'vertical';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Cl-Ladder Reagent Strip (6 Pads)</Text>
        <Text style={styles.subtitle}>
          {interactive
            ? 'Tap any pad to toggle blue / off-white'
            : `${pads ? pads.filter((p) => p.isBlue).length : bluePadCount} of 6 reactive pads`}
        </Text>
      </View>

      {/* Safe Zone bracket indicator */}
      <View style={styles.safeZoneLegend}>
        <View style={styles.safeDot} />
        <Text style={styles.safeZoneText}>JJM Safe Drinking Range: 0.2 to 1.0 ppm (Pads #2 to #4)</Text>
      </View>

      <View style={[styles.stripBody, isVertical ? styles.stripVertical : styles.stripHorizontal]}>
        {padItems.map((pad) => {
          const isSafeTier = pad.index >= 2 && pad.index <= 4;
          return (
            <TouchableOpacity
              key={pad.index}
              disabled={!interactive}
              activeOpacity={0.7}
              onPress={() => onPadPress && onPadPress(pad.index)}
              style={[
                styles.padWrapper,
                isSafeTier && styles.padWrapperSafe,
                interactive && styles.padWrapperInteractive,
              ]}
            >
              <View style={styles.padInfoLeft}>
                <View style={styles.indexCircle}>
                  <Text style={styles.indexNumber}>#{pad.index}</Text>
                </View>
                <View>
                  <Text style={styles.ppmLabel}>{pad.label}</Text>
                  <Text style={styles.descText}>{pad.description}</Text>
                </View>
              </View>

              {/* Physical strip pad square */}
              <View style={styles.padSquareContainer}>
                <View
                  style={[
                    styles.padSquare,
                    pad.isBlue ? styles.padSquareBlue : styles.padSquareInactive,
                  ]}
                >
                  <Ionicons
                    name={pad.isBlue ? 'water' : 'ellipse-outline'}
                    size={18}
                    color={pad.isBlue ? '#FFFFFF' : '#94A3B8'}
                  />
                </View>
                <Text
                  style={[
                    styles.padStateLabel,
                    pad.isBlue ? styles.stateLabelBlue : styles.stateLabelInactive,
                  ]}
                >
                  {pad.isBlue ? 'BLUE' : 'NONE'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginVertical: 10,
  },
  headerRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  safeZoneLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.safeLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.safeBorder,
  },
  safeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.safe,
    marginRight: 6,
  },
  safeZoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.safe,
  },
  stripBody: {
    backgroundColor: Colors.stripBody,
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: '#E2D9C8',
  },
  stripVertical: {
    flexDirection: 'column',
    gap: 8,
  },
  stripHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  padWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  padWrapperSafe: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.safe,
  },
  padWrapperInteractive: {
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  padInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  indexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  ppmLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  descText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  padSquareContainer: {
    alignItems: 'center',
  },
  padSquare: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  padSquareBlue: {
    backgroundColor: Colors.padActive,
    borderColor: Colors.padActiveBorder,
  },
  padSquareInactive: {
    backgroundColor: Colors.padInactive,
    borderColor: Colors.padInactiveBorder,
  },
  padStateLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  stateLabelBlue: {
    color: Colors.padActive,
  },
  stateLabelInactive: {
    color: '#78716C',
  },
});
