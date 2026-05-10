import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import CustomerNavigator from './CustomerNavigator';
import OwnerNavigator from './OwnerNavigator';
import AdminDashboard from '../screens/admin/AdminDashboard';
import { theme } from '../theme';

const Stack = createStackNavigator();

const CustomTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.bg,
    card: theme.colors.card,
    text: theme.colors.text,
    border: theme.colors.border,
  },
};

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={CustomTheme}>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.bg,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.05)',
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '900',
            fontSize: 14,
            letterSpacing: 2,
          },
          headerTitleAlign: 'center',
        }}
      >
        {!user ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
        ) : user.role === 'owner' ? (
          <Stack.Screen 
            name="OwnerNavigator" 
            component={OwnerNavigator} 
            options={{ headerShown: false }}
          />
        ) : user.role === 'admin' ? (
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboard} 
            options={{ 
              title: 'ADMIN OVERWATCH',
              headerTitleStyle: { fontWeight: '900', color: theme.colors.primaryLight, letterSpacing: 2 }
            }}
          />
        ) : (
          <Stack.Screen 
            name="CustomerNavigator" 
            component={CustomerNavigator} 
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bg
  }
});
