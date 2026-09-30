import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { styles } from './styles';

interface SecurityAlertModalProps {
  visible: boolean;
  hasPasscode: boolean;
  onClose: () => void;
  onSetNow: () => void;
  themeColors: any;
  strongText: string;
  weakText: string;
  secureDescText: string;
  unsecureDescText: string;
  gotItText: string;
  setNowText: string;
}

export const SecurityAlertModal: React.FC<SecurityAlertModalProps> = ({
  visible,
  hasPasscode,
  onClose,
  onSetNow,
  themeColors,
  strongText,
  weakText,
  secureDescText,
  unsecureDescText,
  gotItText,
  setNowText,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.alertBox, { backgroundColor: themeColors.surface }]}>
          <View
            style={[
              styles.modalIconBg,
              {
                backgroundColor: hasPasscode
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(245, 158, 11, 0.1)',
              },
            ]}
          >
            {hasPasscode ? (
              <ShieldCheck size={40} color="#22C55E" />
            ) : (
              <AlertTriangle size={40} color="#F59E0B" />
            )}
          </View>

          <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>
            {hasPasscode ? strongText : weakText}
          </Text>

          <Text style={styles.modalSubTitle}>
            {hasPasscode ? secureDescText : unsecureDescText}
          </Text>

          <TouchableOpacity
            style={[styles.alertCloseBtn, { backgroundColor: themeColors.primary }]}
            onPress={() => {
              onClose();
              if (!hasPasscode) onSetNow();
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              {hasPasscode ? gotItText : setNowText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};