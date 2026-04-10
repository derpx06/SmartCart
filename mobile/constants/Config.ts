import { Platform } from 'react-native';

// Prefer EXPO_PUBLIC_API_URL when set.
// Fallback uses the current machine LAN IP discovered from local network.
const NETWORK_BACKEND_URL = 'http://172.23.185.94:3001';
const API_FROM_ENV = process.env.EXPO_PUBLIC_API_URL?.trim();

export const Config = {
    // If Android emulator cannot reach LAN, switch android to http://10.0.2.2:3001.
    API_URL: Platform.select({
        android: API_FROM_ENV || NETWORK_BACKEND_URL,
        ios: API_FROM_ENV || NETWORK_BACKEND_URL,
        default: API_FROM_ENV || NETWORK_BACKEND_URL,
    }),
};
