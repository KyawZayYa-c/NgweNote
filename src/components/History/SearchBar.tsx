import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { styles } from './styles';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  theme: string;
  themeColors: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder,
  theme,
  themeColors,
}) => {
  return (
    <View style={[styles.searchContainer, { backgroundColor: themeColors.surface }]}>
      <Search size={18} color="#999" />
      <TextInput
        style={[styles.searchInput, { color: themeColors.text.primary }]}
        placeholder={placeholder}
        placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};