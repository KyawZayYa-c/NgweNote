import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../context/useAuthStore';
import { useExpenseStore } from '../context/useExpenseStore';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatCurrency';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';
import { isToday, isThisMonth } from 'date-fns';
import { ExpenseCard } from '../components/ExpenseCard';

export const HomeScreen = ({ navigation }: any) => {
  const { user, isGuest } = useAuthStore();
  const { transactions, fetchTransactions, isLoading } = useExpenseStore();

  useEffect(() => {
    fetchTransactions();
  }, [Boolean(user), Boolean(isGuest)]);

  const stats = useMemo(() => {
    let totalBalance = 0;
    let todayExpense = 0;
    let monthExpense = 0;

    if (Array.isArray(transactions)) {
      transactions.forEach(t => {
        const amount = Number(t.amount) || 0;
        const tDate = new Date(t.transactionDate);

        if (t.type === 'income') {
          totalBalance += amount;
        } else {
          totalBalance -= amount;
          if (isToday(tDate)) {
            todayExpense += amount;
          }
          if (isThisMonth(tDate)) {
            monthExpense += amount;
          }
        }
      });
    }

    return { totalBalance, todayExpense, monthExpense };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return Array.isArray(transactions) ? transactions.slice(0, 5) : [];
  }, [transactions]);

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>မင်္ဂလာပါ</Text>
            <Text style={styles.appName}>NgweNote</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.email?.[0]?.toUpperCase() || 'G'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Wallet size={20} color="#e0e7ff" />
            <Text style={styles.balanceLabel}>စုစုပေါင်း လက်ကျန်ငွေ</Text>
          </View>
          <Text style={styles.balanceValue}>{formatCurrency(stats.totalBalance)}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { marginRight: 8 }]}>
            <View style={styles.statHeader}>
              <TrendingDown size={16} color={colors.expense} />
              <Text style={styles.statLabel}>ယနေ့သုံးစွဲမှု</Text>
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.todayExpense)}</Text>
          </View>
          <View style={[styles.statBox, { marginLeft: 8 }]}>
            <View style={styles.statHeader}>
              <TrendingUp size={16} color={colors.expense} />
              <Text style={styles.statLabel}>ယခုလသုံးစွဲမှု</Text>
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.monthExpense)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>လတ်တလော မှတ်တမ်းများ</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.seeAll}>အားလုံးကြည့်ရန်</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <Text style={styles.emptyText}>စောင့်ဆိုင်းပါ...</Text>
          ) : recentTransactions.length > 0 ? (
            recentTransactions.map((t) => (
              <ExpenseCard 
                key={t.id} 
                transaction={t} 
                onPress={() => {}} 
              />
            ))
          ) : (
            <Text style={styles.emptyText}>မှတ်တမ်းမရှိသေးပါ။</Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Plus color="#ffffff" size={30} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 16,
    color: '#64748b',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    color: '#e0e7ff',
    fontSize: 16,
    marginLeft: 8,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  seeAll: {
    color: colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 20,
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
