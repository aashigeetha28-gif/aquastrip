import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'safe' | 'danger' | 'outline';
  size?: 'normal' | 'large' | 'small';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  subtitle?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  subtitle,
}) => {
  let bgColor = Colors.primary;
  let textColor = '#FFFFFF';
  let borderColor = Colors.primary;

  if (variant === 'secondary') {
    bgColor = Colors.surface;
    textColor = Colors.textPrimary;
    borderColor = Colors.border;
  } else if (variant === 'safe') {
    bgColor = Colors.safe;
    textColor = '#FFFFFF';
    borderColor = Colors.safe;
  } else if (variant === 'danger') {
    bgColor = Colors.low;
    textColor = '#FFFFFF';
    borderColor = Colors.low;
  } else if (variant === 'outline') {
    bgColor = 'transparent';
    textColor = Colors.primary;
    borderColor = Colors.primary;
  }

  const isLarge = size === 'large';
  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonBase,
        { backgroundColor: bgColor, borderColor: borderColor },
        isLarge && styles.buttonLarge,
        isSmall && styles.buttonSmall,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size={isSmall ? 'small' : 'small'} />
      ) : (
        <View style={styles.contentRow}>
          {icon && (
            <Ionicons
              name={icon}
              size={isSmall ? 16 : isLarge ? 22 : 18}
              color={textColor}
              style={{ marginRight: 8 }}
            />
          )}
          <View style={styles.textColumn}>
            <Text
              style={[
                styles.titleText,
                { color: textColor },
                isLarge && styles.titleLarge,
                isSmall && styles.titleSmall,
                textStyle,
              ]}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  styles.subtitleText,
                  { color: variant === 'secondary' || variant === 'outline' ? Colors.textSecondary : '#E0F2FE' },
                ]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonLarge: {
    minHeight: 56, // Large touch target for field workers
    paddingVertical: 16,
    borderRadius: 16,
  },
  buttonSmall: {
    minHeight: 38,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  titleLarge: {
    fontSize: 17,
  },
  titleSmall: {
    fontSize: 13,
  },
  subtitleText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.55,
  },
});
