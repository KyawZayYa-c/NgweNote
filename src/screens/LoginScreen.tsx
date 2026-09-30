import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { AlertModal, TopSection, LoginCard, styles } from '../components/Login';

type RootStackParamList = {
  Login: { editData?: any };
};

export const LoginScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const navigation = useNavigation<any>();
  const { loginAsGuest, loginWithGoogle, language, setLanguage } = useAuthStore();
  const { theme, toggleTheme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t } = useTranslation();

  const editData = route.params?.editData;
  const isEditMode = !!editData;

  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showCustomAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleAction = async () => {
    if (isEditMode) {
      showCustomAlert(t('success'), t('updateSuccessDesc'));
      navigation.goBack();
    } else {
      try {
        setIsGuestLoading(true);
        await loginAsGuest();
      } catch (error: any) {
        showCustomAlert(t('loginFailed'), error.message || t('loginErrorMsg'));
      } finally {
        setIsGuestLoading(false);
      }
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;

    try {
      setIsGoogleLoading(true);
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || (response as any).idToken;

      if (!idToken) {
        throw new Error('Google Sign-In failed: No ID Token');
      }
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseUser = userCredential.user;

      await loginWithGoogle({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      console.log('Google Login Error Details:', error);
      showCustomAlert(t('loginFailed'), `${t('loginErrorMsg')} - ${error.message}`);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isLoading = isGoogleLoading || isGuestLoading;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent={true}
      />

      <TopSection
        isEditMode={isEditMode}
        theme={theme}
        language={language}
        isLoading={isLoading}
        onToggleLanguage={() => setLanguage(language === 'mm' ? 'en' : 'en')}
        onToggleTheme={toggleTheme}
        onBack={() => navigation.goBack()}
        themeColors={themeColors}
        editNoteText={t('editNote')}
        updateDescText={t('updateDesc')}
        appDescText={t('appDesc')}
      />

      <LoginCard
        isEditMode={isEditMode}
        theme={theme}
        isGuestLoading={isGuestLoading}
        isGoogleLoading={isGoogleLoading}
        onGuestPress={handleAction}
        onGooglePress={handleGoogleLogin}
        themeColors={themeColors}
        cardTitle={isEditMode ? t('editListTitle') : t('chooseOption')}
        guestText={t('loginGuest')}
        editBtnText={t('editBtnText')}
        orText={t('or')}
        googleText={t('loginGoogle')}
        connectingText={t('connectingGoogle')}
      />

      <View style={styles.footerContainer}>
        <Text style={[styles.footerText, { color: themeColors.text.secondary }]}>
          {isEditMode ? t('updateFooter') : t('footerNote')}
        </Text>
      </View>

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        themeColors={themeColors}
        okText={t('ok') || 'OK'}
      />
    </View>
  );
};