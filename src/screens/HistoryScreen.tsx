import React, { useState, useMemo, useRef } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { useExpenseStore } from '../context/useExpenseStore';
import { useThemeStore } from '../context/useThemeStore';
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parse,
} from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../context/useAuthStore';
import {
  PasscodeModal,
  OptionsSheet,
  MonthSummaryCard,
  SearchBar,
  FilterChips,
  MonthGroup,
  styles,
} from '../components/History';

export const HistoryScreen = () => {
  const navigation = useNavigation<any>();
  const { transactions, deleteTransaction, userPasscode } = useExpenseStore();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [passcode, setPasscode] = useState('');
  const [isPasscodeModal, setIsPasscodeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    type: 'delete' | 'edit';
  } | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const [currentVisibleMonth, setCurrentVisibleMonth] = useState(
    format(new Date(), 'MMMM yyyy')
  );

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

  const handleActionRequest = async (id: string, type: 'delete' | 'edit') => {
    const hasPasscode =
      userPasscode !== '' && userPasscode !== null && userPasscode !== undefined;

    if (!hasPasscode) {
      if (type === 'edit') {
        setIsMenuVisible(false);
        const itemToEdit = groupedTransactions
          .flatMap((m: any) => m.days.flatMap((d: any) => d.data))
          .find((t: any) => t.id === id);

        navigation.navigate('AddTransaction', {
          editData: itemToEdit || selectedItem,
        });
      } else if (type === 'delete') {
        await deleteTransaction(id);
      }
      return;
    }

    setPendingAction({ id, type });
    setIsPasscodeModal(true);
  };

  const confirmPasscode = async () => {
    const { verifyActionPassword, deleteTransaction } = useExpenseStore.getState();
    const { isGuest } = useAuthStore.getState();

    try {
      let isValid = false;

      if (isGuest) {
        isValid = passcode === userPasscode;
      } else {
        isValid = await verifyActionPassword(passcode);
      }

      if (isValid) {
        if (pendingAction?.type === 'edit') {
          setIsMenuVisible(false);
          setIsPasscodeModal(false);
          navigation.navigate('AddTransaction', { editData: selectedItem });
        } else if (pendingAction?.type === 'delete') {
          await deleteTransaction(pendingAction.id);
          setIsPasscodeModal(false);
        }

        setPasscode('');
        setPendingAction(null);
      } else {
        Alert.alert(t('error'), t('wrongPasscode'));
        setPasscode('');
      }
    } catch (error) {
      console.error('Passcode verification error:', error);
      Alert.alert(t('error'), 'Verification failed. Please try again.');
      setPasscode('');
    }
  };

  const activeMonthSummary = useMemo(() => {
    try {
      const parsedDate = parse(currentVisibleMonth, 'MMMM yyyy', new Date());
      const start = startOfMonth(parsedDate);
      const end = endOfMonth(parsedDate);
      return (transactions || []).reduce(
        (acc, curr) => {
          const tDate = new Date(curr.transactionDate);
          if (isWithinInterval(tDate, { start, end })) {
            if (curr.type === 'income') acc.income += curr.amount;
            else acc.expense += curr.amount;
          }
          return acc;
        },
        { income: 0, expense: 0 }
      );
    } catch (e) {
      return { income: 0, expense: 0 };
    }
  }, [transactions, currentVisibleMonth]);

  const filteredTransactions = useMemo(() => {
    return (transactions || [])
      .filter((t) => {
        const matchesSearch = t.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        if (activeFilter === 'all') return matchesSearch;
        if (activeFilter === 'income' || activeFilter === 'expense') {
          return matchesSearch && t.type === activeFilter;
        }
        return matchesSearch && t.category === activeFilter;
      })
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      );
  }, [transactions, searchQuery, activeFilter]);

  const groupedTransactions = useMemo(() => {
    const groups: any = {};

    const slicedTransactions = filteredTransactions.slice(0, visibleCount);

    slicedTransactions.forEach((t) => {
      const monthKey = format(new Date(t.transactionDate), 'MMMM yyyy');
      const dateKey = format(new Date(t.transactionDate), 'yyyy-MM-dd');

      if (!groups[monthKey]) {
        groups[monthKey] = {
          monthTitle: monthKey,
          days: {},
          monthIn: 0,
          monthOut: 0,
        };
      }
      if (!groups[monthKey].days[dateKey]) {
        groups[monthKey].days[dateKey] = {
          date: dateKey,
          data: [],
          dayIn: 0,
          dayOut: 0,
        };
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
      days: Object.values(m.days).sort((a: any, b: any) =>
        b.date.localeCompare(a.date)
      ),
    }));
  }, [filteredTransactions, visibleCount]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const firstVisibleMonth = viewableItems[0].item?.monthTitle;
      if (firstVisibleMonth && firstVisibleMonth !== currentVisibleMonth) {
        setCurrentVisibleMonth(firstVisibleMonth);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 15,
    minimumViewTime: 20,
  }).current;

  React.useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, activeFilter]);

  const handleLongPressItem = (item: any) => {
    setSelectedItem(item);
    setIsMenuVisible(true);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme === 'light' ? '#F4F7FE' : themeColors.background,
        },
      ]}
    >
      <PasscodeModal
        visible={isPasscodeModal}
        passcode={passcode}
        onChangePasscode={setPasscode}
        onCancel={() => {
          setIsPasscodeModal(false);
          setPasscode('');
        }}
        onConfirm={confirmPasscode}
        title={t('enterPasscode')}
        cancelText={t('cancel')}
        confirmText={t('confirm')}
        themeColors={themeColors}
      />

      <OptionsSheet
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onEdit={() => {
          setIsMenuVisible(false);
          handleActionRequest(selectedItem.id, 'edit');
        }}
        onDelete={() => {
          setIsMenuVisible(false);
          handleActionRequest(selectedItem.id, 'delete');
        }}
        title={t('options')}
        editText={t('editRecord')}
        deleteText={t('deleteRecord')}
        themeColors={themeColors}
      />

      <LinearGradient
        colors={themeColors.primaryGradient || ['#4A6CF7', '#6A85F1']}
        style={styles.header}
      >
        <View style={styles.screenHeaderTitleRow}>
          <CalendarIcon size={24} color="#fff" />
          <Text style={styles.screenHeaderTitleText}>History</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <MonthSummaryCard
          monthTitle={currentVisibleMonth}
          income={activeMonthSummary.income}
          expense={activeMonthSummary.expense}
          incomeLabel={t('income')}
          expenseLabel={t('expense')}
          theme={theme}
          themeColors={themeColors}
        />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('searchPlaceholder')}
          theme={theme}
          themeColors={themeColors}
        />

        <FilterChips
          options={filterOptions}
          activeFilter={activeFilter}
          onSelect={setActiveFilter}
          theme={theme}
          themeColors={themeColors}
        />

        <FlatList
          data={groupedTransactions}
          keyExtractor={(item) => item.monthTitle}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={{ paddingBottom: 40 }}
          onEndReached={() => {
            if (visibleCount < filteredTransactions.length) {
              setVisibleCount((prev) => prev + 10);
            }
          }}
          onEndReachedThreshold={0.3}
          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            if (offsetY <= 5 && groupedTransactions.length > 0) {
              const latestMonth = groupedTransactions[0].monthTitle;
              if (currentVisibleMonth !== latestMonth) {
                setCurrentVisibleMonth(latestMonth);
              }
            }
          }}
          scrollEventThrottle={16}
          removeClippedSubviews={false}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          renderItem={({ item: monthGroup, index }) => (
            <MonthGroup
              monthGroup={monthGroup}
              index={index}
              totalMonths={groupedTransactions.length}
              onLongPressItem={handleLongPressItem}
              theme={theme}
              themeColors={themeColors}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <CalendarIcon size={60} color="#DDD" />
              <Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>
                {t('noRecords')}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};