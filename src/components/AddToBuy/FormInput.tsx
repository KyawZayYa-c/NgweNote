import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from './styles';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric';
  themeColors: any;
  inputStyle?: any;
  containerStyle?: any;
  textAlign?: 'left' | 'center' | 'right';
  sanitize?: (text: string) => string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = 'default',
  themeColors,
  inputStyle,
  containerStyle,
  textAlign = 'left',
  sanitize,
}) => {
  const handleChange = (text: string) => {
    onChangeText(sanitize ? sanitize(text) : text);
  };

  return (
    <View style={containerStyle}>
      <Text style={[styles.label, { color: themeColors.text.secondary }]}>{label}</Text>
      <View
        style={[
          styles.inputBox,
          { backgroundColor: themeColors.surface, borderColor: themeColors.border },
        ]}
      >
        {icon}
        <TextInput
          style={[
            styles.mainInput,
            { color: themeColors.text.primary, textAlign },
            inputStyle,
          ]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={themeColors.text.secondary}
          keyboardType={keyboardType}
          onChangeText={handleChange}
        />
      </View>
    </View>
  );
};