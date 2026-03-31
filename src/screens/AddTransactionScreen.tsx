import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useExpenseStore } from '../context/useExpenseStore';
import { colors } from '../theme/colors';
import { CustomButton } from '../components/CustomButton';
import { LucideIcon, ChevronDown, Calendar, Tag, CreditCard, FileText } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDisplayDate } from '../utils/dateHelpers';

const CATEGORIES = [
  'အစားအစာ', 'သယ်ယူပို့ဆောင်ရေး', 'ဈေးဝယ်ခြင်း', 'ဖျော်ဖြေရေး', 'ကျန်းမာရေး', 'ပညာရေး', 'အလှူအတန်း', 'လစာ/ဝင်ငွေ', 'အခြား'
];

export const AddTransactionScreen = ({ navigation }: any) => {
  const { addTransaction } = useExpenseStore();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('အချက်အလက်မှားယွင်းနေပါသည်', 'ခေါင်းစဉ်နှင့် ပမာဏကို မှန်ကန်စွာ ဖြည့်သွင်းပါ။');
      return;
    }

    setIsLoading(true);
    try {
      await addTransaction({
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        type,
        transactionDate: date,
        note: note.trim() || undefined,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('မှားယွင်းမှုဖြစ်ပေါ်ခဲ့ပါသည်', 'ပြန်လည်ကြိုးစားကြည့်ပါ။');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>မှတ်တမ်းအသစ်</Text>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, type === 'expense' ? styles.activeToggleExpense : null]} 
          onPress={() => setType('expense')}
        >
          <Text style={[styles.toggleText, type === 'expense' ? styles.activeToggleText : null]}>အသုံးစရိတ် (-)</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, type === 'income' ? styles.activeToggleIncome : null]} 
          onPress={() => setType('income')}
        >
          <Text style={[styles.toggleText, type === 'income' ? styles.activeToggleText : null]}>ဝင်ငွေ (+)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ပစ္စည်းအမည်</Text>
          <View style={styles.inputWrapper}>
            <Tag size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.input}
              placeholder="ဥပမာ- ထမင်းစားစရိတ်"
              placeholderTextColor={colors.text.secondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ပမာဏ</Text>
          <View style={styles.inputWrapper}>
            <CreditCard size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.input}
              placeholder="၀"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>မှတ်ချက် (မထည့်လည်းရသည်)</Text>
          <View style={styles.inputWrapper}>
            <FileText size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.input}
              placeholder="မှတ်သားလိုသည်များ..."
              placeholderTextColor={colors.text.secondary}
              value={note}
              onChangeText={setNote}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>အမျိုးအစား</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryChip, category === cat ? styles.activeCategoryChip : null]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, category === cat ? styles.activeCategoryText : null]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ရက်စွဲ</Text>
          <TouchableOpacity 
            style={styles.inputWrapper} 
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={colors.text.secondary} />
            <Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <View style={styles.buttonContainer}>
          <CustomButton 
            title="မှတ်တမ်းတင်မည်" 
            onPress={handleSave} 
            loading={isLoading}
          />
          <CustomButton 
            title="ပယ်ဖျက်မည်" 
            variant="outline" 
            onPress={() => navigation.goBack()} 
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeToggleExpense: {
    backgroundColor: colors.expense,
  },
  activeToggleIncome: {
    backgroundColor: colors.income,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeToggleText: {
    color: '#ffffff',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCategoryChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  activeCategoryText: {
    color: '#ffffff',
  },
  dateText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  buttonContainer: {
    marginTop: 12,
  },
});
