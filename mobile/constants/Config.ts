import { Platform } from 'react-native';

const webApiUrlFromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();

export const Config = {
  API_URL: Platform.select({
    android: 'http://10.0.2.2:3001',
    ios: 'https://0b85-27-63-22-178.ngrok-free.app',
    web: webApiUrlFromEnv || 'http://localhost:3001',
    default: 'https://0b85-27-63-22-178.ngrok-free.app',
  }),
};
