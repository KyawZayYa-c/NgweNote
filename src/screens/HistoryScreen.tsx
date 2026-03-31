import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { useExpenseStore } from '../context/useExpenseStore';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateHeader } from '../utils/dateHelpers';
import { ExpenseCard } from '../components/ExpenseCard';
import { GroupHeader } from '../components/GroupHeader';
import { EmptyState } from '../components/EmptyState';
import { Search, Calendar, Plus } from 'lucide-react-native';
import { Transaction } from '../services/firestoreService';

export const HistoryScreen = ({ navigation }: any) => {
  const { transactions } = useExpenseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, { title: string, date: Date, data: Transaction[], total: number }> = {};
    
    filteredTransactions.forEach(t => {
      const dateStr = t.transactionDate.toDateString();
      if (!groups[dateStr]) {
        groups[dateStr] = {
          title: formatDateHeader(t.transactionDate),
          date: t.transactionDate,
          data: [],
          total: 0
        };
      }
      groups[dateStr].data.push(t);
      groups[dateStr].total += (t.type === 'income' ? t.amount : -t.amount);
    });

    return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredTransactions]);

  const toggleGroup = (dateStr: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>မှတ်တမ်းများ</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => navigation.navigate('AddTransaction')}
          >
            <Plus color={colors.primary} size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Search color={colors.text.secondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="ရှာဖွေရန်..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Calendar color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>စုစုပေါင်း:</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(groupedTransactions.reduce((acc, g) => acc + g.total, 0))}
          </Text>
        </View>
      </View>

      {groupedTransactions.length > 0 ? (
        <FlatList
          data={groupedTransactions}
          keyExtractor={(item) => item.date.toDateString()}
          renderItem={({ item }) => (
            <View style={styles.group}>
              <GroupHeader
                title={item.title}
                totalAmount={item.total}
                isCollapsed={!!collapsedGroups[item.date.toDateString()]}
                onToggle={() => toggleGroup(item.date.toDateString())}
              />
              {!collapsedGroups[item.date.toDateString()] && (
                <View>
                  {item.data.map((t) => (
                    <ExpenseCard key={t.id} transaction={t} />
                  ))}
                </View>
              )}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyState />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  filterButton: {
    padding: 8,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
    marginRight: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
  },
  listContent: {
    padding: 16,
  },
  group: {
    marginBottom: 8,
  },
});
