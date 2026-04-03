import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { useExpenseStore } from '../context/useExpenseStore';
import { useThemeStore } from '../context/useThemeStore';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Search, Trash2, Calendar as CalendarIcon, TrendingUp, TrendingDown, Tag, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export const HistoryScreen = () => {
  // ✅ Navigation navigation type error ကင်းဝေးစေရန် any သုံးထားသည်
  const navigation = useNavigation<any>(); 
  const { transactions, deleteTransaction, userPasscode } = useExpenseStore();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [displayLimit, setDisplayLimit] = useState(10);
  
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [passcode, setPasscode] = useState('');
  const [isPasscodeModal, setIsPasscodeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{id: string, type: 'delete' | 'edit'} | null>(null);

  const filterOptions = [
    { id: 'all', label: t('all') },
    { id: 'income', label: t('income') },
    { id: 'expense', label: t('expense') },
    { id: 'Food', label: t('food') },
    { id: 'Shopping', label: t('shopping') },
    { id: 'Transport', label: t('transport') },
    { id: 'Rent', label: t('rent') },
    { id: 'Bills', label: t('bills') },
    { id: 'Health', label: t('health') },
  ];

  const handleActionRequest = (id: string, type: 'delete' | 'edit') => {
    setPendingAction({ id, type });
    setIsPasscodeModal(true);
  };

  const confirmPasscode = async () => {
    if (passcode === userPasscode) {
      if (pendingAction?.type === 'edit') {
        setIsMenuVisible(false);
        setIsPasscodeModal(false);
        navigation.navigate('AddTransaction', { editData: selectedItem }); 
      } else if (pendingAction?.type === 'delete') {
        await deleteTransaction(pendingAction.id);
        setIsPasscodeModal(false);
        Alert.alert(t('success'), t('deletedSuccess'));
      }
      
      setPasscode('');
      setPendingAction(null);
    } else {
      Alert.alert(t('error'), t('wrongPasscode'));
      setPasscode('');
    }
  };

  const monthlySummary = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return (transactions || []).reduce((acc, curr) => {
      const tDate = new Date(curr.transactionDate);
      if (isWithinInterval(tDate, { start, end })) {
        if (curr.type === 'income') acc.income += curr.amount;
        else acc.expense += curr.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return (transactions || [])
      .filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeFilter === 'all') return matchesSearch;
        if (activeFilter === 'income' || activeFilter === 'expense') {
          return matchesSearch && t.type === activeFilter;
        }
        return matchesSearch && t.category === activeFilter;
      })
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }, [transactions, searchQuery, activeFilter]);
  
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: { data: any[], in: number, out: number } } = {};
    const limitedData = filteredTransactions.slice(0, displayLimit);

    limitedData.forEach(t => {
      const dateKey = format(new Date(t.transactionDate), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = { data: [], in: 0, out: 0 };
      groups[dateKey].data.push(t);
      if (t.type === 'income') groups[dateKey].in += t.amount;
      else groups[dateKey].out += t.amount;
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a)) 
      .map(date => ({ date, ...groups[date] }));
  }, [filteredTransactions, displayLimit]);
  
  return (
    <View style={[
      styles.container, {
        backgroundColor: theme === 'light' ? '#F4F7FE' : themeColors.background
      }]}>

      {/* Passcode Modal */}
      <Modal visible={isPasscodeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            <Lock size={30} color="#4A6CF7" style={{ marginBottom: 10 }} />
            <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>{t('enterPasscode')}</Text>
            <TextInput
              style={[styles.passInput, { color: themeColors.text.primary }]}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              value={passcode}
              onChangeText={setPasscode}
              autoFocus
              placeholder="****"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => { setIsPasscodeModal(false); setPasscode(''); }}>
                <Text style={{ color: '#999', fontSize: 16 }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmPasscode}>
                <Text style={{ color: '#4A6CF7', fontWeight: 'bold', fontSize: 16 }}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Sheet Menu Modal */}
      <Modal visible={isMenuVisible} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.sheetOverlay} 
          activeOpacity={1} 
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={[styles.sheetContent, { backgroundColor: themeColors.surface }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: themeColors.text.primary }]}>{t('options')}</Text>
            
            <TouchableOpacity 
              style={styles.sheetBtn} 
              onPress={() => {
                setIsMenuVisible(false);
                handleActionRequest(selectedItem.id, 'edit'); 
              }}
            >
              <Text style={{ color: '#4A6CF7', fontSize: 16, fontWeight: 'bold' }}>{t('editRecord')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sheetBtn, { borderTopWidth: 0.5, borderTopColor: '#EEE' }]} 
              onPress={() => {
                setIsMenuVisible(false);
                handleActionRequest(selectedItem.id, 'delete'); 
              }}
            >
              <Text style={{ color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' }}>{t('deleteRecord')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Header Summary */}
      <LinearGradient
        colors={themeColors.primaryGradient}
  style={styles.header}
      >
        <Text style={styles.navTitle}>{t('historyTitle')}</Text>
        <View style={styles.monthlySummaryRow}>
          <View style={styles.summaryBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <TrendingUp size={14} color="#4ADE80" />
              <Text style={styles.summaryLabel}>{t('income')}</Text>
            </View>
            <Text style={styles.summaryValue}>+{monthlySummary.income.toLocaleString()}</Text>
          </View>
          <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <View style={styles.summaryBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <TrendingDown size={14} color="#FB7185" />
              <Text style={styles.summaryLabel}>{t('expense')}</Text>
            </View>
            <Text style={styles.summaryValue}>-{monthlySummary.expense.toLocaleString()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: themeColors.surface }]}>
          <Search size={18} color="#999" />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text.primary }]}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setActiveFilter(opt.id)}
                style={[
                  styles.chip, 
                  { backgroundColor: activeFilter === opt.id ? '#4A6CF7' : themeColors.surface }
                ]}
              >
                <Text style={[styles.chipText, { color: activeFilter === opt.id ? '#fff' : '#666' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List of Transactions */}
        <FlatList
          data={groupedTransactions}
          keyExtractor={(item) => item.date}
          onEndReached={() => setDisplayLimit(prev => prev + 10)}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <CalendarIcon size={60} color="#DDD" />
              <Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>{t('noRecords')}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.dateBlock}>
              <View style={styles.dateHeader}>
                <View style={styles.dateLeft}>
                  <CalendarIcon size={14} color="#888" />
                  <Text style={styles.dateTitle}>{format(new Date(item.date), 'MMMM dd, yyyy')}</Text>
                </View>
                <View style={styles.dateRight}>
                  {item.in > 0 && <Text style={styles.dayIn}>+{item.in.toLocaleString()}</Text>}
                  {item.out > 0 && <Text style={styles.dayOut}>-{item.out.toLocaleString()}</Text>}
                </View>
              </View>

              {item.data.map((tData) => (
                <TouchableOpacity 
                  key={tData.id} 
                  style={[styles.itemCard, { backgroundColor: themeColors.surface }]}
                  onLongPress={() => {
                    setSelectedItem(tData); 
                    setIsMenuVisible(true); 
                  }}
                >
                  <View style={styles.itemMain}>
                    <Text style={[styles.itemLabel, { color: themeColors.text.primary }]}>{tData.title}</Text>
                    <View style={styles.itemSub}>
                      <Tag size={10} color="#999" />
                      <Text style={styles.itemCat}>{tData.category}</Text>
                    </View>
                  </View>
                  <View style={styles.itemEnd}>
                    <Text style={[styles.itemAmount, { color: tData.type === 'income' ? '#22C55E' : '#FF6B6B' }]}>
                      {tData.type === 'income' ? '+' : '-'} {tData.amount.toLocaleString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 70 },
  header: { paddingTop: 45, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  navTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 15 },
  monthlySummaryRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 15, padding: 12 },
  summaryBox: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#E0E0E0', fontSize: 11, marginBottom: 2 },
  summaryValue: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 16, marginTop: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 12, height: 45, elevation: 3, marginBottom: 15 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  filterSection: { marginBottom: 15 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginRight: 8, elevation: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  dateBlock: { marginBottom: 20 },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  dateLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateTitle: { fontSize: 13, fontWeight: 'bold', color: '#777' },
  dateRight: { flexDirection: 'row', gap: 10 },
  dayIn: { fontSize: 11, color: '#22C55E', fontWeight: 'bold' },
  dayOut: { fontSize: 11, color: '#FF6B6B', fontWeight: 'bold' },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 8, elevation: 1 },
  itemMain: { flex: 1 },
  itemLabel: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  itemSub: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemCat: { fontSize: 11, color: '#999' },
  itemEnd: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemAmount: { fontSize: 14, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { marginTop: 10, fontSize: 15, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 25, alignItems: 'center', elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  passInput: { borderBottomWidth: 2, borderBottomColor: '#4A6CF7', width: '60%', textAlign: 'center', fontSize: 28, letterSpacing: 15, marginBottom: 25, paddingVertical: 5 },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 10 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContent: { padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25, alignItems: 'center' },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#DDD', borderRadius: 5, marginBottom: 15 },
  sheetTitle: { fontSize: 14, marginBottom: 20, fontWeight: '600' },
  sheetBtn: { width: '100%', paddingVertical: 18, alignItems: 'center' },
});