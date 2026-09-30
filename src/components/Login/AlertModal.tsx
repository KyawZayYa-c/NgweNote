import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { styles } from './styles';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  themeColors: any;
  okText: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  onClose,
  themeColors,
  okText,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalAlertBox, { backgroundColor: themeColors.surface }]}>
          <View style={styles.alertIconContainer}>
            <AlertCircle size={44} color="#F59E0B" />
          </View>

          <Text style={[styles.modalAlertTitle, { color: themeColors.text.primary }]}>
            {title}
          </Text>
          <Text style={[styles.modalAlertMessage, { color: themeColors.text.secondary }]}>
            {message}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.modalAlertBtn, { backgroundColor: themeColors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.modalAlertBtnText}>{okText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};