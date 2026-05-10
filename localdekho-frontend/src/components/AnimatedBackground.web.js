import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedBackground = () => {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#0A0A0F', '#13131A', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />
      {/* Premium Web Fallback: CSS Blur Orbs */}
      <View style={[styles.webOrb, { 
        top: -height * 0.2, 
        left: -width * 0.2, 
        width: width * 0.8, 
        height: width * 0.8, 
        backgroundColor: '#1D9E75',
        opacity: 0.15,
        borderRadius: width,
      }]} />
      <View style={[styles.webOrb, { 
        bottom: -height * 0.1, 
        right: -width * 0.1, 
        width: width * 0.6, 
        height: width * 0.6, 
        backgroundColor: '#00C9FF',
        opacity: 0.1,
        borderRadius: width,
      }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  webOrb: {
    position: 'absolute',
    // @ts-ignore
    filter: 'blur(100px)', 
    zIndex: 0,
  }
});

export default AnimatedBackground;
