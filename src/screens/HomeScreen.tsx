import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  Animated,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import { useExpenseStore } from '../context/useExpenseStore';
import { Wallet, TrendingUp, TrendingDown, Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ShoppingSection } from '../components/ShoppingSection';
import { useShoppingStore } from '../context/useShoppingStore';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t } = useTranslation();
  
  // Store မှ လိုအပ်သော data များ ဆွဲထုတ်ခြင်း
  const { 
    transactions, 
    fetchTransactions, 
    adminNoti, 
    setAdminNoti,
    isLoading,
  } = useExpenseStore();

  const { toBuyItems, fetchToBuyItems, toggleBoughtStatus } = useShoppingStore();

  const [greeting, setGreeting] = useState('');
  const translateY = useRef(new Animated.Value(0)).current;
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [incomingNoti, setIncomingNoti] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

const handleBuyAction = (item: any) => {
    // ၁။ Shopping Store မှာ update လုပ်ခြင်း
    toggleBoughtStatus(item.id);

    // ၂။ စာရင်းသွင်းရန် screen သို့ data ပို့ပေးခြင်း
    navigation.navigate('AddTransaction', {
      editData: {
        title: item.itemName,
        amount: item.unitPrice * item.count,
        type: 'expense'
      }
    });
  };

  useEffect(() => {
    fetchToBuyItems();
    fetchTransactions();
    
    updateGreeting();
  }, []);

  const showNotification = (message: string) => {
    setIncomingNoti(message);
    setHasUnread(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hideNotification();
    }, 2500);
  };

  const hideNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setIncomingNoti(null));
  };

  useEffect(() => {
    if (adminNoti) {
      showNotification(`Admin: ${adminNoti}`);
      const timer = setTimeout(() => {
        setAdminNoti(null);
      }, 5000);
      return () => clearTimeout(timer);
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

  // စာရင်းတွက်ချက်မှုများ
  const allTransactions = transactions || [];
  const totalIncome = allTransactions.filter(tr => tr.type === 'income').reduce((sum, tr) => sum + tr.amount, 0);
  const totalExpense = allTransactions.filter(tr => tr.type === 'expense').reduce((sum, tr) => sum + tr.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  const localToday = new Date().toISOString().split('T')[0];
  const todayTransactions = allTransactions.filter(tr => {
    const trDate = new Date(tr.transactionDate).toISOString().split('T')[0];
    return trDate === localToday;
  });

  const hasRecordedToday = todayTransactions.length > 0;

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
              if (hasUnread || adminNoti) {
                const message = adminNoti ? `Admin: ${adminNoti}` : "စာရင်းများကို စနစ်တကျ မှတ်သားနိုင်ပါပြီ 🔔";
                showNotification(message);
                setHasUnread(false);
              }
            }}
          >
            <Bell color="#fff" size={24} />
            {(hasUnread || adminNoti) && <View style={styles.redDot} />}
          </TouchableOpacity>
        </View>

        {incomingNoti && (
          <Animated.View style={[styles.incomingNotiBox, { opacity: fadeAnim }]}>
            <BlurView intensity={90} tint="dark" style={styles.notiBlur}>
               <View style={styles.notiIconCircle}>
                 <Bell size={14} color="#fff" />
               </View>
               <Text style={styles.incomingNotiText} numberOfLines={1}>{incomingNoti}</Text>
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
                   <Text style={styles.statText}>+ {totalIncome.toLocaleString()} Ks</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.statItem}>
                   <TrendingDown color="#FF6B6B" size={16} />
                   <Text style={styles.statText}>- {totalExpense.toLocaleString()} Ks</Text>
                </View>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      <View style={styles.contentArea}>
        <ShoppingSection 
          toBuyItems={toBuyItems || []} 
          todayTransactions={transactions}
      onToggle={(item) => navigation.navigate('AddTransaction', { 
  editData: { 
    ...item, 
    amount: item.unitPrice * item.count, // amount ကို ဒီမှာတင် တွက်ပို့လိုက်ပါ
    title: item.itemName,
    type: 'expense'
  } 
})}
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
  notiBlur: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 25, gap: 10, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  notiIconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center' },
  incomingNotiText: { color: '#fff', fontSize: 12, flex: 1, fontWeight: '500' },
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
  contentArea: { flex: 1, padding: 20, marginTop: 10 },
});