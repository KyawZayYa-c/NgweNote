//src/screens/AddToBuyScreen.tsx
import React, { useState, useEffect } from 'react';
import { useExpenseStore } from '../context/useExpenseStore'; 
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Platform, KeyboardAvoidingView, StatusBar, Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../context/useThemeStore';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Save, ShoppingBag, DollarSign, Plus, X } from 'lucide-react-native';

export const AddToBuyScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();
  
  const { addToBuyItem, updateToBuyItem } = useExpenseStore(); 
  const editData = route.params?.editData;
  const isEditMode = !!editData;

  // --- States ---
  const [itemName, setItemName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [count, setCount] = useState('1');
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemList, setItemList] = useState<any[]>([]);

  const isBatching = itemList.length > 0;

  useEffect(() => {
    if (isEditMode) {
      setItemName(editData.itemName);
      setUnitPrice(editData.unitPrice.toString());
      count && setCount(editData.count.toString());
    }
  }, [isEditMode, editData]);

  useEffect(() => {
    const price = parseFloat(unitPrice) || 0;
    const qty = parseInt(count) || 0;
    setTotalPrice(price * qty);
  }, [unitPrice, count]);

  const resetForm = () => {
    setItemName('');
    setUnitPrice('');
    setCount('1');
    setTotalPrice(0);
  };

  const addToList = () => {
    if (!itemName || !unitPrice) {
      Alert.alert(t('warning'), t('alertFillAll'));
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      itemName,
      unitPrice: parseFloat(unitPrice),
      count: parseInt(count),
      totalPrice: totalPrice,
    };

    setItemList([...itemList, newItem]);
    resetForm();
  };

  const removeFromList = (id: string) => {
    setItemList(itemList.filter(item => item.id !== id));
  };

  const handleFinalSave = async () => {
    try {
      if (isEditMode) {
        if (!itemName || !unitPrice) {
          Alert.alert(t('warning'), t('alertFillAll'));
          return;
        }
        
        await updateToBuyItem(editData.id, {
          itemName: itemName,
          unitPrice: parseFloat(unitPrice),
          count: parseInt(count),
        });
      } else {
        const itemsToSave = [...itemList];
        if (itemName && unitPrice) {
          itemsToSave.push({
            itemName,
            unitPrice: parseFloat(unitPrice),
            count: parseInt(count),
          });
        }

        if (itemsToSave.length === 0) {
          Alert.alert(t('warning'), t('alertNoItems'));
          return;
        }

        for (const item of itemsToSave) {
          await addToBuyItem({
            itemName: item.itemName,
            unitPrice: item.unitPrice,
            count: item.count
          });
        }
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('error'), t('alertSaveError'));
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      <LinearGradient colors={themeColors.primaryGradient} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? t('editListTitle') : t('addToListTitle')}
          </Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: themeColors.text.secondary }]}>{t('labelItemName')}</Text>
          <View style={[styles.inputBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <ShoppingBag size={18} color={themeColors.primary} style={{ marginRight: 10 }} />
            <TextInput 
              style={[styles.mainInput, { color: themeColors.text.primary }]}
              value={itemName}
              placeholder={t('placeholderItemName')}
              placeholderTextColor={themeColors.text.secondary} 
              onChangeText={setItemName}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1.5 }}>
            <Text style={[styles.label, { color: themeColors.text.secondary }]}>{t('labelPrice')}</Text>
            <View style={[styles.inputBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
              <DollarSign size={18} color={themeColors.primary} />
              <TextInput 
                style={[styles.mainInput, { color: themeColors.text.primary, marginLeft: 5 }]}
                value={unitPrice}
                placeholder="0.00"
                placeholderTextColor={themeColors.text.secondary} 
                keyboardType="decimal-pad"
                onChangeText={(text) => setUnitPrice(text.replace(/[^0-9.]/g, ''))}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: themeColors.text.secondary }]}>{t('labelCount')}</Text>
            <View style={[styles.inputBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
              <TextInput 
                style={[styles.mainInput, { color: themeColors.text.primary, textAlign: 'center' }]}
                value={count}
                keyboardType="numeric"
                placeholderTextColor={themeColors.text.secondary}
                onChangeText={(text) => setCount(text.replace(/[^0-9]/g, ''))}
              />
            </View>
          </View>
        </View>

        <View style={styles.totalDisplay}>
          <Text style={[styles.totalLabel, { color: themeColors.text.secondary }]}>{t('labelTotalAmount')}</Text>
          <Text style={[styles.totalAmount, { color: themeColors.primary }]}>
            {totalPrice.toLocaleString()} Ks
          </Text>
        </View>

        {!isEditMode && (
          <TouchableOpacity 
            onPress={addToList} 
            style={[styles.addToListBtn, { borderColor: themeColors.primary }]}
            activeOpacity={0.7}
          >
            <Plus size={20} color={themeColors.primary} />
            <Text style={[styles.addToListText, { color: themeColors.primary }]}>{t('addMoreItemBtn')}</Text>
          </TouchableOpacity>
        )}

        {!isEditMode && isBatching && (
          <View style={styles.batchContainer}>
            <Text style={[styles.batchTitle, { color: themeColors.text.secondary }]}>{t('previewTitle')} ({itemList.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.batchScroll}>
              {itemList.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.batchCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]} 
                  onPress={() => removeFromList(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.batchCardHeader}>
                    <Text style={[styles.batchAmount, { color: themeColors.primary }]}>{item.totalPrice.toLocaleString()}</Text>
                    <X size={14} color={themeColors.text.secondary} />
                  </View>
                  <Text style={[styles.batchNote, { color: themeColors.text.primary }]} numberOfLines={1}>{item.itemName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity 
          onPress={handleFinalSave} 
          activeOpacity={0.8}
          style={[
            styles.saveBtn, 
            theme === 'dark' && { borderWidth: 1, borderColor: 'rgba(0, 209, 255, 0.3)' }
          ]} 
        >
          <LinearGradient 
            colors={themeColors.primaryBtn || ['#6A5AE0', '#010102']} 
            style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Save color="#fff" size={20} />
            <Text style={styles.saveText}>
              {isEditMode 
                ? t('editBtnText') 
                : (isBatching ? `${t('saveAllBtnText')} (${itemList.length + (itemName ? 1 : 0)})` : t('saveBtnText'))
              }
            </Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    height: Platform.OS === 'ios' ? 110 : 90, 
    justifyContent: 'flex-end', 
    paddingBottom: 15,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 4 },
  formContainer: { paddingHorizontal: 25, paddingTop: 25, paddingBottom: 60 },
  inputWrapper: { marginBottom: 18 },
  label: { fontSize: 11, marginBottom: 6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  inputBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, borderWidth: 1.5 },
  mainInput: { flex: 1, fontSize: 16, fontWeight: '600', paddingVertical: 0 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  totalDisplay: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalAmount: { fontSize: 20, fontWeight: '800' },
  addToListBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1.5, marginBottom: 25, gap: 8 },
  addToListText: { fontWeight: '700', fontSize: 14 },
  batchContainer: { marginBottom: 25 },
  batchTitle: { fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
  batchScroll: { flexDirection: 'row' },
  batchCard: { width: 130, padding: 12, borderRadius: 18, marginRight: 12, borderWidth: 1.5 },
  batchCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  batchAmount: { fontSize: 14, fontWeight: '800' },
  batchNote: { fontSize: 12, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 20, gap: 12, elevation: 4, overflow: 'hidden' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});