import React, { useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay 
} from 'react-native-reanimated';
import { theme } from '../theme';

const GlassCard = ({ 
  children, 
  style, 
  glow = false, 
  delay = 0,
  intensity = 40
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 100 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {glow && (
        <View style={styles.glowEffect} />
      )}
      <BlurView 
        intensity={Platform.OS === 'ios' ? intensity : 80} 
        tint="dark" 
        style={styles.blur}
      >
        <LinearGradient
          colors={theme.colors.border ? [theme.colors.border, 'transparent'] : ['rgba(255,255,255,0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.borderGradient}
        >
          <View style={styles.content}>
            {children}
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  blur: {
    flex: 1,
  },
  borderGradient: {
    flex: 1,
    padding: 1, // Border width
    borderRadius: theme.radius.xl,
  },
  content: {
    flex: 1,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  glowEffect: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: theme.colors.primaryGlow,
    borderRadius: 1000,
    opacity: 0.2,
    zIndex: -1,
  }
});

export default GlassCard;
