import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  FlatList, 
  ActivityIndicator, 
  Animated,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../context/useAuthStore';
import { useThemeStore } from '../context/useThemeStore';
import { useExpenseStore } from '../context/useExpenseStore';
import { Wallet, TrendingUp, TrendingDown, PlusCircle, Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export const HomeScreen = () => {
  const { user } = useAuthStore();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();
  const { t } = useTranslation();
  const { transactions, fetchTransactions, isLoading } = useExpenseStore();

  const [greeting, setGreeting] = useState('');
  const translateY = useRef(new Animated.Value(0)).current;
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Notification State
  const [incomingNoti, setIncomingNoti] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Noti animation အတွက်
  const { adminNoti, setAdminNoti } = useExpenseStore(); // Store ထဲက လှမ်းယူ

  useEffect(() => {
    fetchTransactions();
    updateGreeting();
  }, []);

  // Noti ပေါ်လာရင် Animation နဲ့ပြပြီး ၂ စက္ကန့်အကြာမှာ ပြန်ဖျောက်မယ်
  const showNotification = (message: string) => {
    setIncomingNoti(message);
    setHasUnread(true);
    
    // ပေါ်လာအောင်လုပ်မယ်
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // ၂ စက္ကန့်အကြာမှာ ပြန်ဖျောက်မယ်
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
    // ၁။ Admin ဆီက message တကယ်ရှိမှ Noti ပြမယ်
    showNotification(`Admin: ${adminNoti}`);
    
    // ၂။ ပြပြီး ၅ စက္ကန့်ကြာရင် Store ထဲက message ကို null ပြန်လုပ်မယ်
    // ဒါမှ နောက်တစ်ခါ အစ်ကို ထပ်ပို့ရင် value change သွားပြီး Noti ထပ်တက်လာမှာပါ
    const timer = setTimeout(() => {
      setAdminNoti(null);
    }, 5000);

    return () => clearTimeout(timer);
  }
}, [adminNoti]); // adminNoti ပြောင်းလဲမှုကိုပဲ စောင့်ကြည့်မယ်
  // Greeting Carousel Logic
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
  const totalIncome = allTransactions.filter(tr => tr.type === 'income').reduce((sum, tr) => sum + tr.amount, 0);
  const totalExpense = allTransactions.filter(tr => tr.type === 'expense').reduce((sum, tr) => sum + tr.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localToday = new Date(now.getTime() - offset).toISOString().split('T')[0];

  const todayTransactions = allTransactions.filter(tr => {
    const trDate = new Date(tr.transactionDate);
    const localTrDate = new Date(trDate.getTime() - offset).toISOString().split('T')[0];
    return localTrDate === localToday;
  });

  const hasRecordedToday = todayTransactions.length > 0;

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.itemCard, { backgroundColor: themeColors.surface }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemTitle, { color: themeColors.text.primary }]}>{item.title}</Text>
        <Text style={styles.itemDate}>
          {new Date(item.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={[styles.itemAmount, { color: item.type === 'income' ? '#22C55E' : '#FF6B6B' }]}>
        {item.type === 'income' ? '+' : '-'} {item.amount.toLocaleString()} Ks
      </Text>
    </View>
  );

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
              if (hasUnread) {
                // ၁။ Admin ဆီက message ရှိရင် အဲ့ဒါကိုပြမယ်၊ မရှိရင် Default စာပြမယ်
                const message = adminNoti ? `Admin: ${adminNoti}` : "Admin: စာရင်းများကို စနစ်တကျ မှတ်သားနိုင်ပါပြီ 🔔";
                
                // ၂။ showNotification ထဲကို message variable ကိုပဲ ထည့်လိုက်ပါ
                showNotification(message);
                
                // ၃။ Noti ဖတ်ပြီးသွားပြီမို့ အနီစက်လေးကို ဖျောက်လိုက်မယ်
                setHasUnread(false);
              }
            }}
          >
            <Bell color="#fff" size={24} />
            {hasUnread && <View style={styles.redDot} />}
          </TouchableOpacity>
        </View>

        {/* Noti Box ကို နေရာအပေါ်တင်ထားတယ် */}
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
          <Text style={[styles.sectionTitle, {color: themeColors.text.primary}]}>
            {t('today')} 
          </Text>
          
          {isLoading ? (
            <ActivityIndicator size="small" color={themeColors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={todayTransactions}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                   <PlusCircle color={themeColors.text.secondary} size={48} strokeWidth={1.5} />
                   <Text style={[styles.emptyText, {color: themeColors.text.secondary}]}>
                     ဒီနေ့အတွက် စာရင်းမရှိသေးပါ
                   </Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 100 }} 
            />
          )}
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
  
  // Floating Noti Box Style ကို ပိုသပ်ရပ်အောင် ပြင်ထားတယ်
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 10 },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemDate: { fontSize: 12, color: '#999' },
  itemAmount: { fontSize: 16, fontWeight: 'bold' }
});