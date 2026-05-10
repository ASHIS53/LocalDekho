import React, { useContext, useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  StatusBar,
  Platform,
  useWindowDimensions,
  Alert
} from 'react-native';
import { 
  impactAsync, 
  notificationAsync, 
  ImpactFeedbackStyle, 
  NotificationFeedbackStyle 
} from 'expo-haptics';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, 
  MapPin, 
  Bell, 
  Filter, 
  ShoppingBag,
  Sparkles,
  LogOut,
  AlertTriangle
} from 'lucide-react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from '../../components/MapComponent';
import { Map as MapIcon, List } from 'lucide-react-native';
import Animated, { 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { theme } from '../../theme';
import ShopCard from '../../components/ShopCard';
import SkeletonLoader from '../../components/SkeletonLoader';

const CATEGORIES = ['All', 'Grocery', 'Fashion', 'Tech', 'Pharmacy', 'Beauty'];

export default function CustomerHome({ navigation }) {
  const { width } = useWindowDimensions();
  const { user, logout } = useContext(AuthContext);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const searchScale = useSharedValue(1);
  const [locationMsg, setLocationMsg] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationMsg('Please enable location to see nearby shops');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);

      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/shops/nearby?lat=${loc.coords.latitude}&lng=${loc.coords.longitude}&radius=100000`);
      setShops(response.data);
    } catch (e) {
      console.error(e);
      setLocationMsg('Failed to acquire location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      const shopName = (shop.name || '').toLowerCase();
      const shopCat = (shop.category || '').toLowerCase();
      
      const matchesSearch = shopName.includes(search.toLowerCase()) || shopCat.includes(search.toLowerCase());
      const matchesCategory = activeCat === 'All' || shopCat === activeCat.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [shops, activeCat, search]);

  const isDesktop = width >= 1024;
  const numColumns = isDesktop ? 3 : 1;

  const animatedSearchStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchScale.value }],
  }));

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.welcomeSection}>
        <View>
          <View style={styles.locationRow}>
            <MapPin size={12} color={theme.colors.primaryLight} />
            <Text style={styles.locationText}>
              {userLocation ? `LAT: ${userLocation.latitude.toFixed(2)}, LNG: ${userLocation.longitude.toFixed(2)}` : 'ACQUIRING LOCATION...'}
            </Text>
          </View>
          <Text style={styles.greeting}>Hey, Explorer</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileBtn}
          onPress={() => {
            if (Platform.OS !== 'web') {
              impactAsync(ImpactFeedbackStyle.Medium);
            }
            logout();
          }}
        >
          <LogOut size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Animated.View style={[styles.searchContainer, animatedSearchStyle]}>
          <BlurView intensity={30} tint="dark" style={styles.searchBlur}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Discover local architecture..."
              placeholderTextColor={theme.colors.textSecondary}
              value={search}
              onChangeText={setSearch}
              onFocus={() => searchScale.value = withSpring(1.02)}
              onBlur={() => searchScale.value = withSpring(1)}
            />
            <TouchableOpacity 
              style={styles.filterBtn}
              onPress={() => {
                if (Platform.OS !== 'web') impactAsync(ImpactFeedbackStyle.Light);
                Alert.alert('Advanced Filters', 'More filtering options coming soon!');
              }}
            >
              <Filter size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.catScroll}>
        <FlashList
          data={CATEGORIES}
          horizontal
          estimatedItemSize={80}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setActiveCat(item)}
              style={[styles.catBtn, activeCat === item && styles.catBtnActive]}
            >
              <Text style={[styles.catBtnText, activeCat === item && styles.catBtnActiveText]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Sparkles size={16} color={theme.colors.primaryLight} />
          <Text style={styles.sectionTitle}>CURATED SECTORS</Text>
        </View>
        
        {/* View Mode Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('list')}
          >
            <List size={14} color={viewMode === 'list' ? '#fff' : theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('map')}
          >
            <MapIcon size={14} color={viewMode === 'map' ? '#fff' : theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.gradients.dark} style={StyleSheet.absoluteFill} />
      
      {loading ? (
        <View style={styles.loadingWrapper}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <SkeletonLoader width="100%" height={180} borderRadius={24} />
              <SkeletonLoader width="70%" height={24} borderRadius={8} style={{ marginTop: 15 }} />
              <SkeletonLoader width="40%" height={16} borderRadius={8} style={{ marginTop: 10 }} />
            </View>
          ))}
        </View>
      ) : locationMsg ? (
        <View style={styles.errorWrapper}>
          <AlertTriangle size={64} color={theme.colors.error} />
          <Text style={styles.errorText}>{locationMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); setLocationMsg(''); fetchShops(); }}>
            <Text style={styles.retryBtnText}>RETRY LOCATION</Text>
          </TouchableOpacity>
        </View>
      ) : (
      ) : viewMode === 'map' ? (
        <View style={styles.mapWrapper}>
          <MapView
            style={styles.mainMap}
            initialRegion={{
              latitude: userLocation?.latitude || 28.6139,
              longitude: userLocation?.longitude || 77.2090,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {userLocation && (
              <Marker 
                coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
                title="Your Location"
                pinColor={theme.colors.primary}
              />
            )}
            {filteredShops.map((shop) => (
              <Marker
                key={shop.id}
                coordinate={{ latitude: parseFloat(shop.lat), longitude: parseFloat(shop.lng) }}
                title={shop.name}
                description={shop.category}
                onCalloutPress={() => navigation.navigate('ShopDetail', { shopId: shop.id, shop })}
              />
            ))}
          </MapView>
        </View>
      ) : (
        <FlashList
          data={filteredShops}
          keyExtractor={(item) => item.id}
          estimatedItemSize={300}
          numColumns={numColumns}
          renderItem={({ item, index }) => (
            <ShopCard 
              shop={item} 
              index={index}
              onPress={() => navigation.navigate('ShopDetail', { shopId: item.id, shop: item })} 
            />
          )}
          ListHeaderComponent={renderHeader()}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: isDesktop ? width * 0.1 : theme.spacing.lg }
          ]}
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <ShoppingBag size={48} color={theme.colors.surface} />
              <Text style={styles.emptyText}>No shops nearby</Text>
            </View>
          }
        />
      )}

      {/* Floating Sticky Tab Bar (Visual Mockup) */}
      <BlurView intensity={Platform.OS === 'ios' ? 40 : 80} tint="dark" style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <ShoppingBag size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Search size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Filter size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  listContent: { paddingBottom: 120 },
  listHeader: { paddingTop: Platform.OS === 'ios' ? 60 : 40, marginBottom: 20 },
  welcomeSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  locationText: { color: theme.colors.primaryLight, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  greeting: { color: theme.colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  profileBtn: { width: 50, height: 50, borderRadius: 16, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  dot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, borderWidth: 2, borderColor: theme.colors.surface },
  searchContainer: { marginBottom: 25 },
  searchBlur: { flexDirection: 'row', alignItems: 'center', height: 60, borderRadius: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 16, marginLeft: 12, ...Platform.select({ web: { outlineStyle: 'none' }}) },
  filterBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  catScroll: { marginBottom: 30 },
  catBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  catBtnActive: { backgroundColor: 'rgba(29, 158, 117, 0.1)', borderColor: theme.colors.primary },
  catBtnText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '700' },
  catBtnActiveText: { color: theme.colors.primaryLight },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { color: theme.colors.text, fontSize: 12, fontWeight: '900', letterSpacing: 2, opacity: 0.6 },
  loadingWrapper: { padding: 20, paddingTop: 100 },
  skeletonCard: { marginBottom: 30 },
  tabBar: { position: 'absolute', bottom: 30, left: 20, right: 20, height: 70, borderRadius: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  tabItem: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  errorWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: theme.colors.error, fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 20, marginBottom: 20 },
  retryBtn: { backgroundColor: 'rgba(255,82,82,0.1)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,82,82,0.2)' },
  retryBtnText: { color: theme.colors.error, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  emptyWrapper: { alignItems: 'center', marginTop: 50, opacity: 0.5 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '700', marginTop: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  toggleRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: theme.colors.primary },
  mapWrapper: { flex: 1, marginTop: 10, borderRadius: 24, overflow: 'hidden', marginHorizontal: 20, marginBottom: 120, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mainMap: { flex: 1 },
});
