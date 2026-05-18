import React, { useState, useMemo, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Keyboard, Modal, Pressable } from 'react-native';
import { ShoppingCard } from './ShoppingCard';
import { useThemeStore } from '../context/useThemeStore';
import { useTranslation } from 'react-i18next';
import { Tag, Pin, PinOff, Trash2, Edit3, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useExpenseStore } from '../context/useExpenseStore';

interface ShoppingSectionProps {
  toBuyItems: any[];
  todayTransactions: any[];
  onBuy?: (item: any) => void;
}

export const ShoppingSection = ({ 
  toBuyItems, 
  todayTransactions, 
  onBuy 
}: ShoppingSectionProps) => {
  const { getColors } = useThemeStore();
  const themeColors = getColors();
  const navigation = useNavigation<any>();
  const { toggleBoughtStatus, deleteToBuyItem } = useExpenseStore();
  const { t } = useTranslation(); // 🌟 i18n Translation Hook ကို ခေါ်ယူအသုံးပြုခြင်း
  
  const [activeTab, setActiveTab] = useState('history');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    if (todayTransactions.length === 0) {
      setActiveTab('toBuy');
    } else {
      setActiveTab('history');
    }
  }, [todayTransactions.length]);

  const sortedToBuyItems = useMemo(() => {
    return [...toBuyItems].map(item => ({
      ...item,
      isPinned: pinnedIds.includes(item.id)
    })).sort((a, b) => {
      if (a.isBought !== b.isBought) {
        return a.isBought ? 1 : -1;
      }
      if (!a.isBought && a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return 0;
    });
  }, [toBuyItems, pinnedIds]);

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

  const toBuyTotal = useMemo(() => {
    return toBuyItems
      .filter(item => !item.isBought)
      .reduce((sum, item) => sum + ((item.count || 0) * (item.unitPrice || 0)), 0);
  }, [toBuyItems]);

  // 🌟 Tab labels တွေကို i18n keys သုံးပြီး Language အလိုက် ပြောင်းလဲအောင် ပြင်ဆင်ခြင်း
  const tabs = todayTransactions.length === 0 
    ? [{ id: 'toBuy', label: t('toBuy') }, { id: 'history', label: t('todayHistory') }]
    : [{ id: 'history', label: t('todayHistory') }, { id: 'toBuy', label: t('toBuy') }];

  const handleTogglePin = (id: string) => {
    if (pinnedIds.includes(id)) {
      setPinnedIds(pinnedIds.filter(pid => pid !== id));
    } else {
      setPinnedIds([...pinnedIds, id]);
    }
    setModalVisible(false);
  };

  // စာရင်းဖျက်ခြင်း လုပ်ဆောင်ချက်
  const handleDelete = (id: string) => {
    deleteToBuyItem(id);
    setModalVisible(false);
  };

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
              <Text style={[styles.tabLabel, { color: activeTab === tab.id ? themeColors.primary : themeColors.tab }]}>{tab.label}</Text>
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
               {/* 🌟 "စုစုပေါင်း" ကို Translation Key ဖြင့် အစားထိုး */}
               <Text style={{ fontSize: 10, color: '#999' }}>{t('totalEstimate')}</Text>
               <Text style={{ fontSize: 12, color: themeColors.text.primary, fontWeight: 'bold' }}>{toBuyTotal.toLocaleString()} Ks</Text>
            </View>
          )}
        </View>
      </View>

      {activeTab === 'toBuy' && (
        <TouchableOpacity 
          style={[styles.inlineAddBtn, { backgroundColor: themeColors.primary + '15', borderColor: themeColors.primary + '40' }]} 
          onPress={() => navigation.navigate('AddToBuy')}
        >
          {/* 🌟 "+ ဝယ်စရာအသစ်ထည့်ရန်" ကို Translation Key ဖြင့် အစားထိုး */}
          <Text style={{ color: themeColors.primary, fontWeight: 'bold', fontSize: 14 }}>
            + {t('add_item')}
          </Text>
        </TouchableOpacity>
      )}

      {/* List Section */}
      <FlatList
        style={{ marginBottom: 70 }}
        data={activeTab === 'history' ? todayTransactions : sortedToBuyItems}
        keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
        extraData={[toBuyItems, pinnedIds]} 
        renderItem={({ item }) => (
          activeTab === 'history' ? (
            <View style={[styles.itemCard, { backgroundColor: themeColors.surface }]}>
              <View style={styles.itemMain}>
                <Text style={[styles.itemLabel, { color: themeColors.text.primary }]}>{item.title || item.category}</Text>
                {/* 🌟 "အထွေထွေ" ကို Translation Key ဖြင့် အစားထိုး */}
                <View style={styles.itemSub}><Tag size={10} color="#999" /><Text style={styles.itemCat}>{item.category || t('all')}</Text></View>
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
                if (item?.id) {
                  toggleBoughtStatus(item.id); 
                  setTimeout(() => {
                    if (onBuy) onBuy({ ...item, isBought: !item.isBought }); 
                  }, 300);
                }
              }}
              onLongPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
              onEdit={(editItem) => navigation.navigate('AddToBuy', { editData: editItem })}
              onDelete={(id) => handleDelete(id)}
            />
          )
        )}
        /* 🌟 "မှတ်တမ်းမရှိသေးပါ" ကို Translation Key ဖြင့် အစားထိုး */
        ListEmptyComponent={<Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>{t('noRecords')}</Text>}
        contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 16, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            {/* Handle Bar */}
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              {/* 🌟 "ရွေးချယ်ရန်" ကို Translation Key ဖြင့် အစားထိုး */}
              <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>
                {selectedItem?.itemName || t('chooseOption')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={themeColors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <View style={styles.optionsGroup}>
              {/* ၁။ Pin / Unpin ခလုတ် */}
              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={() => handleTogglePin(selectedItem?.id)}
              >
                {pinnedIds.includes(selectedItem?.id) ? (
                  <>
                    <PinOff size={20} color="#FFAC1C" />
                    {/* 🌟 "ထိပ်ဆုံးမှ ပြန်ဖြုတ်မည် (Cancel Pin)" ကို Translation (EN/MM) ပြောင်းလဲနိုင်အောင် key သတ်မှတ်ရင် အဆင်ပြေအောင် t('cancel') သို့မဟုတ် Language Text အလိုက် ပြင်ဆင်နိုင်ပါတယ် (ဒီမှာတော့ မူရင်းအဓိပ္ပာယ်အတိုင်း i18n text သုံးထားပါတယ်) */}
                    <Text style={[styles.optionText, { color: themeColors.text.primary }]}>
                      {t('cancel')} Pin
                    </Text>
                  </>
                ) : (
                  <>
                    <Pin size={20} color={themeColors.primary} />
                    <Text style={[styles.optionText, { color: themeColors.text.primary }]}>
                      Pin to Top
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('AddToBuy', { editData: selectedItem });
                }}
              >
                <Edit3 size={20} color="#22C55E" />
                {/* 🌟 "အချက်အလက် ပြင်ဆင်မည်" ကို Translation Key ဖြင့် အစားထိုး */}
                <Text style={[styles.optionText, { color: themeColors.text.primary }]}>
                  {t('editRecord')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, { borderBottomWidth: 0 }]} 
                onPress={() => handleDelete(selectedItem?.id)}
              >
                <Trash2 size={20} color="#FF6B6B" />
                {/* 🌟 "စာရင်းမှ ဖျက်ပစ်မည်" ကို Translation Key ဖြင့် အစားထိုး */}
                <Text style={[styles.optionText, { color: '#FF6B6B', fontWeight: 'bold' }]}>
                  {t('deleteRecord')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tabItem: { paddingVertical: 5 },
  tabLabel: { fontSize: 13, fontWeight: '800' },
  inlineAddBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginVertical: 10, paddingVertical: 14, borderRadius: 15, borderWidth: 1, borderStyle: 'dashed', borderColor: '#ccc' },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  itemMain: { flex: 1 },
  itemLabel: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  itemSub: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemCat: { fontSize: 11, color: '#999' },
  itemEnd: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemAmount: { fontSize: 14, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 14 },
  
  // Modal Custom Styles 🌟
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#ccc', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  optionsGroup: { borderRadius: 16, overflow: 'hidden' },
  optionButton: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  optionText: { fontSize: 15, fontWeight: '500' }
});