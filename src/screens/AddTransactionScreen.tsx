//src/screens/AddTransactionScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Platform, KeyboardAvoidingView, StatusBar, Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../context/useThemeStore';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Save, Tag, Calendar, Edit3, Plus, X, Lock } from 'lucide-react-native';
import { CategoryModal } from '../components/CategoryModal';
import { useExpenseStore } from '../context/useExpenseStore';

export const AddTransactionScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { transactions, addTransaction, updateTransaction } = useExpenseStore();

  const editData = route.params?.editData;
  const isEditMode = !!(editData && editData.transactionDate);

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [catModal, setCatModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [batchItems, setBatchItems] = useState<any[]>([]);

  const isBatching = batchItems.length > 0;

  const resetForm = () => {
    setAmount('');
    setSelectedCat(null);
    setNote('');
  };

  useEffect(() => {
    if (route.params?.editData) {
      const data = route.params.editData;
      setAmount(data.amount?.toString() || '');
      setNote(data.title || '');
      if(data.type) setType(data.type);
      
      if (data.transactionDate) {
        setDate(new Date(data.transactionDate));
        setSelectedCat(data.category ? { name: data.category } : null);
      } else {
        setDate(new Date());
        setSelectedCat({ name: 'Shopping' }); 
      }
    }
  }, [route.params?.editData]);

  // Balance Calculation
  const totalIncome = transactions.filter(tr => tr.type === 'income').reduce((sum, tr) => sum + tr.amount, 0);
  const totalExpense = transactions.filter(tr => tr.type === 'expense').reduce((sum, tr) => sum + tr.amount, 0);
  const baseBalance = totalIncome - totalExpense;
  const batchTotalExpense = batchItems.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0);
  const currentBalance = (isEditMode && editData.type === 'expense' ? baseBalance + editData.amount : baseBalance) - batchTotalExpense;

  const numAmount = parseFloat(amount) || 0;

  // ✅ ငွေမလုံလောက်ခြင်း ရှိ/မရှိ စစ်ဆေးခြင်း
  const isInsufficientBalance = type === 'expense' && numAmount > currentBalance;

  // ✅ ဖြည့်စွက်ချက် စစ်ဆေးခြင်း
  const validateInputs = () => {
    if (!amount || numAmount <= 0) {
      Alert.alert(t('warning'), t('enterAmount'));
      return false;
    }
    if (type === 'expense' && !selectedCat) {
      Alert.alert(t('warning'), t('selectCategory'));
      return false;
    }
    return true;
  };

  const handleAddToBatch = () => {
    if (!validateInputs()) return;
    const newItem = {
      id: Date.now().toString(),
      title: note || (type === 'income' ? t('income') : selectedCat.name),
      amount: numAmount,
      category: type === 'income' ? 'Income' : selectedCat.name,
      type: type,
      transactionDate: date.toISOString(),
    };
    setBatchItems([...batchItems, newItem]);
    resetForm();
  };

  const handleSaveAll = async () => {
    const itemsToSave = [...batchItems];
    if (itemsToSave.length === 0 || amount) {
      if (!validateInputs()) return;
      itemsToSave.push({
        title: note || (type === 'income' ? t('income') : selectedCat?.name),
        amount: numAmount,
        category: type === 'income' ? 'Income' : selectedCat?.name,
        type: type,
        transactionDate: date.toISOString(),
      });
    }

    try {
      if (isEditMode) {
        await updateTransaction(editData.id, itemsToSave[0]);
      } else {
        for (const item of itemsToSave) {
          await addTransaction(item);
        }
      }
      navigation.setParams({ editData: undefined });
      setBatchItems([]);
      resetForm();
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", t('saveError'));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={themeColors.primaryGradient} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ChevronLeft color="#fff" size={28} /></TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditMode ? "ပြင်ဆင်ရန်" : t('createRecord')}</Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        {/* Type Switcher */}
        <View style={styles.switcherContainer}>
          <View style={[styles.switcherBackground, { backgroundColor: theme === 'dark' ? '#2A2D37' : '#D1D5DB' }]}>
            <TouchableOpacity onPress={() => setType('expense')} disabled={isEditMode || isBatching} style={[styles.switchBtn, type === 'expense' && styles.activeExpense]}>
              <Text style={[styles.switchText, type === 'expense' ? { color: '#fff' } : { color: '#4B5563' }]}>{t('expense')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setType('income')} disabled={isEditMode || isBatching} style={[styles.switchBtn, type === 'income' && styles.activeIncome]}>
              <Text style={[styles.switchText, type === 'income' ? { color: '#fff' } : { color: '#4B5563' }]}>{t('income')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: themeColors.text.secondary }]}>{t('amount')}</Text>
          <View style={[styles.inputBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.currencySymbol, { color: themeColors.text.primary }]}>Ks</Text>
            <TextInput 
              style={[styles.amountInput, { color: themeColors.text.primary }]} 
              value={amount} placeholder="0" keyboardType="decimal-pad"
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
            />
          </View>
        </View>

        <View style={styles.row}>
          {/* Category Selector */}
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

          {/* Date Selector */}
          <TouchableOpacity style={[styles.iconBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, isBatching && { opacity: 0.6 }]} onPress={() => !isBatching && setShowDatePicker(true)} disabled={isBatching}>
            <Calendar size={18} color={themeColors.primary} />
            <Text style={[styles.boxText, { color: themeColors.text.primary }]}>
              {date.toDateString() === new Date().toDateString() ? t('today') : date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if(d) setDate(d); }} maximumDate={new Date()} />}

        {/* Note Input */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: themeColors.text.secondary }]}>{t('note')}</Text>
          <View style={[styles.noteBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Edit3 size={18} color={themeColors.text.secondary} />
            <TextInput style={[styles.noteInput, { color: themeColors.text.primary }]} multiline value={note} onChangeText={setNote} placeholder={t('writeNote')} />
          </View>
        </View>

        {/* Add Another Button */}
        {!isEditMode && (
          <TouchableOpacity 
            onPress={handleAddToBatch} 
            disabled={isInsufficientBalance}
            style={[styles.addToListBtn, { borderColor: themeColors.primary, opacity: isInsufficientBalance ? 0.7 : 1 }]}
          >
            <Plus size={20} color={themeColors.primary} />
            <Text style={[styles.addToListText, { color: themeColors.primary }]}>{t('addAnother')}</Text>
          </TouchableOpacity>
        )}

        {/* ✅ Save Button Logic */}
        <TouchableOpacity 
          onPress={handleSaveAll} 
          disabled={isInsufficientBalance}
        >
          <LinearGradient 
            colors={themeColors.primaryBtn || ['#6A5AE0', '#00D1FF']} 
            style={[styles.saveBtn, isInsufficientBalance && { opacity: 0.7 }]} // ငွေမလုံလောက်ရင် နည်းနည်းမှိန်မယ်
          >
            <Save color="#fff" size={20} />
            <Text style={styles.saveText}>
              {isBatching ? `${t('saveAll')} (${batchItems.length + (amount ? 1 : 0)})` : (isEditMode ? t('update') : t('save'))}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <CategoryModal visible={catModal} onClose={() => setCatModal(false)} onSelect={(cat: any) => setSelectedCat(cat)} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 100, justifyContent: 'flex-end', paddingBottom: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 4 },
  formContainer: { paddingHorizontal: 25, paddingTop: 25, paddingBottom: 60 },
  switcherContainer: { marginBottom: 10, alignItems: 'center' },
  switcherBackground: { flexDirection: 'row', padding: 4, borderRadius: 22, width: '100%' },
  switchBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 18 },
  activeExpense: { backgroundColor: '#EF4444' },
  activeIncome: { backgroundColor: '#10B981' },
  switchText: { fontSize: 14, fontWeight: '700' },
  inputWrapper: { marginBottom: 18 },
  label: { fontSize: 11, marginBottom: 6, marginTop: 4, fontWeight: '700', textTransform: 'uppercase' },
  inputBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, borderWidth: 1.5 },
  currencySymbol: { fontSize: 20, marginRight: 10, fontWeight: '700' },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  iconBox: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, gap: 10, borderWidth: 1.5 },
  boxText: { fontSize: 14, fontWeight: '600' },
  noteBox: { flexDirection: 'row', padding: 15, borderRadius: 20, borderWidth: 1.5, minHeight: 80 },
  noteInput: { flex: 1, marginLeft: 10, fontSize: 15, textAlignVertical: 'top' },
  addToListBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 15, borderStyle: 'dashed', borderWidth: 1.5, marginBottom: 20, gap: 8 },
  addToListText: { fontWeight: '700', fontSize: 14 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 20, gap: 12, elevation: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});