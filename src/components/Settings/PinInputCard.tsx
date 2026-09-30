import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Lock, Trash2 } from 'lucide-react-native';
import { styles } from './styles';

interface PinInputCardProps {
  visible: boolean;
  currentStep: string;
  tempPin: string;
  onChangePin: (text: string) => void;
  onCancel: () => void;
  onBack: () => void;
  onConfirm: () => void;
  themeColors: any;
  labels: {
    enterCurrentPin: string;
    createPassword: string;
    confirmPin: string;
    removePasswordTitle: string;
    successTitle: string;
    removePasswordDesc: string;
    enterPinHint: string;
    back: string;
    cancel: string;
    continue: string;
    save: string;
    create: string;
    confirm: string;
    remove: string;
    done: string;
  };
  passMode: string;
}

export const PinInputCard: React.FC<PinInputCardProps> = ({
  visible,
  currentStep,
  tempPin,
  onChangePin,
  onCancel,
  onBack,
  onConfirm,
  themeColors,
  labels,
  passMode,
}) => {
  const getTitle = () => {
    switch (currentStep) {
      case 'enter_old':
        return labels.enterCurrentPin;
      case 'set_new':
        return labels.createPassword;
      case 'confirm_new':
        return labels.confirmPin;
      case 'confirm_remove':
        return labels.removePasswordTitle;
      case 'success':
        return labels.successTitle;
      default:
        return '';
    }
  };

  const getActionLabel = () => {
    switch (currentStep) {
      case 'enter_old':
        return labels.continue;
      case 'set_new':
        return passMode === 'change' ? labels.save : labels.create;
      case 'confirm_new':
        return labels.confirm;
      case 'confirm_remove':
        return labels.remove;
      case 'success':
        return labels.done;
      default:
        return '';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlayCenter}>
        <KeyboardAvoidingView behavior="padding" style={styles.centerCardWrapper}>
          <View style={[styles.pinCard, { backgroundColor: themeColors.surface }]}>
            <View
              style={[
                styles.cardIconBg,
                {
                  backgroundColor:
                    currentStep === 'confirm_remove'
                      ? 'rgba(255, 107, 107, 0.1)'
                      : 'rgba(108, 92, 231, 0.1)',
                },
              ]}
            >
              {currentStep === 'confirm_remove' ? (
                <Trash2 size={30} color="#FF6B6B" />
              ) : (
                <Lock size={30} color={themeColors.primary} />
              )}
            </View>

            <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>
              {getTitle()}
            </Text>

            <Text style={styles.cardSubTitle}>
              {currentStep === 'confirm_remove'
                ? labels.removePasswordDesc
                : labels.enterPinHint}
            </Text>

            {currentStep !== 'confirm_remove' && currentStep !== 'success' && (
              <TextInput
                style={[
                  styles.passInput,
                  {
                    color: themeColors.text.primary,
                    borderBottomColor: themeColors.primary,
                  },
                ]}
                maxLength={4}
                keyboardType="number-pad"
                secureTextEntry
                autoFocus
                value={tempPin}
                onChangeText={onChangePin}
              />
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cardSecondaryBtn}
                onPress={currentStep === 'confirm_new' ? onBack : onCancel}
              >
                <Text style={{ color: '#666', fontWeight: '600' }}>
                  {currentStep === 'confirm_new' ? labels.back : labels.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cardPrimaryBtn,
                  {
                    backgroundColor:
                      currentStep === 'confirm_remove' ? '#FF6B6B' : themeColors.primary,
                  },
                ]}
                onPress={onConfirm}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {getActionLabel()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};