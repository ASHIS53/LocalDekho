import React from 'react';
import { 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  View,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  FadeIn 
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { theme } from '../theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const GradientButton = ({ 
  title, 
  onPress, 
  loading = false, 
  success = false, 
  style,
  textStyle,
  colors = theme.gradients.primary,
  icon: Icon
}) => {
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
    <AnimatedTouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={loading || success}
      style={[styles.container, animatedStyle, style]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : success ? (
            <Animated.View entering={FadeIn.springify()}>
              <Check color={theme.colors.text} size={24} strokeWidth={3} />
            </Animated.View>
          ) : (
            <>
              {Icon && <Icon color={theme.colors.text} size={20} style={styles.icon} />}
              <Text style={[styles.text, textStyle]}>{title}</Text>
            </>
          )}
        </View>
      </LinearGradient>
      <View style={styles.glow} />
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    borderRadius: theme.radius.lg,
    overflow: 'visible',
    ...theme.shadows.primary,
  },
  gradient: {
    flex: 1,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  icon: {
    marginRight: 10,
  },
  glow: {
    position: 'absolute',
    bottom: -10,
    left: '10%',
    right: '10%',
    height: 20,
    backgroundColor: theme.colors.primary,
    opacity: 0.2,
    ...Platform.select({
      web: { filter: 'blur(15px)' },
      default: {}
    }),
    zIndex: -1,
  }
});

export default GradientButton;
