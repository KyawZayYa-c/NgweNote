import React from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Bell, X } from 'lucide-react-native';
import { styles } from './styles';

interface NotificationBannerProps {
  message: string | null;
  fadeAnim: Animated.Value;
  progressAnim: Animated.Value;
  onPause: () => void;
  onResume: () => void;
  onHide: () => void;
  themeColors: any;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  fadeAnim,
  progressAnim,
  onPause,
  onResume,
  onHide,
  themeColors,
}) => {
  if (!message) return null;

  return (
    <Animated.View
      style={[styles.incomingNotiBox, { opacity: fadeAnim }]}
      onStartShouldSetResponder={() => {
        onPause();
        return true;
      }}
      onResponderRelease={onResume}
    >
      <BlurView
        intensity={95}
        tint="dark"
        style={[styles.notiBlur, { borderColor: themeColors.glassBorder }]}
      >
        <View style={styles.notiInnerRow}>
          <View style={styles.notiIconCircle}>
            <Bell size={14} color={themeColors.white} />
          </View>
          <Text style={[styles.incomingNotiText, { color: themeColors.white }]}>
            {message}
          </Text>
          <TouchableOpacity onPress={onHide} style={styles.notiCloseBtn}>
            <X size={16} color={themeColors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: themeColors.notiProgress,
                shadowColor: themeColors.notiProgress,
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </BlurView>
    </Animated.View>
  );
};