import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { HomeScreen } from '../screens/HomeScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { LoginScreen } from '../screens/LoginScreen'; 
import { useAuthStore } from '../context/useAuthStore'; 
import { useThemeStore } from '../context/useThemeStore';
import { Wallet, History as HistoryIcon, Settings, History, ShoppingCart, X, Plus, PieChart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { HistoryScreen } from '../screens/HistoryScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AddToBuyScreen } from '../screens/AddToBuyScreen'; // ဒီကောင်လေး အသစ်ထည့်ရမယ်

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
/* 
const CustomTabBarButton = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation<any>();
  const { getColors } = useThemeStore();
  const themeColors = getColors();
  const { t } = useTranslation();
  const gradientColors = themeColors.primaryGradient || ['#6A5AE0', '#00D1FF'];

  const handlePress = (target: string) => {
    setVisible(false);
    navigation.navigate(target);
  };

  return (
    <View style={styles.fabContainer}>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={[styles.menuRow, { backgroundColor: themeColors.surface }]}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handlePress('AddTransaction')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                <History color="#2E7D32" size={24} />
              </View>
              <Text style={[styles.menuText, { color: themeColors.text.primary }]}>{t('History') || 'မှတ်တမ်း'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handlePress('AddToBuy')} // Register လုပ်ထားတဲ့ နာမည်အတိုင်း ဖြစ်ရမယ်
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                <ShoppingCart color="#1976D2" size={24} />
              </View>
              <Text style={[styles.menuText, { color: themeColors.text.primary }]}>{t('ToBuy') || 'ဝယ်ယူရန်'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <TouchableOpacity activeOpacity={0.8} onPress={() => setVisible(true)}>
        <LinearGradient colors={gradientColors} style={[styles.fab, { borderColor: themeColors.background }]}>
          {visible ? <X color="#FFFFFF" size={28} /> : <Plus color="#FFFFFF" size={32} strokeWidth={2.5} />}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
*/

const CustomTabBarButton = () => {
  const navigation = useNavigation<any>();
  const { getColors } = useThemeStore();
  const themeColors = getColors();
  const gradientColors = themeColors.primaryGradient || ['#6A5AE0', '#00D1FF'];

  return (
    <View style={styles.fabContainer}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => navigation.navigate('AddTransaction')} // တိုက်ရိုက်သွားရန်
      >
        <LinearGradient colors={gradientColors} style={[styles.fab, { borderColor: themeColors.background }]}>
          <Plus color="#FFFFFF" size={32} strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

/*
function TabNavigator() {
  const { t } = useTranslation();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.text.secondary,
        tabBarStyle: [styles.tabBar, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : themeColors.surface }],
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
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ tabBarLabel: t('analytics') }} />
      <Tab.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen} 
        options={{ tabBarLabel: '', tabBarButton: (props) => <CustomTabBarButton {...props} /> }} 
      />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: t('history') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('settings') }} />
    </Tab.Navigator>
  );
}
*/
function TabNavigator() {
  const { t } = useTranslation();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.text.secondary,
        tabBarStyle: [styles.tabBar, { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : themeColors.surface }],
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
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ tabBarLabel: t('analytics') }} />
      
      {/* အလယ်ခလုတ် - နာမည်ကို Tab ထဲမှာ ပေါ်မနေအောင် အလွတ်ထားထားပါတယ် */}
      <Tab.Screen 
        name="AddTransactionTab" 
        component={AddTransactionScreen} 
        options={{ 
          tabBarLabel: '', 
          tabBarButton: () => <CustomTabBarButton /> 
        }} 
      />

      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: t('history') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('settings') }} />
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
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            {/* AddTransaction ကို Stack ထဲမှာပါ ထည့်ထားမှ Tab ကနေ လှမ်းခေါ်ရင် Screen အပြည့်ပွင့်မှာပါ */}
            <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
            <Stack.Screen name="AddToBuy" component={AddToBuyScreen} /> 
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
/*
export const AppNavigator = () => {
  const { isGuest } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isGuest ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="AddToBuy" component={AddToBuyScreen} /> 
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
*/
const styles = StyleSheet.create({
  tabBar: { height: 70, position: 'absolute', bottom: 20, marginHorizontal: 15, borderRadius: 25, paddingBottom: Platform.OS === 'ios' ? 20 : 10, paddingTop: 10, borderTopWidth: 0, elevation: 10 },
  tabBarLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  fabContainer: { top: -25, justifyContent: 'center', alignItems: 'center' },
  fab: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 110 },
  menuRow: { flexDirection: 'row', padding: 20, borderRadius: 25, gap: 30, elevation: 5 },
  menuItem: { alignItems: 'center', gap: 8 },
  iconCircle: { width: 55, height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  menuText: { fontSize: 12, fontWeight: 'bold' },
});