import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  transactionDate: string;
}

interface TopExpensesListProps {
  items: ExpenseItem[];
  count: number;
  title: string;
  noRecordsText: string;
  themeColors: any;
}

export const TopExpensesList: React.FC<TopExpensesListProps> = ({
  items,
  count,
  title,
  noRecordsText,
  themeColors,
}) => {
  return (
    <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
      <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
        {title}
      </Text>
      {items.length > 0 ? (
        items.map((item, idx) => (
          <View key={item.id} style={styles.listItem}>
            <View
              style={[styles.listIndex, { backgroundColor: themeColors.background }]}
            >
              <Text style={{ color: themeColors.primary, fontWeight: 'bold' }}>
                {idx + 1}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={[styles.itemTitle, { color: themeColors.text.primary }]}>
                {item.title}
              </Text>
              <Text style={styles.itemDate}>
                {new Date(item.transactionDate).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.itemAmount}>
              - {item.amount.toLocaleString()} Ks
            </Text>
          </View>
        ))
      ) : (
        <Text
          style={{
            color: themeColors.text.secondary,
            textAlign: 'center',
            padding: 20,
          }}
        >
          {noRecordsText}
        </Text>
      )}
    </View>
  );
};