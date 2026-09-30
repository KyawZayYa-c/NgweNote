import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Send, Clock, Trash2 } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from './styles';

interface NotiItem {
  id: string;
  message: string;
  time: string;
}

interface AdminNotiModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onChangeTitle: (text: string) => void;
  onChangeMessage: (text: string) => void;
  onSend: () => void;
  history: NotiItem[];
  onDeleteHistory: (id: string) => void;
  themeColors: any;
  labels: {
    headerTitle: string;
    titlePlaceholder: string;
    messagePlaceholder: string;
    sendText: string;
    historyTitle: string;
    emptyHistory: string;
  };
}

export const AdminNotiModal: React.FC<AdminNotiModalProps> = ({
  visible,
  onClose,
  title,
  message,
  onChangeTitle,
  onChangeMessage,
  onSend,
  history,
  onDeleteHistory,
  themeColors,
  labels,
}) => {
  const renderItem = ({ item }: { item: NotiItem }) => (
    <View style={styles.historyItem}>
      <Clock size={14} color="#999" />
      <View style={{ flex: 1 }}>
        <Text style={[styles.historyText, { color: themeColors.text.primary }]}>
          {item.message}
        </Text>
        <Text style={styles.historyTime}>
          {new Date(item.time).toLocaleTimeString()}
        </Text>
      </View>
      <TouchableOpacity onPress={() => onDeleteHistory(item.id)} style={{ padding: 5 }}>
        <Trash2 size={16} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.notiSheet, { backgroundColor: themeColors.surface }]}>
          <View style={styles.notiHeader}>
            <Text style={[styles.modalMainTitle, { color: themeColors.text.primary }]}>
              {labels.headerTitle}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="closecircle" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.notiInput,
                {
                  height: 45,
                  marginBottom: 10,
                  color: themeColors.text.primary,
                  borderColor: themeColors.primary,
                },
              ]}
              placeholder={labels.titlePlaceholder}
              placeholderTextColor="#999"
              value={title}
              onChangeText={onChangeTitle}
            />
            <TextInput
              style={[
                styles.notiInput,
                { color: themeColors.text.primary, borderColor: themeColors.primary },
              ]}
              placeholder={labels.messagePlaceholder}
              placeholderTextColor="#999"
              value={message}
              onChangeText={onChangeMessage}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: themeColors.primary }]}
              onPress={onSend}
            >
              <Send size={20} color="#fff" />
              <Text style={styles.sendBtnText}>{labels.sendText}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.historyTitle, { color: themeColors.text.secondary }]}>
            {labels.historyTitle}
          </Text>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.emptyHistory}>{labels.emptyHistory}</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
};