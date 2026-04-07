import React, { useState, useEffect } from 'react';
import { useShoppingStore } from '../context/useShoppingStore';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Platform, KeyboardAvoidingView, StatusBar, Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../context/useThemeStore';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Save, ShoppingBag, DollarSign, Plus, X } from 'lucide-react-native';

export const AddToBuyScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();

  // --- States ---
  const [itemName, setItemName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [count, setCount] = useState('1');
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemList, setItemList] = useState<any[]>([]);
  const { addToBuyItem } = useShoppingStore();

  const isBatching = itemList.length > 0;

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
      Alert.alert(t('warning'), "အချက်အလက်အပြည့်အစုံထည့်ပါ");
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
    const itemsToSave = [...itemList];
    
    if (itemName && unitPrice) {
      itemsToSave.push({
        id: Date.now().toString(),
        itemName,
        unitPrice: parseFloat(unitPrice),
        count: parseInt(count),
        totalPrice: totalPrice,
      });
    }

    if (itemsToSave.length === 0) {
      Alert.alert(t('warning'), "ပစ္စည်းစာရင်း ထည့်သွင်းပေးပါ");
      return;
    }

    // ✅ ဒီနေရာမှာ Store ထဲကို သိမ်းတဲ့ logic ထည့်ရပါမယ်
    try {
      // ပစ္စည်းတစ်ခုချင်းစီကို Store ထဲ ထည့်မယ်
      for (const item of itemsToSave) {
        await addToBuyItem({
          itemName: item.itemName,
          unitPrice: item.unitPrice,
          count: item.count
        });
      }
      
      console.log("Saved successfully to Store!");
      setItemList([]);
      resetForm();
      navigation.goBack();
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိပါသည်။");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header - Create Page UI အတိုင်း */}
      <LinearGradient colors={themeColors.primaryGradient} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ဝယ်ယူရန်စာရင်းထည့်ရန်</Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        
        {/* Item Name Input */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: themeColors.text.secondary }]}>ပစ္စည်းအမည်</Text>
          <View style={[styles.inputBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <ShoppingBag size={18} color={themeColors.primary} style={{ marginRight: 10 }} />
            <TextInput 
              style={[styles.mainInput, { color: themeColors.text.primary }]}
              value={itemName}
              placeholder="ပစ္စည်းအမည် ရိုက်ထည့်ပါ"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
              onChangeText={setItemName}
            />
          </View>
        </View>

        <View style={styles.row}>
          {/* Unit Price Input */}
          <View style={{ flex: 1.5 }}>
            <Text style={[styles.label, { color: themeColors.text.secondary }]}>ဈေးနှုန်း</Text>
            <View style={[styles.inputBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
              <DollarSign size={18} color={themeColors.primary} />
              <TextInput 
                style={[styles.mainInput, { color: themeColors.text.primary, marginLeft: 5 }]}
                value={unitPrice}
                placeholder="0.00"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
                keyboardType="decimal-pad"
                onChangeText={(text) => setUnitPrice(text.replace(/[^0-9.]/g, ''))}
              />
            </View>
          </View>

          {/* Count Input */}
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: themeColors.text.secondary }]}>အရေအတွက်</Text>
            <View style={[styles.inputBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
              <TextInput 
                style={[styles.mainInput, { color: themeColors.text.primary, textAlign: 'center' }]}
                value={count}
                placeholder="1"
                keyboardType="numeric"
                onChangeText={(text) => setCount(text.replace(/[^0-9]/g, ''))}
              />
            </View>
          </View>
        </View>

        {/* Total Display */}
        <View style={styles.totalDisplay}>
          <Text style={[styles.totalLabel, { color: themeColors.text.secondary }]}>စုစုပေါင်းကျသင့်ငွေ:</Text>
          <Text style={[styles.totalAmount, { color: themeColors.primary }]}>
            {totalPrice.toLocaleString()} Ks
          </Text>
        </View>

        {/* Add Another Item Button (Create Page အတိုင်း Dashed Border) */}
        <TouchableOpacity onPress={addToList} style={[styles.addToListBtn, { borderColor: themeColors.primary }]}>
          <Plus size={20} color={themeColors.primary} />
          <Text style={[styles.addToListText, { color: themeColors.primary }]}>ပစ္စည်းထပ်ထည့်မည်</Text>
        </TouchableOpacity>

        {/* Horizontal Preview List (Create Page အတိုင်း ဘေးတိုက် Scroll) */}
        {isBatching && (
          <View style={styles.batchContainer}>
            <Text style={[styles.batchTitle, { color: themeColors.text.secondary }]}>{t('preview')} ({itemList.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.batchScroll}>
              {itemList.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.batchCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]} 
                  onPress={() => removeFromList(item.id)}
                >
                  <View style={styles.batchCardHeader}>
                    <Text style={[styles.batchAmount, { color: themeColors.primary }]}>
                      {item.totalPrice.toLocaleString()}
                    </Text>
                    <X size={14} color="#9CA3AF" />
                  </View>
                  <Text style={[styles.batchNote, { color: themeColors.text.primary }]} numberOfLines={1}>{item.itemName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Save All Button (Create Page UI အတိုင်း) */}
        <TouchableOpacity onPress={handleFinalSave}>
          <LinearGradient colors={themeColors.primaryBtn || ['#6A5AE0', '#00D1FF']} style={styles.saveBtn}>
            <Save color="#fff" size={20} />
            <Text style={styles.saveText}>
              {isBatching ? `အားလုံးသိမ်းဆည်းမည် (${itemList.length + (itemName ? 1 : 0)})` : "သိမ်းဆည်းမည်"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
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
  inputWrapper: { marginBottom: 18 },
  label: { fontSize: 11, marginBottom: 6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  inputBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, borderWidth: 1.5 },
  mainInput: { flex: 1, fontSize: 18, fontWeight: '600' },
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
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: 20, gap: 12, elevation: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});