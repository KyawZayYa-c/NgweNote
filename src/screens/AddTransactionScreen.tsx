import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../context/useThemeStore';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  Save,
  Tag,
  Calendar,
  Edit3,
  Plus,
} from 'lucide-react-native';
import { CategoryModal } from '../components/CategoryModal';
import { useExpenseStore } from '../context/useExpenseStore';
import {
  AlertModal,
  TypeSwitcher,
  BatchPreview,
  styles,
} from '../components/AddTransaction';

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

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const isBatching = batchItems.length > 0;

  const resetForm = () => {
    setAmount('');
    setSelectedCat(null);
    setNote('');
  };

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    if (route.params?.editData) {
      const data = route.params.editData;
      setAmount(data.amount?.toString() || '');
      setNote(data.title || '');
      if (data.type) setType(data.type);

      if (data.transactionDate) {
        setDate(new Date(data.transactionDate));
        setSelectedCat(data.category ? { name: data.category } : null);
      } else {
        setDate(new Date());
        setSelectedCat({ name: 'Shopping' });
      }
    }
  }, [route.params?.editData]);

  const totalIncome = transactions
    .filter((tr) => tr.type === 'income')
    .reduce((sum, tr) => sum + tr.amount, 0);
  const totalExpense = transactions
    .filter((tr) => tr.type === 'expense')
    .reduce((sum, tr) => sum + tr.amount, 0);
  const baseBalance = totalIncome - totalExpense;
  const batchTotalExpense = batchItems
    .filter((i) => i.type === 'expense')
    .reduce((sum, i) => sum + i.amount, 0);
  const currentBalance =
    (isEditMode && editData.type === 'expense'
      ? baseBalance + editData.amount
      : baseBalance) - batchTotalExpense;

  const numAmount = parseFloat(amount) || 0;
  const isInsufficientBalance = type === 'expense' && numAmount > currentBalance;

  const validateInputs = () => {
    if (!amount || numAmount <= 0) {
      showAlert(t('warning'), t('enterAmount'));
      return false;
    }
    if (type === 'expense' && !selectedCat) {
      showAlert(t('warning'), t('selectCategory'));
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

  const handleRemoveFromBatch = (id: string) => {
    setBatchItems(batchItems.filter((item) => item.id !== id));
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
      showAlert(t('error') || 'Error', t('saveError') || 'Failed to save');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient colors={themeColors.primaryGradient} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? t('edit') || 'Edit' : t('createRecord')}
          </Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
      >
        <TypeSwitcher
          type={type}
          onChange={setType}
          disabled={isEditMode || isBatching}
          theme={theme}
          expenseText={t('expense')}
          incomeText={t('income')}
        />

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: themeColors.text.secondary }]}>
            {t('amount')}
          </Text>
          <View
            style={[
              styles.inputBox,
              { backgroundColor: themeColors.surface, borderColor: themeColors.border },
            ]}
          >
            <Text style={[styles.currencySymbol, { color: themeColors.text.primary }]}>
              Ks
            </Text>
            <TextInput
              style={[styles.amountInput, { color: themeColors.text.primary }]}
              value={amount}
              placeholder="0"
              keyboardType="decimal-pad"
              placeholderTextColor={themeColors.text.secondary}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
            />
          </View>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.iconBox,
              { backgroundColor: themeColors.surface, borderColor: themeColors.border },
              type === 'income' && { opacity: 0.6 },
            ]}
            onPress={() => type === 'expense' && setCatModal(true)}
            disabled={type === 'income'}
            activeOpacity={0.7}
          >
            <Tag size={18} color={themeColors.primary} />
            <Text
              style={[styles.boxText, { color: themeColors.text.primary }]}
              numberOfLines={1}
            >
              {type === 'income'
                ? t('income')
                : selectedCat
                ? selectedCat.name
                : t('category')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconBox,
              { backgroundColor: themeColors.surface, borderColor: themeColors.border },
              isBatching && { opacity: 0.6 },
            ]}
            onPress={() => !isBatching && setShowDatePicker(true)}
            disabled={isBatching}
            activeOpacity={0.7}
          >
            <Calendar size={18} color={themeColors.primary} />
            <Text style={[styles.boxText, { color: themeColors.text.primary }]}>
              {date.toDateString() === new Date().toDateString()
                ? t('today')
                : date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setDate(d);
            }}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: themeColors.text.secondary }]}>
            {t('note')}
          </Text>
          <View
            style={[
              styles.noteBox,
              { backgroundColor: themeColors.surface, borderColor: themeColors.border },
            ]}
          >
            <Edit3 size={18} color={themeColors.text.secondary} />
            <TextInput
              style={[styles.noteInput, { color: themeColors.text.primary }]}
              multiline
              value={note}
              onChangeText={setNote}
              placeholder={t('writeNote')}
              placeholderTextColor={themeColors.text.secondary}
            />
          </View>
        </View>

        {!isEditMode && (
          <TouchableOpacity
            onPress={handleAddToBatch}
            disabled={isInsufficientBalance}
            style={[
              styles.addToListBtn,
              { borderColor: themeColors.primary, opacity: isInsufficientBalance ? 0.7 : 1 },
            ]}
            activeOpacity={0.7}
          >
            <Plus size={20} color={themeColors.primary} />
            <Text style={[styles.addToListText, { color: themeColors.primary }]}>
              {t('addAnother')}
            </Text>
          </TouchableOpacity>
        )}

        {!isEditMode && isBatching && (
          <BatchPreview
            items={batchItems}
            onRemove={handleRemoveFromBatch}
            themeColors={themeColors}
            title={t('previewTitle') || 'ထည့်သွင်းရန် စာရင်းများ'}
          />
        )}

        <TouchableOpacity
          onPress={handleSaveAll}
          disabled={isInsufficientBalance}
          activeOpacity={0.8}
          style={[
            styles.saveBtn,
            theme === 'dark' && { borderWidth: 1, borderColor: 'rgba(0, 209, 255, 0.3)' },
            isInsufficientBalance && { opacity: 0.5 },
          ]}
        >
          <LinearGradient
            colors={themeColors.primaryBtn || ['#6A5AE0', '#010102']}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 1 }}>
            <Save color="#fff" size={20} />
            <Text style={styles.saveText}>
              {isBatching
                ? `${t('saveAll')} (${batchItems.length + (amount ? 1 : 0)})`
                : isEditMode
                ? t('update')
                : t('save')}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <CategoryModal
        visible={catModal}
        onClose={() => setCatModal(false)}
        onSelect={(cat: any) => setSelectedCat(cat)}
      />

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        themeColors={themeColors}
        okText={t('ok') || 'OK'}
      />
    </KeyboardAvoidingView>
  );
};