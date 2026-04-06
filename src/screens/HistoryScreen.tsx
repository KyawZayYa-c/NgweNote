import React, { useState, useMemo, useRef } from 'react'; // useRef ထပ်ထည့်ထားပါတယ်
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { useExpenseStore } from '../context/useExpenseStore';
import { useThemeStore } from '../context/useThemeStore';
import { format, startOfMonth, endOfMonth, isWithinInterval, parse } from 'date-fns';
import { Search, Calendar as CalendarIcon, TrendingUp, TrendingDown, Tag, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export const HistoryScreen = () => {
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

  // ✅ လက်ရှိ Screen ပေါ်မှာ မြင်နေရတဲ့ လကို သိမ်းထားရန်
  const [currentVisibleMonth, setCurrentVisibleMonth] = useState(format(new Date(), 'MMMM yyyy'));

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
        // Alert.alert(t('success'), t('deletedSuccess'));
      }
      setPasscode('');
      setPendingAction(null);
    } else {
      Alert.alert(t('error'), t('wrongPasscode'));
      setPasscode('');
    }
  };

  // ✅ Scroll ဆွဲတဲ့အခါ လက်ရှိလအလိုက် Summary ကို ပြောင်းလဲတွက်ချက်ပေးမည့် Logic
  const activeMonthSummary = useMemo(() => {
    // လက်ရှိမြင်နေရတဲ့ လရဲ့ start နဲ့ end ကို တွက်ပါတယ်
    const parsedDate = parse(currentVisibleMonth, 'MMMM yyyy', new Date());
    const start = startOfMonth(parsedDate);
    const end = endOfMonth(parsedDate);

    return (transactions || []).reduce((acc, curr) => {
      const tDate = new Date(curr.transactionDate);
      if (isWithinInterval(tDate, { start, end })) {
        if (curr.type === 'income') acc.income += curr.amount;
        else acc.expense += curr.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions, currentVisibleMonth]);

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
    const groups: any = {};
    const limitedData = filteredTransactions.slice(0, displayLimit);

    limitedData.forEach(t => {
      const monthKey = format(new Date(t.transactionDate), 'MMMM yyyy');
      const dateKey = format(new Date(t.transactionDate), 'yyyy-MM-dd');

      if (!groups[monthKey]) {
        groups[monthKey] = { monthTitle: monthKey, days: {}, monthIn: 0, monthOut: 0 };
      }
      if (!groups[monthKey].days[dateKey]) {
        groups[monthKey].days[dateKey] = { date: dateKey, data: [], dayIn: 0, dayOut: 0 };
      }

      groups[monthKey].days[dateKey].data.push(t);
      if (t.type === 'income') {
        groups[monthKey].monthIn += t.amount;
        groups[monthKey].days[dateKey].dayIn += t.amount;
      } else {
        groups[monthKey].monthOut += t.amount;
        groups[monthKey].days[dateKey].dayOut += t.amount;
      }
    });

    return Object.values(groups).map((m: any) => ({
      ...m,
      days: Object.values(m.days).sort((a: any, b: any) => b.date.localeCompare(a.date))
    }));
  }, [filteredTransactions, displayLimit]);

  // ✅ Viewable Items က ပြောင်းလဲသွားရင် (Scroll ဆွဲရင်) လကို update လုပ်ပေးမည့် function
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      // Screen ပေါ်မှာ မြင်နေရတဲ့ ထိပ်ဆုံး item ရဲ့ month title ကို ယူပါတယ်
      const firstVisibleMonth = viewableItems[0].item.monthTitle;
      // ✅ လက်ရှိလနဲ့ မတူမှသာ State ကို update လုပ်ပါ (ဒါဆိုရင် Screen မတုန်တော့ပါ)
      if (firstVisibleMonth && firstVisibleMonth !== currentVisibleMonth) {
      setCurrentVisibleMonth(firstVisibleMonth);
    }
    }
  }).current;


  return (
    <View style={[styles.container, { backgroundColor: theme === 'light' ? '#F4F7FE' : themeColors.background }]}>
      
      {/* Passcode Modal (No Change) */}
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

      {/* Options Menu Modal (No Change) */}
      <Modal visible={isMenuVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setIsMenuVisible(false)}>
          <View style={[styles.sheetContent, { backgroundColor: themeColors.surface }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: themeColors.text.primary }]}>{t('options')}</Text>
            <TouchableOpacity style={styles.sheetBtn} onPress={() => { setIsMenuVisible(false); handleActionRequest(selectedItem.id, 'edit'); }}>
              <Text style={{ color: '#4A6CF7', fontSize: 16, fontWeight: 'bold' }}>{t('editRecord')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sheetBtn, { borderTopWidth: 0.5, borderTopColor: '#EEE' }]} onPress={() => { setIsMenuVisible(false); handleActionRequest(selectedItem.id, 'delete'); }}>
              <Text style={{ color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' }}>{t('deleteRecord')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Header - Card summary ပြောင်းလဲသွားမည့်အပိုင်း */}
      <LinearGradient colors={themeColors.primaryGradient || ['#4A6CF7', '#6A85F1']} style={styles.header}>
        {/* လအမည်ကိုပါ header မှာ ပြချင်ရင် activeMonthSummary အပေါ်မှာ currentVisibleMonth ကို သုံးပြလို့ရပါတယ် */}
        <Text style={styles.navTitle}>{currentVisibleMonth}</Text>
        <View style={styles.monthlySummaryRow}>
          <View style={styles.summaryBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <TrendingUp size={14} color="#4ADE80" />
              <Text style={styles.summaryLabel}>{t('income')}</Text>
            </View>
            <Text style={styles.summaryValue}>+{activeMonthSummary.income.toLocaleString()}</Text>
          </View>
          <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <View style={styles.summaryBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <TrendingDown size={14} color="#FB7185" />
              <Text style={styles.summaryLabel}>{t('expense')}</Text>
            </View>
            <Text style={styles.summaryValue}>-{activeMonthSummary.expense.toLocaleString()}</Text>
          </View>
        </View>
      </LinearGradient>

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
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.id;
              return (
                <TouchableOpacity key={opt.id} onPress={() => setActiveFilter(opt.id)} style={styles.chipWrapper}>
                  {isActive ? (
                    <LinearGradient colors={themeColors.primaryBtn || ['#6A5AE0', '#00D1FF']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.chipGradient}>
                      <Text style={[styles.chipText, { color: '#fff' }]}>{opt.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.chipNormal, { backgroundColor: themeColors.surface }]}>
                      <Text style={[styles.chipText, { color: theme === 'dark' ? '#94A3B8' : '#666' }]}>{opt.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main List - onViewableItemsChanged ထည့်သွင်းထားပါတယ် */}
        <FlatList
          data={groupedTransactions}
          keyExtractor={(item) => item.monthTitle}
          onEndReached={() => setDisplayLimit(prev => prev + 10)}
          onViewableItemsChanged={onViewableItemsChanged} // ✅ Scroll monitoring
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }} // ✅ ၅၀ ရာခိုင်နှုန်း မြင်ရရင် လကို update လုပ်မယ်
          renderItem={({ item: monthGroup, index }) => (
            <View>
              <View style={styles.monthDivider}>
                <Text style={styles.monthText}>{monthGroup.monthTitle}</Text>
                <View style={styles.monthTotalBox}>
                  <Text style={styles.monthInText}>+{monthGroup.monthIn.toLocaleString()}</Text>
                  <Text style={styles.monthOutText}>-{monthGroup.monthOut.toLocaleString()}</Text>
                </View>
              </View>

              {monthGroup.days.map((dayGroup: any) => (
                <View key={dayGroup.date} style={styles.dateBlock}>
                  <View style={styles.dateHeader}>
                    <View style={styles.dateLeft}>
                      <CalendarIcon size={14} color="#888" />
                      <Text style={styles.dateTitle}>{format(new Date(dayGroup.date), 'MMMM dd, yyyy')}</Text>
                    </View>
                    <View style={styles.dateRight}>
                      {dayGroup.dayIn > 0 && <Text style={styles.dayIn}>+{dayGroup.dayIn.toLocaleString()}</Text>}
                      {dayGroup.dayOut > 0 && <Text style={styles.dayOut}>-{dayGroup.dayOut.toLocaleString()}</Text>}
                    </View>
                  </View>

                  {dayGroup.data.map((tData: any) => (
                    <TouchableOpacity 
                      key={tData.id} 
                      style={[styles.itemCard, { backgroundColor: themeColors.surface }]}
                      onLongPress={() => { setSelectedItem(tData); setIsMenuVisible(true); }}
                    >
                      <View style={styles.itemMain}>
                        <Text style={[styles.itemLabel, { color: themeColors.text.primary }]}>{tData.title}</Text>
                        <View style={styles.itemSub}><Tag size={10} color="#999" /><Text style={styles.itemCat}>{tData.category}</Text></View>
                      </View>
                      <View style={styles.itemEnd}>
                        <Text style={[styles.itemAmount, { color: tData.type === 'income' ? '#22C55E' : '#FF6B6B' }]}>
                          {tData.type === 'income' ? '+' : '-'} {tData.amount.toLocaleString()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {index < groupedTransactions.length - 1 && (
                <View style={[styles.monthSeparator, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.481)' : 'rgba(0, 0, 0, 0.33)' }]} />
              )}
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <CalendarIcon size={60} color="#DDD" />
              <Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>{t('noRecords')}</Text>
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
  chipWrapper: {
  marginRight: 8,
  borderRadius: 12,
  overflow: 'hidden', // Gradient က ကွေးနေတဲ့ထောင့်တွေအတိုင်း ဖြစ်နေအောင်
  elevation: 2,
},
chipGradient: {
  paddingHorizontal: 18,
  paddingVertical: 10,
  alignItems: 'center',
  justifyContent: 'center',
},
chipNormal: {
  paddingHorizontal: 18,
  paddingVertical: 10,
  alignItems: 'center',
  justifyContent: 'center',
},
chipText: {
  fontSize: 12,
  fontWeight: '700',
},
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginRight: 8, elevation: 1 },
  // ✅ Month Divider Styles
  monthDivider: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', marginBottom: 15, marginTop: 10 },
  monthText: { fontSize: 16, fontWeight: '800', color: '#4A6CF7', textTransform: 'uppercase' },
  monthTotalBox: { flexDirection: 'row', gap: 12 },
  monthInText: { fontSize: 12, color: '#22C55E', fontWeight: '700' },
  monthOutText: { fontSize: 12, color: '#FF6B6B', fontWeight: '700' },
  monthSeparator: { height: 2, marginHorizontal: 30, },
  // Day Block Styles
  dateBlock: { marginBottom: 15 },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  dateLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateTitle: { fontSize: 13, fontWeight: 'bold', color: '#777' },
  dateRight: { flexDirection: 'row', gap: 10 },
  dayIn: { fontSize: 11, color: '#22C55E', fontWeight: 'bold' },
  dayOut: { fontSize: 11, color: '#FF6B6B', fontWeight: 'bold' },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom:5,  elevation: 1 },
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