import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

let Viro: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  Viro = require('@reactvision/react-viro');
} catch {
  Viro = null;
}

function RecipeARPlacementScene() {
  if (!Viro) {
    return null;
  }

  const {
    ViroARScene,
    ViroARPlaneSelector,
    Viro3DObject,
    ViroAmbientLight,
    ViroText,
  } = Viro;
  const planeSelectorRef = useRef<any>(null);

  return (
    <ViroARScene
      anchorDetectionTypes={['planesHorizontal']}
      onAnchorFound={(anchor: any) => {
        console.log('[ViroAR] anchor found', anchor);
        planeSelectorRef.current?.handleAnchorFound(anchor);
      }}
      onAnchorUpdated={(anchor: any) => {
        console.log('[ViroAR] anchor updated', anchor);
        planeSelectorRef.current?.handleAnchorUpdated(anchor);
      }}
      onAnchorRemoved={(anchor: any) => {
        console.log('[ViroAR] anchor removed', anchor);
        anchor && planeSelectorRef.current?.handleAnchorRemoved(anchor);
      }}
    >
      <ViroAmbientLight color="#ffffff" intensity={1000} />
      <ViroARPlaneSelector
        ref={planeSelectorRef}
        alignment="Horizontal"
        minHeight={0.15}
        minWidth={0.15}
        pauseUpdates={false}
        hideOverlayOnSelection={false}
        useActualShape
      >
        <ViroText
          text="Tap plane to place model"
          position={[0, 0.16, 0]}
          scale={[0.2, 0.2, 0.2]}
          width={4}
          height={1}
          style={{ fontSize: 20, color: '#ffffff', textAlign: 'center' }}
        />
        <Viro3DObject
          source={require('../../../res/pan_of_borshch.glb')}
          type="GLB"
          position={[0, 0.1, 0]}
          scale={[0.2, 0.2, 0.2]}
          rotation={[0, 0, 0]}
          onError={(event: any) => {
            console.warn('[ViroAR] pan_of_borshch.glb failed to load', event?.nativeEvent);
          }}
          onLoadStart={() => {
            console.log('[ViroAR] pan_of_borshch.glb load start');
          }}
          onLoadEnd={() => {
            console.log('[ViroAR] pan_of_borshch.glb load end');
          }}
        />
      </ViroARPlaneSelector>
    </ViroARScene>
  );
}

export default function ARScene() {
  if (!Viro) {
    return (
      <View style={styles.centered}>
        <Text style={styles.fallbackText}>
          AR runtime is not available in this build. Rebuild the iOS app with native modules.
        </Text>
      </View>
    );
  }

  const { ViroARSceneNavigator } = Viro;

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        initialScene={{ scene: RecipeARPlacementScene }}
        style={styles.navigator}
      />
      <View pointerEvents="none" style={styles.overlay}>
        <Text style={styles.overlayTitle}>AR Placement</Text>
        <Text style={styles.overlayBody}>
          Move the phone over a table or floor. Tap any highlighted plane to place or move `pan_of_borshch.glb`.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  navigator: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  overlayBody: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  fallbackText: {
    color: '#fff',
    textAlign: 'center',
  },
});
