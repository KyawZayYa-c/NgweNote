import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../context/useAuthStore';
import { colors } from '../theme/colors';
import { fontSize } from '../theme/fontSize'; // font size ကို import လုပ်ပါ
import { LogOut, Languages, Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export const HomeScreen = () => {
  const { logout, language, setLanguage } = useAuthStore();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'mm' ? 'en' : 'mm';
    setLanguage(nextLang);
    i18n.changeLanguage(nextLang);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
        <View style={styles.topBar}>
          <View style={styles.titleArea}>
             <Text style={styles.welcomeText} numberOfLines={1}>{t('welcome')}</Text>
             <Text style={styles.guestText} numberOfLines={1}>{t('guest')}</Text>
          </View>
          
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
              <Languages color="#fff" size={18} />
              <Text style={styles.langLabel}>{language === 'mm' ? 'English' : 'မြန်မာ'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <LogOut color="#fff" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <View style={styles.balanceCard}>
             <View style={styles.balanceIconBg}>
               <Wallet color="#fff" size={24} />
             </View>
             <View style={styles.balanceTextGroup}>
               <Text style={styles.balanceLabel} numberOfLines={1}>{t('balance')}</Text>
               <Text style={styles.balanceAmount} numberOfLines={1}>0 Ks</Text>
             </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { 
    height: 280, 
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 35,
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleArea: { flex: 1, marginRight: 10 },
  
  // Font sizes တွေကို variable နဲ့ ပြောင်းသုံးထားပါတယ်
  welcomeText: { 
    color: '#fff', 
    opacity: 0.85, 
    fontSize: fontSize.sm, // 14px
    fontWeight: '500' 
  },
  guestText: { 
    color: '#fff', 
    fontSize: fontSize.xl, // 22px
    fontWeight: 'bold' 
  },
  
  langLabel: { 
    color: '#fff', 
    fontSize: fontSize.xs, // 12px
    fontWeight: 'bold' 
  },
  
  balanceLabel: { 
    color: '#fff', 
    fontSize: fontSize.md, // 16px (မြန်မာစာအတွက် ပိုကြီးပေးထားပါတယ်)
    opacity: 0.9, 
    fontWeight: '500' 
  },
  balanceAmount: { 
    color: '#fff', 
    fontSize: fontSize.xxl, // 28px
    fontWeight: 'bold', 
    marginTop: 2 
  },

  // Layout Styles
  headerIcons: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  langBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', width: 75, height: 40, borderRadius: 12 },
  logoutBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  balanceSection: { width: '100%', alignItems: 'center' },
  balanceCard: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', width: '100%', height: 110 },
  balanceIconBg: { width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  balanceTextGroup: { flex: 1 },
});