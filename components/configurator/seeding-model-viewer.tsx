"use client";

import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, useAnimations, ContactShadows, Environment } from "@react-three/drei";
import { MeshoptDecoder } from "meshoptimizer";
import * as THREE from "three";

interface ModelProps {
  url: string;
  isPlaying: boolean;
}

function SeedingModel({ url, isPlaying }: ModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url, true, true, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  // Clone the scene to avoid issues with reused cached scenes
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  const { actions, names } = useAnimations(animations, group);

  // Play/pause animations based on isPlaying prop
  useEffect(() => {
    if (names.length > 0) {
      names.forEach((name) => {
        const action = actions[name];
        if (action) {
          if (isPlaying) {
            action.reset().play();
          } else {
            action.paused = true;
          }
        }
      });
    }
  }, [actions, names, isPlaying]);

  return (
    <group ref={group} rotation={[Math.PI * 1.5, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-stone-500">Loading 3D model...</p>
      </div>
    </div>
  );
}

interface SeedingModelViewerProps {
  isPlaying?: boolean;
  className?: string;
}

const MODEL_URL = "/models/seeding-system.glb";

export function SeedingModelViewer({ isPlaying = true, className = "" }: SeedingModelViewerProps) {
  return (
    <div className={`relative bg-white rounded-lg overflow-hidden ${className}`} style={{ height: "500px" }}>
      <Suspense fallback={<LoadingSpinner />}>
        <Canvas
          shadows
          camera={{ position: [2, 2, 1], fov: 35 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          frameloop="always"
        >
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
          <Environment preset="studio" background={false} />

          {/* Model */}
          <SeedingModel url={MODEL_URL} isPlaying={isPlaying} />

          {/* Shadow underneath the model */}
          <ContactShadows
            position={[0, -0.3, 0]}
            opacity={0.4}
            scale={6}
            blur={2}
            far={2}
          />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={20}
            autoRotate={false}
            minPolarAngle={Math.PI / 2 - Math.PI / 6}
            maxPolarAngle={Math.PI / 2 + Math.PI / 6}
          />
        </Canvas>
      </Suspense>

      {/* Controls hint */}
      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-stone-500">
        <span className="font-medium">Controls:</span> Drag to rotate, scroll to zoom
      </div>
    </div>
  );
}

// Preload model for better performance
useGLTF.preload("/models/seeding-system.glb");
