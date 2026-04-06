import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Dimensions, StatusBar, Switch, Modal, TextInput, KeyboardAvoidingView, FlatList 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, Lock, Languages, Moon, ChevronRight, LogOut, Trash2, 
  CheckCircle2, RefreshCw, BellRing, AlertTriangle, Send, Clock, 
  ShieldCheck, ShieldAlert 
} from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { useThemeStore } from '../context/useThemeStore';
import { useAuthStore } from '../context/useAuthStore';
import { useExpenseStore } from '../context/useExpenseStore'; 
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

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
  const { theme, toggleTheme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t, i18n } = useTranslation();
  const { user, isGuest, logout } = useAuthStore();
  const { userPasscode, setPasscode, clearAllData } = useExpenseStore(); 

  const [passModalVisible, setPassModalVisible] = useState(false);
  const [securityAlertVisible, setSecurityAlertVisible] = useState(false);
  const [confirmResetVisible, setConfirmResetVisible] = useState(false);
  const [notiModalVisible, setNotiModalVisible] = useState(false);

  const [passMode, setPassMode] = useState<'change' | 'reset'>('change');
  const [currentStep, setCurrentStep] = useState(1);
  const [passcodeData, setPasscodeData] = useState({ old: '', new: '', reset: '' });
  const [notiMessage, setNotiMessage] = useState('');
  const [notiHistory, setNotiHistory] = useState<any[]>([]);
  const { setAdminNoti } = useExpenseStore();
  const isAdmin = user?.email === "admin@gmail.com" || user?.email === "user@gmail.com" || isGuest;

  const handlePasscodeAction = () => {
    if (passMode === 'change') {
      if (currentStep === 1) {
        if (passcodeData.old === userPasscode) {
          setCurrentStep(2);
        } else {
          setPasscodeData({ ...passcodeData, old: '' });
          alert("Incorrect Old Passcode");
        }
      } else {
        if (passcodeData.new.length === 4) {
          setPasscode(passcodeData.new);
          resetPassModal();
        }
      }
    } else {
      if (passcodeData.reset === userPasscode) {
        clearAllData();
        resetPassModal();
        alert("All data cleared!");
      } else {
        setPasscodeData({ ...passcodeData, reset: '' });
        alert("Incorrect Passcode");
      }
    }
  };

  const resetPassModal = () => {
    setPassModalVisible(false);
    setConfirmResetVisible(false);
    setCurrentStep(1);
    setPasscodeData({ old: '', new: '', reset: '' });
  };

  const handleSendNoti = () => {
  if (notiMessage.trim() === '') return;
  
  // Store ထဲကို message ထည့်လိုက်ခြင်းဖြင့် HomeScreen က ချက်ချင်းသိသွားမယ်
  setAdminNoti(notiMessage); 
  
  const newNoti = {
    id: Date.now().toString(),
    message: notiMessage,
    time: new Date().toISOString(),
  };
  setNotiHistory([newNoti, ...notiHistory]);
  setNotiMessage('');
};

  const deleteNoti = (id: string) => {
    setNotiHistory(prev => prev.filter(item => item.id !== id));
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
                <CheckCircle2 size={12} color="#22C55E" /><Text style={[styles.syncText, { color: '#22C55E' }]}>{t('synced')}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>{t('security')}</Text>
          <SettingRow icon={ShieldCheck} label={t('securityCheckout')} value={userPasscode === "0000" ? "Action Needed" : "Secure"} onPress={() => setSecurityAlertVisible(true)} />
          <SettingRow icon={RefreshCw} label={t('changePasscode')} onPress={() => { setPassMode('change'); setPassModalVisible(true); }} />
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

        <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
          <SettingRow icon={Trash2} label={t('resetData')} isDanger onPress={() => setConfirmResetVisible(true)} />
          <SettingRow icon={LogOut} label={t('logout')} isDanger onPress={logout} />
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

      {/* --- Passcode Modal --- */}
      <Modal visible={passModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior="padding" style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            <View style={[styles.modalIconBg, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
              <Lock size={32} color={themeColors.primary} />
            </View>
            <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>
              {passMode === 'change' ? (currentStep === 1 ? t('changePasscode') : "Enter New Passcode") : "Confirm Passcode"}
            </Text>
            <TextInput
              style={[styles.passInput, { borderBottomColor: themeColors.primary, color: themeColors.text.primary }]}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              autoFocus
              value={passMode === 'change' ? (currentStep === 1 ? passcodeData.old : passcodeData.new) : passcodeData.reset}
              onChangeText={(val) => {
                if (passMode === 'change') {
                  currentStep === 1 ? setPasscodeData({ ...passcodeData, old: val }) : setPasscodeData({ ...passcodeData, new: val })
                } else {
                  setPasscodeData({ ...passcodeData, reset: val })
                }
              }}
            />
            <View style={styles.modalActionRow}>
              <TouchableOpacity onPress={resetPassModal}><Text style={{ color: '#999' }}>{t('cancel')}</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: themeColors.primary }]} onPress={handlePasscodeAction}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* --- Other Modals (Security Alert / Confirm Reset) - Logic is same, keep your styles --- */}
      <Modal visible={confirmResetVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheet, { backgroundColor: themeColors.surface }]}>
            <View style={styles.dangerIconAnim}><AlertTriangle size={40} color="#FF6B6B" /></View>
            <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>{t('confirmDeleteTitle')}</Text>
            <Text style={styles.modalSubTitle}>{t('confirmDeleteDesc')}</Text>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF6B6B' }]} 
              onPress={() => { setConfirmResetVisible(false); setPassMode('reset'); setPassModalVisible(true); }}>
              <Text style={styles.actionBtnText}>{t('deleteAction')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmResetVisible(false)}>
              <Text style={{ color: '#999', fontWeight: '600' }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal visible={securityAlertVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.alertBox, { backgroundColor: themeColors.surface }]}>
            <View style={styles.alertHeader}>
              <ShieldAlert size={28} color={userPasscode === "0000" ? "#F59E0B" : "#22C55E"} />
              <Text style={[styles.alertTitle, { color: themeColors.text.primary }]}>{t('securityStatus')}</Text>
            </View>
            <TouchableOpacity style={[styles.alertCloseBtn, { backgroundColor: themeColors.primary }]} onPress={() => setSecurityAlertVisible(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('gotIt')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
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
  bottomSheet: { width: '100%', position: 'absolute', bottom: 0, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, alignItems: 'center' },
  dangerIconAnim: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 107, 107, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalContent: { width: width * 0.85, borderRadius: 30, padding: 25, alignItems: 'center' },
  modalIconBg: { width: 70, height: 70, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalMainTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalSubTitle: { fontSize: 14, color: '#999', marginBottom: 25, textAlign: 'center' },
  passInput: { width: '80%', fontSize: 32, textAlign: 'center', borderBottomWidth: 2, paddingBottom: 10, letterSpacing: 15, marginBottom: 30 },
  modalActionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
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
});