import { Platform } from 'react-native';

const webApiUrlFromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
const fallbackApiUrl =
  Platform.select({
    android: 'http://10.211.149.94:3001',
    ios: 'http://10.211.149.94:3001',
    web: 'http://localhost:3001',
    default: 'http://10.211.149.94:3001',
  }) ?? 'http://10.211.149.94:3001';

export const Config = {
  API_URL: 'http://54.227.131.6',
};
