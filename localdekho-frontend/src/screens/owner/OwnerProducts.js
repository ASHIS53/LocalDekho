import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform,
  useWindowDimensions,
  StatusBar,
  TextInput
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Box,
  Filter
} from 'lucide-react-native';
import Animated, { 
  FadeInUp,
  Layout,
  SlideInRight
} from 'react-native-reanimated';
import axios from 'axios';
import { theme } from '../../theme';
import ProductCard from '../../components/ProductCard';
import { notificationAsync, NotificationFeedbackType } from 'expo-haptics';

export default function OwnerProducts({ route, navigation }) {
  const { width } = useWindowDimensions();
  const shopId = route?.params?.shopId;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (shopId) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [shopId]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/products/shop/${shopId}`);
      setProducts(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (Platform.OS !== 'web') notificationAsync(NotificationFeedbackType.Warning);
    setProducts(products.filter(p => p.id !== id));
  };

  const isDesktop = width >= 1024;
  const numColumns = isDesktop ? 4 : 2;

  const renderProductItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <ProductCard 
        product={item} 
        index={index} 
        onPress={() => {}}
      />
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Edit3 size={16} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: 'rgba(255,82,82,0.1)' }]}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 size={16} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.gradients.dark} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingHorizontal: isDesktop ? width * 0.1 : 20 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>INVENTORY CONTROL</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddProduct', { shopId })}
          >
            <Plus size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <BlurView intensity={30} tint="dark" style={styles.searchWrapper}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assets..."
            placeholderTextColor={theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </BlurView>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlashList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          estimatedItemSize={250}
          renderItem={renderProductItem}
          contentContainerStyle={[
            styles.listPadding,
            { paddingHorizontal: isDesktop ? width * 0.1 : 15 }
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Box size={64} color={theme.colors.surface} />
              <Text style={styles.emptyText}>VAULT IS EMPTY</Text>
              <Text style={styles.emptySubtext}>NO ASSETS REGISTERED IN THIS SECTOR</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingTop: 60, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { color: theme.colors.text, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' },
  addBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', height: 58, borderRadius: 18, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 16, marginLeft: 12, ...Platform.select({ web: { outlineStyle: 'none' }}) },
  filterBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' },
  listPadding: { paddingTop: 20, paddingBottom: 100 },
  itemContainer: { flex: 1, marginBottom: 20 },
  itemActions: { flexDirection: 'row', gap: 8, marginTop: 10, paddingHorizontal: 5 },
  actionBtn: { flex: 1, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  loading: { marginTop: 100 },
  empty: { marginTop: 100, alignItems: 'center', opacity: 0.5 },
  emptyText: { color: theme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 20, letterSpacing: 1 },
  emptySubtext: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '800', marginTop: 8 }
});
