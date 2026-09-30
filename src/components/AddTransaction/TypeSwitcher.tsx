import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface TypeSwitcherProps {
  type: 'expense' | 'income';
  onChange: (type: 'expense' | 'income') => void;
  disabled?: boolean;
  theme: string;
  expenseText: string;
  incomeText: string;
}

export const TypeSwitcher: React.FC<TypeSwitcherProps> = ({
  type,
  onChange,
  disabled = false,
  theme,
  expenseText,
  incomeText,
}) => {
  return (
    <View style={styles.switcherContainer}>
      <View
        style={[
          styles.switcherBackground,
          { backgroundColor: theme === 'dark' ? '#2A2D37' : '#D1D5DB' },
        ]}
      >
        <TouchableOpacity
          onPress={() => onChange('expense')}
          disabled={disabled}
          style={[styles.switchBtn, type === 'expense' && styles.activeExpense]}
        >
          <Text
            style={[
              styles.switchText,
              type === 'expense' ? { color: '#fff' } : { color: '#4B5563' },
            ]}
          >
            {expenseText}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChange('income')}
          disabled={disabled}
          style={[styles.switchBtn, type === 'income' && styles.activeIncome]}
        >
          <Text
            style={[
              styles.switchText,
              type === 'income' ? { color: '#fff' } : { color: '#4B5563' },
            ]}
          >
            {incomeText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};