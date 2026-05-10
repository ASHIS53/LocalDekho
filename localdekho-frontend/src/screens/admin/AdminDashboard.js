import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform,
  useWindowDimensions,
  StatusBar,
  ScrollView
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Shield, 
  Activity, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Layout,
  Users,
  ShoppingBag,
  TrendingUp,
  Search,
  ExternalLink
} from 'lucide-react-native';
import Animated, { 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import axios from 'axios';
import { theme } from '../../theme';
import GlassCard from '../../components/GlassCard';
import AnimatedNumber from '../../components/AnimatedNumber';
import { AuthContext } from '../../context/AuthContext';
import { notificationAsync, NotificationFeedbackType } from 'expo-haptics';

export default function AdminDashboard({ navigation }) {
  const { width } = useWindowDimensions();
  const { logout } = useContext(AuthContext);
  const [pendingShops, setPendingShops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const blink = useSharedValue(1);

  useEffect(() => {
    fetchPendingShops();
    blink.value = withRepeat(withTiming(0.4, { duration: 800 }), -1, true);
  }, []);

  const fetchPendingShops = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/admin/pending-shops`);
      setPendingShops(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const blinkStyle = useAnimatedStyle(() => ({
    opacity: blink.value,
  }));

  const handleApprove = async (id) => {
    if (Platform.OS !== 'web') notificationAsync(NotificationFeedbackType.Success);
    try {
      await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/api/admin/approve-shop/${id}`);
      setPendingShops(pendingShops.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const StatItem = ({ title, value, icon: Icon, color }) => (
    <View style={styles.statItem}>
      <GlassCard style={styles.statInner}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
          <Icon size={18} color={color} />
        </View>
        <Text style={styles.statLabel}>{title}</Text>
        <AnimatedNumber value={value} style={styles.statValue} />
      </GlassCard>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#050A1A', '#0A0A0F']} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingHorizontal: width >= 1024 ? width * 0.1 : 20 }]}>
        <View>
          <View style={styles.liveRow}>
            <Animated.View style={[styles.liveDot, blinkStyle]} />
            <Text style={styles.liveText}>GLOBAL OVERWATCH ACTIVE</Text>
          </View>
          <Text style={styles.headerTitle}>Control Room</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Shield size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: width >= 1024 ? width * 0.1 : 20 }
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
          <StatItem title="TOTAL REVENUE" value={45200} icon={TrendingUp} color={theme.colors.success} />
          <StatItem title="ACTIVE NODES" value={128} icon={Activity} color={theme.colors.primaryLight} />
          <StatItem title="USERS" value={1420} icon={Users} color={theme.colors.accent} />
          <StatItem title="SHOPS" value={54} icon={ShoppingBag} color={theme.colors.primary} />
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PENDING VERIFICATIONS</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingShops.length} REQUESTS</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <FlashList
            data={pendingShops}
            estimatedItemSize={150}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
                <GlassCard style={styles.pendingCard}>
                  <View style={styles.pendingInfo}>
                    <View>
                      <Text style={styles.shopName}>{item.name}</Text>
                      <Text style={styles.ownerInfo}>OWNER: {item.ownerId?.slice(0, 8)}</Text>
                    </View>
                    <TouchableOpacity>
                      <ExternalLink size={18} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.pendingActions}>
                    <TouchableOpacity 
                      style={[styles.adminBtn, { borderColor: theme.colors.error + '30' }]}
                    >
                      <XCircle size={18} color={theme.colors.error} />
                      <Text style={[styles.adminBtnText, { color: theme.colors.error }]}>REJECT</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.adminBtn, { backgroundColor: 'rgba(29,158,117,0.1)', borderColor: theme.colors.primary }]}
                      onPress={() => handleApprove(item.id)}
                    >
                      <CheckCircle size={18} color={theme.colors.primaryLight} />
                      <Text style={[styles.adminBtnText, { color: theme.colors.primaryLight }]}>APPROVE</Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              </Animated.View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <CheckCircle size={64} color={theme.colors.success} />
                <Text style={styles.emptyText}>ALL NODES VERIFIED</Text>
                <Text style={styles.emptySubtext}>NO PENDING AUTHORIZATION REQUESTS</Text>
              </View>
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A1A' },
  header: { paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.error, shadowColor: theme.colors.error, shadowRadius: 10, shadowOpacity: 0.8, elevation: 10 },
  liveText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  headerTitle: { color: theme.colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  logoutBtn: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  scrollContent: { paddingBottom: 100 },
  statsRow: { marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 35 },
  statItem: { marginRight: 12, width: 150 },
  statInner: { padding: 20 },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  statLabel: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  statValue: { color: theme.colors.text, fontSize: 20, fontWeight: '900', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { color: theme.colors.text, fontSize: 11, fontWeight: '900', letterSpacing: 2, opacity: 0.5 },
  badge: { backgroundColor: 'rgba(29, 158, 117, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { color: theme.colors.primaryLight, fontSize: 10, fontWeight: '900' },
  pendingCard: { marginBottom: 15, padding: 0 },
  pendingInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  shopName: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  ownerInfo: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '700', marginTop: 4 },
  pendingActions: { flexDirection: 'row', gap: 10, padding: 15, backgroundColor: 'rgba(255,255,255,0.02)' },
  adminBtn: { flex: 1, height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1 },
  adminBtnText: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  empty: { marginTop: 80, alignItems: 'center', opacity: 0.5 },
  emptyText: { color: theme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 20, letterSpacing: 1 },
  emptySubtext: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '800', marginTop: 8 }
});
