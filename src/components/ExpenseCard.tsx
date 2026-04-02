import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';

// Currency format အတွက် ယာယီ function (မရှိရင် error တက်မှာစိုးလို့ပါ)
const formatCurrency = (amount: number) => {
  return amount.toLocaleString() + " Ks";
};

interface ExpenseCardProps {
  transaction: any; // Transaction type error မတက်အောင် any ခဏထားပါတယ်
  onPress?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ transaction, onPress }) => {
  const isIncome = transaction.type === 'income';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: isIncome ? '#E0FBFF' : '#FFEBEB' }]}>
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
    borderRadius: 18, // ပိုလှအောင် ဝိုင်းလိုက်ပါတယ်
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    // Shadow အတွက် (Web ရော App ပါ ရအောင်)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15, // Modern design အရ လေးထောင့်ဝိုင်းလေး လုပ်ထားပါတယ်
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700', // ပိုထင်ရှားအောင်
    color: colors.text.primary,
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
  },
});