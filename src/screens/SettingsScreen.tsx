//src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Dimensions, StatusBar, Switch, Modal, TextInput, KeyboardAvoidingView, FlatList , Image,TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, Lock, Unlock, Languages, Moon, ChevronRight, LogOut, Trash2, 
  CheckCircle2, RefreshCw, BellRing, AlertTriangle, Send, Clock, 
  ShieldCheck, ShieldAlert 
} from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { useThemeStore } from '../context/useThemeStore';
import { useAuthStore } from '../context/useAuthStore';
import { useExpenseStore } from '../context/useExpenseStore'; 
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
const { width } = Dimensions.get('window');
import { db } from '../services/firebaseConfig';
import { ref, set, push } from "firebase/database";

const SettingRow = ({ icon: Icon, label, value, onPress, isToggle, toggleValue, onToggleChange, isDanger }: any) => {
  const { getColors } = useThemeStore();
  const themeColors = getColors();

  return (
    <TouchableOpacity 
      style={[styles.row, { borderBottomColor: 'rgba(150, 150, 150, 0.1)' }]} 
      onPress={onPress}
      disabled={isToggle}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: isDanger ? 'rgba(255, 107, 107, 0.1)' : 'rgba(150, 150, 150, 0.1)' }]}>
          <Icon size={20} color={isDanger ? '#FF6B6B' : themeColors.primary} />
        </View>
        <Text style={[styles.rowLabel, { color: isDanger ? '#FF6B6B' : themeColors.text.primary }]}>{label}</Text>
      </View>
      
      <View style={styles.rowRight}>
        {isToggle ? (
          <Switch 
            value={toggleValue} 
            onValueChange={onToggleChange}
            trackColor={{ false: "#767577", true: themeColors.primary }}
            thumbColor="#fff"
          />
        ) : (
          <View style={styles.valueRow}>
            {value && <Text style={[styles.rowValue, { color: themeColors.text.secondary }]}>{value}</Text>}
            <ChevronRight size={18} color="#999" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const SettingsScreen = () => {
  const [tempPin, setTempPin] = useState('');
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [pinCardVisible, setPinCardVisible] = useState(false);
const [alertConfig, setAlertConfig] = useState({ 
  message: '', 
  type: 'success' as 'success' | 'error' 
});
  const { theme, toggleTheme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t, i18n } = useTranslation();
  const { user, isGuest, logout } = useAuthStore();
  const { userPasscode, setPasscode, removePasscode, clearAllData } = useExpenseStore(); 

  const [securityAlertVisible, setSecurityAlertVisible] = useState(false);
  const [confirmResetVisible, setConfirmResetVisible] = useState(false);
  const [notiModalVisible, setNotiModalVisible] = useState(false);
  const [notiTitle, setNotiTitle] = useState('');
  const [notiMessage, setNotiMessage] = useState('');
  const [notiHistory, setNotiHistory] = useState<any[]>([]);
  const { setAdminNoti } = useExpenseStore();

  const isAdmin = user?.role === "admin";

const [passModalVisible, setPassModalVisible] = useState(false);
const [passMode, setPassMode] = useState<'create' | 'change' | 'remove' | 'manage_options'| 'reset'>('manage_options');
const [currentStep, setCurrentStep] = useState<'enter_old' | 'set_new' | 'confirm_new' | 'confirm_remove' | 'success'| 'manage_options'>('set_new');
const [passcodeData, setPasscodeData] = useState({ old: '', new: '', confirm: '' });
 const [checking, setChecking] = useState(false);
// Modal ပြန်ဖွင့်တိုင်း logic ကို reset လုပ်ဖို့
const openPassModal = (mode: 'create' | 'manage_options') => {
    setPassMode(mode);
    if (mode === 'create') {
      setCurrentStep('set_new');
      setPinCardVisible(true); // Create ဆိုရင် အလယ်က box တန်းပြမယ်
    } else {
      setCurrentStep('manage_options');
      setPassModalVisible(true); // Manage ဆိုရင် အောက်က menu အရင်ပြမယ်
    }
    setPasscodeData({ old: '', new: '', confirm: '' });
  };


const handleSecurityCheck = () => {
  setChecking(true);
  setTimeout(() => {
    setChecking(false);
    setSecurityAlertVisible(true);
  }, 1000); // စစ်ဆေးနေတဲ့ ပုံစံမျိုး ခဏပြတာ
};
  
  const resetPinFlow = () => {
  setPinCardVisible(false);
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
      // PIN မှန်သွားပြီဆိုရင် Mode ကို စစ်မယ်
      if (passMode === 'reset') {
        await clearAllData(); // Reset mode ဆိုရင် PIN မှန်တာနဲ့ တန်းဖြတ်
        resetPinFlow();
        alert(t('resetSuccess'));
      } else if (passMode === 'remove') {
        setCurrentStep('confirm_remove'); 
        setPinCardVisible(false);
        setPassModalVisible(true);
      } else {
        setCurrentStep('set_new'); // Change Mode ဆိုရင် PIN အသစ်ပေးခိုင်းမယ်
      }
      setTempPin('');
    } else {
      alert(t('wrongPasscode'));
      setTempPin('');
    }
  } 
  else if (currentStep === 'set_new') {
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
  if (notiMessage.trim() === '' ) {
    alert("Title ရော Message ရော ထည့်ပေးပါဗျာ။");
    return;
  }

  try {
    await db.collection('notifications').doc('global_announcement').set({
      title: notiTitle, // ဒီမှာ Admin စိတ်ကြိုက် title ထည့်လို့ရပါပြီ
      message: notiMessage,
      createdAt: new Date().toISOString(), // ဒီ field က အရေးကြီးပါတယ် (အချိန်စစ်ဖို့)
      sender: "Admin"
    });
    setNotiTitle('');
    setNotiMessage('');
    alert("Notification sent successfully!");
  } catch (error) {
    alert("Error sending notification");
  }
};
  const deleteNoti = (id: string) => {
    setNotiHistory(prev => prev.filter(item => item.id !== id));
  };

  // SettingsScreen.tsx အတွင်းမှာ ဒါလေး ပြင်/ထည့်ပါ

const handleResetAction = async () => {
  // ၁။ User မှာ Passcode ရှိမရှိ အရင်စစ်မယ်
  if (userPasscode) {
    // PIN ရှိရင် PIN ထည့်တဲ့ Modal ကို ပြမယ်
    setPassMode('reset');
    setConfirmResetVisible(false); // အရင် Modal ကို ပိတ်
    setCurrentStep('enter_old');   // PIN အဟောင်းရိုက်ခိုင်းတဲ့ step ကို သွား
    setPinCardVisible(true);       // PIN ရိုက်တဲ့ card ကို ပြ
  } else {
    // ၂။ PIN မရှိရင် တန်းဖြတ်မယ်
    try {
      await clearAllData();
      setConfirmResetVisible(false);
      alert(t('resetSuccess')); // ဖြတ်ပြီးကြောင်း Alert ပြ
    } catch (error) {
      alert("Error clearing data");
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
          console.log("Google SDK silent cleanup");
        }
      }
    }
    await logout(); 
    
  } catch (error: any) {
    // ၄။ တကယ်လို့ error တက်ခဲ့ရင်တောင် logic မရပ်သွားအောင် logout() ကို ခေါ်ပေးထားပါ
    console.log("Logout Process Error:", error.message);
    await logout();
  }
};

  const renderNotiItem = ({ item }: { item: any }) => (
    <View style={styles.historyItem}>
      <Clock size={14} color="#999" />
      <View style={{ flex: 1 }}>
        <Text style={[styles.historyText, { color: themeColors.text.primary }]}>{item.message}</Text>
        <Text style={styles.historyTime}>{new Date(item.time).toLocaleTimeString()}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteNoti(item.id)} style={{ padding: 5 }}>
        <Trash2 size={16} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={themeColors.primaryGradient} style={styles.navBar}>
        <Text style={styles.navTitle}>{t('settings')}</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatarContainer, { borderColor: themeColors.primary, backgroundColor: isGuest ? 'rgba(150, 150, 150, 0.1)' : '#fff', justifyContent: 'center', alignItems: 'center' }]}>
              {isGuest ? <User size={35} color={themeColors.primary} /> : <AntDesign name="google" size={32} color="#EA4335" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: themeColors.text.primary }]} numberOfLines={1}>
                {isGuest ? t('guestUser') : user?.displayName}
              </Text>
              {!isGuest && <Text style={{ color: themeColors.text.secondary, fontSize: 13 }}>{user?.email}</Text>}
              <View style={styles.syncStatus}>
                <CheckCircle2 size={12} color="#22C55E" /><Text style={[styles.syncText, { color: '#22C55E' }]}> {isGuest ?  t('NotSynced') :  t('cloudSynced') }</Text>
              </View>
            </View>
          </View>
        </View>

        

       
        {/* Security Section */}
<View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
  <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>{t('security')}</Text>
  
  {/* Security Checkout - Password ရှိမရှိပေါ်မူတည်ပြီး အရောင်ပြောင်းမယ် */}
  <SettingRow 
    icon={checking ? RefreshCw : (userPasscode && userPasscode !== "" ? ShieldCheck : AlertTriangle)} 
    label={t('securityCheckout')} 
    value={userPasscode && userPasscode !== "" ? t('strong') : t('weak')} 
    isDanger={!userPasscode || userPasscode === ""}
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
            <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Admin Panel</Text>
            <SettingRow icon={BellRing} label="Global Notification" onPress={() => setNotiModalVisible(true)} />
          </View>
        )}

        <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>{t('preferences')}</Text>
          <SettingRow icon={Languages} label={t('language')} value={i18n.language === 'mm' ? 'English' : 'မြန်မာ'} onPress={() => i18n.changeLanguage(i18n.language === 'mm' ? 'en' : 'mm')} />
          <SettingRow icon={Moon} label={t('theme')} isToggle toggleValue={theme === 'dark'} onToggleChange={toggleTheme} />
        </View>

        {/* 4. About Section */}
        <View style={[styles.sectionCard, { backgroundColor: themeColors.surface, alignItems: 'center', paddingVertical: 30 }]}>
          <Image source={require('../../assets/icon.png')} style={styles.aboutLogo} />
          <Text style={[styles.aboutAppName, { color: themeColors.text.primary }]}>NgweNote</Text>
          <Text style={{ color: themeColors.text.secondary }}>{t('version')} 1.0.0</Text>
          <View style={styles.devTag}>
             <Text style={{ color: themeColors.text.secondary, fontSize: 12 }}>{t('developer')}</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
          <SettingRow icon={Trash2} label={t('resetData')} isDanger onPress={() => setConfirmResetVisible(true)} />
          <SettingRow icon={LogOut} label={t('logout')} isDanger onPress={handleLogout} />
        </View>
      </ScrollView>

      {/* --- Admin Noti Modal --- */}
      <Modal visible={notiModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.notiSheet, { backgroundColor: themeColors.surface }]}>
            <View style={styles.notiHeader}>
              <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>Admin Notifications</Text>
              <TouchableOpacity onPress={() => setNotiModalVisible(false)}>
                <AntDesign name="closecircle" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput 
          style={[styles.notiInput, { height: 45, marginBottom: 10, color: themeColors.text.primary, borderColor: themeColors.primary }]}
          placeholder="Enter title (e.g. Welcome Back!)"
          placeholderTextColor="#999"
          value={notiTitle}
          onChangeText={setNotiTitle}
        />
              <TextInput 
                style={[styles.notiInput, { color: themeColors.text.primary, borderColor: themeColors.primary }]}
                placeholder="Enter notification message..."
                placeholderTextColor="#999"
                value={notiMessage}
                onChangeText={setNotiMessage}
                multiline
              />
              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: themeColors.primary }]} onPress={handleSendNoti}>
                <Send size={20} color="#fff" />
                <Text style={styles.sendBtnText}>Send to All</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.historyTitle, { color: themeColors.text.secondary }]}>Recently Sent</Text>
            <FlatList
              data={notiHistory}
              keyExtractor={(item) => item.id}
              renderItem={renderNotiItem}
              ListEmptyComponent={<Text style={styles.emptyHistory}>No history yet</Text>}
            />
          </View>
        </View>
      </Modal>
{/* Security Status Modal */}
      <Modal visible={securityAlertVisible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.alertBox, { backgroundColor: themeColors.surface }]}>
          <View style={[styles.modalIconBg, { 
            backgroundColor: userPasscode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)' 
          }]}>
            {userPasscode ? <ShieldCheck size={40} color="#22C55E" /> : <AlertTriangle size={40} color="#F59E0B" />}
          </View>
          
          <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>
            {userPasscode ? t('strong') : t('weak')}
          </Text>
          
          <Text style={styles.modalSubTitle}>
            {userPasscode ? t('secureDesc') : t('unsecureDesc')}
          </Text>

          <TouchableOpacity 
            style={[styles.alertCloseBtn, { backgroundColor: themeColors.primary }]} 
            onPress={() => {
              setSecurityAlertVisible(false);
              if(!userPasscode) setPinCardVisible(true);;
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              {userPasscode ? t('gotIt') : t('setNow')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* --- Enhanced  Custom Alert Modal --- */}
<Modal visible={customAlertVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={[styles.alertBox, { backgroundColor: themeColors.surface, width: width * 0.8 }]}>
      
      <View style={[styles.modalIconBg, { 
        backgroundColor: alertConfig.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 107, 107, 0.1)',
        marginBottom: 15 
      }]}>
        {alertConfig.type === 'success' ? (
          <CheckCircle2 size={35} color="#22C55E" />
        ) : (
          <ShieldAlert size={35} color="#FF6B6B" />
        )}
      </View>

      <Text style={[styles.modalMainTitle, { color: themeColors.text.primary, fontSize: 19 }]}>
        {alertConfig.type === 'success' ? 'Success' : 'Security Alert'}
      </Text>
      
      <Text style={[styles.modalSubTitle, { marginBottom: 25, fontSize: 15 }]}>
        {alertConfig.message}
      </Text>

      <TouchableOpacity 
        style={[styles.alertCloseBtn, { 
          backgroundColor: alertConfig.type === 'success' ? themeColors.primary : '#FF6B6B',
          borderRadius: 15,
          width: '100%'
        }]} 
        onPress={() => setCustomAlertVisible(false)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{t('gotIt')}</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* ၁။ အောက်ကတက်လာမယ့် Menu (Change / Remove ရွေးရန်) */}
      <Modal visible={passModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setPassModalVisible(false)}>
          <View style={styles.modalOverlayBottom}>
            <TouchableWithoutFeedback>
              <View style={[styles.bottomSheet, { backgroundColor: themeColors.surface }]}>
                <View style={styles.sheetHandle} />
                
                {currentStep === 'manage_options' && (
                  <View style={{ width: '100%' }}>
                    <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>{t('passwordSecurity')}</Text>
                    <TouchableOpacity style={styles.menuOption} onPress={() => { 
                      setPassMode('change'); 
                      setCurrentStep('enter_old'); 
                      setPassModalVisible(false);
                      setPinCardVisible(true); // Card box ကို အလယ်မှာ ပြောင်းပြမယ်
                    }}>
                      <RefreshCw size={20} color={themeColors.primary} />
                      <Text style={[styles.menuText, { color: themeColors.text.primary }]}>{t('changePin')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuOption} onPress={() => { 
                      setPassMode('remove'); 
                      setCurrentStep('enter_old'); 
                      setPassModalVisible(false);
                      setPinCardVisible(true); 
                    }}>
                      <Trash2 size={20} color="#FF6B6B" />
                      <Text style={[styles.menuText, { color: '#FF6B6B' }]}>{t('removePassword')}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Success & Remove Confirm တွေက ဒီ Bottom Sheet မှာပဲ ဆက်ပြပါမယ် */}
                {currentStep === 'confirm_remove' && (
                  <View style={{ alignItems: 'center' }}>
                     <View style={styles.dangerIconBg}><Trash2 size={40} color="#FF6B6B" /></View>
                     <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>{t('removePasswordTitle')}</Text>
                     <Text style={styles.modalSubTitle}>{t('removePasswordDesc')}</Text>
                    <TouchableOpacity style={styles.removeBtn} onPress={async () => { await removePasscode(); resetPinFlow(); }}>
                       <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('remove')}</Text>
                     </TouchableOpacity>
                  </View>
                )}

                {currentStep === 'success' && (
                  <View style={{ alignItems: 'center' }}>
                     <CheckCircle2 size={60} color="#22C55E" />
                     <Text style={[styles.modalMainTitle, { color: themeColors.text.primary, marginTop: 20 }]}>{t('successTitle')}</Text>
                     <TouchableOpacity style={[styles.alertCloseBtn, { backgroundColor: themeColors.primary }]} onPress={() => {setPassModalVisible(false); setPinCardVisible(false);}}>
                       <Text style={{ color: '#fff' }}>{t('done')}</Text>
                     </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ၂။ Screen အလယ်မှာပြမယ့် PIN Input Card (image_ea5057.png ပုံစံ) */}
      <Modal visible={pinCardVisible} transparent animationType="fade">
  <View style={styles.modalOverlayCenter}>
    <KeyboardAvoidingView behavior="padding" style={styles.centerCardWrapper}>
      <View style={[styles.pinCard, { backgroundColor: themeColors.surface }]}>
        
        <View style={[styles.cardIconBg, { 
          backgroundColor: currentStep === 'confirm_remove' ? 'rgba(255, 107, 107, 0.1)' : 'rgba(108, 92, 231, 0.1)' 
        }]}>
          {currentStep === 'confirm_remove' ? (
            <Trash2 size={30} color="#FF6B6B" />
          ) : (
            <Lock size={30} color={themeColors.primary} />
          )}
        </View>

        <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>
          {currentStep === 'enter_old' ? t('Enter Current Pin') : 
           currentStep === 'set_new' ? t('Create Password') : 
           currentStep === 'confirm_new' ? t('Confirm Pin') : 
           currentStep === 'confirm_remove' ? t('Remove Password Title') : t('Success Title')}
        </Text>
        
        <Text style={styles.cardSubTitle}>
          {currentStep === 'confirm_remove' ? t('Remove Password Desc') : "Enter 4-digit PIN"}
        </Text>

        {currentStep !== 'confirm_remove' && currentStep !== 'success' && (
          <TextInput
            style={[styles.passInput, { color: themeColors.text.primary, borderBottomColor: themeColors.primary }]}
            maxLength={4}
            keyboardType="number-pad"
            secureTextEntry
            autoFocus
            value={tempPin}
            onChangeText={setTempPin}
          />
        )}

        <View style={styles.modalActionRow}>
          {/* Cancel/Back Button */}
          <TouchableOpacity 
            style={styles.cardSecondaryBtn} 
            onPress={() => {
              if (currentStep === 'confirm_new') setCurrentStep('set_new');
              else resetPinFlow();
            }}
          >
            <Text style={{ color: '#666', fontWeight: '600' }}>
              {currentStep === 'confirm_new' ? t('back') : t('cancel')}
            </Text>
          </TouchableOpacity>

          {/* Action Button (Dynamic Label) */}
          <TouchableOpacity 
            style={[styles.cardPrimaryBtn, { 
              backgroundColor: currentStep === 'confirm_remove' ? '#FF6B6B' : themeColors.primary 
            }]}
            onPress={async () => {
              if (currentStep === 'confirm_remove') {
                await removePasscode();
                resetPinFlow();
              } else if (currentStep === 'success') {
                resetPinFlow();//setCurrentStep('success') လုပ်မယ့်အစား resetPinFlow()
              } else {
                handleNextStep();
              }
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              {currentStep === 'enter_old' ? t('continue') : 
               currentStep === 'set_new' ? (passMode === 'change' ? t('save') : t('create')) : 
               currentStep === 'confirm_new' ? t('confirm') : 
               currentStep === 'confirm_remove' ? t('remove') : t('done')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </View>
      </Modal>
       {/* --- Other Modals (Security Alert / Confirm Reset) - Logic is same, keep your styles --- */}
      <Modal visible={confirmResetVisible} transparent animationType="slide">
        <View style={styles.modalOverlayResetData}>
          <View style={[styles.bottomSheetReset, { backgroundColor: themeColors.surface }]}>
            <View style={styles.dangerIconAnim}>
              <AlertTriangle size={40} color="#FF6B6B" /></View>
            <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>{t('confirmDeleteTitle')}</Text>
            <Text style={styles.modalSubTitle}>{t('confirmDeleteDesc')}</Text>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF6B6B' }]} 
              onPress={handleResetAction}
              >
              <Text style={styles.actionBtnText}>{t('deleteAction')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmResetVisible(false)}>
              <Text style={{ color: '#999', fontWeight: '600' }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

     

const styles = StyleSheet.create({
  modalActionRow: { 
    flexDirection: 'row', 
    width: '100%', 
    gap: 15, 
  },
  cardPrimaryBtn: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 15, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSecondaryBtn: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee'
  },
  modalOverlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  centerCardWrapper: { width: '82%', alignItems: 'center' },
  pinCard: { 
    width: '100%', 
    borderRadius: 30, 
    padding: 10, 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardIconBg: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  cardSubTitle: { fontSize: 13, color: '#999', marginBottom: 10, textAlign: 'center' },
  cardFooter: { width: '100%', flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  bottomSheet: { width: '100%', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, paddingBottom: 40 },
  sheetHandle: { width: 45, height: 5, backgroundColor: '#E0E0E0', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  passInput: { width: '80%', fontSize: 32, textAlign: 'center', borderBottomWidth: 2, paddingBottom: 10, letterSpacing: 15, marginBottom: 20 },
  modalMainTitle: { fontSize: 19, fontWeight: 'bold', textAlign: 'center' },
  menuOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, gap: 15 },
  menuText: { fontSize: 16, fontWeight: '500' },
  removeBtn: { width: '100%', padding: 16, backgroundColor: '#FF6B6B', borderRadius: 15, alignItems: 'center', marginTop: 10 },
  modalOverlayResetData: { 
    flex: 1, 
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  // bottomSheet: { 
  //   width: '100%', 
  //   borderTopLeftRadius: 35, 
  //   borderTopRightRadius: 35, 
  //   padding: 25, 
  //   paddingBottom: 40,
  //   elevation: 25 
  // },
  // sheetHandle: { 
  //   width: 45, 
  //   height: 5, 
  //   backgroundColor: '#E0E0E0', 
  //   borderRadius: 10, 
  //   alignSelf: 'center', 
  //   marginBottom: 20 
  // },
  // removeBtn: { 
  //   width: '100%', 
  //   padding: 16, 
  //   backgroundColor: '#FF6B6B', 
  //   borderRadius: 15, 
  //   alignItems: 'center', 
  //   marginTop: 10 
  // },
  dangerIconBg: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15
  },
  // menuOption: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingVertical: 20,
  //   paddingHorizontal: 10,
  //   gap: 15,
  // },
  // menuText: {
  //   fontSize: 17,
  //   fontWeight: '500',
  // },
  cancelMenuBtn: {
    marginTop: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  navBar: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 25, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  navTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  sectionCard: { marginHorizontal: 20, marginTop: 20, borderRadius: 25, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatarContainer: { width: 70, height: 70, borderRadius: 25, borderWidth: 2 },
  userName: { fontSize: 20, fontWeight: 'bold' },
  syncStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  syncText: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconContainer: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowValue: { fontSize: 14 },
   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
   bottomSheetReset: { width: '100%', position: 'absolute', bottom: 0, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, alignItems: 'center' },
  dangerIconAnim: { width: 60, height: 60, borderRadius: 40, backgroundColor: 'rgba(255, 107, 107, 0.1)', display:"flex", justifyContent: 'center', alignItems: 'center',textAlign:"center",marginBottom: 10 },
  modalContent: { width: width * 0.85, borderRadius: 30, padding: 25, alignItems: 'center' },
  modalIconBg: { width: 70, height: 70, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  // modalMainTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalSubTitle: { fontSize: 14, color: '#999', marginBottom: 25, textAlign: 'center' },
  //passInput: { width: '80%', fontSize: 32, textAlign: 'center', borderBottomWidth: 2, paddingBottom: 10, letterSpacing: 15, marginBottom: 30 },
  
  modalConfirmBtn: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 15 },
  actionBtn: { width: '100%', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
  actionBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelBtn: { padding: 10 },
  alertBox: { width: width * 0.8, borderRadius: 25, padding: 25, alignItems: 'center' },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  alertTitle: { fontSize: 18, fontWeight: 'bold' },
  alertCloseBtn: { width: '100%', paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  notiSheet: { width: '100%', height: '80%', position: 'absolute', bottom: 0, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25 },
  notiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  inputWrapper: { marginBottom: 25 },
  notiInput: { borderWidth: 1, borderRadius: 15, padding: 15, height: 100, textAlignVertical: 'top', marginBottom: 15 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 15, gap: 10 },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  historyTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  historyText: { flex: 1, fontSize: 14 },
  historyTime: { fontSize: 11, color: '#999' },
  emptyHistory: { textAlign: 'center', marginTop: 20, color: '#999' },
  aboutLogo: { width: 80, height: 80, borderRadius: 20, marginBottom: 15 },
  aboutAppName: { fontSize: 22, fontWeight: 'bold' },
  devTag: { marginTop: 15, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(150,150,150,0.05)' }
});