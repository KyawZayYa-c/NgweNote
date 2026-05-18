//src/screens/HomeScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  Animated,
  TouchableOpacity
} from 'react-native';
import { db } from '../services/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import { useExpenseStore } from '../context/useExpenseStore';
import { Wallet, TrendingUp, TrendingDown, Bell, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ShoppingSection } from '../components/ShoppingSection';
import * as Notifications from 'expo-notifications';

const APP_START_TIME = new Date().toISOString();

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { getColors } = useThemeStore();
  const themeColors = getColors(); // 👈 ဗဟိုချက်အရောင်အားလုံး ထိန်းချုပ်ရာနေရာ
  const { t } = useTranslation();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { 
    transactions, 
    fetchTransactions, 
    adminNoti, 
    notiTitle,
    setAdminNoti,
    setAdminTitle,
    isLoading,
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
        shoppingItemId: item.id 
      }
    });
  };

  useEffect(() => {
    fetchToBuyItems();
    fetchTransactions();
    updateGreeting();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = db.collection('notifications')
      .doc('global_announcement')
      .onSnapshot(async (doc) => {
        if (doc.exists) {
          const data = doc.data();
          
          if (data && data.createdAt > APP_START_TIME) {
            setAdminNoti(data.message); 
            setAdminTitle(data.title || "Admin Announcement 🔔");
            setHasUnread(true);

            await Notifications.scheduleNotificationAsync({
              content: {
                title: data.title || "Admin Announcement 🔔", 
                body: data.message || "",
              },
              trigger: null,
            });
            showNotification(`${data.title || "Admin Announcement 🔔"}: ${data.message}`);
          }
        }
      });

    return () => unsubscribe();
  }, [user]);
  
  const showNotification = (message: string) => {
    setIncomingNoti(message);
    setHasUnread(true);
    
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

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
    if (hour < 12) setGreeting("Good Morning ☀️");
    else if (hour < 17) setGreeting("Good Afternoon 🌤️");
    else if (hour < 21) setGreeting("Good Evening 🌙");
    else setGreeting("Good Night ✨");
  };

  const allTransactions = transactions || [];
  const now = new Date();
  const todayString = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  const todayHistory = allTransactions.filter(tr => {
    if (!tr.transactionDate) return false;
    const dateObj = new Date(tr.transactionDate);
    const trDateString = [
      dateObj.getFullYear(),
      String(dateObj.getMonth() + 1).padStart(2, '0'),
      String(dateObj.getDate()).padStart(2, '0')
    ].join('-');
    return trDateString === todayString;
  });

  const totalIncome = allTransactions.filter(tr => tr.type === 'income').reduce((sum, tr) => sum + tr.amount, 0);
  const totalExpense = allTransactions.filter(tr => tr.type === 'expense').reduce((sum, tr) => sum + tr.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  const todayIncome = todayHistory.filter(tr => tr.type === 'income').reduce((sum, tr) => sum + tr.amount, 0);
  const todayExpense = todayHistory.filter(tr => tr.type === 'expense').reduce((sum, tr) => sum + tr.amount, 0);

  const hasRecordedToday = todayHistory.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}
      
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" // အပေါ်ဆုံးဘားကို အရောင်ဖောက်မြင်ရအောင် လုပ်တာပါ
  translucent={true} />
      
      {/* 🌟 Top Section Background Gradient */}
      <LinearGradient 
        colors={themeColors.primaryGradient} 
        style={styles.headerGradient}
      >
        <View style={styles.topBar}>
          <View style={styles.titleArea}>
            <View style={styles.greetingContainer}>
              <Animated.View style={{ transform: [{ translateY }] }}> 
                <Text style={[styles.welcomeText, { color: themeColors.white }]}>{greeting}</Text>
                <Text style={[styles.subGreeting, { color: themeColors.subGreetingText }]}>
                  {hasRecordedToday ? "ဒီနေ့အတွက် စာရင်းမှတ်ပြီးပါပြီ 🌟" : "ဒီနေ့အတွက် စာရင်းမှတ်ဖို့ မမေ့နဲ့ဦးနော် 📝"}
                </Text>
              </Animated.View>
            </View>
            <Text style={[styles.guestText, { color: themeColors.white }]}>{user?.displayName || t('guest')}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.bellBtn, { backgroundColor: themeColors.bellIconBg }]}
            onPress={() => {
              setHasUnread(false); 

              if (adminNoti) {
                const displayTitle = notiTitle || "Admin Announcement 🔔";
                showNotification(`${displayTitle} : ${adminNoti}`);
                setAdminNoti(null); 
              } else {
                showNotification("လက်ရှိတွင် သတိပေးချက်အသစ် မရှိသေးပါဗျာ။");
              }
            }}
          >
            <Bell color={themeColors.white} size={24} />
            
            {adminNoti && hasUnread && (
              <View style={[styles.notiBadge, { borderColor: themeColors.white }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* 🌟 Notification Pop-up */}
        {incomingNoti && (
          <Animated.View 
            style={[styles.incomingNotiBox, { opacity: fadeAnim }]}
            onStartShouldSetResponder={() => { pauseNotification(); return true; }}
            onResponderRelease={() => resumeNotification()}
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
                <Text style={[styles.incomingNotiText, { color: themeColors.white }]}>{incomingNoti}</Text>
                <TouchableOpacity onPress={() => hideNotification()} style={styles.notiCloseBtn}>
                  <X size={16} color={themeColors.white} />
                </TouchableOpacity>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, {
                  backgroundColor: themeColors.notiProgress, 
                  shadowColor: themeColors.notiProgress,
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  })
                }]} />
              </View>
            </BlurView>
          </Animated.View>
        )}

        {/* 🌟 Balance Glassmorphism Card */}
        <BlurView 
          intensity={50} 
          tint="light" 
          style={[styles.balanceCardWrapper, { borderColor: themeColors.glassBorder }]}
        >
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View style={[styles.iconBg, { backgroundColor: themeColors.walletIconBg }]}>
                <Wallet color={themeColors.white} size={24} />
              </View>
              <Text style={[styles.balanceLabel, { color: themeColors.white }]}>{t('balance')}</Text> 
            </View>
            <Text style={[styles.balanceAmount, { color: themeColors.white }]}>
              {currentBalance.toLocaleString()} <Text style={styles.currencyText}>Ks</Text>
            </Text>
            
            <View style={[styles.statsRow, { borderTopColor: themeColors.statsRowBorder }]}>
                <View style={styles.statItem}>
                   <TrendingUp color={themeColors.income} size={16} />
                   <Text style={[styles.statText, { color: themeColors.white }]}>+ {todayIncome.toLocaleString()} Ks</Text>
                </View>
                <View style={[styles.separator, { backgroundColor: themeColors.statSeparator }]} />
                <View style={styles.statItem}>
                   <TrendingDown color={themeColors.expense} size={16} />
                   <Text style={[styles.statText, { color: themeColors.white }]}>- {todayExpense.toLocaleString()} Ks</Text>
                </View>
            </View>
          </View>
        </BlurView>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { height: 350, paddingHorizontal: 20, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingTop: 50 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titleArea: { flex: 1 },
  greetingContainer: { height: 25, overflow: 'hidden', marginBottom: 2 },
  bellBtn: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  notiBadge: { position: 'absolute', right: -2, top: -2, backgroundColor: '#FF3B30', width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
  incomingNotiBox: { position: 'absolute', top: 5, left: 30, right: 30, zIndex: 1000 },
  notiInnerRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  notiCloseBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  progressBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressBar: { height: '100%', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5, elevation: 3 },
  notiBlur: { flexDirection: 'row', alignItems: 'center', justifyContent: "center", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 25, gap: 10, overflow: 'hidden', backgroundColor: 'rgba(15,23,42,0.85)', borderWidth: 1, minHeight: 40, maxHeight: 120 },
  notiIconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F59E0B', marginLeft: -6, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  incomingNotiText: { fontSize: 12, flex: 1, fontWeight: '500' },
  welcomeText: { opacity: 0.9, fontSize: 14, fontWeight: '500', height: 25 },
  subGreeting: { fontSize: 12, height: 25, fontWeight: '500' },
  guestText: { fontSize: 24,  fontWeight: 'bold' },
  balanceCardWrapper: { borderRadius: 28,marginTop: 17, overflow: 'hidden', borderWidth: 1 },
  balanceCard: { padding: 20 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  iconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  balanceLabel: { fontSize: 16, fontWeight: '500' },
  balanceAmount: { fontSize: 32, fontWeight: 'bold' },
  currencyText: { fontSize: 18 },
  statsRow: { flexDirection: 'row', marginTop: 15, paddingTop: 15, borderTopWidth: 1 },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  statText: { fontSize: 13, fontWeight: '600' },
  separator: { width: 1, height: '100%' },
  contentArea: { flex: 1, paddingHorizontal: 20 },
});