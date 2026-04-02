import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { registerRootComponent } from 'expo';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/context/useAuthStore';
import { colors } from './src/theme/colors';
import './src/i18n';

function App() {
  const { init, isLoading } = useAuthStore();

  useEffect(() => {
    init(); // app ဖွင့်တာနဲ့ AsyncStorage ကို အရင်စစ်မယ်
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <AppNavigator />;
}
export default App;
//export default registerRootComponent(App);