import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerHome from '../screens/customer/CustomerHome';
import ShopDetail from '../screens/customer/ShopDetail';
import { theme } from '../theme';

const Stack = createStackNavigator();

export default function CustomerNavigator() {
  return (
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
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 14,
          letterSpacing: 2,
        }
      }}
    >
      <Stack.Screen name="Home" component={CustomerHome} options={{ headerShown: false }} />
      <Stack.Screen 
        name="ShopDetail" 
        component={ShopDetail} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}
