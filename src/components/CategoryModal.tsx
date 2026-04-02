import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { ShoppingBag, Coffee, Car, Home, Smartphone, Heart, X } from 'lucide-react-native';

const categories = [
  { id: '1', name: 'Food', icon: <Coffee size={24} color="#FF9F43" /> },
  { id: '2', name: 'Shopping', icon: <ShoppingBag size={24} color="#FF5BAE" /> },
  { id: '3', name: 'Transport', icon: <Car size={24} color="#4834D4" /> },
  { id: '4', name: 'Rent', icon: <Home size={24} color="#686DE0" /> },
  { id: '5', name: 'Bills', icon: <Smartphone size={24} color="#22A6B3" /> },
  { id: '6', name: 'Health', icon: <Heart size={24} color="#EB4D4B" /> },
];

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (category: any) => void;
}

export const CategoryModal = ({ visible, onClose, onSelect }: any) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Category</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#333" /></TouchableOpacity>
          </View>
          
          <FlatList
            data={categories}
            numColumns={3}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.catItem} 
                onPress={() => { onSelect(item); onClose(); }}
              >
                <View style={styles.iconBg}>{item.icon}</View>
                <Text style={styles.catText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 25, padding: 20, maxHeight: '60%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700' },
  catItem: { flex: 1, alignItems: 'center', marginBottom: 20 },
  iconBg: { width: 55, height: 55, borderRadius: 15, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catText: { fontSize: 12, color: '#666', fontWeight: '500' }
});