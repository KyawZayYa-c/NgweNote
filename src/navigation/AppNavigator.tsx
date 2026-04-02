import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { LoginScreen } from '../screens/LoginScreen'; 
import { useAuthStore } from '../context/useAuthStore'; 
import { colors } from '../theme/colors';
import { Wallet, History as HistoryIcon, Settings, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity style={styles.fabContainer} onPress={onPress}>
    <View style={styles.fab}>
      <Plus color={colors.white} size={28} />
    </View>
  </TouchableOpacity>
);

function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#a5a8f3',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'HomeTab') return <Wallet color={color} size={22} />;
          if (route.name === 'History') return <HistoryIcon color={color} size={22} />;
          if (route.name === 'Settings') return <Settings color={color} size={22} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: t('home') }} />
      
      {/* AddTransaction ကို Tab ထဲမှာပဲ တိုက်ရိုက်ထည့်လိုက်ပါပြီ */}
      <Tab.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen} 
        options={{ 
          tabBarLabel: '',
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          )
        }} 
      />

      <Tab.Screen name="History" component={HomeScreen} options={{ tabBarLabel: t('history') }} />
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
          /* MainTabs တစ်ခုတည်းဖြင့် Footer ကို အမြဲပြသထားမည် */
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
    bottom: 25, 
    marginHorizontal: 20,
    borderRadius: 25,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderTopWidth: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -5,
  },
  fabContainer: {
    top: -25, 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary, 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: '#fff',
  }
});