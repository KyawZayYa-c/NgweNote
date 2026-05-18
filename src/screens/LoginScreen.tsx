//src/screens/LoginScreen.tsx
import React, { useEffect } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import { fontSize } from '../theme/fontSize';
import { User, Wallet, Languages, Moon, Sun, Edit3, XCircle } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ✅ Navigation Type သတ်မှတ်ခြင်း
type RootStackParamList = {
  Login: { editData?: any };
};

export const LoginScreen = () => {
  // ✅ Route ကို Type သတ်မှတ်လိုက်ခြင်းဖြင့် editData error ပျောက်သွားပါမည်
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const navigation = useNavigation<any>();
 const { loginAsGuest, loginWithGoogle, language, setLanguage } = useAuthStore();
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


  
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "925381789702-dgt9his7phe5kifhd4dsh0sv4ljctqho.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);
  

const handleGoogleLogin = async () => {
  try {
    // ၁။ Google Sign-In ခေါ်မယ်
    const response = await GoogleSignin.signIn();
    
    // Version အသစ်တွေမှာ response structure ကို console.log နဲ့ အရင်ကြည့်ပါ
    // ပုံမှန်အားဖြင့် response.data.idToken (သို့) response.idToken ဖြစ်ပါတယ်
    const idToken = response.data?.idToken || (response as any).idToken;

    if (!idToken) {
      throw new Error('Google Sign-In failed: No ID Token');
    }

    // ၂။ Credential တည်ဆောက်မယ်
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    
    // ၃။ Firebase နဲ့ Sign-in ဝင်မယ်
    const userCredential = await auth().signInWithCredential(googleCredential);
    const firebaseUser = userCredential.user;

    // ၄။ အစ်ကို့ရဲ့ Auth Store ထဲ သိမ်းမယ်
    await loginWithGoogle({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL
    });
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
    
  } catch (error: any) {
    console.log('Google Login Error Details:', error);
    // Error code 12500 တို့ 7 တို့ဆိုရင် SHA-1 key မမှန်လို့ ဖြစ်တာ များပါတယ်
    Alert.alert("Login Failed", "အကောင့်ဝင်လို့ မရပါ - " + error.message);
  }
};
  
  
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      backgroundColor="transparent" // အပေါ်ဆုံးဘားကို အရောင်ဖောက်မြင်ရအောင် လုပ်တာပါ
  translucent={true}
      />
      <LinearGradient 
        colors={theme === 'light' ? ['#5e3fbb', '#e711ee'] : ['#25519a', '#162038']} 
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
          {/* 🌟 Logo Icon Box */}
          <View style={[
            styles.logoIcon, 
            theme === 'dark' && { backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }
          ]}>
            {isEditMode ? (
              <Edit3 color={themeColors.primary} size={35} />
            ) : (
              <Wallet color={themeColors.primary} size={35} />
            )}
          </View>
          
          <View style={styles.titleContainer}>
            <View style={styles.logoTextRow}>
              <Text style={styles.appTitle}>
                {isEditMode ? "Edit Note" : "Ngwe"}
              </Text>
              {!isEditMode && (
                <Text style={[
                  styles.appTitleNote, 
                  { color: theme === 'light' ? '#688bac' : '#00D1FF' }
                ]}>
                  Note
                </Text>
              )}
            </View>
            <Text style={styles.appDesc}>
              {isEditMode ? "ပြင်ဆင်လိုသည့် အချက်အလက်များကို ပြောင်းလဲပါ" : t('appDesc')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cardContainer}>
        <View 
          style={[
            styles.card, 
            { 
              backgroundColor: themeColors.surface,
              shadowColor: theme === 'dark' ? '#00D1FF' : '#000',
              shadowOpacity: theme === 'dark' ? 0.25 : 0.12,
              elevation: theme === 'dark' ? 20 : 12,
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#E0E0E0',
              borderWidth: theme === 'dark' ? 1.5 : 0,
            }
          ]}
        >
          <Text style={[styles.cardTitle, { color: themeColors.text.primary }]}>
            {isEditMode ? "Transaction Details" : t('chooseOption')}
          </Text>

          {/* Guest Login Button */}
          <TouchableOpacity 
            style={[
              styles.actionBtn, 
              { backgroundColor: isEditMode ? themeColors.primary : (theme === 'dark' ? '#24334d' : '#F0EEFF') },
              theme === 'dark' && { borderWidth: 1, borderColor: 'rgba(0, 209, 255, 0.3)' }
            ]} 
            onPress={handleAction}
            activeOpacity={0.8}
          >
            {isEditMode ? (
              <Edit3 color="#fff" size={22} />
            ) : (
              <User color={theme === 'dark' ? '#00D1FF' : '#5e3fbb'} size={22} />
            )}
            <Text style={[
              styles.btnText, 
              { color: isEditMode ? '#fff' : (theme === 'dark' ? '#00D1FF' : '#1A1D1F') }
            ]}>
              {isEditMode ? "Update Changes" : t('loginGuest')}
            </Text>
          </TouchableOpacity>

          {!isEditMode && (
            <>
              <View style={styles.dividerRow}>
                <View style={[styles.line, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E0E0E0' }]} />
                <Text style={[styles.orText, { color: themeColors.text.secondary }]}>
                  {t('or')}
                </Text>
                <View style={[styles.line, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E0E0E0' }]} />
              </View>

              {/* Google Login Button */}
              <TouchableOpacity 
                style={[
                  styles.actionBtn, 
                  styles.googleBtn,
                  theme === 'dark' && { backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5 }
                ]} 
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <AntDesign name="google" size={22} color="#EA4335" />
                <Text style={[styles.btnText, { color: theme === 'dark' ? '#F8FAFC' : '#1A1D1F' }]}>
                  {t('loginGoogle')}
                </Text>
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
  topSection: { height: '48%', justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 50, borderBottomRightRadius: 50 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 15, width: '80%', marginTop: 20 },
  titleContainer: { flex: 1 },
  logoTextRow: { flexDirection: 'row', alignItems: 'center' },
  appTitle: { fontSize: fontSize.huge, fontWeight: 'bold', color: '#fff' },
  appTitleNote: { fontSize: fontSize.huge, fontWeight: 'bold', marginLeft: 5 },
  appDesc: { fontSize: fontSize.sm, marginTop: 5, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  
  // Card Layout & Depths
  cardContainer: { alignItems: 'center', marginTop: -80 },
  card: { 
    width: SCREEN_WIDTH * 0.88, 
    padding: 28, 
    borderRadius: 30, 
    shadowOffset: { width: 0, height: 12 }, 
    shadowRadius: 16 
  },
  cardTitle: { textAlign: 'center', marginBottom: 25, fontSize: fontSize.md, fontWeight: '700' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, height: 58, borderRadius: 18, width: '100%' },
  btnText: { fontWeight: '700', fontSize: fontSize.md },
  googleBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  line: { flex: 1, height: 1 },
  orText: { marginHorizontal: 15, fontSize: fontSize.xs, fontWeight: '600' },
  
  // Top Floating Bars
  langBtn: { position: 'absolute', top: 50, left: 20, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.22)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  themeBtn: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(255,255,255,0.22)', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  langText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '600' },
  
  // Logo Box
  logoIcon: { width: 70, height: 70, backgroundColor: '#fff', borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  
  footerContainer: { position: 'absolute', bottom: 25, width: '100%', paddingHorizontal: 20, alignItems: 'center' },
  footerText: { fontSize: fontSize.xs, textAlign: 'center', lineHeight: 20, fontWeight: '500', opacity: 0.85 },
});