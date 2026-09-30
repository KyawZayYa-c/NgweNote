import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface Filter {
  id: string;
  label: string;
  sortKey: number;
  type: string;
}

interface FilterTabsProps {
  filters: Filter[];
  activeFilter: string;
  onSelect: (id: string) => void;
  theme: string;
  themeColors: any;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  filters,
  activeFilter,
  onSelect,
  theme,
  themeColors,
}) => {
  return (
    <View style={[styles.filterCard, { backgroundColor: themeColors.surface }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => onSelect(f.id)}
            style={[
              styles.filterBtn,
              { backgroundColor: theme === 'dark' ? '#2A2D37' : '#E5E7EB' },
              activeFilter === f.id && [
                styles.activeFilterBtn,
                { backgroundColor: themeColors.primary },
              ],
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === f.id ? '#fff' : themeColors.text.primary },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};