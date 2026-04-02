import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Save, Tag, Calendar, Edit3 } from 'lucide-react-native';
import { CategoryModal } from '../components/CategoryModal';
import { saveLocalTransaction } from './storageService';

export const AddTransactionScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  
  // States
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [isFocused, setIsFocused] = useState(false);
  const [amount, setAmount] = useState('');
  const [catModal, setCatModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState('');

  const handleSave = async () => {
  // ၁။ Validation: ပမာဏ သုညထက်ကြီးရမယ်
  const numAmount = parseFloat(amount);
  if (!amount || numAmount <= 0) {
    alert("ပမာဏကို မှန်ကန်စွာ ရိုက်ထည့်ပါ"); // Amount must be > 0
    return;
  }

  if (!selectedCat) {
    alert("အမျိုးအစား ရွေးချယ်ပေးပါ");
    return;
  }

  // ၂။ Data Structure (Prompt အတိုင်း)
  const newTransaction = {
    id: Date.now().toString(),
    title: note || selectedCat.name,
    amount: numAmount,
    category: selectedCat.name,
    type: type, // 'expense' | 'income'
    transactionDate: date.toISOString(),
    createdAt: new Date().toISOString(),
  };

  try {
    // ၃။ Local AsyncStorage ထဲမှာ အရင်သိမ်းမယ် (Guest Mode logic)
    const success = await saveLocalTransaction(newTransaction);
    
    if (success) {
      alert("မှတ်တမ်းတင်ပြီးပါပြီ");
      navigation.goBack();
    }
  } catch (error) {
    alert("သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိနေပါသည်");
  }
};

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('createRecord')}</Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.formContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Switcher */}
        <View style={styles.switcherContainer}>
          <View style={styles.switcherBackground}>
            <TouchableOpacity 
              onPress={() => setType('expense')}
              style={[styles.switchBtn, type === 'expense' && styles.activeExpense]}
            >
              <Text style={[styles.switchText, type === 'expense' && { color: '#fff' }]}>{t('expense')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setType('income')}
              style={[styles.switchBtn, type === 'income' && styles.activeIncome]}
            >
              <Text style={[styles.switchText, type === 'income' && { color: '#fff' }]}>{t('income')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{t('amount')}</Text>
          <View style={[styles.amountBox, isFocused && { borderBottomColor: colors.primary }]}>
            <Text style={styles.currencySymbol}>Ks</Text>
            <TextInput 
              style={styles.amountInput}
              value={amount}
              placeholder="0"
              keyboardType="decimal-pad"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholderTextColor="#999"
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
              {...(Platform.OS === 'web' && { 
                style: [styles.amountInput, { outlineStyle: 'none' } as any] 
              })}
            />
          </View>
        </View>

        {/* Row for Category and Date */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.iconBox} 
            onPress={() => setCatModal(true)}
          >
            <Tag size={18} color={colors.primary} />
            <Text style={styles.boxText} numberOfLines={1}>
              {selectedCat ? selectedCat.name : t('category')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
  style={styles.iconBox} 
  onPress={() => setShowDatePicker(true)}
>
  <Calendar size={18} color={colors.primary} />
  <Text style={styles.boxText}>
    {date.toDateString() === new Date().toDateString() ? t('today') : date.toLocaleDateString()}
  </Text>
</TouchableOpacity>
        </View>

        {/* Note Section */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{t('note')}</Text>
          <View style={styles.noteBox}>
            <Edit3 size={18} color="#999" style={{ marginTop: 2 }} />
            <TextInput 
              style={styles.noteInput}
              placeholder={t('writeNote')}
              multiline
              value={note}
              onChangeText={setNote}
              placeholderTextColor="#999"
              
            />
          </View>
        </View>

        {/* Save Button */}
       <TouchableOpacity 
  style={styles.saveBtn} 
  activeOpacity={0.8}
  onPress={handleSave}
>
  <Save color="#fff" size={20} />
  <Text style={styles.saveText}>{t('save')}</Text>
</TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>

{/* Category Modal */}
      <CategoryModal 
        visible={catModal} 
        onClose={() => setCatModal(false)} 
        onSelect={(cat: any) => setSelectedCat(cat)} 
      />

     {/* {showDatePicker && (
  <DateTimePicker
    value={date}
    mode="date"
    display="spinner"
    onChange={(event, selectedDate) => {
      setShowDatePicker(false); 
      if (selectedDate) {
        setDate(selectedDate);
      }
    }}
  />
)} */}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { 
    height: 90, 
    justifyContent: 'flex-end', 
    paddingBottom: 15, 
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  backBtn: { padding: 4 },
  formContainer: { paddingHorizontal: 25, paddingTop: 20 },
  switcherContainer: { marginBottom: 20, alignItems: 'center' },
  switcherBackground: { flexDirection: 'row', backgroundColor: '#f0f0f0', padding: 4, borderRadius: 20, width: '100%' },
  switchBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 18 },
  activeExpense: { backgroundColor: '#ff6b6b' },
  activeIncome: { backgroundColor: '#20d3fe' },
  switchText: { fontSize: 14, fontWeight: '600', color: '#777' },
  inputWrapper: { marginBottom: 15 }, 
  label: { fontSize: 12, color: '#999', marginBottom: 5, fontWeight: '500' },
  amountBox: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.2, borderBottomColor: '#eee', paddingBottom: 5 },
  currencySymbol: { fontSize: 20, color: '#333', marginRight: 10, fontWeight: '500' },
  amountInput: { flex: 1, fontSize: 26, color: '#333', fontWeight: '600', padding: 0 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  iconBox: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 15, 
    gap: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    // Shadow for iOS/Android
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  boxText: { fontSize: 13, color: '#444', fontWeight: '500' },
  noteBox: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#f0f0f0', 
    minHeight: 70, 
  },
  noteInput: { flex: 1, marginLeft: 10, fontSize: 15, textAlignVertical: 'top', color: '#333', paddingTop: 0 },
  saveBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: colors.primary, 
    padding: 15, 
    borderRadius: 18, 
    gap: 10, 
    marginTop: 10,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});