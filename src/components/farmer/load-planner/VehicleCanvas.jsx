import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useLoadPlannerStore } from '../../../store/useLoadPlannerStore';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const SLOT_COLORS = [
  { fill: 0x10b981, stroke: 0x34d399 }, // Emerald
  { fill: 0x3b82f6, stroke: 0x60a5fa }, // Blue
  { fill: 0xf59e0b, stroke: 0xfbbf24 }, // Amber
  { fill: 0x8b5cf6, stroke: 0xa78bfa }, // Violet
  { fill: 0xec4899, stroke: 0xf472b6 }, // Pink
  { fill: 0x06b6d4, stroke: 0x22d3ee }, // Cyan
];

let cachedGltfModel = null;

// Dynamic Cargo Slot Generator
const update3DSlots = (scene, activeTemplate, routeStops, removedOrderIds, slotMeshesRef, checkLifoViolation, trailerBounds) => {
  slotMeshesRef.current.forEach((obj) => scene.remove(obj));
  slotMeshesRef.current = [];

  if (!trailerBounds) return;

  const { rows, cols } = activeTemplate;
  const { center, size } = trailerBounds;

  const slotW = size.x / cols;
  const slotH = size.y / rows;
  const slotD = size.z;
  const startX = center.x - size.x / 2;
  const startY = center.y - size.y / 2;

  const slotGroup = new THREE.Group();
  scene.add(slotGroup);
  slotMeshesRef.current.push(slotGroup);

  const activeOrders = useLoadPlannerStore.getState().batch?.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
  const deliveryStops = routeStops.filter(s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId)));
  const pickupCount = routeStops.filter(s => s.stopType === 'pickup').length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const slotNum = r * cols + c + 1;
      const cellX = startX + c * slotW + slotW / 2;
      const cellY = startY + r * slotH + slotH / 2;
      
      const stop = deliveryStops.find(s => s.loadingSequence === slotNum);
      const slotMeshGroup = new THREE.Group();
      slotMeshGroup.position.set(cellX, cellY, center.z);
      slotGroup.add(slotMeshGroup);

      const boxGeo = new THREE.BoxGeometry(slotW - 3, slotH - 3, slotD - 3);
      
      if (!stop) {
        const emptyMesh = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          transparent: true,
          opacity: 0.15,
          roughness: 0.8
        }));
        emptyMesh.userData = { slotNum };
        emptyMesh.receiveShadow = true;
        slotMeshGroup.add(emptyMesh);

        const edges = new THREE.EdgesGeometry(boxGeo);
        slotMeshGroup.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xcbd5e1 })));
      } else {
        const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
        const isViolated = checkLifoViolation(stop, deliveryStops);
        const palette = isViolated ? { fill: 0xef4444, stroke: 0xfca5a5 } : SLOT_COLORS[(slotNum - 1) % SLOT_COLORS.length];

        const cargoMesh = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({
          color: palette.fill,
          roughness: 0.3,
          metalness: 0.1,
          transparent: true,
          opacity: 0.9
        }));
        cargoMesh.userData = { slotNum };
        cargoMesh.castShadow = true;
        cargoMesh.receiveShadow = true;
        slotMeshGroup.add(cargoMesh);

        const edges = new THREE.EdgesGeometry(boxGeo);
        slotMeshGroup.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: palette.stroke, linewidth: 2 })));
      }
    }
  }
};

const VehicleCanvas = () => {
  const { activeTemplate, removedOrderIds, batch, setDraggedItem, draggedItem, localRouteStops: routeStops } = useLoadPlannerStore();
  const [mountElement, setMountElement] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadErrorMsg, setLoadErrorMsg] = useState('');
  const [trailerBounds, setTrailerBounds] = useState(null);

  const deliveryStops = routeStops.filter(s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId)));
  const checkLifoViolation = (stop, list = deliveryStops) => list.some(o => o.loadingSequence > stop.loadingSequence && stop.sequence < o.sequence);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const slotMeshesRef = useRef([]);

  // Callback ref to guarantee DOM element attachment before starting WebGL
  const mountRef = (element) => {
    if (element) {
      setMountElement(element);
    }
  };

  useEffect(() => {
    if (!mountElement) return;
    let isCurrent = true;

    setModelLoaded(false);
    setLoadProgress(0);
    setLoadErrorMsg('');

    const width = mountElement.clientWidth || 760;
    const height = 350;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 2000);
    camera.position.set(-260, 160, 280);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountElement.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(150, 250, 150);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 150;
    controls.maxDistance = 600;
    controls.target.set(30, 10, 0);

    const gridHelper = new THREE.GridHelper(800, 40, '#e2e8f0', '#f1f5f9');
    gridHelper.position.y = -35;
    scene.add(gridHelper);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.ShadowMaterial({ opacity: 0.08 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -35.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Group that will hold the loaded GLB model
    const vehicleGroup = new THREE.Group();
    scene.add(vehicleGroup);

    const type = activeTemplate.type;

    update3DSlots(scene, activeTemplate, routeStops, removedOrderIds, slotMeshesRef, checkLifoViolation, trailerBounds);

    const setupModelInScene = (modelScene) => {
      modelScene.updateMatrixWorld(true);

      const pivot = new THREE.Group();
      pivot.add(modelScene);

      const box = new THREE.Box3().setFromObject(modelScene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      modelScene.position.set(-center.x, -center.y, -center.z);

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0.001 ? 200 / maxDim : 1;
      pivot.scale.set(scale, scale, scale);
      pivot.position.set(-80, -10, 0);
      vehicleGroup.add(pivot);

      pivot.updateMatrixWorld(true);

      let largestMesh = null;
      let maxVolume = 0;

      modelScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          child.updateMatrixWorld(true);
          const meshBox = new THREE.Box3().setFromObject(child);
          const meshSize = meshBox.getSize(new THREE.Vector3());
          const volume = meshSize.x * meshSize.y * meshSize.z;

          if (volume > maxVolume) {
            maxVolume = volume;
            largestMesh = child;
          }
        }
      });

      if (largestMesh) {
        const trailerBox = new THREE.Box3().setFromObject(largestMesh);
        const trailerSize = trailerBox.getSize(new THREE.Vector3());
        const trailerCenter = trailerBox.getCenter(new THREE.Vector3());

        if (isCurrent) {
          setTrailerBounds({
            center: trailerCenter,
            size: new THREE.Vector3(trailerSize.x * 0.9, trailerSize.y * 0.85, trailerSize.z * 0.9)
          });
        }

        const applyTranslucent = (mat) => {
          mat.transparent = true;
          mat.opacity = 0.12;
          mat.color.setHex(0xcbd5e1);
          mat.roughness = 0.1;
          mat.metalness = 0.9;
        };

        if (largestMesh.material) {
          if (Array.isArray(largestMesh.material)) {
            largestMesh.material.forEach(applyTranslucent);
          } else {
            applyTranslucent(largestMesh.material);
          }
        }
      }

      if (isCurrent) setModelLoaded(true);
    };

    if (type !== 'warehouse') {
      if (cachedGltfModel) {
        setupModelInScene(cachedGltfModel.clone());
      } else {
        const loader = new GLTFLoader();
        loader.load(
          '/modal/Untitled.glb',
          (gltf) => {
            if (!isCurrent) return;
            cachedGltfModel = gltf.scene;
            setupModelInScene(gltf.scene.clone());
          },
          (xhr) => {
            if (!isCurrent) return;
            if (xhr.total > 0) {
              setLoadProgress(Math.min(100, Math.round((xhr.loaded / xhr.total) * 100)));
            }
          },
          (error) => {
            if (!isCurrent) return;
            console.error(error);
            setLoadingError(true);
            setLoadErrorMsg('Failed to load 3D asset');
          }
        );
      }
    } else {
      setModelLoaded(true);
    }

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountElement || !rendererRef.current || !cameraRef.current) return;
      const w = mountElement.clientWidth;
      cameraRef.current.aspect = w / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isCurrent = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (mountElement && renderer.domElement) {
        mountElement.removeChild(renderer.domElement);
      }
    };
  }, [mountElement, activeTemplate.type]);

  // Re-draw slots reactively when stops update or trailer bounds are computed
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !trailerBounds) return;
    update3DSlots(scene, activeTemplate, routeStops, removedOrderIds, slotMeshesRef, checkLifoViolation, trailerBounds);
  }, [activeTemplate, routeStops, removedOrderIds, batch, trailerBounds]);

  const handleHTMLDrop = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!renderer || !camera || !scene) return;

    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const slotTargets = [];
    scene.traverse((node) => {
      if (node.isMesh && node.userData && node.userData.slotNum) {
        slotTargets.push(node);
      }
    });

    const intersects = raycaster.intersectObjects(slotTargets);
    if (intersects.length > 0) {
      const targetLoadSeq = intersects[0].object.userData.slotNum;
      const existingStop = deliveryStops.find(s => s.loadingSequence === targetLoadSeq);
      const pickups = routeStops.filter(s => s.stopType === 'pickup');
      const deliveries = [...deliveryStops];
      const draggedStopIdx = deliveries.findIndex(s => String(s.orderId) === String(draggedItem.orderId));

      if (draggedStopIdx !== -1) {
        const draggedStop = deliveries[draggedStopIdx];
        if (existingStop) {
          const temp = existingStop.loadingSequence;
          existingStop.loadingSequence = draggedStop.loadingSequence;
          draggedStop.loadingSequence = temp;
        } else {
          draggedStop.loadingSequence = targetLoadSeq;
        }

        const sorted = [...deliveries].sort((a, b) => b.loadingSequence - a.loadingSequence);
        let seq = pickups.length + 1;
        sorted.forEach(s => { s.sequence = seq++; });

        useLoadPlannerStore.setState({ localRouteStops: [...pickups, ...deliveries] });
        toast.success(`Cargo repositioned in slot ${targetLoadSeq}`);
      }
    }
    setDraggedItem(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleHTMLDrop}
        className="relative rounded-2xl overflow-hidden select-none border border-slate-200 bg-[#f8fafc] shadow-inner"
        style={{ height: '350px' }}
      >
        {/* React Callback Ref mount point */}
        <div ref={mountRef} className="w-full h-full" />
        
        {loadErrorMsg && (
          <div className="absolute top-3 left-3 bg-rose-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black z-20 shadow-md">
            {loadErrorMsg}
          </div>
        )}

        {!modelLoaded && activeTemplate.type !== 'warehouse' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white z-10">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <span className="text-[12px] font-black uppercase tracking-widest">Analyzing and Loading 3D Model</span>
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${loadProgress}%` }} />
            </div>
          </div>
        )}
      </div>
      <p className="text-center text-[9px] text-slate-400 font-semibold tracking-wide">
        🖱 Drag stops onto 3D container slots · Drag scene to rotate camera view
      </p>
    </div>
  );
};

export default VehicleCanvas;
