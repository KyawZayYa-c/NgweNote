import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  activeFilter: string;
  onSelect: (id: string) => void;
  theme: string;
  themeColors: any;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  activeFilter,
  onSelect,
  theme,
  themeColors,
}) => {
  return (
    <View style={styles.filterSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((opt) => {
          const isActive = activeFilter === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => onSelect(opt.id)}
              style={styles.chipWrapper}
            >
              {isActive ? (
                <LinearGradient
                  colors={themeColors.primaryBtn || ['#6A5AE0', '#00D1FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.chipGradient}
                >
                  <Text style={[styles.chipText, { color: '#fff' }]}>{opt.label}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.chipNormal, { backgroundColor: themeColors.surface }]}>
                  <Text
                    style={[
                      styles.chipText,
                      { color: theme === 'dark' ? '#94A3B8' : '#666' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};