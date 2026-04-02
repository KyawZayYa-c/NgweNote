import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

export const CustomButton = ({ title, onPress, variant = 'primary', loading, disabled }: any) => {
  // Expo အတွက် အရေးကြီးဆုံးအပိုင်း - အတင်း Boolean ပြောင်းတာပါ
  const isLoading = loading === true; 
  const isDisabled = disabled === true;
  const isOutline = variant === 'outline';

  const getBackgroundColor = () => {
  if (isDisabled || isLoading) return '#cbd5e1';
  if (variant === 'primary') return colors.primary;
  if (variant === 'secondary') return colors.secondary;
  if (variant === 'danger') return colors.danger;
  // 'transparent' အစား ကာလာကုဒ် အသေ သုံးပါ
  return 'rgba(0,0,0,0)'; 
};


  const getTextColor = () => {
    if (isDisabled || isLoading) return '#94a3b8';
    return isOutline ? colors.primary : '#ffffff';
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      // ဤနေရာတွင် logic ကို အသေအချာ boolean ဖြစ်အောင်လုပ်ပါ
      disabled={isLoading || isDisabled} 
      style={[
        styles.button, 
        { 
          backgroundColor: getBackgroundColor(),
          borderWidth: isOutline ? 1 : 0,
         borderColor: isOutline ? colors.primary : 'rgba(0,0,0,0)'
        }
      ]}
    >
      {isLoading ? (
        // ActivityIndicator ရဲ့ color prop မှာ string မှန်ဖို့လိုပါတယ်
        <ActivityIndicator color={getTextColor()} size="small" />
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