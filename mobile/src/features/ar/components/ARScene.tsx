import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

let Viro: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  Viro = require('@reactvision/react-viro');
} catch {
  Viro = null;
}

const {
  ViroARScene,
  Viro3DObject,
  ViroAmbientLight,
  ViroSpotLight,
  ViroNode,
  ViroQuad,
  ViroAnimations,
  ViroTrackingStateConstants,
  ViroMaterials,
} = Viro || {};

// Register animations for the "landing" effect
if (Viro) {
  ViroAnimations.registerAnimations({
    scaleIn: {
      properties: {
        scaleX: 0.2,
        scaleY: 0.2,
        scaleZ: 0.2,
        opacity: 1,
      },
      duration: 500,
      easing: 'EaseInEaseOut',
    },
    reticlePulse: {
      properties: {
        scaleX: 0.06,
        scaleY: 0.06,
        scaleZ: 0.06,
      },
      duration: 1000,
      easing: 'EaseInEaseOut',
    },
  });

  ViroMaterials.createMaterials({
    reticleMaterial: {
      diffuseColor: 'rgba(0, 255, 255, 0.8)',
    },
    shadowMaterial: {
      diffuseColor: 'rgba(0, 0, 0, 0.4)',
    },
    gridOverlay: {
      diffuseColor: 'rgba(0, 255, 255, 0.15)',
      lightingModel: 'Constant',
    }
  });
}

interface PlacedObject {
  position: number[];
  id: number;
  scale: number[];
}

function RecipeARPlacementScene(props: any) {
  const { placedObjects, setPlacedObjects, modelUrl, setTrackingState, setReticleFound, reticleFound } = props.arSceneNavigator.viroAppProps;
  const [reticlePosition, setReticlePosition] = useState<number[]>([0, 0, -1]);
  const arSceneRef = useRef<any>(null);

  const _onTrackingUpdated = useCallback((state: any, reason: any) => {
    setTrackingState(state);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      console.log('[ViroAR] Tracking Normal - ready for placement');
    }
  }, []);

  const _onCameraTransformUpdate = useCallback((event: any) => {
    if (!arSceneRef.current) return;

    arSceneRef.current.performARHitTestWithRay(event.forward).then((results: any[]) => {
      if (results && results.length > 0) {
        setReticleFound(true);
        const pos = results[0].transform.position;
        const snappedPos = [
          Math.round(pos[0] * 10) / 10,
          pos[1],
          Math.round(pos[2] * 10) / 10
        ];
        setReticlePosition(snappedPos);
      } else {
        setReticleFound(false);
      }
    });
  }, []);

  const _onReticleTap = useCallback(async () => {
    console.log('[ViroAR] Attempting Place - Found:', reticleFound, 'Pos:', reticlePosition);

    // Provide haptic feedback for the tap itself
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) { /* ignore haptic errors */ }

    // Use current reticle position or a fallback if briefly lost
    const finalPos = reticleFound ? [...reticlePosition] : [0, -0.5, -1];

    const newId = Date.now();
    // Increase default scale to [0.2, 0.2, 0.2] for better visibility
    setPlacedObjects((prev: PlacedObject[]) => [...prev, {
      position: finalPos,
      id: newId,
      scale: [0.2, 0.2, 0.2]
    }]);

    console.log('[ViroAR] Placed object at:', finalPos);
  }, [reticleFound, reticlePosition, setPlacedObjects]);

  const _onPinch = useCallback((pinchState: any, scaleFactor: number, source: any) => {
    if (pinchState === 2) {
      setPlacedObjects((prev: PlacedObject[]) => prev.map(obj => {
        const factor = scaleFactor > 1 ? 1.05 : 0.95;
        const newScale = obj.scale[0] * factor;
        const cappedScale = Math.max(0.01, Math.min(0.8, newScale));
        return { ...obj, scale: [cappedScale, cappedScale, cappedScale] };
      }));
    }
  }, [setPlacedObjects]);

  if (!Viro) return null;

  return (
    <ViroARScene
      ref={arSceneRef}
      onTrackingUpdated={_onTrackingUpdated}
      onCameraTransformUpdate={_onCameraTransformUpdate}
      anchorDetectionTypes={['planesHorizontal', 'planesVertical']}
      onClick={_onReticleTap}
    >
      <ViroAmbientLight color="#ffffff" intensity={500} />
      <ViroSpotLight
        innerAngle={5}
        outerAngle={90}
        direction={[0, -1, 0]}
        position={[0, 8, 0]}
        color="#ffffff"
        intensity={1500}
        castsShadow={true}
        shadowMapSize={2048}
        shadowOpacity={0.8}
      />

      {/* Scene-wide Click Surface for 'Tap Anywhere' placement */}
      <ViroQuad
        position={reticleFound ? reticlePosition : [0, -0.5, -1]}
        rotation={[-90, 0, 0]}
        scale={[100, 100, 1]}
        opacity={0}
        onClick={_onReticleTap}
      />

      {reticleFound && (
        <ViroNode position={reticlePosition}>
          <ViroNode
            animation={{ name: 'reticlePulse', run: true, loop: true }}
          >
            <ViroQuad
              rotation={[-90, 0, 0]}
              scale={[0.08, 0.08, 0.08]}
              materials={['reticleMaterial']}
            />
          </ViroNode>
          {[-0.3, -0.15, 0, 0.15, 0.3].map(x =>
            [-0.3, -0.15, 0, 0.15, 0.3].map(z => (
              <ViroQuad
                key={`${x}-${z}`}
                position={[x, -0.001, z]}
                rotation={[-90, 0, 0]}
                scale={[0.12, 0.12, 0.12]}
                materials={['gridOverlay']}
              />
            ))
          )}
        </ViroNode>
      )}

      {/* Render placed objects */}
      {placedObjects.map((obj: PlacedObject) => (
        <ViroNode
          key={obj.id}
          position={obj.position}
          onPinch={_onPinch}
        >
          <Viro3DObject
            source={modelUrl ? { uri: modelUrl } : require('../../../res/pan_of_borshch.glb')}
            type="GLB"
            position={[0, 0.05, 0]}
            scale={obj.scale}
            opacity={1}
            rotation={[0, 0, 0]}
            animation={{ name: 'scaleIn', run: true }}
            dragType="FixedToWorld"
            onDrag={() => { }}
          />
          <ViroQuad
            rotation={[-90, 0, 0]}
            scale={[obj.scale[0] * 6, obj.scale[1] * 6, obj.scale[2] * 6]}
            materials={['shadowMaterial']}
            arShadowReceiver={true}
          />
        </ViroNode>
      ))}
    </ViroARScene>
  );
}

export default function ARScene({ modelUrl }: { modelUrl?: string }) {
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [trackingState, setTrackingState] = useState<any>(null);
  const [reticleFound, setReticleFound] = useState(false);

  const adjustAllScales = (factor: number) => {
    setPlacedObjects((prev) => prev.map(obj => {
      const newScale = obj.scale[0] * factor;
      const cappedScale = Math.max(0.01, Math.min(0.8, newScale));
      return { ...obj, scale: [cappedScale, cappedScale, cappedScale] };
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clearAll = () => {
    setPlacedObjects([]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!Viro) {
    return (
      <View style={styles.centered}>
        <Text style={styles.fallbackText}>
          AR runtime is not available. Please ensure native modules are linked correctly.
        </Text>
      </View>
    );
  }

  const { ViroARSceneNavigator } = Viro;

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        initialScene={{ scene: RecipeARPlacementScene }}
        viroAppProps={{ placedObjects, setPlacedObjects, modelUrl, setTrackingState, setReticleFound, reticleFound }}
        style={styles.navigator}
        autofocus={true}
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.glassCard} pointerEvents="auto">
          <View style={styles.headerRow}>
            <View style={styles.dot} />
            <Text style={styles.overlayTitle}>CULINARY ATELIER AR</Text>
          </View>
          <Text style={styles.overlayBody}>
            Scan surfaces to reveal blocks. Tap anywhere to place. Pinch objects to scale.
          </Text>

          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={() => adjustAllScales(1.1)}>
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={() => adjustAllScales(0.9)}>
              <Text style={styles.btnText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlBtn, styles.clearBtn]} onPress={clearAll}>
              <Text style={[styles.btnText, { fontSize: 12 }]}>CLEAR</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.glowLine} />
        </View>
      </View>

      {/* Surface Tracking Guide Overlay */}
      {trackingState === ViroTrackingStateConstants.TRACKING_NORMAL && !reticleFound && placedObjects.length === 0 && (
        <View style={styles.trackingGuideOverlay}>
          <View style={styles.guideCard}>
            <ActivityIndicator color="#fff" style={{ marginBottom: 16 }} />
            <Text style={styles.guideTitle}>SEARCHING FOR SURFACE</Text>
            <Text style={styles.guideText}>Move your phone slowly over the ground or table</Text>
            <View style={styles.pulseContainer}>
              <View style={styles.pulseDot} />
            </View>
          </View>
        </View>
      )}
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
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  trackingGuideOverlay: {
    position: 'absolute',
    top: '35%',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  guideCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 28,
    paddingVertical: 32,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    width: '100%',
  },
  guideTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  guideText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  pulseContainer: {
    marginTop: 20,
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  pulseDot: {
    width: '40%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  glassCard: {
    backgroundColor: 'rgba(25, 25, 25, 0.75)',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 10,
    shadowColor: '#fff',
    shadowRadius: 4,
    shadowOpacity: 0.8,
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  overlayBody: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  glowLine: {
    height: 1,
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 15,
    alignSelf: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 20,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  clearBtn: {
    paddingHorizontal: 15,
    width: 'auto',
    backgroundColor: 'rgba(255, 50, 50, 0.15)',
    borderColor: 'rgba(255, 100, 100, 0.3)',
  },
  btnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '300',
  },
  centered: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  fallbackText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
