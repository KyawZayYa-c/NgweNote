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
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  const activeTab = useMemo(() => {
    if (selectedTab !== null) return selectedTab; 
    return todayTransactions.length > 0 ? 'history' : 'toBuy';
  }, [selectedTab, todayTransactions]);

  const sortedToBuyItems = useMemo(() => {
    if (!toBuyItems || toBuyItems.length === 0) return [];
    return [...toBuyItems].map(item => ({
      ...item,
      isPinned: pinnedIds.includes(item.id)
    })).sort((a, b) => {
      if (a.isBought !== b.isBought) return a.isBought ? 1 : -1;
      if (!a.isBought && a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return 0;
    });
  }, [toBuyItems, pinnedIds]);

  const todayTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    const len = todayTransactions.length;
    for (let i = 0; i < len; i++) {
      const item = todayTransactions[i];
      const amount = parseFloat(item.amount) || 0;
      if (item.type === 'income') income += amount;
      else if (item.type === 'expense') expense += amount;
    }
    return { income, expense };
  }, [todayTransactions]);

  const toBuyTotal = useMemo(() => {
    if (!toBuyItems) return 0;
    return toBuyItems
      .filter(item => !item.isBought)
      .reduce((sum, item) => sum + ((item.count || 0) * (item.unitPrice || 0)), 0);
  }, [toBuyItems]);

  const tabs = useMemo(() => [
    { id: 'history', label: t('todayHistory') },
    { id: 'toBuy', label: t('toBuy') }
  ], [t]);

  const handleTogglePin = (id: string) => {
    setPinnedIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    deleteToBuyItem(id);
    setModalVisible(false);
  };

  const handleToggleStatus = (item: any) => {
    if (!item?.id) return;
    toggleBoughtStatus(item.id);
    
    if (onBuy) {
      onBuy({ ...item, isBought: !item.isBought });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
      {/* Tab Bar Section */}
      <View style={[styles.tabBar, { backgroundColor: themeColors.background }]}>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab.id}
              onPress={() => setSelectedTab(tab.id)}
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
        
        // ⚡ FlatList 
        removeClippedSubviews={true} 
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}

        renderItem={({ item }) => (
          activeTab === 'history' ? (
            <View style={[styles.itemCard, { backgroundColor: themeColors.surface }]}>
              <View style={styles.itemMain}>
                <Text style={[styles.itemLabel, { color: themeColors.text.primary }]}>{item.title || item.category}</Text>
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
              onToggle={() => handleToggleStatus(item)}
              onLongPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
              onEdit={(editItem) => navigation.navigate('AddToBuy', { editData: editItem })}
              onDelete={(id) => handleDelete(id)}
            />
          )
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>{t('noRecords')}</Text>}
        contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 16, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal Section  */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>
                {selectedItem?.itemName || t('chooseOption')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={themeColors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsGroup}>
              <TouchableOpacity style={styles.optionButton} onPress={() => handleTogglePin(selectedItem?.id)}>
                {pinnedIds.includes(selectedItem?.id) ? (
                  <>
                    <PinOff size={20} color="#FFAC1C" />
                    <Text style={[styles.optionText, { color: themeColors.text.primary }]}>{t('cancel')} Pin</Text>
                  </>
                ) : (
                  <>
                    <Pin size={20} color={themeColors.primary} />
                    <Text style={[styles.optionText, { color: themeColors.text.primary }]}>Pin to Top</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={() => { setModalVisible(false); navigation.navigate('AddToBuy', { editData: selectedItem }); }}>
                <Edit3 size={20} color="#22C55E" />
                <Text style={[styles.optionText, { color: themeColors.text.primary }]}>{t('editRecord')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.optionButton, { borderBottomWidth: 0 }]} onPress={() => handleDelete(selectedItem?.id)}>
                <Trash2 size={20} color="#FF6B6B" />
                <Text style={[styles.optionText, { color: '#FF6B6B', fontWeight: 'bold' }]}>{t('deleteRecord')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5 },
  tabItem: { paddingVertical: 8 },
  tabLabel: { fontSize: 14, fontWeight: 'bold' },
  inlineAddBtn: { marginHorizontal: 16, marginTop: 10, paddingVertical: 12, borderRadius: 15, borderStyle: 'dashed', borderWidth: 1, alignItems: 'center' },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8, elevation: 1 },
  itemMain: { flex: 1 },
  itemLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  itemSub: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemCat: { fontSize: 11, color: '#999' },
  itemEnd: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 15, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  optionsGroup: { gap: 5 },
  optionButton: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.05)' },
  optionText: { fontSize: 14, marginLeft: 10 }
});