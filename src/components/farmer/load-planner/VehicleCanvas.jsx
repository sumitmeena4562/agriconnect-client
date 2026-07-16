import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useLoadPlannerStore } from '../../../store/useLoadPlannerStore';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const cachedGltfModels = {};

// Dynamic Cargo Slot Generator (with Realistic 2x2 stacks of taped cardboard boxes on wooden pallets)
const update3DSlots = (scene, activeTemplate, routeStops, removedOrderIds, slotMeshesRef, checkLifoViolation, trailerBounds) => {
  slotMeshesRef.current.forEach((obj) => scene.remove(obj));
  slotMeshesRef.current = [];

  if (!trailerBounds) return;

  const { rows, cols } = activeTemplate;
  const { center, size } = trailerBounds;

  // Real-world layout: single sequence row along length (X) for perfect side-view clarity. No depth overlap.
  const totalSlots = rows * cols;
  const slotW = size.x / totalSlots;
  const slotH = size.y; // Full height of trailer cargo space
  const slotD = size.z; // Full depth of trailer cargo space
  const startX = center.x - size.x / 2;
  const bottomY = center.y - size.y / 2; // Floor height
  const cellZ = center.z; // Centered in the depth

  const slotGroup = new THREE.Group();
  scene.add(slotGroup);
  slotMeshesRef.current.push(slotGroup);

  const activeOrders = useLoadPlannerStore.getState().batch?.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
  const deliveryStops = routeStops.filter(s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId)));

  const packagingReport = useLoadPlannerStore.getState().packagingReport;
  const occupancyData = packagingReport?.trailerOccupancyData || [];

  let totalW = 0;
  let weightedX = 0;
  let weightedY = 0;
  let weightedZ = 0;

  const palletH = slotH * 0.08;

  for (let sIdx = 0; sIdx < totalSlots; sIdx++) {
    const slotNum = sIdx + 1;
    const cellX = startX + sIdx * slotW + slotW / 2;
    
    const slotOccupancy = occupancyData.find(item => item.slotIndex === slotNum);
    const slotMeshGroup = new THREE.Group();
    // Position pallet flat on the floor
    slotMeshGroup.position.set(cellX, bottomY + palletH / 2, cellZ);
    slotGroup.add(slotMeshGroup);

    const boxGeo = new THREE.BoxGeometry(slotW - 3, slotH - 3, slotD - 6);
    
    const stop = deliveryStops.find(s => s.loadingSequence === slotNum);
    const boxInfo = stop ? packagingReport?.recommendedBoxes?.find(b => String(b.orderId) === String(stop.orderId)) : null;
    const isViolated = stop ? checkLifoViolation(stop, deliveryStops) : false;

    if (!stop || !boxInfo) {
      // Empty slot helper (Storage wireframe frame look sitting flat on floor)
      const emptyMesh = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.03,
        roughness: 0.8
      }));
      emptyMesh.userData = { slotNum };
      emptyMesh.position.y = slotH / 2 - palletH / 2;
      emptyMesh.receiveShadow = true;
      slotMeshGroup.add(emptyMesh);

      const edges = new THREE.EdgesGeometry(boxGeo);
      const edgesLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xcbd5e1, opacity: 0.15, transparent: true }));
      edgesLines.position.y = slotH / 2 - palletH / 2;
      slotMeshGroup.add(edgesLines);
    } else {
      // Filled cargo box
      
      const weight = boxInfo ? boxInfo.weightPerBox : 0;
      
      // Parse custom colors from hex strings
      let boxColor = parseInt(slotOccupancy.color.replace('#', '0x'));
      let tapeColor = parseInt(slotOccupancy.tapeColor.replace('#', '0x'));
      
      if (isViolated) {
        boxColor = 0xfca5a5;  // Red Violation Kraft
        tapeColor = 0xdc2626; // Violation red tape
      }

      // 1. Wooden Pallet Base (Height = palletH, sits flat on floor)
      const palletGeo = new THREE.BoxGeometry(slotW - 3, palletH, slotD - 6);
      const palletMat = new THREE.MeshStandardMaterial({
        color: 0x7c5a3c, // Realistic warm wood color
        roughness: 0.95,
        metalness: 0.05
      });
      const palletMesh = new THREE.Mesh(palletGeo, palletMat);
      palletMesh.position.y = 0;
      palletMesh.castShadow = true;
      palletMesh.receiveShadow = true;
      slotMeshGroup.add(palletMesh);

      // ── DYNAMIC BOX SIZE CALCULATION BASED ON RECOMMENDATION ENGINE ──
      const boxType = boxInfo?.boxType || 'M';
      const scaleFactor = 
        boxType === 'S' ? 0.70 :
        boxType === 'M' ? 0.82 :
        boxType === 'L' ? 0.90 : 0.98; // XL
      
      // Since it's a single row, the pallet is square-ish. Let's stack boxes in a perfect 2x2 grid.
      const subW = ((slotW - 5) / 2) * scaleFactor;
      const subD = ((slotD - 6) / 2) * scaleFactor;
      const boxH = Math.min(Math.min(subW, subD) * 0.78, (slotH - palletH) * 0.28) * scaleFactor;

      const subBoxGeo = new THREE.BoxGeometry(subW, boxH, subD);
      const subBoxMat = new THREE.MeshStandardMaterial({
        color: boxColor,
        roughness: 0.9,
        metalness: 0.0
      });

      const tapeMat = new THREE.MeshStandardMaterial({
        color: tapeColor,
        roughness: 0.4,
        metalness: 0.1
      });

      const labelMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
      });

      const glyphMat = new THREE.MeshBasicMaterial({
        color: 0x475569,
        side: THREE.DoubleSide
      });

      // 2x2 grid offsets
      const offsets = [
        { dx: -1, dz: 1, label: true },  // Front-Left
        { dx: 1,  dz: 1, label: true },  // Front-Right
        { dx: -1, dz: -1, label: false }, // Back-Left
        { dx: 1,  dz: -1, label: false }  // Back-Right
      ];

      // Draw the exact number of boxes recommended for this slot, stacking them vertically
      const boxCount = boxInfo?.count || 1;
      const layerSize = 4;

      for (let i = 0; i < boxCount; i++) {
        const layer = Math.floor(i / layerSize);
        const subIdx = i % layerSize;
        const { dx, dz, label } = offsets[subIdx];

        const px = dx * (subW / 2 + 1.2);
        const pz = dz * (subD / 2 + 1.2);
        const py = palletH / 2 + (layer * boxH) + boxH / 2; // local position relative to slotMeshGroup center

        // Cardboard Box Mesh
        const boxMesh = new THREE.Mesh(subBoxGeo, subBoxMat);
        boxMesh.position.set(px, py, pz);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        slotMeshGroup.add(boxMesh);

        // Top Flap Seam Tape
        const tapeW = subD / 6;
        const topTape = new THREE.Mesh(new THREE.BoxGeometry(subW - 0.2, 0.15, tapeW), tapeMat);
        topTape.position.set(px, py + boxH / 2, pz);
        slotMeshGroup.add(topTape);

        // Side Tape Folds
        const sideTapeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, boxH / 4, tapeW), tapeMat);
        sideTapeLeft.position.set(px - subW / 2 + 0.1, py + boxH / 2 - boxH / 8, pz);
        slotMeshGroup.add(sideTapeLeft);

        const sideTapeRight = new THREE.Mesh(new THREE.BoxGeometry(0.15, boxH / 4, tapeW), tapeMat);
        sideTapeRight.position.set(px + subW / 2 - 0.1, py + boxH / 2 - boxH / 8, pz);
        slotMeshGroup.add(sideTapeRight);

        // shipping labels & glyphs on front-facing boxes (matches bottom layer only)
        if (label && layer === 0) {
          // White shipping sticker (top-right of box face)
          const labelW = subW / 4.2;
          const labelH = Math.max(3, boxH / 3.8);
          const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(labelW, labelH), labelMat);
          labelMesh.position.set(px + subW / 4.2, py + boxH * 0.2, pz + subD / 2 + 0.1);
          slotMeshGroup.add(labelMesh);

          // Three handling icons/glyphs (bottom-left of box face)
          const glyphGeo = new THREE.PlaneGeometry(1.2, 1.2);
          for (let g = 0; g < 3; g++) {
            const glyphMesh = new THREE.Mesh(glyphGeo, glyphMat);
            glyphMesh.position.set(px - subW / 4.5 + g * 1.8, py - boxH * 0.25, pz + subD / 2 + 0.1);
            slotMeshGroup.add(glyphMesh);
          }
        }

        // Subtle box edges highlight
        const edges = new THREE.EdgesGeometry(subBoxGeo);
        const edgesLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: tapeColor, opacity: 0.15, transparent: true }));
        edgesLines.position.set(px, py, pz);
        slotMeshGroup.add(edgesLines);

        // Accumulate center of gravity metrics per box
        totalW += weight;
        weightedX += cellX * weight;
        weightedY += (bottomY + palletH + (layer * boxH) + boxH / 2) * weight;
        weightedZ += cellZ * weight;
      }
    }
  }

  // ── Render 3D Center of Gravity (CoG) Indicator ──
  if (totalW > 0) {
    const cogX = weightedX / totalW;
    const cogY = weightedY / totalW;
    const cogZ = weightedZ / totalW;

    const cogGroup = new THREE.Group();
    cogGroup.position.set(cogX, cogY, cogZ);
    slotGroup.add(cogGroup);

    const isTopHeavy = cogY > (bottomY + size.y * 0.6);
    const cogColor = isTopHeavy ? 0xef4444 : 0x3b82f6;

    // Glowing core sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 16, 16),
      new THREE.MeshBasicMaterial({
        color: cogColor,
        transparent: true,
        opacity: 0.85,
        depthTest: false,
        depthWrite: false
      })
    );
    sphere.renderOrder = 999;
    cogGroup.add(sphere);

    // 3D Axis crosshairs
    const lineMat = new THREE.LineBasicMaterial({
      color: cogColor,
      transparent: true,
      opacity: 0.65,
      depthTest: false,
      depthWrite: false
    });
    
    const xGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-15, 0, 0), new THREE.Vector3(15, 0, 0)]);
    const xLine = new THREE.Line(xGeo, lineMat);
    xLine.renderOrder = 999;
    cogGroup.add(xLine);

    const yGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -15, 0), new THREE.Vector3(0, 15, 0)]);
    const yLine = new THREE.Line(yGeo, lineMat);
    yLine.renderOrder = 999;
    cogGroup.add(yLine);

    const zGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -15), new THREE.Vector3(0, 0, 15)]);
    const zLine = new THREE.Line(zGeo, lineMat);
    zLine.renderOrder = 999;
    cogGroup.add(zLine);
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

      // 1. Calculate bounds of unrotated model scene to center it locally
      const box = new THREE.Box3().setFromObject(modelScene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      modelScene.position.set(-center.x, -center.y, -center.z);

      // 2. Rotate pivot to straighten the truck model along the X-axis (facing left)
      if (type === 'mini_truck' || type === 'pickup_vehicle' || type === 'tractor_trolley' || type === 'bike_delivery') {
        pivot.rotation.y = -0.43; // -24.6 degrees clockwise rotation to align baked diagonal geometry
      }

      // 3. Scale and position the pivot in the scene
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

        let adjustedSize = new THREE.Vector3(trailerSize.x, trailerSize.y, trailerSize.z);
        let adjustedCenter = new THREE.Vector3(trailerCenter.x, trailerCenter.y, trailerCenter.z);

        if (type === 'mini_truck') {
          // Manual adjustments for minitrcuck.glb to align the container bounds exactly inside the white rear cargo box
          adjustedCenter.x += trailerSize.x * 0.17; // Shift to the rear (away from the cab)
          adjustedCenter.y += trailerSize.y * 0.14; // Shift up to container bed level
          adjustedSize.x *= 0.58; // Take only the rear container length (exclude cab)
          adjustedSize.y *= 0.65; // Height of container box
          adjustedSize.z *= 0.78; // Width of container box
        } else if (type === 'pickup_vehicle' || type === 'tractor_trolley' || type === 'bike_delivery') {
          // Adjustments for mini truck model fallback configurations
          adjustedCenter.x += trailerSize.x * 0.17;
          adjustedCenter.y += trailerSize.y * 0.08;
          adjustedSize.x *= 0.58;
          adjustedSize.y *= 0.55;
          adjustedSize.z *= 0.78;
        } else {
          // Standard adjustments for container_truck (Untitled.glb)
          adjustedSize.x *= 0.90;
          adjustedSize.y *= 0.85;
          adjustedSize.z *= 0.90;
        }

        if (isCurrent) {
          setTrailerBounds({
            center: adjustedCenter,
            size: adjustedSize
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
      if (cachedGltfModels[type]) {
        setupModelInScene(cachedGltfModels[type].clone());
      } else {
        const loader = new GLTFLoader();
        loader.load(
          `/modal/${type}/model.glb`,
          (gltf) => {
            if (!isCurrent) return;
            cachedGltfModels[type] = gltf.scene;
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
      <p className="text-center text-[9.5px] text-slate-400 font-semibold tracking-wide flex items-center justify-center gap-1.5">
        <span>🖱 Drag stops onto 3D container slots</span>
        <span className="text-slate-200">|</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-xs" /> Center of Gravity overlay</span>
      </p>
    </div>
  );
};

export default VehicleCanvas;
