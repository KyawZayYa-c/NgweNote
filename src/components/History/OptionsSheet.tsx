import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { styles } from './styles';

interface OptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  title: string;
  editText: string;
  deleteText: string;
  themeColors: any;
}

export const OptionsSheet: React.FC<OptionsSheetProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
  title,
  editText,
  deleteText,
  themeColors,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.sheetContent, { backgroundColor: themeColors.surface }]}>
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetTitle, { color: themeColors.text.primary }]}>
            {title}
          </Text>
          <TouchableOpacity style={styles.sheetBtn} onPress={onEdit}>
            <Text style={{ color: '#4A6CF7', fontSize: 16, fontWeight: 'bold' }}>
              {editText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sheetBtn, { borderTopWidth: 0.5, borderTopColor: '#EEE' }]}
            onPress={onDelete}
          >
            <Text style={{ color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' }}>
              {deleteText}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};