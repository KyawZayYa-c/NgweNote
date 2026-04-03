
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import { useExpenseStore } from '../context/useExpenseStore'; // Store ထည့်မယ်
import { fontSize } from '../theme/fontSize';
import { LogOut, Languages, Wallet, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export const HomeScreen = () => {
  const { logout, language, setLanguage } = useAuthStore();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t } = useTranslation();

  // Store ကနေ data တွေ ယူမယ်
  const { transactions, fetchTransactions, isLoading } = useExpenseStore();

  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- တွက်ချက်မှုပိုင်း (Balance, Income, Expense) ---
  const totalIncome = (transactions || [])
    .filter(tr => tr.type === 'income')
    .reduce((sum, tr) => sum + tr.amount, 0);

  const totalExpense = (transactions || [])
    .filter(tr => tr.type === 'expense')
    .reduce((sum, tr) => sum + tr.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <LinearGradient colors={themeColors.primaryGradient} style={styles.headerGradient}>
        <View style={styles.topBar}>
          <View style={styles.titleArea}>
            <Text style={styles.welcomeText}>{t('welcome')}</Text>
            <Text style={styles.guestText}>{t('guest')}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setLanguage(language === 'mm' ? 'en' : 'mm')} style={styles.glassBtn}>
              <Languages color="#fff" size={18} />
              <Text style={styles.langLabel}>{language === 'mm' ? 'EN' : 'MM'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.glassBtn}>
              <LogOut color="#fff" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <BlurView intensity={theme === 'dark' ? 10 : 30} tint={theme === 'dark' ? 'dark' : 'light'} style={styles.balanceCardWrapper}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View style={styles.iconBg}><Wallet color="#fff" size={24} /></View>
              <Text style={styles.balanceLabel}>{t('balance')}</Text>
            </View>
            <Text style={styles.balanceAmount}>{currentBalance.toLocaleString()} <Text style={{fontSize: 18}}>Ks</Text></Text>
            
            <View style={styles.statsRow}>
               <View style={styles.statItem}>
                  <TrendingUp color="#22C55E" size={16} />
                  <Text style={styles.statText}>+ {totalIncome.toLocaleString()} Ks</Text>
               </View>
               <View style={styles.separator} />
               <View style={styles.statItem}>
                  <TrendingDown color="#FF6B6B" size={16} />
                  <Text style={styles.statText}>- {totalExpense.toLocaleString()} Ks</Text>
               </View>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      {/* Transactions List Section */}
      <View style={styles.contentArea}>
          <Text style={[styles.sectionTitle, {color: themeColors.text.primary}]}>{t('recent')}</Text>
          
          {isLoading ? (
            <ActivityIndicator size="small" color={themeColors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={transactions || []}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={[styles.itemCard, { backgroundColor: themeColors.surface }]}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: themeColors.text.primary }]}>{item.title}</Text>
                    <Text style={styles.itemDate}>{new Date(item.transactionDate).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[
                    styles.itemAmount, 
                    { color: item.type === 'income' ? '#22C55E' : '#FF6B6B' }
                  ]}>
                    {item.type === 'income' ? '+' : '-'} {item.amount.toLocaleString()} Ks
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                   <Text style={{color: themeColors.text.secondary}}>မှတ်တမ်းမရှိသေးပါ။</Text>
                </View>
              }
              // List ရဲ့ အောက်ဆုံးမှာ ပိတ်မသွားအောင် padding နည်းနည်းထည့်ထားမယ်
              contentContainerStyle={{ paddingBottom: 100 }} 
            />
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { 
    height: 330, 
    paddingHorizontal: 20, 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40, 
    paddingTop: 50 
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  titleArea: { flex: 1 },
  welcomeText: { color: '#fff', opacity: 0.8, fontSize: fontSize.sm },
  guestText: { color: '#fff', fontSize: fontSize.xl, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  glassBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
  langLabel: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  balanceCardWrapper: { borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  balanceCard: { padding: 20 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  iconBg: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  balanceLabel: { color: '#fff', fontSize: fontSize.md },
  balanceAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  statText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  separator: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.2)' },
  contentArea: { flex: 1, padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: 'bold', marginBottom: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  // Transaction Item Styles
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    // Shadow for iOS & Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemDate: { fontSize: 12, color: '#999' },
  itemAmount: { fontSize: 16, fontWeight: 'bold' }
});