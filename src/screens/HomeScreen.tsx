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
import { useShoppingStore } from '../context/useShoppingStore';
import * as Notifications from 'expo-notifications';
const APP_START_TIME = new Date().toISOString();
export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();
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
    toggleBoughtStatus,
  } = useExpenseStore();


  const [greeting, setGreeting] = useState('');
  const translateY = useRef(new Animated.Value(0)).current;
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [incomingNoti, setIncomingNoti] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
const handleBuyAction = (item: any) => {
  toggleBoughtStatus(item.id);

  navigation.navigate('AddTransaction', {
    editData: {
      ...item, 
      title: item.itemName,
      amount: item.unitPrice * item.count,
      type: 'expense',
      category: item.category || 'Shopping'
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
          
          // ၁။ Store ထဲကို အရင်ထည့်မယ် (ဒါမှ Icon မှာ အနီစက် တန်းပေါ်မယ်)
          setAdminNoti(data.message); 
          setAdminTitle(data.title || "Admin Announcement 🔔");
          setHasUnread(true);

          // ၂။ ဖုန်း Notification Bar မှာပြမယ်
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
  
  // ၁။ Banner ပေါ်လာဖို့ Fade In
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

// ဖိထားရင် ရပ်ထားဖို့ (Pause)
const pauseNotification = () => {
  progressAnim.stopAnimation(); // Animation ကို ရပ်မယ်
};

// ပြန်လွှတ်ရင် ကျန်တဲ့အချိန်ကနေ ဆက်ပြေးဖို့ (Resume)
const resumeNotification = () => {
  const currentVal = (progressAnim as any)._value; // လက်ရှိ ရောက်နေတဲ့နေရာ
  Animated.timing(progressAnim, {
    toValue: 100,
    duration: 3500 * (1 - currentVal / 100), // ကျန်တဲ့ အချိန်လောက်ပဲ ထပ်ပြေးမယ်
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
      // setAdminNoti(null) ကို ဒီထဲကနေ ဖယ်ထုတ်လိုက်ပါ
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

// --- စာရင်းတွက်ချက်မှုများ အပိုင်း ---
  const allTransactions = transactions || [];

  // ✅ ၁။ စက်ရဲ့ Local ရက်စွဲကို (YYYY-MM-DD) ပုံစံအတိအကျယူခြင်း
  const now = new Date();
  const todayString = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  // ✅ ၂။ "ဒီနေ့မှတ်တမ်း" အတွက် သီးသန့်စစ်ထုတ်ခြင်း
  const todayHistory = allTransactions.filter(tr => {
    if (!tr.transactionDate) return false;

    // Transaction Date ကိုလည်း Local format (YYYY-MM-DD) အဖြစ်ပြောင်းပြီးမှ နှိုင်းယှဉ်ပါမယ်
    const dateObj = new Date(tr.transactionDate);
    const trDateString = [
      dateObj.getFullYear(),
      String(dateObj.getMonth() + 1).padStart(2, '0'),
      String(dateObj.getDate()).padStart(2, '0')
    ].join('-');

    return trDateString === todayString;
  });

  // Balance တွက်ချက်မှု (အားလုံးပေါင်း)
  const totalIncome = allTransactions.filter(tr => tr.type === 'income').reduce((sum, tr) => sum + tr.amount, 0);
  const totalExpense = allTransactions.filter(tr => tr.type === 'expense').reduce((sum, tr) => sum + tr.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  // ဒီနေ့အတွက် ဝင်ငွေ/ထွက်ငွေ သီးသန့်
  const todayIncome = todayHistory.filter(tr => tr.type === 'income').reduce((sum, tr) => sum + tr.amount, 0);
  const todayExpense = todayHistory.filter(tr => tr.type === 'expense').reduce((sum, tr) => sum + tr.amount, 0);

  const hasRecordedToday = todayHistory.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={themeColors.primaryGradient} style={styles.headerGradient}>
        <View style={styles.topBar}>
          <View style={styles.titleArea}>
            <View style={styles.greetingContainer}>
              <Animated.View style={{ transform: [{ translateY }] }}> 
                <Text style={styles.welcomeText}>{greeting}</Text>
                <Text style={styles.subGreeting}>
                  {hasRecordedToday ? "ဒီနေ့အတွက် စာရင်းမှတ်ပြီးပါပြီ 🌟" : "ဒီနေ့အတွက် စာရင်းမှတ်ဖို့ မမေ့နဲ့ဦးနော် 📝"}
                </Text>
              </Animated.View>
            </View>
            <Text style={styles.guestText}>{user?.displayName || t('guest')}</Text>
          </View>
          
         
          <TouchableOpacity 
  style={styles.bellBtn}
  onPress={() => {
    // ၁။ အနီစက်ကို ပျောက်အောင်လုပ်မယ်
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
  <Bell color="#fff" size={24} />
  
  {adminNoti && hasUnread && (
    <View style={{
      position: 'absolute',
      right: -2,
      top: -2,
      backgroundColor: 'red',
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#fff'
    }} />
  )}
</TouchableOpacity>

        </View>

        {incomingNoti && (
  <Animated.View 
    style={[styles.incomingNotiBox, { opacity: fadeAnim }]}
    onStartShouldSetResponder={() => { pauseNotification(); return true; }} // ဖိလိုက်ရင်
    onResponderRelease={() => resumeNotification()} // လွှတ်လိုက်ရင်
  >
    <BlurView intensity={90} tint="dark" style={styles.notiBlur}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View style={styles.notiIconCircle}>
          <Bell size={14} color="#fff" />
        </View>
        <Text style={styles.incomingNotiText}>{incomingNoti}</Text>
        <TouchableOpacity onPress={() => hideNotification()} style={{ padding: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 }}>
          <X size={18} color="#999" />
        </TouchableOpacity>
      </View>

      {/* အောက်ခြေက အလင်းတန်း (Progress Bar) */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, {
          width: progressAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%']
          })
        }]} />
      </View>
    </BlurView>
  </Animated.View>
)}

        <BlurView intensity={theme === 'dark' ? 10 : 30} tint={theme === 'dark' ? 'dark' : 'light'} style={styles.balanceCardWrapper}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View style={styles.iconBg}><Wallet color="#fff" size={24} /></View>
              <Text style={styles.balanceLabel}>{t('balance')}</Text> 
            </View>
            <Text style={styles.balanceAmount}>{currentBalance.toLocaleString()} <Text style={{fontSize: 18}}>Ks</Text></Text>
            
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                   <TrendingUp color="#22C55E" size={16} />
                   <Text style={styles.statText}>+ {todayIncome.toLocaleString()} Ks</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.statItem}>
                   <TrendingDown color="#FF6B6B" size={16} />
                   <Text style={styles.statText}>- {todayExpense.toLocaleString()} Ks</Text>
                </View>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      <View style={styles.contentArea}>
        <ShoppingSection 
    toBuyItems={toBuyItems || []} 
    todayTransactions={todayHistory}
    onBuy={handleBuyAction} // ဒီနေရာမှာ နာမည်တူအောင် ပြောင်းပေးပါ
  />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { height: 330, paddingHorizontal: 20, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingTop: 50 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titleArea: { flex: 1 },
  greetingContainer: { height: 25, overflow: 'hidden', marginBottom: 2 },
  bellBtn: { width: 45, height: 45, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  redDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, backgroundColor: '#FF3B30', borderRadius: 4, borderWidth: 1, borderColor: '#fff' },
  incomingNotiBox: { position: 'absolute', top: 5, left: 30, right: 30, zIndex: 1000 },
  progressBarContainer: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 3,
  backgroundColor: 'rgba(255,255,255,0.1)',
},
progressBar: {
  height: '100%',
  backgroundColor: '#F59E0B', // Bell icon နဲ့ အရောင်တူ (Yellow/Orange)
  // လင်းလက်နေစေဖို့ shadow ထည့်လို့ရပါတယ်
  shadowColor: '#F59E0B',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 5,
  elevation: 3,
},
  notiBlur: { flexDirection: 'row', alignItems: 'center', justifyContent: "center", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 25, gap: 10, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  minHeight: 40,
  maxHeight: 120,
  },
  notiIconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F59E0B', marginLeft: -6, marginRight:10, justifyContent: 'center', alignItems: 'center' },
  incomingNotiText: { color: '#fff',  fontSize: 12, flex: 1, fontWeight: '500' },
  welcomeText: { color: '#fff', opacity: 0.8, fontSize: 14, fontWeight: '500', height: 25 },
  subGreeting: { color: '#fff', opacity: 0.9, fontSize: 12, height: 25 },
  guestText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  balanceCardWrapper: { borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  balanceCard: { padding: 20 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  iconBg: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  balanceLabel: { color: '#fff', fontSize: 16 },
  balanceAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  statText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  separator: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.2)' },
  contentArea: { flex: 1, paddingHorizontal: 20,  },
});