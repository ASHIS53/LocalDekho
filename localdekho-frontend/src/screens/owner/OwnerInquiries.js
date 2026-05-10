import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform,
  useWindowDimensions,
  StatusBar
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  User,
  ExternalLink,
  MessageCircle,
  MoreVertical
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import axios from 'axios';
import { theme } from '../../theme';
import GlassCard from '../../components/GlassCard';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

export default function OwnerInquiries({ route, navigation }) {
  const { width } = useWindowDimensions();
  const { shopId } = route.params;
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/inquiries/shop/${shopId}`);
      setInquiries(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderInquiry = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
      <GlassCard style={styles.inquiryCard}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.userPhone?.slice(-2) || 'U'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>IDENTITY: +91 XXX-XXX-{item.userPhone?.slice(-4)}</Text>
              <Text style={styles.timeText}>SYSTEM LOG: 2H AGO</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreBtn}>
            <MoreVertical size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.replyBtn}
          onPress={() => {
            if (Platform.OS !== 'web') impactAsync(ImpactFeedbackStyle.Medium);
          }}
        >
          <LinearGradient colors={theme.gradients.primary} style={styles.replyGrad}>
            <MessageCircle size={18} color={theme.colors.text} />
            <Text style={styles.replyText}>SECURE WHATSAPP REPLY</Text>
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.gradients.dark} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingHorizontal: width >= 1024 ? width * 0.1 : 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>SECURE COMMUNICATIONS</Text>
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{inquiries.length} SIGNALS</Text>
          </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlashList
          data={inquiries}
          keyExtractor={(item) => item.id}
          estimatedItemSize={200}
          renderItem={renderInquiry}
          contentContainerStyle={[
            styles.listPadding,
            { paddingHorizontal: width >= 1024 ? width * 0.1 : 20 }
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MessageSquare size={64} color={theme.colors.surface} />
              <Text style={styles.emptyText}>NO SIGNALS RECEIVED</Text>
              <Text style={styles.emptySubtext}>SECURE CHANNEL IS ACTIVE AND LISTENING</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitleBox: { alignItems: 'center' },
  headerTitle: { color: theme.colors.text, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  unreadBadge: { backgroundColor: 'rgba(29, 158, 117, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 5 },
  unreadText: { color: theme.colors.primaryLight, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' },
  listPadding: { paddingBottom: 100 },
  inquiryCard: { marginBottom: 20, padding: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: theme.colors.text, fontSize: 16, fontWeight: '900' },
  userName: { color: theme.colors.text, fontSize: 14, fontWeight: '800' },
  timeText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 2 },
  messageBox: { paddingHorizontal: 20, paddingBottom: 20 },
  messageText: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: '600', lineHeight: 22 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  replyBtn: { margin: 15, height: 54, borderRadius: 16, overflow: 'hidden' },
  replyGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  replyText: { color: theme.colors.text, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  loading: { marginTop: 100 },
  empty: { marginTop: 100, alignItems: 'center', opacity: 0.5 },
  emptyText: { color: theme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 20, letterSpacing: 1 },
  emptySubtext: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '800', marginTop: 8 }
});
