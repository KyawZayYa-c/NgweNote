import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { LucideIcon, SearchX } from 'lucide-react-native';

interface EmptyStateProps {
  message?: string;
  icon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = "မှတ်တမ်းမရှိသေးပါ။", 
  icon: Icon = SearchX 
}) => {
  return (
    <View style={styles.container}>
      <Icon size={48} color={colors.text.secondary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 200,
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
    textAlign: 'center',
  },
});
