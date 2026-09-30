import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Languages, Moon, Sun, Wallet, Edit3, XCircle } from 'lucide-react-native';
import { styles } from './styles';

interface TopSectionProps {
  isEditMode: boolean;
  theme: string;
  language: string;
  isLoading: boolean;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onBack: () => void;
  themeColors: any;
  editNoteText: string;
  updateDescText: string;
  appDescText: string;
}

export const TopSection: React.FC<TopSectionProps> = ({
  isEditMode,
  theme,
  language,
  isLoading,
  onToggleLanguage,
  onToggleTheme,
  onBack,
  themeColors,
  editNoteText,
  updateDescText,
  appDescText,
}) => {
  return (
    <LinearGradient
      colors={theme === 'light' ? ['#5e3fbb', '#e711ee'] : ['#25519a', '#162038']}
      style={styles.topSection}
    >
      {!isEditMode && (
        <>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={onToggleLanguage}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Languages color="#fff" size={18} />
            <Text style={styles.langText}>
              {language === 'en' ? 'မြန်မာ' : 'English'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.themeBtn}
            onPress={onToggleTheme}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            {theme === 'light' ? (
              <Moon color="#fff" size={20} />
            ) : (
              <Sun color="#fff" size={20} />
            )}
          </TouchableOpacity>
        </>
      )}

      {isEditMode && (
        <TouchableOpacity style={styles.themeBtn} onPress={onBack} activeOpacity={0.7}>
          <XCircle color="#fff" size={24} />
        </TouchableOpacity>
      )}

      <View style={styles.logoRow}>
        <View
          style={[
            styles.logoIcon,
            theme === 'dark' && {
              backgroundColor: '#1E293B',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
            },
          ]}
        >
          {isEditMode ? (
            <Edit3 color={themeColors.primary} size={35} />
          ) : (
            <Wallet color={themeColors.primary} size={35} />
          )}
        </View>

        <View style={styles.titleContainer}>
          <View style={styles.logoTextRow}>
            <Text style={styles.appTitle}>{isEditMode ? editNoteText : 'Ngwe'}</Text>
            {!isEditMode && (
              <Text
                style={[
                  styles.appTitleNote,
                  { color: theme === 'light' ? '#688bac' : '#00D1FF' },
                ]}
              >
                Note
              </Text>
            )}
          </View>
          <Text style={styles.appDesc}>
            {isEditMode ? updateDescText : appDescText}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};