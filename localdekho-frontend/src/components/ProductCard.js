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
import { Plus } from 'lucide-react-native';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { theme } from '../theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ProductCard = ({ product, onPress, index = 0 }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
    if (Platform.OS !== 'web') {
      impactAsync(ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify().damping(15).stiffness(100)}>
      <AnimatedTouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.container, animatedStyle]}
      >
      <View style={styles.imageWrapper}>
        <Image
          source={
            product.images?.[0] || 
            product.image || 
            'https://via.placeholder.com/500?text=No+Image'
          }
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>₹{product.price}</Text>
        </View>
        
        {product.offer && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>{product.offer}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        
        <View style={styles.footer}>
          <View style={styles.sizesRow}>
            {['S', 'M', 'L'].map((s) => (
              <View key={s} style={styles.sizeDot}>
                <Text style={styles.sizeText}>{s}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.addBtn}>
            <LinearGradient
              colors={theme.gradients.primary}
              style={styles.addGrad}
            >
              <Plus size={16} color={theme.colors.text} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedTouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    flex: 1,
  },
  imageWrapper: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 230, 118, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  offerBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: theme.colors.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  offerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  name: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sizesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  sizeDot: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sizeText: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    overflow: 'hidden',
  },
  addGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default ProductCard;
