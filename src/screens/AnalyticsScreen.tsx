
//src/screens/AnalyticsScreen.tsx
import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, StatusBar, Platform } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import ViewShot from 'react-native-view-shot';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../context/useThemeStore';
import { useExpenseStore } from '../context/useExpenseStore';
import { TrendingUp, TrendingDown, Image as ImageIcon, PieChart as ChartIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsScreen = () => {
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t, i18n } = useTranslation();
  const { transactions } = useExpenseStore();
  const viewShotRef = useRef(null);

  const currentYear = new Date().getFullYear();

  const monthNames = useMemo(() => 
    i18n.language === 'mm' 
      ? ["ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်", "ဇူလိုင်", "သြဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  , [i18n.language]);

  const availableFilters = useMemo(() => {
    const filters: { id: string; label: string; sortKey: number; type: string }[] = [];
    const uniqueYears = new Set<number>();
    const currentYearMonths = new Set<number>();

    // ၁။ Current Year အတွက် Year Summary
    filters.push({
      id: `year-${currentYear}`,
      label: currentYear.toString(),
      sortKey: currentYear * 100 - 1, 
      type: 'year'
    });

    transactions.forEach(tr => {
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
            type: 'month'
          });
        }
      } else {
        if (!uniqueYears.has(year)) {
          uniqueYears.add(year);
          filters.push({
            id: `year-${year}`,
            label: year.toString(),
            sortKey: year * 10, 
            type: 'year'
          });
        }
      }
    });

    return filters.sort((a, b) => b.sortKey - a.sortKey);
  }, [transactions, monthNames, currentYear]);

  const [activeFilter, setActiveFilter] = useState(availableFilters[0]?.id || `year-${currentYear}`);

  const analyticsData = useMemo(() => {
    let filtered = transactions || [];
    if (activeFilter.startsWith('year-')) {
      const targetYear = parseInt(activeFilter.replace('year-', ''));
      filtered = filtered.filter(tr => new Date(tr.transactionDate).getFullYear() === targetYear);
    } else {
      const [m, y] = activeFilter.split('-').map(Number);
      filtered = filtered.filter(tr => {
        const d = new Date(tr.transactionDate);
        return d.getMonth() === m && d.getFullYear() === y;
      });
    }

    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const expenseList = filtered.filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount);

    return { 
      income, 
      expense, 
      topExpenses: expenseList.slice(0, 5),
      label: availableFilters.find(f => f.id === activeFilter)?.label,
      count: expenseList.length > 5 ? 5 : expenseList.length
    };
  }, [transactions, activeFilter, availableFilters]);

  const saveAsImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;
      const uri = await captureRef(viewShotRef, { format: 'png', quality: 1.0 });
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert(t('success'), t('imageSaved'));
    } catch (err) { console.error(err); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background , paddingBottom: 70 }}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      {/* ၄ထောင့် ပုံစံ ဖြစ်သွားအောင် border radius ဖြုတ်ထားတဲ့ Header ဖြစ်ပါတယ် */}
      <LinearGradient colors={themeColors.primaryGradient} style={styles.navBar}>
        <View style={styles.navContent}>
          <ChartIcon color="#fff" size={24} />
          <Text style={styles.navTitle}>{t('analytics')}</Text>
        </View>
      </LinearGradient>

      {/* အောက်ခြေမှာ Card တွေ အပြည့်ပေါ်နေစေဖို့ PaddingBottom ကို 150 ထားပေးပါတယ် */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        
        {/* လ တွေ နှစ် တွေကို အောက်မှာ Card လေးနဲ့ သီးသန့်ပြပေးထားတာပါ */}
        <View style={[styles.filterCard, { backgroundColor: themeColors.surface }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availableFilters.map((f) => (
              <TouchableOpacity 
                key={f.id} 
                onPress={() => setActiveFilter(f.id)}
                style={[
                  styles.filterBtn, 
                  { backgroundColor: theme === 'dark' ? '#2A2D37' : '#E5E7EB' },
                  activeFilter === f.id && [styles.activeFilterBtn, { backgroundColor: themeColors.primary }]
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, { color: activeFilter === f.id ? '#fff' : themeColors.text.primary }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
          <View style={{ backgroundColor: themeColors.background, paddingTop: 10 }}>
            
            <View style={styles.kpiRow}>
              {/* Income Card: အစိမ်းနုရောင် နောက်ခံ */}
              <View style={[styles.kpiCard, { backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : '#E8F5E9' }]}>
                <TrendingUp color="#22C55E" size={20} />
                <Text style={[styles.kpiLabel, { color: themeColors.text.secondary }]}>{t('totalIncome')}</Text>
                <Text style={[styles.kpiValue, { color: '#22C55E' }]}>{analyticsData.income.toLocaleString()} Ks</Text>
              </View>

              {/* Expense Card: အနီနုရောင် နောက်ခံ */}
              <View style={[styles.kpiCard, { backgroundColor: theme === 'dark' ? 'rgba(255, 107, 107, 0.15)' : '#FFEBEE' }]}>
                <TrendingDown color="#FF6B6B" size={20} />
                <Text style={[styles.kpiLabel, { color: themeColors.text.secondary }]}>{t('totalExpense')}</Text>
                <Text style={[styles.kpiValue, { color: '#FF6B6B' }]}>{analyticsData.expense.toLocaleString()} Ks</Text>
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>{t('ratioTitle')} ({analyticsData.label})</Text>
              <PieChart
                data={[
                  { name: t('income'), population: analyticsData.income || 0.1, color: '#22C55E', legendFontColor: themeColors.text.primary, legendFontSize: 12 },
                  { name: t('expense'), population: analyticsData.expense || 0.1, color: '#FF6B6B', legendFontColor: themeColors.text.primary, legendFontSize: 12 },
                ]}
                width={screenWidth - 80} height={180}
                chartConfig={{ color: (op = 1) => themeColors.primary }}
                accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} absolute
              />
            </View>

            <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                {i18n.language === 'mm' ? `ထိပ်တန်းအသုံးစရိတ် (${analyticsData.count}) ခု` : `Top ${analyticsData.count} Expenses`}
              </Text>
              {analyticsData.topExpenses.length > 0 ? analyticsData.topExpenses.map((item, idx) => (
                <View key={item.id} style={styles.listItem}>
                  <View style={[styles.listIndex, { backgroundColor: themeColors.background }]}><Text style={{color: themeColors.primary, fontWeight:'bold'}}>{idx+1}</Text></View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={[styles.itemTitle, { color: themeColors.text.primary }]}>{item.title}</Text>
                    <Text style={styles.itemDate}>{new Date(item.transactionDate).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.itemAmount}>- {item.amount.toLocaleString()} Ks</Text>
                </View>
              )) : <Text style={{color: themeColors.text.secondary, textAlign:'center', padding: 20}}>{t('noRecords')}</Text>}
            </View>
          </View>
        </ViewShot>
        
        <TouchableOpacity onPress={saveAsImage} style={[styles.exportBtn, { borderColor: themeColors.primary }]} activeOpacity={0.7}>
            <ImageIcon color={themeColors.primary} size={20} />
            <Text style={{ color: themeColors.primary, fontWeight: 'bold' }}>{t('saveAsImage')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: { 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 45, 
    paddingBottom: 20,
  },
  navContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  
  // လ/နှစ် Filter ပြသရန် သီးသန့် Card Style
  filterCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, marginRight: 8 },
  activeFilterBtn: { elevation: 3 },
  filterText: { fontSize: 13, fontWeight: 'bold' },
  
  kpiRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 25, marginTop: 10 },
  kpiCard: { 
    flex: 1, 
    padding: 15, 
    borderRadius: 24, 
    borderWidth: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  kpiLabel: { fontSize: 12, marginTop: 10, fontWeight: '500' },
  kpiValue: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  sectionCard: { 
    marginHorizontal: 20, 
    padding: 22, 
    borderRadius: 30, 
    marginBottom: 25, 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.05)'
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  listIndex: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '600' },
  itemDate: { fontSize: 12, color: '#999', marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: 'bold', color: '#FF6B6B' },
  exportBtn: { marginHorizontal: 20, marginTop: 10, padding: 20, borderRadius: 22, borderWidth: 1.5, borderStyle: 'dashed', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 }
});