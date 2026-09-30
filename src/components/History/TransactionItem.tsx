import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Tag } from 'lucide-react-native';
import { styles } from './styles';

interface TransactionItemProps {
  data: any;
  onLongPress: (item: any) => void;
  themeColors: any;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  data,
  onLongPress,
  themeColors,
}) => {
  return (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: themeColors.surface }]}
      onLongPress={() => onLongPress(data)}
    >
      <View style={styles.itemMain}>
        <Text style={[styles.itemLabel, { color: themeColors.text.primary }]}>
          {data.title}
        </Text>
        <View style={styles.itemSub}>
          <Tag size={10} color="#999" />
          <Text style={styles.itemCat}>{data.category}</Text>
        </View>
      </View>
      <View style={styles.itemEnd}>
        <Text
          style={[
            styles.itemAmount,
            { color: data.type === 'income' ? '#22C55E' : '#FF6B6B' },
          ]}
        >
          {data.type === 'income' ? '+' : '-'} {data.amount.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};