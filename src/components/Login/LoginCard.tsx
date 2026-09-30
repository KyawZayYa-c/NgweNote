import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { User, Edit3 } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoginCardProps {
  isEditMode: boolean;
  theme: string;
  isGuestLoading: boolean;
  isGoogleLoading: boolean;
  onGuestPress: () => void;
  onGooglePress: () => void;
  themeColors: any;
  cardTitle: string;
  guestText: string;
  editBtnText: string;
  orText: string;
  googleText: string;
  connectingText: string;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  isEditMode,
  theme,
  isGuestLoading,
  isGoogleLoading,
  onGuestPress,
  onGooglePress,
  themeColors,
  cardTitle,
  guestText,
  editBtnText,
  orText,
  googleText,
  connectingText,
}) => {
  const isDisabled = isGoogleLoading || isGuestLoading;

  return (
    <View style={styles.cardContainer}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surface,
            shadowColor: theme === 'dark' ? '#00D1FF' : '#000',
            shadowOpacity: theme === 'dark' ? 0.25 : 0.12,
            elevation: theme === 'dark' ? 20 : 12,
            borderColor:
              theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#E0E0E0',
            borderWidth: theme === 'dark' ? 1.5 : 0,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: themeColors.text.primary }]}>
          {cardTitle}
        </Text>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: isEditMode
                ? themeColors.primary
                : theme === 'dark'
                ? '#24334d'
                : '#F0EEFF',
            },
            theme === 'dark' && {
              borderWidth: 1,
              borderColor: 'rgba(0, 209, 255, 0.3)',
            },
            isDisabled && { opacity: 0.6 },
          ]}
          onPress={onGuestPress}
          activeOpacity={0.8}
          disabled={isDisabled}
        >
          {isGuestLoading ? (
            <ActivityIndicator
              color={theme === 'dark' ? '#00D1FF' : '#5e3fbb'}
              size="small"
            />
          ) : (
            <>
              {isEditMode ? (
                <Edit3 color="#fff" size={22} />
              ) : (
                <User
                  color={theme === 'dark' ? '#00D1FF' : '#5e3fbb'}
                  size={22}
                />
              )}
              <Text
                style={[
                  styles.btnText,
                  {
                    color: isEditMode
                      ? '#fff'
                      : theme === 'dark'
                      ? '#00D1FF'
                      : '#1A1D1F',
                  },
                ]}
              >
                {isEditMode ? editBtnText : guestText}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {!isEditMode && (
          <>
            <View style={styles.dividerRow}>
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor:
                      theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E0E0E0',
                  },
                ]}
              />
              <Text style={[styles.orText, { color: themeColors.text.secondary }]}>
                {orText}
              </Text>
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor:
                      theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E0E0E0',
                  },
                ]}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.googleBtn,
                theme === 'dark' && {
                  backgroundColor: '#1E293B',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderWidth: 1.5,
                },
                isDisabled && { opacity: 0.6 },
              ]}
              onPress={onGooglePress}
              activeOpacity={0.8}
              disabled={isDisabled}
            >
              {isGoogleLoading ? (
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
                >
                  <ActivityIndicator
                    color={theme === 'dark' ? '#00D1FF' : '#5e3fbb'}
                    size="small"
                  />
                  <Text
                    style={[
                      styles.btnText,
                      { color: theme === 'dark' ? '#F8FAFC' : '#1A1D1F' },
                    ]}
                  >
                    {connectingText}
                  </Text>
                </View>
              ) : (
                <>
                  <AntDesign name="google" size={22} color="#EA4335" />
                  <Text
                    style={[
                      styles.btnText,
                      { color: theme === 'dark' ? '#F8FAFC' : '#1A1D1F' },
                    ]}
                  >
                    {googleText}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};