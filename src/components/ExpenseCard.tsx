import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatCurrency';
import { Transaction } from '../services/firestoreService';
import { LucideIcon, ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';

interface ExpenseCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ transaction, onPress }) => {
  const isIncome = transaction.type === 'income';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: isIncome ? '#dcfce7' : '#fee2e2' }]}>
        {isIncome ? (
          <ArrowUpCircle size={24} color={colors.income} />
        ) : (
          <ArrowDownCircle size={24} color={colors.expense} />
        )}
      </View>
      <View style={styles.details}>
        <Text style={styles.title}>{transaction.title}</Text>
        <Text style={styles.category}>{transaction.category}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
