import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { styles } from './styles';

interface MonthSummaryCardProps {
  monthTitle: string;
  income: number;
  expense: number;
  incomeLabel: string;
  expenseLabel: string;
  theme: string;
  themeColors: any;
}

export const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({
  monthTitle,
  income,
  expense,
  incomeLabel,
  expenseLabel,
  theme,
  themeColors,
}) => {
  return (
    <View style={[styles.combinedSummaryCard, { backgroundColor: themeColors.surface }]}>
      <Text style={[styles.cardMonthTitle, { color: themeColors.text.primary }]}>
        {monthTitle}
      </Text>

      <View style={styles.cardDividerLine} />

      <View style={styles.cardSummaryRow}>
        <View style={styles.summaryBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <TrendingUp size={15} color="#22C55E" />
            <Text style={[styles.summaryLabel, { color: themeColors.text.secondary }]}>
              {incomeLabel}
            </Text>
          </View>
          <Text style={[styles.summaryValue, { color: '#22C55E' }]}>
            +{income.toLocaleString()} Ks
          </Text>
        </View>

        <View
          style={[
            styles.verticalDivider,
            {
              backgroundColor:
                theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
          ]}
        />

        <View style={styles.summaryBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <TrendingDown size={15} color="#FF6B6B" />
            <Text style={[styles.summaryLabel, { color: themeColors.text.secondary }]}>
              {expenseLabel}
            </Text>
          </View>
          <Text style={[styles.summaryValue, { color: '#FF6B6B' }]}>
            -{expense.toLocaleString()} Ks
          </Text>
        </View>
      </View>
    </View>
  );
};