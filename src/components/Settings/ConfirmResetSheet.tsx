import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { styles } from './styles';

interface ConfirmResetSheetProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  themeColors: any;
  title: string;
  desc: string;
  deleteText: string;
  cancelText: string;
}

export const ConfirmResetSheet: React.FC<ConfirmResetSheetProps> = ({
  visible,
  onConfirm,
  onCancel,
  themeColors,
  title,
  desc,
  deleteText,
  cancelText,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlayResetData}>
        <View style={[styles.bottomSheetReset, { backgroundColor: themeColors.surface }]}>
          <View style={styles.dangerIconAnim}>
            <AlertTriangle size={40} color="#FF6B6B" />
          </View>
          <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>
            {title}
          </Text>
          <Text style={styles.modalSubTitle}>{desc}</Text>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FF6B6B' }]}
            onPress={onConfirm}
          >
            <Text style={styles.actionBtnText}>{deleteText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={{ color: '#999', fontWeight: '600' }}>{cancelText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};