import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  useWindowDimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShoppingBag,
  TrendingUp,
  Users,
  MessageSquare,
  Plus,
  Settings,
  LogOut,
  Zap,
  Activity,
  ChevronRight,
  Bell,
  Eye,
  UserCircle,
} from 'lucide-react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { theme } from '../../theme';
import GlassCard from '../../components/GlassCard';
import AnimatedNumber from '../../components/AnimatedNumber';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

// ─── Pulsing live dot ───────────────────────────────────────────────────────
function LiveDot() {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.6, { duration: 900 }), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.6], [1, 0.3]),
  }));
  return (
    <View style={liveDotStyles.wrap}>
      <Animated.View style={[liveDotStyles.dot, style]} />
      <View style={liveDotStyles.core} />
    </View>
  );
}
const liveDotStyles = StyleSheet.create({
  wrap: { width: 14, height: 14, justifyContent: 'center', alignItems: 'center' },
  dot: {
    position: 'absolute',
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: 'rgba(29,158,117,0.35)',
  },
  core: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#1D9E75',
  },
});

// ─── Top header bar (3 slots) ────────────────────────────────────────────────
function TopBar({ shopName, shop, navigation, logout }) {
  return (
    <Animated.View entering={FadeInDown.delay(0).springify()} style={topBarStyles.bar}>
      {/* Left — notifications */}
      <TouchableOpacity
        style={topBarStyles.iconBtn}
        onPress={() => {
          if (Platform.OS !== 'web') impactAsync(ImpactFeedbackStyle.Light);
        }}
      >
        <Bell size={20} color={theme.colors.textSecondary} />
        {/* unread badge */}
        <View style={topBarStyles.badge}>
          <Text style={topBarStyles.badgeText}>3</Text>
        </View>
      </TouchableOpacity>

      {/* Center — shop name */}
      <View style={topBarStyles.center}>
        <LiveDot />
        <Text style={topBarStyles.shopName} numberOfLines={1}>
          {shopName || 'My Shop'}
        </Text>
      </View>

      {/* Right — profile + settings */}
      <View style={topBarStyles.rightRow}>
        <TouchableOpacity
          style={topBarStyles.iconBtn}
          onPress={() => navigation.navigate('Settings', { shopId: shop?.id, shop })}
        >
          <Settings size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[topBarStyles.iconBtn, topBarStyles.profileBtn]}
          onPress={() => navigation.navigate('Settings', { shopId: shop?.id, shop })}
        >
          <UserCircle size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
const topBarStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 65 : (StatusBar.currentHeight ? StatusBar.currentHeight + 15 : 45),
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  shopName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.4,
    maxWidth: 160,
  },
  rightRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  profileBtn: {
    backgroundColor: 'rgba(29,158,117,0.12)',
    borderColor: 'rgba(29,158,117,0.25)',
  },
  badge: {
    position: 'absolute', top: -3, right: -3,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: theme.colors.error,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
});

// ─── Open / Close status card ─────────────────────────────────────────────────
function StatusCard({ shop, onToggle }) {
  return (
    <Animated.View entering={FadeInUp.delay(150).springify()}>
      <LinearGradient
        colors={
          shop?.isOpen
            ? ['rgba(29,158,117,0.18)', 'rgba(29,158,117,0.06)']
            : ['rgba(255,82,82,0.12)', 'rgba(255,82,82,0.04)']
        }
        style={statusStyles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={statusStyles.left}>
          <Text style={statusStyles.label}>OPERATIONAL STATUS</Text>
          <Text
            style={[
              statusStyles.value,
              { color: shop?.isOpen ? theme.colors.success : theme.colors.error },
            ]}
          >
            {shop?.isOpen ? '● LIVE ON MARKET' : '○ SYSTEM OFFLINE'}
          </Text>
        </View>
        <Switch
          value={shop?.isOpen || false}
          onValueChange={onToggle}
          trackColor={{ false: '#2C2C3E', true: theme.colors.primary }}
          thumbColor="#FFFFFF"
        />
      </LinearGradient>
    </Animated.View>
  );
}
const statusStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  left: { gap: 4 },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  value: { fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
});

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color, suffix, delay }) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()} style={statStyles.wrapper}>
      <GlassCard style={statStyles.card}>
        <View style={[statStyles.iconBox, { backgroundColor: color + '18' }]}>
          <Icon size={16} color={color} />
        </View>
        <Text style={statStyles.title}>{title}</Text>
        <View style={statStyles.row}>
          <AnimatedNumber value={value} style={statStyles.value} />
          {suffix ? <Text style={[statStyles.suffix, { color }]}>{suffix}</Text> : null}
        </View>
      </GlassCard>
    </Animated.View>
  );
}
const statStyles = StyleSheet.create({
  wrapper: { width: '48%' },
  card: { padding: 14, gap: 6 },
  iconBox: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    color: theme.colors.textSecondary,
    fontSize: 9, fontWeight: '900', letterSpacing: 1.2,
  },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  value: { color: theme.colors.text, fontSize: 22, fontWeight: '900' },
  suffix: { fontSize: 12, fontWeight: '900' },
});

// ─── Quick action pill ────────────────────────────────────────────────────────
function ActionPill({ icon: Icon, label, color, onPress }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.93, {}, () => { scale.value = withSpring(1); });
    if (Platform.OS !== 'web') impactAsync(ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <Animated.View style={animStyle}>
        <LinearGradient
          colors={[color + '22', color + '08']}
          style={pillStyles.pill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[pillStyles.iconWrap, { backgroundColor: color + '20' }]}>
            <Icon size={18} color={color} />
          </View>
          <Text style={pillStyles.label}>{label}</Text>
          <ChevronRight size={14} color={color} style={{ opacity: 0.6 }} />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}
const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 10,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  label: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ─── Recent inquiry row ───────────────────────────────────────────────────────
function InquiryRow({ name, message, time, unread }) {
  const initials = name?.slice(0, 2).toUpperCase() || '??';
  return (
    <View style={inqStyles.row}>
      <View style={inqStyles.avatar}>
        <Text style={inqStyles.initials}>{initials}</Text>
        {unread && <View style={inqStyles.unreadDot} />}
      </View>
      <View style={inqStyles.info}>
        <Text style={inqStyles.name}>{name}</Text>
        <Text style={inqStyles.msg} numberOfLines={1}>{message}</Text>
      </View>
      <Text style={inqStyles.time}>{time}</Text>
    </View>
  );
}
const inqStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(29,158,117,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  initials: { color: theme.colors.primary, fontSize: 12, fontWeight: '800' },
  unreadDot: {
    position: 'absolute', top: 0, right: 0,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: theme.colors.primary,
    borderWidth: 1.5, borderColor: theme.colors.card,
  },
  info: { flex: 1 },
  name: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  msg: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 1 },
  time: { color: theme.colors.textSecondary, fontSize: 10 },
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function OwnerDashboard({ navigation }) {
  const { width } = useWindowDimensions();
  const { logout, user } = useContext(AuthContext);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchShopDetails(); }, []);

  const fetchShopDetails = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/shops/owner/${user.uid}`
      );
      setShop(res.data);
    } catch (e) {
      if (e.response?.status === 404) navigation.replace('ShopRegistration');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (Platform.OS !== 'web') impactAsync(ImpactFeedbackStyle.Medium);
    try {
      const res = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/shops/${shop.id}/toggle`
      );
      setShop({ ...shop, isOpen: res.data.isOpen });
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <View style={s.loadWrap}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const hPad = width >= 1024 ? width * 0.1 : 20;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0D0D14', '#0A0A0F']} style={StyleSheet.absoluteFill} />

      {/* ── Top bar ── */}
      <TopBar
        shopName={shop?.name}
        shop={shop}
        navigation={navigation}
        logout={logout}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingHorizontal: hPad }]}
      >
        {/* ── Status toggle ── */}
        <View style={{ marginHorizontal: -hPad }}>
          <StatusCard shop={shop} onToggle={toggleStatus} />
        </View>

        {/* ── Stats grid ── */}
        <Animated.View entering={FadeIn.delay(100)} style={s.sectionHead}>
          <Text style={s.sectionLabel}>TODAY'S STATS</Text>
        </Animated.View>

        <View style={s.grid}>
          <StatCard title="VIEWS" value={1240} icon={Eye} color="#1D9E75" delay={200} />
          <StatCard title="CUSTOMERS" value={850} icon={Users} color="#FFD700" delay={250} />
          <StatCard title="INQUIRIES" value={42} icon={MessageSquare} color="#00C9FF" delay={300} />
          <StatCard title="GROWTH" value={12} icon={TrendingUp} color="#00E676" suffix="%" delay={350} />
        </View>

        {/* ── Quick actions ── */}
        <Animated.View entering={FadeIn.delay(400)} style={s.sectionHead}>
          <Text style={s.sectionLabel}>QUICK ACTIONS</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).springify()}>
          <ActionPill
            icon={Plus}
            label="Add New Product"
            color="#1D9E75"
            onPress={() => navigation.navigate('AddProduct', { shopId: shop?.id })}
          />
          <ActionPill
            icon={ShoppingBag}
            label="Manage Inventory"
            color="#FFD700"
            onPress={() => navigation.navigate('ManageProducts', { shopId: shop?.id })}
          />
          <ActionPill
            icon={MessageSquare}
            label="View Inquiries"
            color="#00C9FF"
            onPress={() => navigation.navigate('InquiriesList', { shopId: shop?.id })}
          />
          <ActionPill
            icon={Zap}
            label="Boost Shop Visibility"
            color="#FF6B6B"
            onPress={() => { }}
          />
        </Animated.View>

        {/* ── Recent inquiries ── */}
        <Animated.View entering={FadeIn.delay(500)} style={s.sectionHead}>
          <Text style={s.sectionLabel}>RECENT INQUIRIES</Text>
          <TouchableOpacity onPress={() => navigation.navigate('InquiriesList')}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(550).springify()}>
          <GlassCard style={s.inqCard}>
            <InquiryRow
              name="Priya Rawat"
              message="Kya yeh saree size 42 mein milegi?"
              time="10m"
              unread
            />
            <InquiryRow
              name="Neha Sharma"
              message="Price thodi kam ho sakti hai bulk mein?"
              time="1h"
              unread
            />
            <InquiryRow
              name="Asha Mehta"
              message="Aaj shop khuli hai kya?"
              time="3h"
            />
          </GlassCard>
        </Animated.View>

        {/* ── Logout ── */}
        <Animated.View entering={FadeInUp.delay(600).springify()}>
          <TouchableOpacity
            style={s.logoutRow}
            onPress={() => {
              if (Platform.OS !== 'web') impactAsync(ImpactFeedbackStyle.Heavy);
              logout();
            }}
          >
            <LogOut size={16} color={theme.colors.error} />
            <Text style={s.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  loadWrap: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#0A0A0F',
  },
  scroll: { paddingBottom: 20 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 24,
  },
  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionLabel: {
    color: theme.colors.textSecondary,
    fontSize: 9, fontWeight: '900', letterSpacing: 1.8,
  },
  seeAll: {
    color: theme.colors.primary,
    fontSize: 11, fontWeight: '700',
  },
  inqCard: { padding: 4, marginBottom: 24 },
  logoutRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,82,82,0.2)',
    backgroundColor: 'rgba(255,82,82,0.06)',
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: 13, fontWeight: '800', letterSpacing: 0.5,
  },
});