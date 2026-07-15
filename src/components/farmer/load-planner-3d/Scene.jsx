import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import DynamicBox from './DynamicBox';

const Scene = ({ boxes, isEditMode, onUpdatePosition }) => {
  // Standard trailer container dimensions in meters
  const containerW = 2.4;
  const containerH = 2.6;
  const containerL = 13.6;

  return (
    <div className="w-full h-full min-h-[350px] md:min-h-[500px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner relative">
      <Canvas
        shadows
        camera={{ position: [-10, 8, 12], fov: 40 }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight
          castShadow
          position={[10, 20, 10]}
          intensity={1.2}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* 3D Trailer Container boundary outline */}
        <mesh position={[0, containerH / 2, 0]}>
          <boxGeometry args={[containerL, containerH, containerW]} />
          <meshBasicMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={0.12}
          />
        </mesh>

        {/* Render each dynamic box */}
        {boxes.map((box) => (
          <DynamicBox
            key={box.order_id}
            box={box}
            isEditMode={isEditMode}
            onUpdatePosition={onUpdatePosition}
          />
        ))}

        {/* Orbit Controls (disabled during activeTransform edit dragging) */}
        <OrbitControls makeDefault={!isEditMode} maxPolarAngle={Math.PI / 2 - 0.05} />

        {/* Floor grid helper */}
        <gridHelper args={[30, 30, '#475569', '#334155']} position={[0, -0.01, 0]} />

        {/* Ground Shadows */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.65}
          scale={20}
          blur={1.5}
          far={10}
        />
      </Canvas>
    </div>
  );
};

export default Scene;
