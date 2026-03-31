import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { formatCurrency } from '../utils/formatCurrency';

interface GroupHeaderProps {
  title: string;
  totalAmount: number;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ 
  title, 
  totalAmount, 
  isCollapsed, 
  onToggle 
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onToggle}
    >
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.total}>{formatCurrency(totalAmount)}</Text>
      </View>
      <View style={styles.right}>
        {isCollapsed ? (
          <ChevronDown size={20} color={colors.text.secondary} />
        ) : (
          <ChevronUp size={20} color={colors.text.secondary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  total: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  right: {
    marginLeft: 12,
  },
});
