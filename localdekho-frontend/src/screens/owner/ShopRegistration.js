import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Info,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Clock,
  Calendar
} from 'lucide-react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from '../../components/MapComponent';
import Animated, { FadeInUp } from 'react-native-reanimated';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { theme } from '../../theme';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import { notificationAsync, NotificationFeedbackType } from 'expo-haptics';

export default function ShopRegistration({ navigation }) {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openTime, setOpenTime] = useState('10:00 AM');
  const [closeTime, setCloseTime] = useState('09:00 PM');
  const [operatingDays, setOperatingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

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

  const handleRegister = async () => {
    if (!name || !address || !category) {
      if (Platform.OS !== 'web') notificationAsync(NotificationFeedbackType.Error);
      Alert.alert('Incomplete Data', 'All architectural sectors must be defined.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/shops/register`, {
        name,
        address,
        category,
        lat: location ? location.lat : null,
        lng: location ? location.lng : null,
        ownerId: user.uid,
        phone: user.phone,
        timings: `${openTime} - ${closeTime}`,
        operatingDays
      });
      
      setSuccess(true);
      if (Platform.OS !== 'web') notificationAsync(NotificationFeedbackType.Success);
      setTimeout(() => navigation.replace('Dashboard'), 1500);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to initialize business node.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.dark} style={StyleSheet.absoluteFill} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
          <View style={styles.iconCircle}>
            <Rocket size={40} color={theme.colors.text} />
          </View>
          <Text style={styles.title}>LAUNCH PROTOCOL</Text>
          <Text style={styles.subtitle}>Define your business architecture for the LocalDekho ecosystem.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <GlassCard style={styles.formCard}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <ShoppingBag size={14} color={theme.colors.primaryLight} />
                <Text style={styles.label}>BUSINESS IDENTITY</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., Apex Retail Solutions"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MapPin size={14} color={theme.colors.accent} />
                <Text style={styles.label}>SECTOR LOCATION</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., Block 4, Digital Enclave"
                placeholderTextColor={theme.colors.textSecondary}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Info size={14} color={theme.colors.primary} />
                <Text style={styles.label}>INDUSTRY VERTICAL</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., Tech / Fashion / Grocery"
                placeholderTextColor={theme.colors.textSecondary}
                value={category}
                onChangeText={setCategory}
              />
            </View>

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

        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.infoSection}>
          <View style={styles.infoCard}>
            <ShieldCheck size={20} color={theme.colors.success} />
            <Text style={styles.infoText}>Your shop will undergo rapid verification upon submission.</Text>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <GradientButton
            title="INITIALIZE BUSINESS"
            loading={loading}
            success={success}
            onPress={handleRegister}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  scrollContent: { padding: 25, paddingBottom: 100 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  iconCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: theme.colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: `0 10px 30px ${theme.colors.primary}66`, // 0.4 opacity
      },
      default: {
        shadowColor: theme.colors.primary,
        shadowRadius: 20,
        shadowOpacity: 0.4,
      }
    })
  },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  formCard: { padding: 0 },
  inputGroup: { padding: 25 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  label: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  input: { color: theme.colors.text, fontSize: 18, fontWeight: '700', ...Platform.select({ web: { outlineStyle: 'none' }}) },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 25 },
  infoSection: { marginVertical: 30 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 20, borderRadius: 20, backgroundColor: 'rgba(0, 230, 118, 0.05)', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.1)' },
  infoText: { flex: 1, color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' },
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
  footer: { marginTop: 10 }
});
