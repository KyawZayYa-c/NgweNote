import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Platform, KeyboardAvoidingView, StatusBar, Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../context/useThemeStore';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Save, Tag, Calendar, Edit3 } from 'lucide-react-native';
import { CategoryModal } from '../components/CategoryModal';
import { useExpenseStore } from '../context/useExpenseStore';

export const AddTransactionScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { transactions, addTransaction, updateTransaction } = useExpenseStore();

  const editData = route.params?.editData;
  const isEditMode = !!editData;

  // --- States ---
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [catModal, setCatModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ✅ Form ကို Reset ချပေးသည့် Function
  const resetForm = () => {
    setType('expense');
    setAmount('');
    setSelectedCat(null);
    setNote('');
    setDate(new Date());
  };

  // ✅ 1. Edit Mode ဖြစ်ပါက Data များကို Form ထဲသို့ ထည့်ပေးခြင်း
  useEffect(() => {
    if (isEditMode && editData) {
      setType(editData.type);
      setAmount(editData.amount.toString());
      setSelectedCat(editData.category ? { name: editData.category } : null);
      setNote(editData.title || '');
      setDate(new Date(editData.transactionDate));
    }
  }, [editData, isEditMode]); // editData ပြောင်းလဲမှုရှိတိုင်း အလုပ်လုပ်မည်

  // ✅ 2. Screen ကနေ ထွက်သွားရင် သို့မဟုတ် အသစ်ထည့်ရန် ဝင်လာရင် Reset လုပ်ခြင်း
  useEffect(() => {
    const focusUnsubscribe = navigation.addListener('focus', () => {
      if (!route.params?.editData) {
        resetForm();
      }
    });

    const blurUnsubscribe = navigation.addListener('blur', () => {
      // Screen ကနေ ထွက်သွားရင် params တွေကို ရှင်းပစ်မယ် (အရေးကြီးသည်)
      navigation.setParams({ editData: undefined });
    });

    return () => {
      focusUnsubscribe();
      blurUnsubscribe();
    };
  }, [navigation, route.params?.editData]);

  // --- Balance Calculation ---
  const totalIncome = transactions
    .filter(tr => tr.type === 'income')
    .reduce((sum, tr) => sum + tr.amount, 0);

  const totalExpense = transactions
    .filter(tr => tr.type === 'expense')
    .reduce((sum, tr) => sum + tr.amount, 0);

  const baseBalance = totalIncome - totalExpense;
  
  // Edit mode မှာဆိုရင် လက်ရှိပြင်နေတဲ့ ပမာဏကို balance ထဲ ပြန်ပေါင်းထည့်ပြီးမှ တွက်ရမယ်
  const currentBalance = isEditMode && editData.type === 'expense' 
    ? baseBalance + editData.amount 
    : baseBalance;

  const numAmount = parseFloat(amount) || 0;

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) setDate(selectedDate);
  };

  const handleSave = async () => {
    const finalAmount = parseFloat(amount) || 0;

    if (!amount || finalAmount <= 0) {
      Alert.alert(t('warning'), t('enterAmount'));
      return;
    }

    if (type === 'expense' && !selectedCat) {
      Alert.alert(t('warning'), t('selectCategory'));
      return;
    }

    if (type === 'expense' && finalAmount > currentBalance) {
      Alert.alert(t('warning'), t('insufficientBalance'));
      return;
    }

    try {
      const transactionPayload = {
        title: note || (type === 'income' ? t('income') : selectedCat.name),
        amount: finalAmount,
        category: type === 'income' ? 'Income' : selectedCat.name,
        type: type,
        transactionDate: date.toISOString(),
      };

      if (isEditMode) {
        await updateTransaction(editData.id, transactionPayload);
      } else {
        await addTransaction(transactionPayload);
      }
      
      resetForm();
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", t('saveError'));
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={themeColors.primaryGradient} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            {/* <ChevronLeft color="#fff" size={28} /> */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? "ပြင်ဆင်ရန်" : t('createRecord')}
          </Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>


      

      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        
        <View style={styles.switcherContainer}>
          <View style={[
            styles.switcherBackground, 
            { backgroundColor: theme === 'dark' ? '#2A2D37' : '#D1D5DB' }
          ]}>
            <TouchableOpacity 
              onPress={() => !isEditMode && setType('expense')} 
              disabled={isEditMode}
              style={[styles.switchBtn, type === 'expense' && styles.activeExpense]}
            >
              <Text style={[styles.switchText, type === 'expense' ? { color: '#fff' } : { color: '#4B5563' }]}>
                {t('expense')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => !isEditMode && setType('income')} 
              disabled={isEditMode}
              style={[styles.switchBtn, type === 'income' && styles.activeIncome]}
            >
              <Text style={[styles.switchText, type === 'income' ? { color: '#fff' } : { color: '#4B5563' }]}>
                {t('income')}
              </Text>
            </TouchableOpacity>
          </View>
          {isEditMode && <Text style={styles.lockText}>* ပြင်ဆင်နေချိန်တွင် အမျိုးအစားပြောင်း၍မရပါ</Text>}
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: themeColors.text.secondary }]}>{t('amount')}</Text>
          <View style={[styles.inputBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.currencySymbol, { color: themeColors.text.primary }]}>Ks</Text>
            <TextInput 
  style={[styles.amountInput, { color: themeColors.text.primary }]}
  value={amount}
  placeholder="0"
  // ✅ ဒီစာကြောင်းကို ထည့်ပေးပါ (Theme အလိုက် placeholder အရောင်ပြောင်းရန်)
  placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
  keyboardType="decimal-pad"
  onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
/>
          </View>
        </View>

        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.iconBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, type === 'income' && { opacity: 0.6 }]} 
            onPress={() => type === 'expense' && setCatModal(true)}
            disabled={type === 'income'}
          >
            <Tag size={18} color={themeColors.primary} />
            <Text style={[styles.boxText, { color: themeColors.text.primary }]} numberOfLines={1}>
              {type === 'income' ? t('income') : (selectedCat ? selectedCat.name : t('category'))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.iconBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]} 
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={18} color={themeColors.primary} />
            <Text style={[styles.boxText, { color: themeColors.text.primary }]}>
              {date.toDateString() === new Date().toDateString() ? t('today') : date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} maximumDate={new Date()} />
        )}

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: themeColors.text.secondary }]}>{t('note')}</Text>
          <View style={[styles.noteBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Edit3 size={18} color={themeColors.text.secondary} />
            <TextInput 
  style={[styles.noteInput, { color: themeColors.text.primary }]}
  placeholder={t('writeNote')}
  placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
  multiline
  value={note}
  onChangeText={setNote}
/>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: themeColors.primary }, (type === 'expense' && numAmount > currentBalance) && { opacity: 0.5 }]} 
          onPress={handleSave}
          disabled={type === 'expense' && numAmount > currentBalance}
        >
          <Save color="#fff" size={20} />
          <Text style={styles.saveText}>
            {type === 'expense' && numAmount > currentBalance ? t('insufficientBalance') : (isEditMode ? t('update') : t('save'))}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <CategoryModal visible={catModal} onClose={() => setCatModal(false)} onSelect={(cat: any) => setSelectedCat(cat)} />
    </KeyboardAvoidingView>
  );
};

// Styles အပိုင်းက အရင်အတိုင်း ထားလိုက်ပါ...
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 110, justifyContent: 'flex-end', paddingBottom: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 4 },
  formContainer: { paddingHorizontal: 25, paddingTop: 25 },
  switcherContainer: { marginBottom: 25, alignItems: 'center' },
  switcherBackground: { flexDirection: 'row', padding: 4, borderRadius: 22, width: '100%', elevation: 2 },
  switchBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 18 },
  activeExpense: { backgroundColor: '#EF4444', elevation: 4 },
  activeIncome: { backgroundColor: '#10B981', elevation: 4 },
  switchText: { fontSize: 14, fontWeight: '700' },
  lockText: { fontSize: 10, marginTop: 8, color: '#9CA3AF', fontWeight: '500' },
  inputWrapper: { marginBottom: 20 }, 
  label: { fontSize: 11, marginBottom: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  inputBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, borderWidth: 1.5 },
  currencySymbol: { fontSize: 20, marginRight: 10, fontWeight: '700' },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  iconBox: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, gap: 10, borderWidth: 1.5 },
  boxText: { fontSize: 14, fontWeight: '600' },
  noteBox: { flexDirection: 'row', padding: 15, borderRadius: 20, borderWidth: 1.5, minHeight: 100 },
  noteInput: { flex: 1, marginLeft: 10, fontSize: 15, textAlignVertical: 'top' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 20, gap: 12, marginTop: 10, elevation: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});