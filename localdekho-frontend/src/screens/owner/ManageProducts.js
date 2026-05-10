import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Switch, Platform,
  useWindowDimensions, StatusBar,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, Trash2, Package, ToggleLeft, Edit3 } from 'lucide-react-native';
import Animated, {
  FadeInUp, FadeInDown, Layout,
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { impactAsync, ImpactFeedbackStyle, notificationAsync, NotificationFeedbackType } from 'expo-haptics';
import { theme } from '../../theme';

// ─────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────
function ProductCard({ item, index, onToggle, onDelete, onEdit, onView }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleDelete = () => {
    Alert.alert(
      'Delete Product?',
      `"${item.name}" permanently delete ho jaayega.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') notificationAsync(NotificationFeedbackType.Error);
            onDelete(item.id);
          },
        },
      ]
    );
  };

  const handleToggle = () => {
    if (Platform.OS !== 'web') impactAsync(ImpactFeedbackStyle.Light);
    onToggle(item.id, item.isAvailable);
  };

  // ✅ FIX: images array se pehli image lo
  const imageUri =
    item.images?.[0] ||   // array format (backend)
    item.image ||          // string format (fallback)
    null;

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).springify()}
      layout={Layout.springify()}
      style={animStyle}
    >
      <TouchableOpacity 
        style={pc.card} 
        activeOpacity={0.9}
        onPress={() => onView(item)}
      >
        {/* Product image */}
        <View style={pc.imgWrap}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={pc.img}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={pc.noImg}>
              <Package size={28} color="rgba(255,255,255,0.2)" />
              <Text style={pc.noImgText}>No Photo</Text>
            </View>
          )}

          {/* Stock badge overlay */}
          <View style={[
            pc.stockBadge,
            { backgroundColor: item.isAvailable ? 'rgba(0,230,118,0.9)' : 'rgba(255,82,82,0.9)' }
          ]}>
            <Text style={pc.stockBadgeText}>
              {item.isAvailable ? 'IN STOCK' : 'OUT'}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={pc.info}>
          <Text style={pc.name} numberOfLines={2}>{item.name}</Text>
          <Text style={pc.price}>₹{Number(item.price).toLocaleString('en-IN')}</Text>

          {/* Sizes row */}
          {item.sizes?.length > 0 && (
            <View style={pc.sizesRow}>
              {item.sizes.slice(0, 3).map(s => (
                <View key={s} style={pc.sizeChip}>
                  <Text style={pc.sizeChipText}>{s}</Text>
                </View>
              ))}
              {item.sizes.length > 3 && (
                <Text style={pc.moreText}>+{item.sizes.length - 3}</Text>
              )}
            </View>
          )}

          {/* Actions row */}
          <View style={pc.actionsRow}>
            {/* Stock toggle */}
            <View style={pc.toggleWrap}>
              <Text style={[
                pc.toggleLabel,
                { color: item.isAvailable ? theme.colors.success : theme.colors.error }
              ]}>
                {item.isAvailable ? 'In Stock' : 'Out of Stock'}
              </Text>
              <Switch
                value={item.isAvailable}
                onValueChange={handleToggle}
                trackColor={{ false: '#2C2C3E', true: theme.colors.primary }}
                thumbColor="#FFFFFF"
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
            </View>

            {/* Delete button */}
            <TouchableOpacity
              style={pc.deleteBtn}
              onPress={handleDelete}
              activeOpacity={0.75}
            >
              <Trash2 size={15} color="#FF5252" />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={pc.editBtn}
                onPress={() => onEdit(item)}
                activeOpacity={0.75}
              >
                <Edit3 size={15} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={pc.viewBtn}
                onPress={() => onView(item)}
                activeOpacity={0.75}
              >
                <ArrowLeft size={15} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const pc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#13131A',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  imgWrap: { width: 110, height: 130 },
  img: { width: '100%', height: '100%' },
  noImg: {
    width: '100%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  noImgText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '700' },
  stockBadge: {
    position: 'absolute', bottom: 8, left: 8,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6,
  },
  stockBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  name: { color: theme.colors.text, fontSize: 14, fontWeight: '700', lineHeight: 19 },
  price: { color: theme.colors.primary, fontSize: 16, fontWeight: '900', marginTop: 2 },
  sizesRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  sizeChip: {
    paddingHorizontal: 7, paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sizeChipText: { color: theme.colors.textSecondary, fontSize: 9, fontWeight: '700' },
  moreText: { color: theme.colors.textSecondary, fontSize: 10 },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  toggleWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toggleLabel: { fontSize: 10, fontWeight: '800' },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,82,82,0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,82,82,0.2)',
  },
  editBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(29,158,117,0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(29,158,117,0.2)',
  },
  viewBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
});

// ─────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <Animated.View entering={FadeInUp.delay(200).springify()} style={es.wrap}>
      <View style={es.iconWrap}>
        <Package size={48} color="rgba(29,158,117,0.4)" />
      </View>
      <Text style={es.title}>Koi product nahi hai</Text>
      <Text style={es.sub}>Apna pehla product add karo{'\n'}aur customers tak pahuncho!</Text>
      <TouchableOpacity style={es.btn} onPress={onAdd} activeOpacity={0.8}>
        <LinearGradient colors={['#1D9E75', '#0D7A5A']} style={es.btnGrad}>
          <Plus size={16} color="#fff" />
          <Text style={es.btnText}>Add First Product</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}
const es = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  iconWrap: {
    width: 90, height: 90, borderRadius: 24,
    backgroundColor: 'rgba(29,158,117,0.08)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, borderWidth: 1,
    borderColor: 'rgba(29,158,117,0.15)',
  },
  title: {
    color: theme.colors.text,
    fontSize: 18, fontWeight: '800',
    letterSpacing: -0.3, marginBottom: 8,
  },
  sub: {
    color: theme.colors.textSecondary,
    fontSize: 13, textAlign: 'center', lineHeight: 20,
  },
  btn: { marginTop: 24, borderRadius: 14, overflow: 'hidden' },
  btnGrad: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingVertical: 13, paddingHorizontal: 24,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

// ─────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────
export default function ManageProducts({ route, navigation }) {
  const { shopId } = route.params;
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const hPad = width >= 1024 ? width * 0.12 : 20;

  useEffect(() => {
    if (isFocused) fetchProducts();
  }, [isFocused]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/products/shop/${shopId}`
      );
      // ✅ FIX: response format handle karo
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.products || [];
      setProducts(data);
    } catch (err) {
      console.error('Fetch products error:', err.response?.data || err.message);
      Alert.alert('Error', 'Products load nahi hue. Backend check karo.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (productId, currentStatus) => {
    try {
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/products/${productId}/toggle`
      );
      setProducts(prev =>
        prev.map(p => p.id === productId ? { ...p, isAvailable: !currentStatus } : p)
      );
    } catch (err) {
      console.error('Toggle error:', err.message);
      Alert.alert('Error', 'Status update nahi hua.');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/api/products/${productId}`
      );
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Delete error:', err.message);
      Alert.alert('Error', 'Delete nahi hua.');
    }
  };

  const handleEdit = (product) => {
    navigation.navigate('AddProduct', { shopId, product, editMode: true });
  };

  const handleView = (product) => {
    navigation.navigate('AddProduct', { shopId, product, editMode: true, viewMode: true });
  };

  return (
    <View style={ms.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      <LinearGradient colors={['#0D0D15', '#0A0A0F']} style={StyleSheet.absoluteFill} />

      {/* ── HEADER ── */}
      <Animated.View
        entering={FadeInDown.springify()}
        style={[ms.header, { paddingHorizontal: hPad }]}
      >
        <TouchableOpacity
          style={ms.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <ArrowLeft size={20} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={ms.headerCenter}>
          <Text style={ms.headerTitle}>My Products</Text>
          {products.length > 0 && (
            <View style={ms.countBadge}>
              <Text style={ms.countText}>{products.length}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={ms.addBtn}
          onPress={() => navigation.navigate('AddProduct', { shopId })}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* ── CONTENT ── */}
      {loading ? (
        <View style={ms.loadWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={ms.loadText}>Products load ho rahe hain...</Text>
        </View>
      ) : products.length === 0 ? (
        <EmptyState onAdd={() => navigation.navigate('AddProduct', { shopId })} />
      ) : (
        <FlashList
          data={products}
          keyExtractor={item => item.id?.toString()}
          estimatedItemSize={140}
          renderItem={({ item, index }) => (
            <ProductCard
              item={item}
              index={index}
              onToggle={toggleAvailability}
              onDelete={deleteProduct}
              onEdit={handleEdit}
              onView={handleView}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: hPad,
            paddingTop: 16,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const ms = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  loadWrap: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', gap: 12,
  },
  loadText: {
    color: theme.colors.textSecondary,
    fontSize: 13, fontWeight: '600',
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerCenter: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 16, fontWeight: '800', letterSpacing: -0.4,
  },
  countBadge: {
    backgroundColor: 'rgba(29,158,117,0.2)',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 100, borderWidth: 1,
    borderColor: 'rgba(29,158,117,0.3)',
  },
  countText: {
    color: theme.colors.primary,
    fontSize: 11, fontWeight: '800',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
});