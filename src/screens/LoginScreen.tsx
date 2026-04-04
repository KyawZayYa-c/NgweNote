import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import { fontSize } from '../theme/fontSize';
import { User, Wallet, Languages, Moon, Sun, Edit3, XCircle } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ✅ Navigation Type သတ်မှတ်ခြင်း
type RootStackParamList = {
  Login: { editData?: any };
};

export const LoginScreen = () => {
  // ✅ Route ကို Type သတ်မှတ်လိုက်ခြင်းဖြင့် editData error ပျောက်သွားပါမည်
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const navigation = useNavigation<any>();
  const { loginAsGuest, language, setLanguage } = useAuthStore();
  const { theme, toggleTheme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t } = useTranslation();

  const editData = route.params?.editData; 
  const isEditMode = !!editData;

  const handleAction = () => {
    if (isEditMode) {
      Alert.alert("Update Successful");
      navigation.goBack();
    } else {
      loginAsGuest();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
      
      <LinearGradient 
        colors={theme === 'light' ? [themeColors.primary, themeColors.secondary] : ['#111322', '#1A1D30']} 
        style={styles.topSection}
      >
        {!isEditMode && (
          <>
            <TouchableOpacity 
              style={styles.langBtn} 
              onPress={() => setLanguage(language === 'mm' ? 'en' : 'mm')}
              activeOpacity={0.7}
            >
              <Languages color="#fff" size={18} />
              <Text style={styles.langText}>{language === 'mm' ? 'English' : 'မြန်မာ'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.themeBtn} 
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {theme === 'light' ? <Moon color="#fff" size={20} /> : <Sun color="#fff" size={20} />}
            </TouchableOpacity>
          </>
        )}

        {isEditMode && (
          <TouchableOpacity 
            style={styles.themeBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <XCircle color="#fff" size={24} />
          </TouchableOpacity>
        )}

        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            {isEditMode ? (
              <Edit3 color={themeColors.primary} size={35} />
            ) : (
              <Wallet color={themeColors.primary} size={35} />
            )}
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.appTitle}>
              {isEditMode ? "Edit Note" : "NgweNote"}
            </Text>
            <Text style={styles.appDesc}>
              {isEditMode ? "ပြင်ဆင်လိုသည့် အချက်အလက်များကို ပြောင်းလဲပါ" : t('appDesc')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
          
          <Text style={[styles.cardTitle, { color: themeColors.text.primary }]}>
            {isEditMode ? "Transaction Details" : t('chooseOption')}
          </Text>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: isEditMode ? themeColors.primary : '#F0EEFF' }]} 
            onPress={handleAction}
            activeOpacity={0.8}
          >
            {isEditMode ? (
              <Edit3 color="#fff" size={22} />
            ) : (
              <User color={themeColors.primary} size={22} />
            )}
            <Text style={[styles.btnText, { color: isEditMode ? '#fff' : '#1A1D1F' }]}>
              {isEditMode ? "Update Changes" : t('loginGuest')}
            </Text>
          </TouchableOpacity>

          {!isEditMode && (
            <>
              <View style={styles.dividerRow}>
                <View style={[styles.line, { backgroundColor: themeColors.border }]} />
                <Text style={[styles.orText, { color: themeColors.text.secondary }]}>
                  {t('or')}
                </Text>
                <View style={[styles.line, { backgroundColor: themeColors.border }]} />
              </View>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.googleBtn]} 
                onPress={() => {}}
                activeOpacity={0.8}
              >
                <AntDesign name="google" size={22} color="#EA4335" />
                <Text style={[styles.btnText, { color: '#1A1D1F' }]}>{t('loginGoogle')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Text style={[styles.footerText, { color: themeColors.text.secondary }]}>
          {isEditMode ? "ပြင်ဆင်မှုများပြီးဆုံးပါက Update ကိုနှိပ်ပါ" : t('footerNote')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: { height: '45%', justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 50, borderBottomRightRadius: 50 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 15, width: '80%', marginTop: 20 },
  titleContainer: { flex: 1 },
  appTitle: { fontSize: fontSize.huge, fontWeight: 'bold', color: '#fff' },
  appDesc: { fontSize: fontSize.sm, marginTop: 5, color: 'rgba(255,255,255,0.9)' },
  cardContainer: { alignItems: 'center', marginTop: -70 },
  card: { width: SCREEN_WIDTH * 0.88, padding: 28, borderRadius: 30, elevation: 20, shadowOpacity: 0.15, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowRadius: 15 },
  cardTitle: { textAlign: 'center', marginBottom: 25, fontSize: fontSize.md, fontWeight: '700' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, height: 58, borderRadius: 18, width: '100%', elevation: 2 },
  btnText: { fontWeight: '700', fontSize: fontSize.md },
  googleBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  line: { flex: 1, height: 1 },
  orText: { marginHorizontal: 15, fontSize: fontSize.xs, fontWeight: '600' },
  langBtn: { position: 'absolute', top: 50, left: 20, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.25)', padding: 10, borderRadius: 20 },
  themeBtn: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(255,255,255,0.25)', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  langText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '600' },
  logoIcon: { width: 70, height: 70, backgroundColor: '#fff', borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  footerContainer: { position: 'absolute', bottom: 25, width: '100%', paddingHorizontal: 20, alignItems: 'center' },
  footerText: { fontSize: fontSize.xs, textAlign: 'center', lineHeight: 20, fontWeight: '500', opacity: 0.85 },
});