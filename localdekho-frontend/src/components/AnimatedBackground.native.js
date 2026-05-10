import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Blur, Circle, LinearGradient as SkiaGradient, vec } from '@shopify/react-native-skia';

const AnimatedBackground = () => {
  const { width, height } = useWindowDimensions();

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Circle cx={width * 0.2} cy={height * 0.2} r={150}>
        <SkiaGradient
          start={vec(0, 0)}
          end={vec(300, 300)}
          colors={['#1D9E75', '#0D7A5A']}
        />
        <Blur blur={80} />
      </Circle>
      
      <Circle cx={width * 0.8} cy={height * 0.8} r={200}>
        <SkiaGradient
          start={vec(0, 0)}
          end={vec(400, 400)}
          colors={['#00C9FF', '#1D9E75']}
        />
        <Blur blur={100} />
      </Circle>
    </Canvas>
  );
};

export default AnimatedBackground;
