import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { HomeScreen } from '../screens/HomeScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { LoginScreen } from '../screens/LoginScreen'; 
import { useAuthStore } from '../context/useAuthStore'; 
import { useThemeStore } from '../context/useThemeStore'; // Theme Store ကို ခေါ်သုံးမယ်
import { fontSize } from '../theme/fontSize';
import { Wallet, History as HistoryIcon, Settings, Plus, PieChart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { HistoryScreen } from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Plus Button Component
const CustomTabBarButton = ({ children, onPress }: any) => {
  const { getColors } = useThemeStore();
  const themeColors = getColors();

  // gradientColors ကို fallback (||) ခံထားရင် ဘယ်တော့မှ crash မဖြစ်တော့ပါဘူး
  const gradientColors = themeColors.primaryGradient || ['#6A5AE0', '#00D1FF'];

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      style={styles.fabContainer} 
      onPress={onPress}
    >
      <LinearGradient
        colors={gradientColors}
        style={[styles.fab, { borderColor: themeColors.background }]}
      >
        <Plus color="#FFFFFF" size={32} strokeWidth={2.5} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

function TabNavigator() {
  const { t } = useTranslation();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.text.secondary,
        tabBarStyle: [
          styles.tabBar, 
          { 
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : themeColors.surface,
            shadowColor: themeColors.primary 
          }
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, focused }) => {
          const size = focused ? 24 : 22;
          if (route.name === 'HomeTab') return <Wallet color={color} size={size} />;
          if (route.name === 'Analytics') return <PieChart color={color} size={size} />;
          if (route.name === 'History') return <HistoryIcon color={color} size={size} />;
          if (route.name === 'Settings') return <Settings color={color} size={size} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: t('home') }} />
      <Tab.Screen name="Analytics" component={HomeScreen} options={{ tabBarLabel: t('analytics') }} />
      
      <Tab.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen} 
        options={{ 
          tabBarLabel: '',
          tabBarButton: (props) => <CustomTabBarButton {...props} />
        }} 
      />

      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: t('history') }} />
      <Tab.Screen name="Settings" component={HomeScreen} options={{ tabBarLabel: t('settings') }} />
    </Tab.Navigator>
  );
}

export const AppNavigator = () => {
  const { isGuest } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isGuest ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 70, 
    position: 'absolute',
    bottom: 20, 
    marginHorizontal: 15,
    borderRadius: 25,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    borderTopWidth: 0,
    elevation: 10,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  fabContainer: {
    top: -25, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 4,
  }
});