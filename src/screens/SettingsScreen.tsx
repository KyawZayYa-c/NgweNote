import React, { useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { View, Text, ScrollView, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Lock,
  Unlock,
  Languages,
  Moon,
  LogOut,
  Trash2,
  CheckCircle2,
  RefreshCw,
  BellRing,
  AlertTriangle,
  ShieldCheck,
  Settings,
} from 'lucide-react-native';
import { useThemeStore } from '../context/useThemeStore';
import { useAuthStore } from '../context/useAuthStore';
import { useExpenseStore } from '../context/useExpenseStore';
import { useTranslation } from 'react-i18next';
import { db } from '../services/firebaseConfig';
import {
  SettingRow,
  ProfileCard,
  SecurityAlertModal,
  CustomAlertModal,
  PasscodeManageSheet,
  PinInputCard,
  ConfirmResetSheet,
  AdminNotiModal,
  styles,
} from '../components/Settings';

export const SettingsScreen = () => {
  const { theme, toggleTheme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t, i18n } = useTranslation();
  const { user, isGuest, logout } = useAuthStore();
  const { userPasscode, setPasscode, removePasscode, clearAllData, setAdminNoti } =
    useExpenseStore();

  const [tempPin, setTempPin] = useState('');
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [pinCardVisible, setPinCardVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const [securityAlertVisible, setSecurityAlertVisible] = useState(false);
  const [confirmResetVisible, setConfirmResetVisible] = useState(false);
  const [notiModalVisible, setNotiModalVisible] = useState(false);
  const [notiTitle, setNotiTitle] = useState('');
  const [notiMessage, setNotiMessage] = useState('');
  const [notiHistory, setNotiHistory] = useState<any[]>([]);

  const isAdmin = user?.role === 'admin';

  const [passModalVisible, setPassModalVisible] = useState(false);
  const [passMode, setPassMode] = useState<
    'create' | 'change' | 'remove' | 'manage_options' | 'reset'
  >('manage_options');
  const [currentStep, setCurrentStep] = useState<
    | 'enter_old'
    | 'set_new'
    | 'confirm_new'
    | 'confirm_remove'
    | 'success'
    | 'manage_options'
  >('set_new');
  const [passcodeData, setPasscodeData] = useState({
    old: '',
    new: '',
    confirm: '',
  });
  const [checking, setChecking] = useState(false);

  const openPassModal = (mode: 'create' | 'manage_options') => {
    setPassMode(mode);
    if (mode === 'create') {
      setCurrentStep('set_new');
      setPinCardVisible(true);
    } else {
      setCurrentStep('manage_options');
      setPassModalVisible(true);
    }
    setPasscodeData({ old: '', new: '', confirm: '' });
  };

  const handleSecurityCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setSecurityAlertVisible(true);
    }, 1000);
  };

  const resetPinFlow = () => {
    setPinCardVisible(false);
    setPassModalVisible(false);
    setTempPin('');
    setPasscodeData({ old: '', new: '', confirm: '' });
    if (userPasscode) {
      setCurrentStep('manage_options');
    } else {
      setCurrentStep('set_new');
    }
  };

  const handleNextStep = async () => {
    if (tempPin.length !== 4) return;

    if (currentStep === 'enter_old') {
      if (tempPin === userPasscode) {
        if (passMode === 'reset') {
          await clearAllData();
          resetPinFlow();
          alert(t('resetSuccess'));
        } else if (passMode === 'remove') {
          setCurrentStep('confirm_remove');
          setPinCardVisible(false);
          setPassModalVisible(true);
        } else {
          setCurrentStep('set_new');
        }
        setTempPin('');
      } else {
        alert(t('wrongPasscode'));
        setTempPin('');
      }
    } else if (currentStep === 'set_new') {
      setPasscodeData({ ...passcodeData, new: tempPin });
      setTempPin('');
      setCurrentStep('confirm_new');
    } else if (currentStep === 'confirm_new') {
      if (tempPin === passcodeData.new) {
        await setPasscode(tempPin);
        resetPinFlow();
        setTempPin('');
      } else {
        alert(t('mismatchPIN'));
        setTempPin('');
      }
    }
  };

  const handleSendNoti = async () => {
    if (notiMessage.trim() === '') {
      alert('Title ရော Message ရော ထည့်ပေးပါဗျာ။');
      return;
    }

    try {
      await db.collection('notifications').doc('global_announcement').set({
        title: notiTitle,
        message: notiMessage,
        createdAt: new Date().toISOString(),
        sender: 'Admin',
      });
      setNotiTitle('');
      setNotiMessage('');
      alert('Notification sent successfully!');
    } catch (error) {
      alert('Error sending notification');
    }
  };

  const handleResetAction = async () => {
    if (userPasscode) {
      setPassMode('reset');
      setConfirmResetVisible(false);
      setCurrentStep('enter_old');
      setPinCardVisible(true);
    } else {
      try {
        await clearAllData();
        setConfirmResetVisible(false);
        alert(t('resetSuccess'));
      } catch (error) {
        alert('Error clearing data');
      }
    }
  };

  const handleLogout = async () => {
    try {
      if (!isGuest) {
        const currentUser = await GoogleSignin.getCurrentUser();

        if (currentUser) {
          try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
          } catch (e) {
            console.log('Google SDK silent cleanup');
          }
        }
      }
      await logout();
    } catch (error: any) {
      console.log('Logout Process Error:', error.message);
      await logout();
    }
  };

  return (
    <View style={[styles.container, { flex: 1, backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={themeColors.primaryGradient || ['#4A6CF7', '#6A85F1']}
        style={styles.header}
      >
        <View style={styles.screenHeaderTitleRow}>
          <Settings size={24} color="#fff" />
          <Text style={styles.screenHeaderTitleText}>{t('settings')}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 70 }}
      >
        <ProfileCard
          isGuest={isGuest}
          user={user}
          themeColors={themeColors}
          guestUserText={t('guestUser')}
          cloudSyncedText={t('cloudSynced')}
          notSyncedText={t('NotSynced')}
        />

        <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
            {t('security')}
          </Text>

          <SettingRow
            icon={
              checking
                ? RefreshCw
                : userPasscode && userPasscode !== ''
                ? ShieldCheck
                : AlertTriangle
            }
            label={t('securityCheckout')}
            value={userPasscode && userPasscode !== '' ? t('strong') : t('weak')}
            isDanger={!userPasscode || userPasscode === ''}
            onPress={handleSecurityCheck}
          />

          <SettingRow
            icon={userPasscode ? Lock : Unlock}
            label={userPasscode ? t('managePasscode') : t('setPasscode')}
            isDanger={!userPasscode}
            onPress={() => openPassModal(userPasscode ? 'manage_options' : 'create')}
          />
        </View>

        {isAdmin && (
          <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
            <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>
              Admin Panel
            </Text>
            <SettingRow
              icon={BellRing}
              label="Global Notification"
              onPress={() => setNotiModalVisible(true)}
            />
          </View>
        )}

        <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
            {t('preferences')}
          </Text>
          <SettingRow
            icon={Languages}
            label={t('language')}
            value={i18n.language === 'mm' ? 'English' : 'မြန်မာ'}
            onPress={() =>
              i18n.changeLanguage(i18n.language === 'mm' ? 'en' : 'mm')
            }
          />
          <SettingRow
            icon={Moon}
            label={t('theme')}
            isToggle
            toggleValue={theme === 'dark'}
            onToggleChange={toggleTheme}
          />
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: themeColors.surface,
              alignItems: 'center',
              paddingVertical: 30,
            },
          ]}
        >
          <Image source={require('../../assets/icon.png')} style={styles.aboutLogo} />
          <Text style={[styles.aboutAppName, { color: themeColors.text.primary }]}>
            NgweNote
          </Text>
          <Text style={{ color: themeColors.text.secondary }}>
            {t('version')} 1.0.0
          </Text>
          <View style={styles.devTag}>
            <Text style={{ color: themeColors.text.secondary, fontSize: 12 }}>
              {t('developer')}
            </Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
          <SettingRow
            icon={Trash2}
            label={t('resetData')}
            isDanger
            onPress={() => setConfirmResetVisible(true)}
          />
          <SettingRow
            icon={LogOut}
            label={t('logout')}
            isDanger
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      <AdminNotiModal
        visible={notiModalVisible}
        onClose={() => setNotiModalVisible(false)}
        title={notiTitle}
        message={notiMessage}
        onChangeTitle={setNotiTitle}
        onChangeMessage={setNotiMessage}
        onSend={handleSendNoti}
        history={notiHistory}
        onDeleteHistory={(id) =>
          setNotiHistory((prev) => prev.filter((item) => item.id !== id))
        }
        themeColors={themeColors}
        labels={{
          headerTitle: 'Admin Notifications',
          titlePlaceholder: 'Enter title (e.g. Welcome Back!)',
          messagePlaceholder: 'Enter notification message...',
          sendText: 'Send to All',
          historyTitle: 'Recently Sent',
          emptyHistory: 'No history yet',
        }}
      />

      <SecurityAlertModal
        visible={securityAlertVisible}
        hasPasscode={!!userPasscode}
        onClose={() => setSecurityAlertVisible(false)}
        onSetNow={() => setPinCardVisible(true)}
        themeColors={themeColors}
        strongText={t('strong')}
        weakText={t('weak')}
        secureDescText={t('secureDesc')}
        unsecureDescText={t('unsecureDesc')}
        gotItText={t('gotIt')}
        setNowText={t('setNow')}
      />

      <CustomAlertModal
        visible={customAlertVisible}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setCustomAlertVisible(false)}
        themeColors={themeColors}
        gotItText={t('gotIt')}
      />

      <PasscodeManageSheet
        visible={passModalVisible}
        currentStep={currentStep}
        onClose={() => setPassModalVisible(false)}
        onChangePin={() => {
          setPassMode('change');
          setCurrentStep('enter_old');
          setPassModalVisible(false);
          setPinCardVisible(true);
        }}
        onRemovePin={() => {
          setPassMode('remove');
          setCurrentStep('enter_old');
          setPassModalVisible(false);
          setPinCardVisible(true);
        }}
        onConfirmRemove={async () => {
          await removePasscode();
          resetPinFlow();
        }}
        onDone={() => {
          setPassModalVisible(false);
          setPinCardVisible(false);
        }}
        themeColors={themeColors}
        labels={{
          passwordSecurity: t('passwordSecurity'),
          changePin: t('changePin'),
          removePassword: t('removePassword'),
          removePasswordTitle: t('removePasswordTitle'),
          removePasswordDesc: t('removePasswordDesc'),
          remove: t('remove'),
          successTitle: t('successTitle'),
          done: t('done'),
        }}
      />

      <PinInputCard
        visible={pinCardVisible}
        currentStep={currentStep}
        tempPin={tempPin}
        onChangePin={setTempPin}
        onCancel={resetPinFlow}
        onBack={() => setCurrentStep('set_new')}
        onConfirm={async () => {
          if (currentStep === 'confirm_remove') {
            await removePasscode();
            resetPinFlow();
          } else if (currentStep === 'success') {
            resetPinFlow();
          } else {
            handleNextStep();
          }
        }}
        themeColors={themeColors}
        passMode={passMode}
        labels={{
          enterCurrentPin: t('Enter Current Pin'),
          createPassword: t('Create Password'),
          confirmPin: t('Confirm Pin'),
          removePasswordTitle: t('Remove Password Title'),
          successTitle: t('Success Title'),
          removePasswordDesc: t('Remove Password Desc'),
          enterPinHint: 'Enter 4-digit PIN',
          back: t('back'),
          cancel: t('cancel'),
          continue: t('continue'),
          save: t('save'),
          create: t('create'),
          confirm: t('confirm'),
          remove: t('remove'),
          done: t('done'),
        }}
      />

      <ConfirmResetSheet
        visible={confirmResetVisible}
        onConfirm={handleResetAction}
        onCancel={() => setConfirmResetVisible(false)}
        themeColors={themeColors}
        title={t('confirmDeleteTitle')}
        desc={t('confirmDeleteDesc')}
        deleteText={t('deleteAction')}
        cancelText={t('cancel')}
      />
    </View>
  );
};