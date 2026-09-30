import React from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { styles } from './styles';

interface GreetingHeaderProps {
  greeting: string;
  subGreeting: string;
  userName: string;
  translateY: Animated.Value;
  hasUnread: boolean;
  showBadge: boolean;
  onBellPress: () => void;
  themeColors: any;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  greeting,
  subGreeting,
  userName,
  translateY,
  hasUnread,
  showBadge,
  onBellPress,
  themeColors,
}) => {
  return (
    <View style={styles.topBar}>
      <View style={styles.titleArea}>
        <View style={styles.greetingContainer}>
          <Animated.View style={{ transform: [{ translateY }] }}>
            <Text style={[styles.welcomeText, { color: themeColors.white }]}>
              {greeting}
            </Text>
            <Text style={[styles.subGreeting, { color: themeColors.subGreetingText }]}>
              {subGreeting}
            </Text>
          </Animated.View>
        </View>
        <Text style={[styles.guestText, { color: themeColors.white }]}>
          {userName}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.bellBtn, { backgroundColor: themeColors.bellIconBg }]}
        onPress={onBellPress}
      >
        <Bell color={themeColors.white} size={24} />

        {showBadge && hasUnread && (
          <View style={[styles.notiBadge, { borderColor: themeColors.white }]} />
        )}
      </TouchableOpacity>
    </View>
  );
};