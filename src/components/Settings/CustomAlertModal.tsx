import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { styles } from './styles';

const { width } = Dimensions.get('window');

interface CustomAlertModalProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  themeColors: any;
  gotItText: string;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  message,
  type,
  onClose,
  themeColors,
  gotItText,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View
          style={[styles.alertBox, { backgroundColor: themeColors.surface, width: width * 0.8 }]}
        >
          <View
            style={[
              styles.modalIconBg,
              {
                backgroundColor:
                  type === 'success'
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(255, 107, 107, 0.1)',
                marginBottom: 15,
              },
            ]}
          >
            {type === 'success' ? (
              <CheckCircle2 size={35} color="#22C55E" />
            ) : (
              <ShieldAlert size={35} color="#FF6B6B" />
            )}
          </View>

          <Text
            style={[
              styles.modalMainTitle,
              { color: themeColors.text.primary, fontSize: 19 },
            ]}
          >
            {type === 'success' ? 'Success' : 'Security Alert'}
          </Text>

          <Text style={[styles.modalSubTitle, { marginBottom: 25, fontSize: 15 }]}>
            {message}
          </Text>

          <TouchableOpacity
            style={[
              styles.alertCloseBtn,
              {
                backgroundColor: type === 'success' ? themeColors.primary : '#FF6B6B',
                borderRadius: 15,
                width: '100%',
              },
            ]}
            onPress={onClose}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {gotItText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};