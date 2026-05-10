import React, { useEffect, useState, useRef } from 'react';
import { Text } from 'react-native';

// Pure React animated counter - NO worklets, NO useDerivedValue, NO setNativeProps
// This avoids all Reanimated worklet runtime issues
const AnimatedNumber = ({ value, style, duration = 1500 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out exponential
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValueRef.current + (value - startValueRef.current) * eased);
      
      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value]);

  return (
    <Text style={style}>{displayValue.toLocaleString()}</Text>
  );
};

export default AnimatedNumber;
