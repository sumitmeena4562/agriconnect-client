import React, { useRef, useEffect } from 'react';
import { TransformControls, Edges } from '@react-three/drei';

const DynamicBox = ({ box, isEditMode, onUpdatePosition }) => {
  const meshRef = useRef();
  const controlsRef = useRef();

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Trigger state sync only when dragging ends (mouseUp) to avoid 60fps state re-render lag
    const handleDragEnd = () => {
      if (!meshRef.current) return;
      const { x, y, z } = meshRef.current.position;
      onUpdatePosition(box.order_id, [
        Math.round(x * 100) / 100,
        Math.round(y * 100) / 100,
        Math.round(z * 100) / 100
      ]);
    };

    controls.addEventListener('mouseUp', handleDragEnd);
    return () => {
      controls.removeEventListener('mouseUp', handleDragEnd);
    };
  }, [box.order_id, onUpdatePosition]);

  return (
    <TransformControls
      ref={controlsRef}
      mode="translate"
      enabled={isEditMode}
      showX={isEditMode}
      showY={isEditMode}
      showZ={isEditMode}
      size={0.75}
    >
      <mesh
        ref={meshRef}
        position={[box.pos_x, box.pos_y, box.pos_z]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[box.width, box.height, box.depth]} />
        <meshStandardMaterial 
          color={box.color} 
          roughness={0.85} 
          metalness={0.05} 
        />
        {/* Clean outline edges from Drei (performance optimized) */}
        <Edges
          color="#1e293b"
          thickness={1.5}
        />
      </mesh>
    </TransformControls>
  );
};

export default DynamicBox;
