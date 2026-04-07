// ShoppingCard.tsx - Full Code (ဒါကိုပဲ အစားထိုးလိုက်ပါ)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../context/useThemeStore';
import { CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react-native';

interface Props {
  item: any;
  onToggle: (item: any) => void;
  onDelete?: (id: string) => void;
  onEdit?: (item: any) => void;
}

export const ShoppingCard = ({ item, onToggle, onDelete, onEdit }: Props) => {
  const { getColors } = useThemeStore();
  const themeColors = getColors();

  // Log ထဲက Data နဲ့ ကိုက်အောင် Key တွေကို ဆွဲထုတ်တာပါ ✅
  const itemName = item.itemName || "အမည်မရှိ";
  const count = item.count || 0;
  const unitPrice = item.unitPrice || 0;
  const totalPrice = item.totalPrice || (count * unitPrice);

  return (
    <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
      <TouchableOpacity onPress={() => onToggle(item)} style={styles.checkArea}>
        {item.isBought ? (
          <CheckCircle2 size={24} color="#22C55E" />
        ) : (
          <Circle size={24} color={themeColors.text.secondary} opacity={0.5} />
        )}
      </TouchableOpacity>

      <View style={styles.infoArea}>
        <Text style={[styles.itemTitle, { color: themeColors.text.primary }]}>
          {itemName}
        </Text>
        <Text style={[styles.itemSub, { color: themeColors.text.secondary }]}>
          {count} x {unitPrice.toLocaleString()} Ks
        </Text>
      </View>

      <View style={styles.actionArea}>
        <Text style={[styles.priceText, { color: themeColors.primary }]}>
          {totalPrice.toLocaleString()} Ks
        </Text>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={() => onEdit?.(item)}>
            <Edit2 size={18} color={themeColors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete?.(item.id)}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, marginBottom: 12, elevation: 3 },
  checkArea: { marginRight: 15 },
  infoArea: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700' },
  itemSub: { fontSize: 13 },
  actionArea: { alignItems: 'flex-end' },
  priceText: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  iconGroup: { flexDirection: 'row', gap: 15 }
});