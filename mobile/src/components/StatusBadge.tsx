import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FrcStatus } from '../types';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface StatusBadgeProps {
  status: FrcStatus;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  showIcon = true,
}) => {
  let bg = Colors.safeLight;
  let text = Colors.safe;
  let border = Colors.safeBorder;
  let label = 'SAFE (0.2 - 1.0 ppm)';
  let iconName: keyof typeof Ionicons.glyphMap = 'checkmark-circle';

  if (status === 'low') {
    bg = Colors.lowLight;
    text = Colors.low;
    border = Colors.lowBorder;
    label = 'LOW FRC (<0.2 ppm)';
    iconName = 'alert-circle';
  } else if (status === 'high') {
    bg = Colors.highLight;
    text = Colors.high;
    border = Colors.highBorder;
    label = 'HIGH (>1.0 ppm)';
    iconName = 'warning';
  }

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        isSmall && styles.badgeSmall,
        isLarge && styles.badgeLarge,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={iconName}
          size={isSmall ? 13 : isLarge ? 20 : 16}
          color={text}
          style={{ marginRight: 5 }}
        />
      )}
      <Text
        style={[
          styles.text,
          { color: text },
          isSmall && styles.textSmall,
          isLarge && styles.textLarge,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLarge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSmall: {
    fontSize: 11,
    fontWeight: '600',
  },
  textLarge: {
    fontSize: 15,
    fontWeight: '800',
  },
});
