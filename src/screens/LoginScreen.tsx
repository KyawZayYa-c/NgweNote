import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../context/useAuthStore';
import { colors } from '../theme/colors';
import { CustomButton } from '../components/CustomButton';
import { Wallet } from 'lucide-react-native';

export const LoginScreen = () => {
  const { loginAsGuest } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGuestLogin = async () => {
    setIsAuthenticating(true);
    try {
      await loginAsGuest();
    } catch (error) {
      Alert.alert('မှားယွင်းမှုဖြစ်ပေါ်ခဲ့ပါသည်', 'ဧည့်သည်အဖြစ်ဝင်ရောက်ရန် မအောင်မြင်ပါ။');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogin = async () => {
    Alert.alert('Google Login', 'Google နှင့်ဝင်ရောက်ရန် Native setup လိုအပ်ပါသည်။');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Wallet size={80} color={colors.primary} />
        </View>
        <Text style={styles.appName}>NgweNote</Text>
        <Text style={styles.tagline}>သင်၏ အသုံးစရိတ်များကို အလွယ်တကူ မှတ်တမ်းတင်ပါ</Text>
      </View>

      <View style={styles.footer}>
        <CustomButton 
          title="Google နှင့်ဝင်ရန်" 
          onPress={handleGoogleLogin} 
          loading={isAuthenticating === true} 
        />
        
        <CustomButton 
          title="ဧည့်သည်အဖြစ်သုံးရန်" 
          onPress={handleGuestLogin} 
          variant="outline"
          loading={isAuthenticating === true} 
          disabled={isAuthenticating === true}
        />

        <Text style={styles.disclaimer}>
          ဧည့်သည်အဖြစ်သုံးပါက ဒေတာများကို cloud တွင် သိမ်းဆည်းမည်မဟုတ်ပါ။
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 60,
  },
  disclaimer: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
});