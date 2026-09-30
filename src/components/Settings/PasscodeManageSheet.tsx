import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { RefreshCw, Trash2, CheckCircle2 } from 'lucide-react-native';
import { styles } from './styles';

interface PasscodeManageSheetProps {
  visible: boolean;
  currentStep: string;
  onClose: () => void;
  onChangePin: () => void;
  onRemovePin: () => void;
  onConfirmRemove: () => void;
  onDone: () => void;
  themeColors: any;
  labels: {
    passwordSecurity: string;
    changePin: string;
    removePassword: string;
    removePasswordTitle: string;
    removePasswordDesc: string;
    remove: string;
    successTitle: string;
    done: string;
  };
}

export const PasscodeManageSheet: React.FC<PasscodeManageSheetProps> = ({
  visible,
  currentStep,
  onClose,
  onChangePin,
  onRemovePin,
  onConfirmRemove,
  onDone,
  themeColors,
  labels,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlayBottom}>
          <TouchableWithoutFeedback>
            <View style={[styles.bottomSheet, { backgroundColor: themeColors.surface }]}>
              <View style={styles.sheetHandle} />

              {currentStep === 'manage_options' && (
                <View style={{ width: '100%' }}>
                  <Text
                    style={[styles.modalMainTitle, { color: themeColors.text.primary }]}
                  >
                    {labels.passwordSecurity}
                  </Text>
                  <TouchableOpacity style={styles.menuOption} onPress={onChangePin}>
                    <RefreshCw size={20} color={themeColors.primary} />
                    <Text style={[styles.menuText, { color: themeColors.text.primary }]}>
                      {labels.changePin}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuOption} onPress={onRemovePin}>
                    <Trash2 size={20} color="#FF6B6B" />
                    <Text style={[styles.menuText, { color: '#FF6B6B' }]}>
                      {labels.removePassword}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {currentStep === 'confirm_remove' && (
                <View style={{ alignItems: 'center' }}>
                  <View style={styles.dangerIconBg}>
                    <Trash2 size={40} color="#FF6B6B" />
                  </View>
                  <Text
                    style={[styles.modalMainTitle, { color: themeColors.text.primary }]}
                  >
                    {labels.removePasswordTitle}
                  </Text>
                  <Text style={styles.modalSubTitle}>
                    {labels.removePasswordDesc}
                  </Text>
                  <TouchableOpacity style={styles.removeBtn} onPress={onConfirmRemove}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                      {labels.remove}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {currentStep === 'success' && (
                <View style={{ alignItems: 'center' }}>
                  <CheckCircle2 size={60} color="#22C55E" />
                  <Text
                    style={[
                      styles.modalMainTitle,
                      { color: themeColors.text.primary, marginTop: 20 },
                    ]}
                  >
                    {labels.successTitle}
                  </Text>
                  <TouchableOpacity
                    style={[styles.alertCloseBtn, { backgroundColor: themeColors.primary }]}
                    onPress={onDone}
                  >
                    <Text style={{ color: '#fff' }}>{labels.done}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};