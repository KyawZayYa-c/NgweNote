import React, { useEffect, useRef, useState } from 'react';
import { View, StatusBar, Animated } from 'react-native';
import { db } from '../services/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import { useExpenseStore } from '../context/useExpenseStore';
import { useTranslation } from 'react-i18next';
import { ShoppingSection } from '../components/ShoppingSection';
import * as Notifications from 'expo-notifications';
import {
  GreetingHeader,
  NotificationBanner,
  BalanceCard,
  styles,
} from '../components/Home';

const APP_START_TIME = new Date().toISOString();

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { getColors } = useThemeStore();
  const themeColors = getColors();
  const { t } = useTranslation();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const {
    transactions,
    fetchTransactions,
    adminNoti,
    notiTitle,
    setAdminNoti,
    setAdminTitle,
    fetchToBuyItems,
    toBuyItems,
  } = useExpenseStore();

  const [greeting, setGreeting] = useState('');
  const translateY = useRef(new Animated.Value(0)).current;
  const [currentSlide, setCurrentSlide] = useState(0);

  const [incomingNoti, setIncomingNoti] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleBuyAction = (item: any) => {
    if (!item.isBought) return;

    navigation.navigate('AddTransaction', {
      editData: {
        title: item.itemName,
        amount: (item.unitPrice * item.count).toString(),
        type: 'expense',
        category: item.category || 'Shopping',
        shoppingItemId: item.id,
      },
    });
  };

  useEffect(() => {
    fetchToBuyItems();
    fetchTransactions();
    updateGreeting();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = db
      .collection('notifications')
      .doc('global_announcement')
      .onSnapshot(async (doc) => {
        if (doc.exists) {
          const data = doc.data();

          if (data && data.createdAt > APP_START_TIME) {
            setAdminNoti(data.message);
            setAdminTitle(data.title || 'Admin Announcement 🔔');
            setHasUnread(true);

            await Notifications.scheduleNotificationAsync({
              content: {
                title: data.title || 'Admin Announcement 🔔',
                body: data.message || '',
              },
              trigger: null,
            });
            showNotification(
              `${data.title || 'Admin Announcement 🔔'}: ${data.message}`
            );
          }
        }
      });

    return () => unsubscribe();
  }, [user]);

  const showNotification = (message: string) => {
    setIncomingNoti(message);
    setHasUnread(true);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) hideNotification();
    });
  };

  const pauseNotification = () => {
    progressAnim.stopAnimation();
  };

  const resumeNotification = () => {
    const currentVal = (progressAnim as any)._value;
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3500 * (1 - currentVal / 100),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) hideNotification();
    });
  };

  const hideNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setIncomingNoti(null);
    });
  };

  useEffect(() => {
    if (adminNoti) {
      showNotification(`Admin: ${adminNoti}`);
    }
  }, [adminNoti]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = currentSlide === 0 ? 1 : 0;
      Animated.timing(translateY, {
        toValue: nextSlide === 0 ? 0 : -25,
        duration: 500,
        useNativeDriver: true,
      }).start();
      setCurrentSlide(nextSlide);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning ☀️');
    else if (hour < 17) setGreeting('Good Afternoon 🌤️');
    else if (hour < 21) setGreeting('Good Evening 🌙');
    else setGreeting('Good Night ✨');
  };

  const allTransactions = transactions || [];

  const todayHistory = allTransactions.filter((tr) => {
    const dateToCheck = tr.createdAt
      ? new Date(tr.createdAt)
      : new Date(tr.transactionDate);
    if (!dateToCheck) return false;

    const now = new Date();

    return (
      dateToCheck.getFullYear() === now.getFullYear() &&
      dateToCheck.getMonth() === now.getMonth() &&
      dateToCheck.getDate() === now.getDate()
    );
  });

  const totalIncome = allTransactions
    .filter((tr) => tr.type === 'income')
    .reduce((sum, tr) => sum + tr.amount, 0);
  const totalExpense = allTransactions
    .filter((tr) => tr.type === 'expense')
    .reduce((sum, tr) => sum + tr.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  const todayIncome = allTransactions
    .filter((tr) => tr.type === 'income')
    .reduce((sum, tr) => sum + tr.amount, 0);
  const todayExpense = allTransactions
    .filter((tr) => tr.type === 'expense')
    .reduce((sum, tr) => sum + tr.amount, 0);

  const hasRecordedToday = todayHistory.length > 0;

  const subGreeting = hasRecordedToday
    ? 'ဒီနေ့အတွက် စာရင်းမှတ်ပြီးပါပြီ 🌟'
    : 'ဒီနေ့အတွက် စာရင်းမှတ်ဖို့ မမေ့နဲ့ဦးနော် 📝';

  const handleBellPress = () => {
    setHasUnread(false);

    if (adminNoti) {
      const displayTitle = notiTitle || 'Admin Announcement 🔔';
      showNotification(`${displayTitle} : ${adminNoti}`);
      setAdminNoti(null);
    } else {
      showNotification('လက်ရှိတွင် သတိပေးချက်အသစ် မရှိသေးပါဗျာ။');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <LinearGradient colors={themeColors.primaryGradient} style={styles.headerGradient}>
        <GreetingHeader
          greeting={greeting}
          subGreeting={subGreeting}
          userName={user?.displayName || t('guest')}
          translateY={translateY}
          hasUnread={hasUnread}
          showBadge={!!adminNoti}
          onBellPress={handleBellPress}
          themeColors={themeColors}
        />

        <NotificationBanner
          message={incomingNoti}
          fadeAnim={fadeAnim}
          progressAnim={progressAnim}
          onPause={pauseNotification}
          onResume={resumeNotification}
          onHide={hideNotification}
          themeColors={themeColors}
        />

        <BalanceCard
          balance={currentBalance}
          todayIncome={todayIncome}
          todayExpense={todayExpense}
          balanceLabel={t('balance')}
          themeColors={themeColors}
        />
      </LinearGradient>

      <View style={styles.contentArea}>
        <ShoppingSection
          toBuyItems={toBuyItems || []}
          todayTransactions={todayHistory}
          onBuy={handleBuyAction}
        />
      </View>
    </View>
  );
};