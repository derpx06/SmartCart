import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ARScene from '@/src/features/ar/components/ARScene';
import { ThemedText } from '@/components/themed-text';

export default function ARScreen() {
  const router = useRouter();
  const { modelUrl } = useLocalSearchParams<{ modelUrl: string }>();
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function prepareModel() {
      if (!modelUrl) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Expo 55+ API: use Paths and File classes
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { File, Paths } = require('expo-file-system');

        const filename = modelUrl.split('/').pop()?.split('?')[0] || 'model.glb';
        const modelFile = new File(Paths.cache, filename);

        // Check if file already exists locally
        // Note: in the new API, we can check exists via the file instance or Paths.info
        const info = await Paths.info(modelFile.uri);

        if (info.exists) {
          const uri = modelFile.uri.startsWith('file://') ? modelFile.uri : `file://${modelFile.uri}`;
          console.log('[AR] Using cached model:', uri);
          setLocalUri(uri);
        } else {
          console.log('[AR] Downloading model from:', modelUrl);
          const download = await File.downloadFileAsync(modelUrl, modelFile);
          const uri = download.uri.startsWith('file://') ? download.uri : `file://${download.uri}`;
          console.log('[AR] Download complete:', uri);
          setLocalUri(uri);
        }
      } catch (err) {
        console.error('[AR] Pre-load failed:', err);
        setError('Failed to download 3D model. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }

    void prepareModel();
  }, [modelUrl]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.glassCard}>
          <ActivityIndicator size="large" color="#fff" />
          <ThemedText style={styles.loadingText}>Preparing 3D Atelier...</ThemedText>
          <ThemedText style={styles.subText}>Downloading premium assets for your space.</ThemedText>
        </View>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.glassCard}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Pressable onPress={() => router.back()} style={styles.retryBtn}>
            <ThemedText style={styles.retryText}>Go Back</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ARScene modelUrl={localUri || modelUrl} />
      <Pressable onPress={() => router.back()} style={styles.closeButton}>
        <Ionicons name="close" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    width: '80%',
    gap: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
