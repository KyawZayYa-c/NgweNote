import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false,
  disabled = false
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';

  const getBackgroundColor = () => {
    if (disabled === true || loading === true) return '#cbd5e1';
    if (isPrimary) return colors.primary;
    if (isSecondary) return colors.secondary;
    if (isDanger) return colors.danger;
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled === true || loading === true) return '#94a3b8';
    if (isOutline) return colors.primary;
    return '#ffffff';
  };

  const buttonStyle: ViewStyle = {
    ...styles.button,
    backgroundColor: getBackgroundColor(),
    borderWidth: isOutline ? 1 : 0,
    borderColor: isOutline ? colors.primary : 'transparent',
  };

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={loading === true || disabled === true} 
    >
      {loading === true ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    minHeight: 56,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});