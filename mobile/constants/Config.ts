import { Platform } from 'react-native';

export const Config = {
    // Use 10.0.2.2 for Android emulator to access localhost, 
    // or use your direct IP if testing on a physical device.
    API_URL: Platform.select({
        android: 'http://10.0.2.2:3001',
        ios: 'https://55de-27-63-18-111.ngrok-free.app',
        default: 'https://55de-27-63-18-111.ngrok-free.app',
    }),
};
