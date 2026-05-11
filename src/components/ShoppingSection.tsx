import React, { useState, useMemo, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Keyboard, Alert } from 'react-native';
import { ShoppingCard } from './ShoppingCard';
import { useThemeStore } from '../context/useThemeStore';
import { useShoppingStore } from '../context/useShoppingStore'; 
import { useTranslation } from 'react-i18next';
import { Tag, Plug } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// ၁။ Interface ကို သေချာသတ်မှတ်ပေးလိုက်ပါ
interface ShoppingSectionProps {
  toBuyItems: any[];
  todayTransactions: any[];
  onBuy?: (item: any) => void; // HomeScreen က လှမ်းခေါ်မယ့် function နာမည်
}

export const ShoppingSection = ({ 
  toBuyItems, 
  todayTransactions, 
  onBuy 
}: ShoppingSectionProps) => {
  const { getColors } = useThemeStore();
  const themeColors = getColors();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const { toggleBoughtStatus, deleteToBuyItem } = useShoppingStore();
  const [activeTab, setActiveTab] = useState('history');

  // မှတ်တမ်းမရှိရင် "ဝယ်ယူရန်" tab ကို အလိုအလျောက် ပြောင်းပေးမယ်
  useEffect(() => {
    if (todayTransactions.length === 0) {
      setActiveTab('toBuy');
    } else {
      setActiveTab('history');
    }
  }, [todayTransactions.length]);

  // ဒီနေ့ မှတ်တမ်း စုစုပေါင်း တွက်ချက်ခြင်း
  const todayTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    todayTransactions.forEach(item => {
      const amount = parseFloat(item.amount) || 0;
      if (item.type === 'income') income += amount;
      else if (item.type === 'expense') expense += amount;
    });
    return { income, expense };
  }, [todayTransactions]);

  // ဝယ်ယူရန် စုစုပေါင်း
  const toBuyTotal = useMemo(() => {
    return toBuyItems
      .filter(item => !item.isBought)
      .reduce((sum, item) => sum + ((item.count || 0) * (item.unitPrice || 0)), 0);
  }, [toBuyItems]);

  const tabs = todayTransactions.length === 0 
    ? [{ id: 'toBuy', label: 'ဝယ်ယူရန် 🛒' }, { id: 'history', label: 'ဒီနေ့မှတ်တမ်း 📝' }]
    : [{ id: 'history', label: 'ဒီနေ့မှတ်တမ်း 📝' }, { id: 'toBuy', label: 'ဝယ်ယူရန် 🛒' }];

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
      {/* Tab Bar Section */}
      <View style={[styles.tabBar, { backgroundColor: themeColors.background }]}>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabItem, activeTab === tab.id && { borderBottomWidth: 3, borderBottomColor: themeColors.primary }]}
            >
              <Text style={[styles.tabLabel, { color: activeTab === tab.id ? themeColors.primary : '#999' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          {activeTab === 'history' ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={{ fontSize: 11, color: '#22C55E', fontWeight: 'bold' }}>+{todayTotals.income.toLocaleString()} Ks</Text>
              <Text style={{ fontSize: 11, color: '#FF6B6B', fontWeight: 'bold' }}>-{todayTotals.expense.toLocaleString()} Ks</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'flex-end' }}>
               <Text style={{ fontSize: 10, color: '#999' }}>စုစုပေါင်း</Text>
               <Text style={{ fontSize: 12, color: themeColors.text.primary, fontWeight: 'bold' }}>{toBuyTotal.toLocaleString()} Ks</Text>
            </View>
          )}
        </View>
      </View>

      {/* ၂။ ခလုတ်ကို Tab Bar ရဲ့ အပြင်ဘက် ဒီနေရာမှာ ထည့်ပါ ✅ */}
      {activeTab === 'toBuy' && (
        <TouchableOpacity 
          style={[styles.inlineAddBtn, { backgroundColor: themeColors.primary + '15', borderColor: themeColors.primary + '40' }]} 
          onPress={() => navigation.navigate('AddToBuy')}
        >
          <Text style={{ color: themeColors.primary, fontWeight: 'bold', fontSize: 14 }}>
            + ဝယ်စရာအသစ်ထည့်ရန်
          </Text>
        </TouchableOpacity>
      )}

      {/* List Section */}
      <FlatList
        data={activeTab === 'history' ? todayTransactions : toBuyItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          activeTab === 'history' ? (
            <View style={[styles.itemCard, { backgroundColor: themeColors.surface }]}>
              <View style={styles.itemMain}>
                <Text style={[styles.itemLabel, { color: themeColors.text.primary }]}>{item.title || item.category}</Text>
                <View style={styles.itemSub}><Tag size={10} color="#999" /><Text style={styles.itemCat}>{item.category || 'အထွေထွေ'}</Text></View>
              </View>
              <View style={styles.itemEnd}>
                <Text style={[styles.itemAmount, { color: item.type === 'income' ? '#22C55E' : '#FF6B6B' }]}>
                  {item.type === 'income' ? '+' : '-'} {item.amount.toLocaleString()}
                </Text>
              </View>
            </View>
          ) : (
            <ShoppingCard 
              item={item} 
              onToggle={() => {
                Keyboard.dismiss();
                toggleBoughtStatus(item.id); 
                if (onBuy) onBuy(item); 
              }} 
              onDelete={(id) => {
                Alert.alert("သတိပြုရန်", "ဤပစ္စည်းကို စာရင်းထဲမှ ဖျက်မှာ သေချာပါသလား?", [
                  { text: "မဖျက်တော့ပါ", style: "cancel" },
                  { text: "ဖျက်မည်", onPress: () => deleteToBuyItem(id), style: 'destructive' }
                ]);
              }}
              onEdit={(editItem) => {
                navigation.navigate('AddToBuy', { editData: editItem });
              }}
            />
          )
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>မှတ်တမ်းမရှိသေးပါ</Text>}
        contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 16, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: { 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    paddingBottom: 5,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tabItem: { paddingVertical: 8 },
  tabLabel: { fontSize: 15, fontWeight: '800' },
  inlineAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
  },
  itemCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 14, 
    borderRadius: 16, 
    marginBottom: 8, 
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemMain: { flex: 1 },
  itemLabel: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  itemSub: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemCat: { fontSize: 11, color: '#999' },
  itemEnd: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemAmount: { fontSize: 14, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 14 }
});