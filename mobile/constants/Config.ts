import Constants from 'expo-constants';
import { Platform } from 'react-native';

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/** Dev-only: Metro sets this so physical devices can reach the machine running the backend. */
function devHostFromExpo(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  const host = hostUri.split(':')[0];
  return host || null;
}

const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();

function resolveApiUrl(): string {
  if (fromEnv) {
    return stripTrailingSlash(fromEnv);
  }

  const devHost = __DEV__ ? devHostFromExpo() : null;
  if (devHost) {
    return `http://${devHost}:3001`;
  }

  return (
    Platform.select({
      // Android emulator: host machine’s localhost
      android: 'http://10.0.2.2:3001',
      // iOS simulator: host machine
      ios: 'http://127.0.0.1:3001',
      web: 'http://localhost:3001',
      default: 'http://localhost:3001',
    }) ?? 'http://localhost:3001'
  );
}

export const Config = {
  API_URL: 'http://98.93.190.17:3001',
};
