import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { styles } from './styles';

interface KPICardsProps {
  income: number;
  expense: number;
  theme: string;
  themeColors: any;
  incomeLabel: string;
  expenseLabel: string;
}

export const KPICards: React.FC<KPICardsProps> = ({
  income,
  expense,
  theme,
  themeColors,
  incomeLabel,
  expenseLabel,
}) => {
  return (
    <View style={styles.kpiRow}>
      <View
        style={[
          styles.kpiCard,
          {
            backgroundColor:
              theme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : '#E8F5E9',
          },
        ]}
      >
        <TrendingUp color="#22C55E" size={20} />
        <Text style={[styles.kpiLabel, { color: themeColors.text.secondary }]}>
          {incomeLabel}
        </Text>
        <Text style={[styles.kpiValue, { color: '#22C55E' }]}>
          {income.toLocaleString()} Ks
        </Text>
      </View>
      <View
        style={[
          styles.kpiCard,
          {
            backgroundColor:
              theme === 'dark' ? 'rgba(255, 107, 107, 0.15)' : '#FFEBEE',
          },
        ]}
      >
        <TrendingDown color="#FF6B6B" size={20} />
        <Text style={[styles.kpiLabel, { color: themeColors.text.secondary }]}>
          {expenseLabel}
        </Text>
        <Text style={[styles.kpiValue, { color: '#FF6B6B' }]}>
          {expense.toLocaleString()} Ks
        </Text>
      </View>
    </View>
  );
};