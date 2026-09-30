import React, { useState, useEffect } from 'react';
import { useExpenseStore } from '../context/useExpenseStore';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../context/useThemeStore';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  Save,
  ShoppingBag,
  DollarSign,
  Plus,
} from 'lucide-react-native';
import { AlertModal, FormInput, BatchPreview, styles } from '../components/AddToBuy';

export const AddToBuyScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { theme, getColors } = useThemeStore();
  const themeColors = getColors();

  const { addToBuyItem, updateToBuyItem } = useExpenseStore();
  const editData = route.params?.editData;
  const isEditMode = !!editData;

  const [itemName, setItemName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [count, setCount] = useState('1');
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemList, setItemList] = useState<any[]>([]);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const isBatching = itemList.length > 0;

  useEffect(() => {
    if (isEditMode) {
      setItemName(editData.itemName);
      setUnitPrice(editData.unitPrice.toString());
      setCount(editData.count.toString());
    }
  }, [isEditMode, editData]);

  useEffect(() => {
    const price = parseFloat(unitPrice) || 0;
    const qty = parseInt(count) || 0;
    setTotalPrice(price * qty);
  }, [unitPrice, count]);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const resetForm = () => {
    setItemName('');
    setUnitPrice('');
    setCount('1');
    setTotalPrice(0);
  };

  const addToList = () => {
    if (!itemName || !unitPrice) {
      showAlert(t('warning'), t('alertFillAll'));
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      itemName,
      unitPrice: parseFloat(unitPrice),
      count: parseInt(count),
      totalPrice: totalPrice,
    };

    setItemList([...itemList, newItem]);
    resetForm();
  };

  const removeFromList = (id: string) => {
    setItemList(itemList.filter((item) => item.id !== id));
  };

  const handleFinalSave = async () => {
    try {
      if (isEditMode) {
        if (!itemName && !unitPrice) {
          showAlert(t('warning'), t('alertNoItems'));
          return;
        }
        if (!itemName) {
          showAlert(t('warning'), t('alertNoItems'));
          return;
        }
        if (!unitPrice) {
          showAlert(t('warning'), t('alertNotiPri'));
          return;
        }

        await updateToBuyItem(editData.id, {
          itemName: itemName,
          unitPrice: parseFloat(unitPrice),
          count: parseInt(count),
        });
      } else {
        const itemsToSave = [...itemList];

        if (itemName && unitPrice) {
          itemsToSave.push({
            itemName,
            unitPrice: parseFloat(unitPrice),
            count: parseInt(count),
          });
        } else if (itemName && !unitPrice) {
          showAlert(t('warning'), t('alertNotiPri'));
          return;
        } else if (!itemName && unitPrice) {
          showAlert(t('warning'), t('alertNoItems'));
          return;
        }

        if (itemsToSave.length === 0) {
          showAlert(t('warning'), t('alertNoItems'));
          return;
        }

        for (const item of itemsToSave) {
          await addToBuyItem({
            itemName: item.itemName,
            unitPrice: item.unitPrice,
            count: item.count,
          });
        }
      }

      navigation.goBack();
    } catch (error) {
      showAlert(t('error'), t('alertSaveError'));
    }
  };

  const finalCount = itemList.length + (itemName ? 1 : 0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient colors={themeColors.primaryGradient} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? t('editListTitle') : t('addToListTitle')}
          </Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
      >
        <FormInput
          label={t('labelItemName')}
          value={itemName}
          onChangeText={setItemName}
          placeholder={t('placeholderItemName')}
          icon={<ShoppingBag size={18} color={themeColors.primary} style={{ marginRight: 10 }} />}
          themeColors={themeColors}
          containerStyle={styles.inputWrapper}
        />

        <View style={styles.row}>
          <FormInput
            label={t('labelPrice')}
            value={unitPrice}
            onChangeText={setUnitPrice}
            placeholder="0.00"
            icon={<DollarSign size={18} color={themeColors.primary} />}
            keyboardType="decimal-pad"
            themeColors={themeColors}
            containerStyle={{ flex: 1.5 }}
            inputStyle={{ marginLeft: 5 }}
            sanitize={(text) => text.replace(/[^0-9.]/g, '')}
          />

          <FormInput
            label={t('labelCount')}
            value={count}
            onChangeText={setCount}
            keyboardType="numeric"
            themeColors={themeColors}
            containerStyle={{ flex: 1 }}
            textAlign="center"
            sanitize={(text) => text.replace(/[^0-9]/g, '')}
          />
        </View>

        <View style={styles.totalDisplay}>
          <Text style={[styles.totalLabel, { color: themeColors.text.secondary }]}>
            {t('labelTotalAmount')}
          </Text>
          <Text style={[styles.totalAmount, { color: themeColors.primary }]}>
            {totalPrice.toLocaleString()} Ks
          </Text>
        </View>

        {!isEditMode && (
          <TouchableOpacity
            onPress={addToList}
            style={[styles.addToListBtn, { borderColor: themeColors.primary }]}
            activeOpacity={0.7}
          >
            <Plus size={20} color={themeColors.primary} />
            <Text style={[styles.addToListText, { color: themeColors.primary }]}>
              {t('addMoreItemBtn')}
            </Text>
          </TouchableOpacity>
        )}

        {!isEditMode && isBatching && (
          <BatchPreview
            items={itemList}
            onRemove={removeFromList}
            themeColors={themeColors}
            title={t('previewTitle')}
          />
        )}

        <TouchableOpacity
          onPress={handleFinalSave}
          activeOpacity={0.8}
          style={[
            styles.saveBtn,
            theme === 'dark' && { borderWidth: 1, borderColor: 'rgba(0, 209, 255, 0.3)' },
          ]}
        >
          <LinearGradient
            colors={themeColors.primaryBtn || ['#6A5AE0', '#010102']}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 1 }}>
            <Save color="#fff" size={20} />
            <Text style={styles.saveText}>
              {isEditMode
                ? t('editBtnText')
                : isBatching
                ? `${t('saveAllBtnText')} (${finalCount})`
                : t('saveBtnText')}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        themeColors={themeColors}
        okText={t('ok') || 'OK'}
      />
    </KeyboardAvoidingView>
  );
};