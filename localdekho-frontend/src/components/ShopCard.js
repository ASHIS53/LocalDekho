import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  FadeInUp
} from 'react-native-reanimated';
import { Star, MapPin, Clock } from 'lucide-react-native';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { theme } from '../theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ShopCard = ({ shop, onPress, index = 0 }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
    if (Platform.OS !== 'web') {
      impactAsync(ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 100).springify().damping(15).stiffness(100)}>
      <AnimatedTouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.container, animatedStyle]}
      >
      <View style={styles.imageWrapper}>
        <Image
          source={shop.coverImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={theme.gradients.image}
          style={styles.imageOverlay}
        />
        
        <View style={styles.badgeContainer}>
          <View style={[styles.statusBadge, { backgroundColor: shop.isOpen ? theme.colors.success : theme.colors.error }]}>
            <Text style={styles.statusText}>{shop.isOpen ? 'OPEN' : 'CLOSED'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{shop.name}</Text>
          <View style={styles.ratingBadge}>
            <Star size={12} color={theme.colors.accent} fill={theme.colors.accent} />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>

        <Text style={styles.category}>{shop.category || 'Lifestyle Store'}</Text>

        <View style={styles.footer}>
          <View style={styles.meta}>
            <MapPin size={14} color={theme.colors.primaryLight} />
            <Text style={styles.metaText}>{shop.distance || '0.8'} km</Text>
          </View>
          <View style={styles.meta}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>10 AM - 9 PM</Text>
          </View>
        </View>
      </View>
    </AnimatedTouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageWrapper: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  badgeContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    gap: 4,
  },
  ratingText: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  category: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  }
});

export default ShopCard;
