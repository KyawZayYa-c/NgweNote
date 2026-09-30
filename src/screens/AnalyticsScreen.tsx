import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../context/useThemeStore';
import { useExpenseStore } from '../context/useExpenseStore';
import { Image as ImageIcon, PieChart as ChartIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import {
  FilterTabs,
  KPICards,
  PieChartSection,
  TopExpensesList,
  styles,
} from '../components/Analytics';

export const AnalyticsScreen = () => {
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t, i18n } = useTranslation();
  const { transactions } = useExpenseStore();
  const viewShotRef = useRef(null);

  const currentYear = new Date().getFullYear();

  const monthNames = useMemo(
    () =>
      i18n.language === 'mm'
        ? [
            'ဇန်နဝါရီ',
            'ဖေဖော်ဝါရီ',
            'မတ်',
            'ဧပြီ',
            'မေ',
            'ဇွန်',
            'ဇူလိုင်',
            'သြဂုတ်',
            'စက်တင်ဘာ',
            'အောက်တိုဘာ',
            'နိုဝင်ဘာ',
            'ဒီဇင်ဘာ',
          ]
        : [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
    [i18n.language]
  );

  const availableFilters = useMemo(() => {
    const filters: { id: string; label: string; sortKey: number; type: string }[] = [];
    const uniqueYears = new Set<number>();
    const currentYearMonths = new Set<number>();

    filters.push({
      id: `year-${currentYear}`,
      label: currentYear.toString(),
      sortKey: currentYear * 100 - 1,
      type: 'year',
    });

    transactions.forEach((tr) => {
      const d = new Date(tr.transactionDate);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();

      if (year === currentYear) {
        if (!currentYearMonths.has(monthIdx)) {
          currentYearMonths.add(monthIdx);
          filters.push({
            id: `${monthIdx}-${year}`,
            label: monthNames[monthIdx],
            sortKey: year * 100 + monthIdx,
            type: 'month',
          });
        }
      } else {
        if (!uniqueYears.has(year)) {
          uniqueYears.add(year);
          filters.push({
            id: `year-${year}`,
            label: year.toString(),
            sortKey: year * 10,
            type: 'year',
          });
        }
      }
    });

    return filters.sort((a, b) => b.sortKey - a.sortKey);
  }, [transactions, monthNames, currentYear]);

  const [activeFilter, setActiveFilter] = useState(
    availableFilters[0]?.id || `year-${currentYear}`
  );

  const analyticsData = useMemo(() => {
    let filtered = transactions || [];
    if (activeFilter.startsWith('year-')) {
      const targetYear = parseInt(activeFilter.replace('year-', ''));
      filtered = filtered.filter(
        (tr) => new Date(tr.transactionDate).getFullYear() === targetYear
      );
    } else {
      const [m, y] = activeFilter.split('-').map(Number);
      filtered = filtered.filter((tr) => {
        const d = new Date(tr.transactionDate);
        return d.getMonth() === m && d.getFullYear() === y;
      });
    }

    const income = filtered
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const expenseList = filtered
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount);

    return {
      income,
      expense,
      topExpenses: expenseList.slice(0, 5),
      label: availableFilters.find((f) => f.id === activeFilter)?.label,
      count: expenseList.length > 5 ? 5 : expenseList.length,
    };
  }, [transactions, activeFilter, availableFilters]);

  const saveAsImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;
      const uri = await captureRef(viewShotRef, { format: 'png', quality: 1.0 });
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert(t('success'), t('imageSaved'));
    } catch (err) {
      console.error(err);
    }
  };

  const topExpensesTitle =
    i18n.language === 'mm'
      ? `ထိပ်တန်းအသုံးစရိတ် (${analyticsData.count}) ခု`
      : `Top ${analyticsData.count} Expenses`;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
        paddingBottom: 70,
      }}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient colors={themeColors.primaryGradient} style={styles.navBar}>
        <View style={styles.navContent}>
          <ChartIcon color="#fff" size={24} />
          <Text style={styles.navTitle}>{t('analytics')}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <FilterTabs
          filters={availableFilters}
          activeFilter={activeFilter}
          onSelect={setActiveFilter}
          theme={theme}
          themeColors={themeColors}
        />

        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
          <View style={{ backgroundColor: themeColors.background, paddingTop: 10 }}>
            <KPICards
              income={analyticsData.income}
              expense={analyticsData.expense}
              theme={theme}
              themeColors={themeColors}
              incomeLabel={t('totalIncome')}
              expenseLabel={t('totalExpense')}
            />

            <PieChartSection
              income={analyticsData.income}
              expense={analyticsData.expense}
              label={analyticsData.label}
              title={t('ratioTitle')}
              incomeText={t('income')}
              expenseText={t('expense')}
              themeColors={themeColors}
            />

            <TopExpensesList
              items={analyticsData.topExpenses}
              count={analyticsData.count}
              title={topExpensesTitle}
              noRecordsText={t('noRecords')}
              themeColors={themeColors}
            />
          </View>
        </ViewShot>

        <TouchableOpacity
          onPress={saveAsImage}
          style={[styles.exportBtn, { borderColor: themeColors.primary }]}
          activeOpacity={0.7}
        >
          <ImageIcon color={themeColors.primary} size={20} />
          <Text style={{ color: themeColors.primary, fontWeight: 'bold' }}>
            {t('saveAsImage')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};