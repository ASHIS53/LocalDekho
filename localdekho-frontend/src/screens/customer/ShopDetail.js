import React, { useEffect, useState, useRef, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Platform,
  useWindowDimensions,
  StatusBar,
  Linking
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
  FadeInUp
} from 'react-native-reanimated';
import { 
  ArrowLeft, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Star,
  Info,
  ExternalLink
} from 'lucide-react-native';
import { notificationAsync, NotificationFeedbackType } from 'expo-haptics';
import axios from 'axios';
import { theme } from '../../theme';
import ProductCard from '../../components/ProductCard';
import GlassCard from '../../components/GlassCard';
import { AuthContext } from '../../context/AuthContext';

export default function ShopDetail({ route, navigation }) {
  const { width } = useWindowDimensions();
  const { shopId, shop } = route.params;
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const scrollY = useSharedValue(0);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollY.value, [-300, 0, 300], [150, 0, -100]),
        },
        {
          scale: interpolate(scrollY.value, [-300, 0, 300], [2, 1, 1]),
        },
      ],
    };
  });

  const isDesktop = width >= 1024;
  const numColumns = isDesktop ? 4 : 2;

  const handleConnect = async () => {
    if (Platform.OS !== 'web') notificationAsync(NotificationFeedbackType.Success);
    
    try {
      if (user) {
        await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/inquiries/create`, {
          shopId,
          message: 'Customer initiated a secure WhatsApp connection.'
        });
      }
      
      const phone = shop.phone || '0000000000';
      const text = encodeURIComponent(`Hi, I found your shop (${shop.name}) on LocalDekho. I have an inquiry.`);
      Linking.openURL(`https://wa.me/91${phone}?text=${text}`);
    } catch (e) {
      console.error('Failed to create inquiry', e);
      Alert.alert('Connection Error', 'Could not establish secure channel.');
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Animated.View style={[styles.infoCardWrapper, FadeInUp.delay(200).springify()]}>
        <GlassCard style={styles.infoCard}>
          <View style={styles.shopTypeRow}>
            <Text style={styles.shopCategory}>{shop.category || 'PREMIUM RETAIL'}</Text>
            <View style={styles.ratingBox}>
              <Star size={12} color={theme.colors.accent} fill={theme.colors.accent} />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
          
          <Text style={styles.shopName}>{shop.name}</Text>
          
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <MapPin size={16} color={theme.colors.primaryLight} />
              <Text style={styles.metaText}>{shop.address?.split(',')[0] || 'Local Sector'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{shop.timings || '10:00 AM - 09:00 PM'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Info size={16} color={theme.colors.accent} />
              <Text style={styles.metaText}>{shop.operatingDays?.join(', ') || 'Mon-Sun'}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.connectBtn}
            onPress={handleConnect}
          >
            <LinearGradient colors={theme.gradients.primary} style={styles.connectGrad}>
              <MessageCircle size={20} color={theme.colors.text} />
              <Text style={styles.connectText}>SECURE CONNECT</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.directionsBtn}
            onPress={() => {
              if (Platform.OS !== 'web') notificationAsync(NotificationFeedbackType.Success);
              const url = Platform.select({
                ios: `maps:0,0?q=${shop.name}@${shop.lat},${shop.lng}`,
                android: `geo:0,0?q=${shop.lat},${shop.lng}(${shop.name})`,
                web: `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`
              });
              if (shop.lat && shop.lng) {
                Linking.openURL(url || `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`);
              } else {
                Alert.alert('Unavailable', 'This shop has not set precise GPS coordinates.');
              }
            }}
          >
            <MapPin size={20} color={theme.colors.primary} />
            <Text style={styles.directionsText}>GET DIRECTIONS</Text>
          </TouchableOpacity>
        </GlassCard>
      </Animated.View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>COLLECTION 2026</Text>
        <Text style={styles.sectionSubtitle}>{products.length} ARCHITECTURAL PIECES</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.gradients.dark} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.headerImageContainer, headerImageStyle]}>
        <Image
          source={shop.coverImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000'}
          style={styles.headerImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(10,10,15,0.5)', theme.colors.bg]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <BlurView intensity={30} tint="dark" style={styles.backBlur}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </BlurView>
      </TouchableOpacity>

      <Animated.FlatList
        data={products}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <ProductCard product={item} index={index} />
        )}
        ListHeaderComponent={renderHeader}
        estimatedItemSize={250}
        contentContainerStyle={[
          styles.listPadding,
          { paddingHorizontal: isDesktop ? width * 0.1 : theme.spacing.lg }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  headerImageContainer: { height: 400, width: '100%', position: 'absolute' },
  headerImage: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 100 },
  backBlur: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  listPadding: { paddingTop: 280, paddingBottom: 100 },
  headerContent: { marginBottom: 30 },
  infoCardWrapper: { marginBottom: 40 },
  infoCard: { padding: theme.spacing.xl },
  shopTypeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  shopCategory: { color: theme.colors.primaryLight, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,215,0,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  ratingText: { color: theme.colors.accent, fontSize: 14, fontWeight: '900' },
  shopName: { color: theme.colors.text, fontSize: 36, fontWeight: '900', letterSpacing: -1, marginBottom: 20 },
  metaGrid: { gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 25 },
  connectBtn: { height: 64, borderRadius: 20, overflow: 'hidden' },
  connectGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  connectText: { color: theme.colors.text, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  directionsBtn: { height: 64, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 15, backgroundColor: 'rgba(29, 158, 117, 0.05)' },
  directionsText: { color: theme.colors.primary, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  sectionHeader: { marginBottom: 20 },
  sectionTitle: { color: theme.colors.text, fontSize: 12, fontWeight: '900', letterSpacing: 3, opacity: 0.5 },
  sectionSubtitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800', marginTop: 4 }
});
