import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { theme } from '../theme';

export const Marker = () => null;

export default function MapView({ style }) {
  return (
    <View style={[style, styles.container]}>
      <MapPin size={30} color={theme.colors.error} />
      <Text style={styles.text}>Maps are not available on web</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  text: {
    color: theme.colors.textSecondary,
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
  }
});
