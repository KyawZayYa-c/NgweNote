import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '../context/useAuthStore';
import { useExpenseStore } from '../context/useExpenseStore';
import { colors } from '../theme/colors';
import { CustomButton } from '../components/CustomButton';
import { LucideIcon, User, LogOut, CloudSync, Globe, Info } from 'lucide-react-native';

export const SettingsScreen = () => {
  const { user, isGuest, logout, loginAsGuest } = useAuthStore();
  const { migrateGuestData, isLoading } = useExpenseStore();

  const handleLogout = () => {
    Alert.alert(
      'ထွက်ရန် အတည်ပြုပါ',
      'အကောင့်မှ ထွက်ရန် သေချာပါသလား?',
      [
        { text: 'မထွက်တော့ပါ', style: 'cancel' },
        { 
          text: 'ထွက်မည်', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const handleMigrate = async () => {
    if (user) {
      Alert.alert(
        'ဒေတာပြောင်းရွှေ့ရန်',
        'စက်ထဲရှိ မှတ်တမ်းများကို cloud သို့ ပြောင်းရွှေ့ရန် သေချာပါသလား?',
        [
          { text: 'မပြောင်းတော့ပါ', style: 'cancel' },
          { 
            text: 'ပြောင်းမည်', 
            onPress: async () => {
              await migrateGuestData(user.uid);
              Alert.alert('အောင်မြင်ပါသည်', 'ဒေတာများကို cloud သို့ ပြောင်းရွှေ့ပြီးပါပြီ။');
            }
          }
        ]
      );
    } else {
      Alert.alert('သတိပေးချက်', 'ဒေတာများကို cloud သို့ ပြောင်းရွှေ့ရန် ဦးစွာ login ဝင်ပါ။');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ဆက်တင်များ</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>အကောင့်</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <User size={32} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user ? (user.email || 'အသုံးပြုသူ') : (isGuest ? 'ဧည့်သည်' : 'မသိရှိပါ')}
            </Text>
            <Text style={styles.profileStatus}>
              {user ? 'Cloud Sync ဖွင့်ထားပါသည်' : 'Offline အသုံးပြုနေပါသည်'}
            </Text>
          </View>
        </View>

        {isGuest && (
          <CustomButton 
            title="Google နှင့်ဝင်ရန်" 
            onPress={() => {}} // Integration point
            variant="outline"
          />
        )}

        {user && (
          <TouchableOpacity style={styles.settingItem} onPress={handleMigrate}>
            <CloudSync size={20} color={colors.primary} />
            <Text style={styles.settingText}>Cloud သို့ ဒေတာပြောင်းရွှေ့ရန်</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <LogOut size={20} color={colors.danger} />
          <Text style={[styles.settingText, { color: colors.danger }]}>ထွက်ရန်</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>အခြား</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Globe size={20} color={colors.text.secondary} />
          <Text style={styles.settingText}>ဘာသာစကား (မြန်မာ)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Info size={20} color={colors.text.secondary} />
          <Text style={styles.settingText}>ဗားရှင်း (၁.၀.၀)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: colors.text.primary,
    fontWeight: '500',
  },
});
