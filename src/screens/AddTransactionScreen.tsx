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
  const isEditMode = !!editData;

  // --- States ---
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [catModal, setCatModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // ✅ Batch Entry State
  const [batchItems, setBatchItems] = useState<any[]>([]);

  const isBatching = batchItems.length > 0; // Batch ထဲမှာ item ရှိ/မရှိ စစ်သည်

  const resetForm = () => {
    setAmount('');
    setSelectedCat(null);
    setNote('');
  };

  useEffect(() => {
    if (isEditMode && editData) {
      setType(editData.type);
      setAmount(editData.amount.toString());
      setSelectedCat(editData.category ? { name: editData.category } : null);
      setNote(editData.title || '');
      setDate(new Date(editData.transactionDate));
    }
  }, [editData, isEditMode]);

  const totalIncome = transactions.filter(tr => tr.type === 'income').reduce((sum, tr) => sum + tr.amount, 0);
  const totalExpense = transactions.filter(tr => tr.type === 'expense').reduce((sum, tr) => sum + tr.amount, 0);
  const baseBalance = totalIncome - totalExpense;
  
  const batchTotalExpense = batchItems.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0);
  const currentBalance = (isEditMode && editData.type === 'expense' ? baseBalance + editData.amount : baseBalance) - batchTotalExpense;

  const numAmount = parseFloat(amount) || 0;

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) setDate(selectedDate);
  };

  const handleAddToBatch = () => {
    if (!amount || numAmount <= 0) {
      Alert.alert(t('warning'), t('enterAmount'));
      return;
    }
    if (type === 'expense' && !selectedCat) {
      Alert.alert(t('warning'), t('selectCategory'));
      return;
    }
    if (type === 'expense' && numAmount > currentBalance) {
      Alert.alert(t('warning'), t('insufficientBalance'));
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      title: note || (type === 'income' ? t('income') : selectedCat.name),
      amount: numAmount,
      category: type === 'income' ? 'Income' : selectedCat.name,
      type: type,
      transactionDate: date.toISOString(),
    };

    setBatchItems([...batchItems, newItem]);
    if (isEditMode) {
    navigation.setParams({ editData: undefined });
  }
    resetForm();
  };

  const removeFromBatch = (id: string) => {
    setBatchItems(batchItems.filter(item => item.id !== id));
  };

  const handleSaveAll = async () => {
    const itemsToSave = [...batchItems];
    
    if (amount && numAmount > 0) {
      itemsToSave.push({
        title: note || (type === 'income' ? t('income') : selectedCat?.name),
        amount: numAmount,
        category: type === 'income' ? 'Income' : selectedCat?.name,
        type: type,
        transactionDate: date.toISOString(),
      });
    }

    if (itemsToSave.length === 0) {
      Alert.alert(t('warning'), t('enterAmount'));
      return;
    }

    try {
      if (isEditMode) {
        await updateTransaction(editData.id, itemsToSave[0]);
        navigation.setParams({ editData: undefined });
      } else {
        for (const item of itemsToSave) {
          await addTransaction(item);
        }
      }
      setBatchItems([]);
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
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? "ပြင်ဆင်ရန်" : t('createRecord')}
          </Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        
        {/* ✅ Type Switcher - Disabled if Batching or Editing */}
        <View style={styles.switcherContainer}>
          <View style={[styles.switcherBackground, { backgroundColor: theme === 'dark' ? '#2A2D37' : '#D1D5DB' }]}>
            <TouchableOpacity 
              onPress={() => setType('expense')} 
              disabled={isEditMode || isBatching} 
              style={[styles.switchBtn, type === 'expense' && styles.activeExpense]}
            >
              <Text style={[styles.switchText, type === 'expense' ? { color: '#fff' } : { color: '#4B5563' }]}>{t('expense')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setType('income')} 
              disabled={isEditMode || isBatching} 
              style={[styles.switchBtn, type === 'income' && styles.activeIncome]}
            >
              <Text style={[styles.switchText, type === 'income' ? { color: '#fff' } : { color: '#4B5563' }]}>{t('income')}</Text>
            </TouchableOpacity>
          </View>
          {(isEditMode || isBatching) && (
            <View style={styles.lockInfo}>
              <Lock size={12} color="#9CA3AF" />
              <Text style={styles.lockText}> {isEditMode ? t('editLock') : t('batchLockType')}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: themeColors.text.secondary }]}>{t('amount')}</Text>
          <View style={[styles.inputBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.currencySymbol, { color: themeColors.text.primary }]}>Ks</Text>
            <TextInput 
              style={[styles.amountInput, { color: themeColors.text.primary }]}
              value={amount}
              placeholder="0"
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

          {/* ✅ Date Picker - Disabled if Batching */}
          <TouchableOpacity 
            style={[styles.iconBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, isBatching && { opacity: 0.6 }]} 
            onPress={() => !isBatching && setShowDatePicker(true)}
            disabled={isBatching}
          >
            {isBatching ? <Lock size={18} color={themeColors.text.secondary} /> : <Calendar size={18} color={themeColors.primary} />}
            <Text style={[styles.boxText, { color: themeColors.text.primary }]}>
              {date.toDateString() === new Date().toDateString() ? t('today') : date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} maximumDate={new Date()} />}

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: themeColors.text.secondary }]}>{t('note')}</Text>
          <View style={[styles.noteBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Edit3 size={18} color={themeColors.text.secondary} />
            <TextInput style={[styles.noteInput, { color: themeColors.text.primary }]} placeholder={t('writeNote')} placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'} multiline value={note} onChangeText={setNote} />
          </View>
        </View>

        {/* ✅ Add to List Button - Rename for clarity */}
        {!isEditMode && (
          <TouchableOpacity onPress={handleAddToBatch} style={[styles.addToListBtn, { borderColor: themeColors.primary }]}>
            <Plus size={20} color={themeColors.primary} />
            <Text style={[styles.addToListText, { color: themeColors.primary }]}>{t('addAnother') || 'Add Another Item'}</Text>
          </TouchableOpacity>
        )}

        {/* ✅ Horizontal Batch List Preview */}
        {isBatching && (
          <View style={styles.batchContainer}>
            <Text style={[styles.batchTitle, { color: themeColors.text.secondary }]}>{t('preview')} ({batchItems.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.batchScroll}>
              {batchItems.map((item) => (
                <TouchableOpacity key={item.id} style={[styles.batchCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]} onPress={() => removeFromBatch(item.id)}>
                  <View style={styles.batchCardHeader}>
                    <Text style={[styles.batchAmount, { color: item.type === 'expense' ? '#EF4444' : '#10B981' }]}>
                      {item.type === 'expense' ? '-' : '+'}{item.amount}
                    </Text>
                    <X size={14} color="#9CA3AF" />
                  </View>
                  <Text style={[styles.batchNote, { color: themeColors.text.primary }]} numberOfLines={1}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ✅ Save All Button */}
        <TouchableOpacity onPress={handleSaveAll} disabled={type === 'expense' && numAmount > currentBalance}>
          <LinearGradient colors={themeColors.primaryBtn || ['#6A5AE0', '#00D1FF']} style={[styles.saveBtn, (type === 'expense' && numAmount > currentBalance) && { opacity: 0.5 }]}>
            <Save color="#fff" size={20} />
            <Text style={styles.saveText}>
              {isBatching ? `${t('saveAll') || 'Save All'} (${batchItems.length + (amount ? 1 : 0)})` : (isEditMode ? t('update') : t('save'))}
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
  formContainer: { paddingHorizontal: 25, paddingTop: 25, paddingBottom: 60 }, // ✅ Added more padding for screen fit
  switcherContainer: { marginBottom: 10, alignItems: 'center' },
  switcherBackground: { flexDirection: 'row', padding: 4, borderRadius: 22, width: '100%' },
  switchBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 18 },
  activeExpense: { backgroundColor: '#EF4444' },
  activeIncome: { backgroundColor: '#10B981' },
  switchText: { fontSize: 14, fontWeight: '700' },
  lockInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  lockText: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  inputWrapper: { marginBottom: 18 }, 
  label: { fontSize: 11, marginBottom: 6, marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  inputBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, borderWidth: 1.5 },
  currencySymbol: { fontSize: 20, marginRight: 10, fontWeight: '700' },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12},
  iconBox: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, gap: 10, borderWidth: 1.5 },
  boxText: { fontSize: 14, fontWeight: '600' },
  noteBox: { flexDirection: 'row', padding: 15, borderRadius: 20, borderWidth: 1.5, minHeight: 80 },
  noteInput: { flex: 1, marginLeft: 10, fontSize: 15, textAlignVertical: 'top' },
  addToListBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 15, borderStyle: 'dashed', borderWidth: 1.5, marginBottom: 20, gap: 8 },
  addToListText: { fontWeight: '700', fontSize: 14 },
  batchContainer: { marginBottom: 20 },
  batchTitle: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  batchScroll: { flexDirection: 'row' },
  batchCard: { width: 120, padding: 12, borderRadius: 15, marginRight: 10, borderWidth: 1 },
  batchCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  batchAmount: { fontSize: 14, fontWeight: '800' },
  batchNote: { fontSize: 11, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 20, gap: 12, marginTop: 0, elevation: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});