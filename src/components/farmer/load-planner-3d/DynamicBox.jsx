import React, { useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';

const DynamicBox = ({ box, isEditMode, onUpdatePosition }) => {
  const meshRef = useRef();

  const handleTransform = () => {
    if (!meshRef.current) return;
    const { x, y, z } = meshRef.current.position;
    onUpdatePosition(box.order_id, [
      Math.round(x * 100) / 100,
      Math.round(y * 100) / 100,
      Math.round(z * 100) / 100
    ]);
  };

  const boxMesh = (
    <mesh
      ref={meshRef}
      position={[box.pos_x, box.pos_y, box.pos_z]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[box.width, box.height, box.depth]} />
      <meshStandardMaterial 
        color={box.color} 
        roughness={0.7} 
        metalness={0.15} 
      />
      {/* Edge outlines for visual depth */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(box.width, box.height, box.depth)]} />
        <lineBasicMaterial attach="material" color="#1e293b" linewidth={1.5} opacity={0.35} transparent />
      </lineSegments>
    </mesh>
  );

  if (isEditMode) {
    return (
      <TransformControls
        object={meshRef}
        mode="translate"
        onObjectChange={handleTransform}
        translationSnap={0.1} // Snap to 10cm grid for clean alignment
        size={0.75}
      >
        {boxMesh}
      </TransformControls>
    );
  }

  return boxMesh;
};

export default DynamicBox;
