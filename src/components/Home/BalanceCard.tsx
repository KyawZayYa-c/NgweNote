import React from 'react';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react-native';
import { styles } from './styles';

interface BalanceCardProps {
  balance: number;
  todayIncome: number;
  todayExpense: number;
  balanceLabel: string;
  themeColors: any;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  todayIncome,
  todayExpense,
  balanceLabel,
  themeColors,
}) => {
  return (
    <BlurView
      intensity={50}
      tint="light"
      style={[styles.balanceCardWrapper, { borderColor: themeColors.glassBorder }]}
    >
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <View style={[styles.iconBg, { backgroundColor: themeColors.walletIconBg }]}>
            <Wallet color={themeColors.white} size={24} />
          </View>
          <Text style={[styles.balanceLabel, { color: themeColors.white }]}>
            {balanceLabel}
          </Text>
        </View>
        <Text style={[styles.balanceAmount, { color: themeColors.white }]}>
          {balance.toLocaleString()} <Text style={styles.currencyText}>Ks</Text>
        </Text>

        <View style={[styles.statsRow, { borderTopColor: themeColors.statsRowBorder }]}>
          <View style={styles.statItem}>
            <TrendingUp color={themeColors.income} size={16} />
            <Text style={[styles.statText, { color: themeColors.white }]}>
              + {todayIncome.toLocaleString()} Ks
            </Text>
          </View>
          <View
            style={[styles.separator, { backgroundColor: themeColors.statSeparator }]}
          />
          <View style={styles.statItem}>
            <TrendingDown color={themeColors.expense} size={16} />
            <Text style={[styles.statText, { color: themeColors.white }]}>
              - {todayExpense.toLocaleString()} Ks
            </Text>
          </View>
        </View>
      </View>
    </BlurView>
  );
};