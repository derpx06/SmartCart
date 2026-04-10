import { Platform } from 'react-native';

export const Config = {
    // Use 10.0.2.2 for Android emulator to access localhost, 
    // or use your direct IP if testing on a physical device.
    API_URL: Platform.select({
        android: 'http://10.0.2.2:3001',
        ios: 'https://0b85-27-63-22-178.ngrok-free.app',
        default: 'https://0b85-27-63-22-178.ngrok-free.app',
    }),
};
