import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { styles } from './styles';

interface BatchItem {
  id: string;
  itemName: string;
  unitPrice: number;
  count: number;
  totalPrice: number;
}

interface BatchPreviewProps {
  items: BatchItem[];
  onRemove: (id: string) => void;
  themeColors: any;
  title: string;
}

export const BatchPreview: React.FC<BatchPreviewProps> = ({
  items,
  onRemove,
  themeColors,
  title,
}) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.batchContainer}>
      <Text style={[styles.batchTitle, { color: themeColors.text.secondary }]}>
        {title} ({items.length})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.batchScroll}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.batchCard,
              { backgroundColor: themeColors.surface, borderColor: themeColors.border },
            ]}
            onPress={() => onRemove(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.batchCardHeader}>
              <Text
                style={[styles.batchAmount, { color: themeColors.primary }]}
                numberOfLines={1}
              >
                {item.totalPrice.toLocaleString()}
              </Text>
              <X size={14} color={themeColors.text.secondary} />
            </View>
            <Text
              style={[styles.batchNote, { color: themeColors.text.primary }]}
              numberOfLines={1}
            >
              {item.itemName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};