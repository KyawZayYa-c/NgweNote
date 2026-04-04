// src/theme/colors.ts

const common = {
  primary: '#00D1FF',
  secondary: '#00D1FF',
  accent: '#FF6B6B',
  income: '#00D1FF',
  expense: '#FF6B6B',
  white: '#FFFFFF',
  googleRed: '#EA4335',
};

export const lightColors = {
  ...common,
  primaryBtn: ['#6A5AE0', '#00D1FF'],
  background: '#F4F7FF',
  surface: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  border: '#E0E0E0',
  primaryGradient: ['#6A5AE0', '#00D1FF'], // Added for LinearGradient
  glassBg: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  text: {
    primary: '#1A1D1F',
    secondary: '#9A9EA4',
    onPrimary: '#FFFFFF',
  }
};
export const darkColors = {
  ...common,
  // အောက်ခြေ Background ကို အမည်းကြီး မဟုတ်ဘဲ ခပ်မှောင်မှောင် အပြာရင့်ရောင် သုံးမယ်
  background: '#0F172A', 
  // Card နဲ့ အောက်ခြေ Tab bar အတွက် ပိုလင်းတဲ့ အရောင်
  surface: '#1E293B',    
  
  // အပေါ်ပိုင်း Gradient အတွက် Premium ဆန်တဲ့ အပြာရင့်ပြေး
  primaryGradient: ['#1E293B', '#0F172A'], 
  primaryBtn: ['#42bec4c7','#9768e3f3'],
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    onPrimary: '#FFFFFF',
  }
};

export const colors = {
  light: lightColors,
  dark: darkColors,
};