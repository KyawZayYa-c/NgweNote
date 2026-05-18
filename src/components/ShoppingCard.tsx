import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../context/useThemeStore';
import { Check, Edit2, Trash2 } from 'lucide-react-native';

interface Props {
  item: any;
  onToggle: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (item: any) => void;
  onLongPress?: () => void;
}

export const ShoppingCard = ({ item, onToggle, onDelete, onEdit, onLongPress }: Props) => {
  const { getColors } = useThemeStore();
  const themeColors = getColors();

  // Data Keys သတ်မှတ်ခြင်း
  const itemName = item.itemName || "အမည်မရှိ";
  const count = item.count || 0;
  const unitPrice = item.unitPrice || 0;
  const totalPrice = item.totalPrice || (count * unitPrice);

  return (
    <TouchableOpacity 
      onLongPress={onLongPress} 
      delayLongPress={400} 
      activeOpacity={0.85}
      style={[
        styles.card, 
        { backgroundColor: themeColors.surface },
        item.isBought && { 
          backgroundColor: themeColors.background, 
          opacity: 0.5, 
          borderWidth: 1, 
          borderColor: 'rgba(0,0,0,0.05)' 
        }
      ]}
    >
      {/* (၁) အမှန်ခြစ်ဝိုင်းအပိုင်း */}
      <TouchableOpacity onPress={onToggle} style={styles.checkArea}>
        {item.isBought ? (
          <View style={styles.checkedCircle}>
            <Check size={14} color="#FFFFFF" strokeWidth={3} />
          </View>
        ) : (
          <View style={[styles.uncheckedCircle, { borderColor: themeColors.text.secondary + '50' }]} />
        )}
      </TouchableOpacity>

      {/* (၂) ပစ္စည်းအမည် နှင့် အရေအတွက်အပိုင်း */}
      <View style={styles.infoArea}>
        <Text 
          style={[
            styles.itemTitle, 
            { color: themeColors.text.primary },
            item.isBought && { textDecorationLine: 'line-through', color: '#888' } 
          ]}
        >
          {item.isPinned && "📌 "}{itemName}
        </Text>
        <Text style={[styles.itemSub, { color: themeColors.text.secondary }]}>
          {count} x {unitPrice.toLocaleString()} Ks
        </Text>
      </View>

      {/* (၃) ဈေးနှုန်း နှင့် Edit / Delete Icon များအပိုင်း ✅ */}
      <View style={styles.actionArea}>
        <Text 
          style={[
            styles.priceText, 
            { color: themeColors.primary },
            item.isBought && { textDecorationLine: 'line-through', color: '#888' }
          ]}
        >
          {totalPrice.toLocaleString()} Ks
        </Text>
        
        {/* Icon Group အပိုင်း (Card ရဲ့ Layout မပျက်အောင် အောက်နားလေးမှာ စီပေးထားပါတယ်) */}
        <View style={styles.iconGroup}>
          {!item.isBought && (
            <TouchableOpacity 
              onPress={() => onEdit?.(item)} 
              style={styles.iconTouch}
            >
              <Edit2 size={15} color={themeColors.text.secondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => onDelete?.(item.id)} 
            style={styles.iconTouch}
          >
            <Trash2 size={15} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 14, 
    borderRadius: 16, 
    marginBottom: 10, 
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  checkArea: { marginRight: 12, padding: 4 },
  checkedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  infoArea: { flex: 1, paddingRight: 8 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  itemSub: { fontSize: 12, marginTop: 2 },
  
  // ညာဘက်ခြမ်း Layout ပုံစံ 🌟
  actionArea: { 
    alignItems: 'flex-end', 
    justifyContent: 'center',
    minWidth: 80
  },
  priceText: { 
    fontSize: 14, 
    fontWeight: '800',
    marginBottom: 6 // Icon တွေနဲ့ မကပ်အောင် ခြားထားတာပါ
  },
  iconGroup: { 
    flexDirection: 'row', 
    gap: 12,
    alignItems: 'center'
  },
  iconTouch: {
    padding: 2, // နှိပ်ရလွယ်အောင် Touch Area လေး ပေးထားတာပါ
  }
});