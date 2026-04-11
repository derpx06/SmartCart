import { Platform } from 'react-native';

const REMOTE_STAGING_URL = 'https://smartcart-avj3.onrender.com';

/**
 * Global Configuration for SmartCart API.
 * Currently hardcoded to Render production for consistent development across all devices.
 */
export const Config = {
  // Use the user's provided Render URL as the global source of truth
  API_URL: REMOTE_STAGING_URL,

  // Keep local reference for future toggling if needed
  LOCAL_BACKEND: Platform.select({
    android: 'http://10.0.2.2:3001',
    ios: 'http://127.0.0.1:3001',
    default: 'http://localhost:3001',
  }),
};