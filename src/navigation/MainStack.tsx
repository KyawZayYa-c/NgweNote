import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, History, Settings } from 'lucide-react-native';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'ပင်မ', tabBarIcon: ({color, size}) => <Home color={color} size={size}/> }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'မှတ်တမ်း', tabBarIcon: ({color, size}) => <History color={color} size={size}/> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'ဆက်တင်', tabBarIcon: ({color, size}) => <Settings color={color} size={size}/> }} />
    </Tab.Navigator>
  );
}

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}