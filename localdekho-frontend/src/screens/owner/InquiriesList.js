import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';

export default function InquiriesList({ route, navigation }) {
  const { shopId } = route.params;
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) fetchInquiries();
  }, [isFocused]);

  const fetchInquiries = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/inquiries/shop/${shopId}`);
      setInquiries(response.data.inquiries);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/api/inquiries/${id}/read`);
      setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, isRead: true } : inq));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const renderInquiry = ({ item }) => (
    <View style={[styles.card, !item.isRead && styles.unreadCard]}>
      <Text style={styles.phone}>📞 {item.customerPhone}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      
      {!item.isRead && (
        <TouchableOpacity style={styles.readBtn} onPress={() => markAsRead(item.id)}>
          <Text style={styles.readBtnText}>Mark as Read</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Inquiries</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1D9E75" style={{ marginTop: 20 }} />
      ) : inquiries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No inquiries yet.</Text>
        </View>
      ) : (
        <FlatList
          data={inquiries}
          keyExtractor={item => item.id}
          renderItem={renderInquiry}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#1D9E75', padding: 20, paddingTop: 50,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: { marginRight: 15 },
  backText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  list: { padding: 15 },
  card: {
    backgroundColor: '#fff', padding: 15, borderRadius: 8,
    marginBottom: 15, elevation: 2,
    borderLeftWidth: 4, borderLeftColor: '#ddd'
  },
  unreadCard: { borderLeftColor: '#1D9E75', backgroundColor: '#F0FFF4' },
  phone: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  message: { fontSize: 14, color: '#444', marginBottom: 10 },
  date: { fontSize: 12, color: '#888' },
  readBtn: {
    alignSelf: 'flex-start', marginTop: 10,
    backgroundColor: '#1D9E75', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 5
  },
  readBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', fontSize: 16 }
});
