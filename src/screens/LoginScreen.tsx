import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../context/useAuthStore';
import { colors } from '../theme/colors';
import { fontSize } from '../theme/fontSize';
import { User, Wallet, Languages } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LoginScreen = () => {
  const { loginAsGuest, language, setLanguage } = useAuthStore();
  const { t } = useTranslation();

  const toggleLang = () => {
    const nextLang = language === 'mm' ? 'en' : 'mm';
    setLanguage(nextLang);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.topSection}>
        <TouchableOpacity style={styles.langBtn} onPress={toggleLang}>
          <Languages color="#fff" size={18} />
          <Text style={styles.langText}>{language === 'mm' ? 'English' : 'မြန်မာ'}</Text>
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Wallet color={colors.primary} size={35} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.appTitle}>
              Ngwe<Text style={styles.appTitleItalic}>Note</Text>
            </Text>
            <Text style={styles.appDesc} numberOfLines={2}>{t('appDesc')}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {t('chooseOption')}
          </Text>
          
          <TouchableOpacity style={styles.actionBtn} onPress={loginAsGuest}>
            <User color={colors.primary} size={22} />
            <Text style={styles.btnText} numberOfLines={1} adjustsFontSizeToFit>
              {t('loginGuest')}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>{t('or')}</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.googleBtn]} 
            onPress={() => alert('Coming Soon')}
          >
            <AntDesign name="google" size={22} color="#EA4335" />
            <Text style={styles.btnText} numberOfLines={1} adjustsFontSizeToFit>
              {t('loginGoogle')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>{t('footerNote')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topSection: { 
    height: '45%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderBottomLeftRadius: 50, 
    borderBottomRightRadius: 50 
  },
  logoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 15,
    width: '80%',
  },
  titleContainer: { flex: 1 },
  appTitle: { 
    fontSize: fontSize.huge,
    fontWeight: 'normal', 
    color: '#fff', 
    letterSpacing: 1 
  },
  appTitleItalic: { color: colors.secondary, fontStyle: 'italic' },
  appDesc: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: fontSize.sm,
    marginTop: 5,
    lineHeight: 18,
    fontWeight: 'normal'
  },
  cardContainer: { alignItems: 'center', marginTop: -60, zIndex: 10 },
  card: { 
    width: SCREEN_WIDTH * 0.85, 
    minHeight: 280, 
    padding: 25, 
    backgroundColor: '#fff', 
    borderRadius: 30, 
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    justifyContent: 'center'
  },
  cardTitle: { 
    textAlign: 'center', 
    marginBottom: 25, 
    fontSize: fontSize.md,
    fontWeight: 'normal', 
    color: colors.text.primary 
  },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12, 
    height: 56, 
    borderRadius: 15, 
    backgroundColor: '#F0EEFF', 
    width: '100%' 
  },
  btnText: { 
    fontWeight: 'normal', 
    color: colors.text.primary,
    fontSize: fontSize.md 
  },
  googleBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#e4d2d2' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#eee' },
  orText: { 
    marginHorizontal: 10, 
    color: colors.text.secondary, 
    fontSize: fontSize.xs,
    fontWeight: 'normal'
  },
  langBtn: { 
    position: 'absolute', 
    top: 50, 
    right: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  langText: { 
    color: '#fff', 
    fontSize: fontSize.xs,
    fontWeight: 'normal' 
  },
  logoIcon: { 
    width: 65, 
    height: 65, 
    backgroundColor: '#fff', 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 10 
  },
  footerContainer: { position: 'absolute', bottom: 30, width: '100%', paddingHorizontal: 20 },
  footerText: {
    fontSize: fontSize.xs,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: 'normal',
  },
});