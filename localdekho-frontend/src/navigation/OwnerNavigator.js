import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import OwnerDashboard from '../screens/owner/OwnerDashboard';
import ShopRegistration from '../screens/owner/ShopRegistration';
import ManageProducts from '../screens/owner/ManageProducts';
import OwnerUpload from '../screens/owner/OwnerUpload';
import OwnerInquiries from '../screens/owner/OwnerInquiries';
import OwnerSettings from '../screens/owner/OwnerSettings';
import { theme } from '../theme';

const Stack = createStackNavigator();

export default function OwnerNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={OwnerDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="ShopRegistration" component={ShopRegistration} options={{ title: 'REGISTRATION' }} />
      <Stack.Screen name="ManageProducts" component={ManageProducts} options={{ title: 'INVENTORY' }} />
      <Stack.Screen name="AddProduct" component={OwnerUpload} options={{ title: 'NEW ASSET' }} />
      <Stack.Screen name="InquiriesList" component={OwnerInquiries} options={{ title: 'COMMUNICATIONS' }} />
      <Stack.Screen name="Settings" component={OwnerSettings} options={{ title: 'CONFIGURATION' }} />
    </Stack.Navigator>
  );
}
