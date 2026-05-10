import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import axios from 'axios';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

// --- Global Axios Interceptors for Logging in VS Code Terminal ---
axios.interceptors.request.use((request) => {
  console.log(`\n[API REQUEST] ${request.method?.toUpperCase()} ${request.url}`);
  if (request.data) {
    console.log(`[REQ DATA]`, JSON.stringify(request.data, null, 2));
  }
  return request;
}, (error) => {
  console.log(`[API REQ ERROR]`, error);
  return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
  console.log(`[API RESPONSE] [${response.status}] ${response.config.url}`);
  return response;
}, (error) => {
  console.log(`[API ERROR] [${error.response?.status}] ${error.config?.url}`);
  if (error.response?.data) {
    console.log(`[ERROR DATA]`, JSON.stringify(error.response.data, null, 2));
  }
  return Promise.reject(error);
});

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <AppNavigator />
        <StatusBar style="auto" />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
