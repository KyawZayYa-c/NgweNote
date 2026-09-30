import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Lock } from 'lucide-react-native';
import { styles } from './styles';

interface PasscodeModalProps {
  visible: boolean;
  passcode: string;
  onChangePasscode: (text: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  cancelText: string;
  confirmText: string;
  themeColors: any;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  visible,
  passcode,
  onChangePasscode,
  onCancel,
  onConfirm,
  title,
  cancelText,
  confirmText,
  themeColors,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
          <Lock size={30} color="#4A6CF7" style={{ marginBottom: 10 }} />
          <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>
            {title}
          </Text>
          <TextInput
            style={[styles.passInput, { color: themeColors.text.primary }]}
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
            value={passcode}
            onChangeText={onChangePasscode}
            autoFocus
          />
          <View style={styles.modalBtns}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={{ color: '#999', fontSize: 16 }}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm}>
              <Text style={{ color: '#4A6CF7', fontWeight: 'bold', fontSize: 16 }}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};