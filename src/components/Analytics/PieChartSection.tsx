import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { styles } from './styles';

const screenWidth = Dimensions.get('window').width;

interface PieChartSectionProps {
  income: number;
  expense: number;
  label?: string;
  title: string;
  incomeText: string;
  expenseText: string;
  themeColors: any;
}

export const PieChartSection: React.FC<PieChartSectionProps> = ({
  income,
  expense,
  label,
  title,
  incomeText,
  expenseText,
  themeColors,
}) => {
  return (
    <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
      <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
        {title} ({label})
      </Text>
      <PieChart
        data={[
          {
            name: incomeText,
            population: income || 0.1,
            color: '#22C55E',
            legendFontColor: themeColors.text.primary,
            legendFontSize: 12,
          },
          {
            name: expenseText,
            population: expense || 0.1,
            color: '#FF6B6B',
            legendFontColor: themeColors.text.primary,
            legendFontSize: 12,
          },
        ]}
        width={screenWidth - 80}
        height={180}
        chartConfig={{ color: (op = 1) => themeColors.primary }}
        accessor={'population'}
        backgroundColor={'transparent'}
        paddingLeft={'15'}
        absolute
      />
    </View>
  );
};