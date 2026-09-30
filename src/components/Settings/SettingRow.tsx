import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useThemeStore } from '../../context/useThemeStore';
import { styles } from './styles';

interface SettingRowProps {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  isDanger?: boolean;
}

export const SettingRow: React.FC<SettingRowProps> = ({
  icon: Icon,
  label,
  value,
  onPress,
  isToggle,
  toggleValue,
  onToggleChange,
  isDanger,
}) => {
  const { getColors } = useThemeStore();
  const themeColors = getColors();

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: 'rgba(150, 150, 150, 0.1)' }]}
      onPress={onPress}
      disabled={isToggle}
    >
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDanger
                ? 'rgba(255, 107, 107, 0.1)'
                : 'rgba(150, 150, 150, 0.1)',
            },
          ]}
        >
          <Icon size={20} color={isDanger ? '#FF6B6B' : themeColors.primary} />
        </View>
        <Text
          style={[
            styles.rowLabel,
            { color: isDanger ? '#FF6B6B' : themeColors.text.primary },
          ]}
        >
          {label}
        </Text>
      </View>

      <View style={styles.rowRight}>
        {isToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggleChange}
            trackColor={{ false: '#767577', true: themeColors.primary }}
            thumbColor="#fff"
          />
        ) : (
          <View style={styles.valueRow}>
            {value && (
              <Text style={[styles.rowValue, { color: themeColors.text.secondary }]}>
                {value}
              </Text>
            )}
            <ChevronRight size={18} color="#999" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};