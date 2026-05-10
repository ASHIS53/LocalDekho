import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  useWindowDimensions,
  Image,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Globe, 
  LogOut, 
  User,
  ShoppingBag,
  Bell,
  Lock,
  ChevronRight,
  Sparkles,
  Clock,
  Calendar,
  Navigation
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import axios from 'axios';
import * as Location from 'expo-location';
import { theme } from '../../theme';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import MapView, { Marker } from '../../components/MapComponent';
import { AuthContext } from '../../context/AuthContext';
import { impactAsync, notificationAsync, ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';

export default function OwnerSettings({ navigation, route }) {
  const { width } = useWindowDimensions();
  const { logout, user } = useContext(AuthContext);
  const { shopId, shop } = route.params;

  const [shopName, setShopName] = useState(shop?.name || '');
  const [openTime, setOpenTime] = useState(shop?.timings?.split(' - ')[0] || '10:00 AM');
  const [closeTime, setCloseTime] = useState(shop?.timings?.split(' - ')[1] || '09:00 PM');
  const [operatingDays, setOperatingDays] = useState(shop?.operatingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  
  const [location, setLocation] = useState(shop?.lat && shop?.lng ? { lat: shop.lat, lng: shop.lng } : null);
  const [mapRegion, setMapRegion] = useState({
    latitude: shop?.lat || 28.6139,
    longitude: shop?.lng || 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [loading, setLoading] = useState(false);

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day) => {
    if (operatingDays.includes(day)) {
      setOperatingDays(operatingDays.filter(d => d !== day));
    } else {
      setOperatingDays([...operatingDays, day]);
    }
  };

  const getLocation = async () => {
    try {
      if (Platform.OS !== 'web') notificationAsync(NotificationFeedbackType.Success);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to set shop coordinates.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      setMapRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not fetch location.');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    if (Platform.OS !== 'web') impactAsync(ImpactFeedbackStyle.Medium);
    try {
      await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/api/shops/${shopId}`, {
        name: shopName,
        lat: location ? location.lat : shop.lat,
        lng: location ? location.lng : shop.lng,
        timings: `${openTime} - ${closeTime}`,
        operatingDays
      });
      setLoading(false);
      Alert.alert('Success', 'Profile configuration updated.');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      setLoading(false);
      Alert.alert('Error', 'Failed to update configuration.');
    }
  };

  const SettingItem = ({ icon: Icon, title, value, color }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: color + '15' }]}>
          <Icon size={18} color={color} />
        </View>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {value && <Text style={styles.settingValue}>{value}</Text>}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.dark} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE ARCHITECTURE</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <ShoppingBag size={40} color={theme.colors.primaryLight} />
              <TouchableOpacity style={styles.editAvatar}>
                <Camera size={16} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.profileName}>{shopName}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>UID: {user.uid?.slice(0, 8).toUpperCase()}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>CORE CONFIGURATION</Text>
          <GlassCard style={styles.formCard}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <ShoppingBag size={14} color={theme.colors.primaryLight} />
                <Text style={styles.label}>BUSINESS IDENTITY</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Business Name"
                placeholderTextColor={theme.colors.textSecondary}
                value={shopName}
                onChangeText={setShopName}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Clock size={14} color={theme.colors.success} />
                <Text style={styles.label}>OPERATING HOURS</Text>
              </View>
              <View style={styles.timeRow}>
                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeLabel}>OPEN</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={openTime}
                    onChangeText={setOpenTime}
                    placeholder="10:00 AM"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeLabel}>CLOSE</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={closeTime}
                    onChangeText={setCloseTime}
                    placeholder="09:00 PM"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Calendar size={14} color={theme.colors.accent} />
                <Text style={styles.label}>OPERATING DAYS</Text>
              </View>
              <View style={styles.daysRow}>
                {DAYS.map(day => {
                  const isActive = operatingDays.includes(day);
                  return (
                    <TouchableOpacity 
                      key={day} 
                      style={[styles.dayBtn, isActive && styles.dayBtnActive]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day[0]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Navigation size={14} color={theme.colors.primaryLight} />
                <Text style={styles.label}>GPS COORDINATES</Text>
              </View>
              
              {location ? (
                <Text style={styles.locationText}>Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</Text>
              ) : (
                <Text style={styles.locationTextError}>No GPS coordinates acquired</Text>
              )}

              <TouchableOpacity style={styles.locationBtn} onPress={getLocation}>
                <Text style={styles.locationBtnText}>ACQUIRE CURRENT LOCATION</Text>
              </TouchableOpacity>
              
              {Platform.OS !== 'web' && (
                <View style={styles.mapContainer}>
                  <MapView 
                    style={styles.map}
                    region={mapRegion}
                    onRegionChangeComplete={(region) => {
                      setMapRegion(region);
                      setLocation({ lat: region.latitude, lng: region.longitude });
                    }}
                  >
                    {location && (
                      <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} />
                    )}
                  </MapView>
                  <View style={[styles.mapOverlay, { pointerEvents: 'none' }]}>
                    <MapPin size={24} color={theme.colors.error} />
                  </View>
                </View>
              )}
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>SYSTEM SETTINGS</Text>
          <GlassCard style={{ padding: 10 }}>
            <SettingItem icon={Bell} title="Push Communications" value="High Priority" color={theme.colors.success} />
            <SettingItem icon={Lock} title="Access Protocol" value="Two-Factor Active" color={theme.colors.error} />
          </GlassCard>
        </Animated.View>

        <View style={styles.footer}>
          <GradientButton
            title="SAVE ARCHITECTURE"
            loading={loading}
            onPress={handleSave}
          />
          
          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={logout}
          >
            <LogOut size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>TERMINATE SESSION</Text>
          </TouchableOpacity>

          <View style={styles.versionInfo}>
            <Sparkles size={12} color={theme.colors.textSecondary} />
            <Text style={styles.versionText}>LocalDekho Enterprise v2027.0.1</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, marginBottom: 30 },
  headerTitle: { color: theme.colors.text, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 },
  profileSection: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: { marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 36, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  editAvatar: { position: 'absolute', bottom: -5, right: -5, width: 36, height: 36, borderRadius: 12, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: theme.colors.bg },
  profileName: { color: theme.colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  idBadge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 10 },
  idText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  section: { paddingHorizontal: 20, marginBottom: 35 },
  sectionTitle: { color: theme.colors.text, fontSize: 10, fontWeight: '900', letterSpacing: 2, opacity: 0.5, marginBottom: 15 },
  
  formCard: { padding: 0 },
  inputGroup: { padding: 25 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  label: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  input: { color: theme.colors.text, fontSize: 18, fontWeight: '700', ...Platform.select({ web: { outlineStyle: 'none' }}) },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 25 },
  locationBtn: { backgroundColor: 'rgba(29, 158, 117, 0.1)', padding: 12, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  locationBtnText: { color: theme.colors.primaryLight, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  locationText: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  locationTextError: { color: theme.colors.error, fontSize: 14, fontWeight: '700' },
  mapContainer: { height: 200, marginTop: 15, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
  map: { flex: 1 },
  mapOverlay: { position: 'absolute', top: '50%', left: '50%', marginLeft: -12, marginTop: -24 },
  timeRow: { flexDirection: 'row', gap: 15 },
  timeInputContainer: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  timeLabel: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '800', marginBottom: 5 },
  timeInput: { color: theme.colors.text, fontSize: 16, fontWeight: '700', ...Platform.select({ web: { outlineStyle: 'none' }}) },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  dayBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  dayBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dayText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '800' },
  dayTextActive: { color: theme.colors.bg, fontSize: 12, fontWeight: '900' },

  settingItem: { paddingVertical: 10, paddingHorizontal: 15 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  settingIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '800' },
  settingValue: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 2 },
  
  footer: { paddingHorizontal: 20, gap: 15, marginTop: 10 },
  logoutBtn: { height: 58, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,82,82,0.2)', backgroundColor: 'rgba(255,82,82,0.05)' },
  logoutText: { color: theme.colors.error, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  versionInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, opacity: 0.4 },
  versionText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 }
});
