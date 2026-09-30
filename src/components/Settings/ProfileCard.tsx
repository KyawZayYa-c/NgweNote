import React from 'react';
import { View, Text } from 'react-native';
import { User, CheckCircle2 } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from './styles';

interface ProfileCardProps {
  isGuest: boolean;
  user: any;
  themeColors: any;
  guestUserText: string;
  cloudSyncedText: string;
  notSyncedText: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  isGuest,
  user,
  themeColors,
  guestUserText,
  cloudSyncedText,
  notSyncedText,
}) => {
  return (
    <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
      <View style={styles.profileInfo}>
        <View
          style={[
            styles.avatarContainer,
            {
              borderColor: themeColors.primary,
              backgroundColor: isGuest ? 'rgba(150, 150, 150, 0.1)' : '#fff',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          {isGuest ? (
            <User size={35} color={themeColors.primary} />
          ) : (
            <AntDesign name="google" size={32} color="#EA4335" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.userName, { color: themeColors.text.primary }]}
            numberOfLines={1}
          >
            {isGuest ? guestUserText : user?.displayName}
          </Text>
          {!isGuest && (
            <Text style={{ color: themeColors.text.secondary, fontSize: 13 }}>
              {user?.email}
            </Text>
          )}
          <View style={styles.syncStatus}>
            <CheckCircle2 size={12} color="#22C55E" />
            <Text style={[styles.syncText, { color: '#22C55E' }]}>
              {' '}
              {isGuest ? notSyncedText : cloudSyncedText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};