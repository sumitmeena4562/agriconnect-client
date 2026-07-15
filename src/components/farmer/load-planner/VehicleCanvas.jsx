import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useLoadPlannerStore } from '../../../store/useLoadPlannerStore';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

let cachedGltfModel = null;

// Dynamic Cargo Slot Generator (with Realistic Wooden Pallets & Cardboard Packing Boxes with shipping labels & dynamic fill height)
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

  // Max weight capacity per slot for dynamic fill height calculation
  const maxCapacity = activeTemplate.capacity || 10000;
  const maxWeightPerSlot = maxCapacity / (rows * cols);

  let totalW = 0;
  let weightedX = 0;
  let weightedY = 0;
  let weightedZ = 0;

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
        // Empty slot helper (Storage wireframe frame look)
        const emptyMesh = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          transparent: true,
          opacity: 0.08,
          roughness: 0.8
        }));
        emptyMesh.userData = { slotNum };
        emptyMesh.receiveShadow = true;
        slotMeshGroup.add(emptyMesh);

        const edges = new THREE.EdgesGeometry(boxGeo);
        slotMeshGroup.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xcbd5e1, opacity: 0.3, transparent: true })));
      } else {
        // Filled cargo box
        const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
        const isViolated = checkLifoViolation(stop, deliveryStops);
        const weight = order?.requestedQuantity || 0;

        // Calculate dynamic fill ratio based on weight (min 15% box height to keep it visible)
        const fillRatio = Math.max(0.2, Math.min(1.0, weight / maxWeightPerSlot));
        
        // Dynamic Cargo Classification Colors
        const cropName = order?.crop?.name || '';
        const lowerName = cropName.toLowerCase();
        
        let boxColor = 0xdcba9d;  // Kraft Cardboard Brown (proper matte tone)
        let tapeColor = 0x854d0e; // Standard Brown Tape
        
        if (lowerName.includes('tomato') || lowerName.includes('egg') || lowerName.includes('strawberr')) {
          boxColor = 0xffedd5;  // Fragile Amber Kraft
          tapeColor = 0xea580c; // Red Warning Tape
        } else if (lowerName.includes('milk') || lowerName.includes('paneer') || lowerName.includes('dairy') || lowerName.includes('berr')) {
          boxColor = 0xe0f2fe;  // Cold Chain Sky Blue
          tapeColor = 0x0284c7; // Blue Packing Tape
        } else if (lowerName.includes('potato') || lowerName.includes('wheat') || lowerName.includes('onion') || lowerName.includes('grain')) {
          boxColor = 0xc79a73;  // Heavy Duty Kraft
          tapeColor = 0x78350f; // Dark Brown Tape
        }

        if (isViolated) {
          boxColor = 0xfee2e2;  // LIFO Violation Light Red
          tapeColor = 0xef4444; // Violation Bright Red Tape
        }

        // 1. Wooden Pallet Base (Height = 12% of slot)
        const palletH = slotH * 0.12;
        const palletGeo = new THREE.BoxGeometry(slotW - 3, palletH, slotD - 3);
        const palletMat = new THREE.MeshStandardMaterial({
          color: 0x7c5a3c, // Realistic warm wood color
          roughness: 0.95,
          metalness: 0.05
        });
        const palletMesh = new THREE.Mesh(palletGeo, palletMat);
        palletMesh.position.y = -slotH / 2 + palletH / 2;
        palletMesh.castShadow = true;
        palletMesh.receiveShadow = true;
        slotMeshGroup.add(palletMesh);

        // 2. Cardboard Box (with dynamic height based on fill ratio)
        const boxH = slotH * 0.82 * fillRatio;
        const mainBoxGeo = new THREE.BoxGeometry(slotW - 4, boxH, slotD - 4);
        const mainBoxMat = new THREE.MeshStandardMaterial({
          color: boxColor,
          roughness: 0.9, // Textured matte paper look
          metalness: 0.0
        });
        const mainBoxMesh = new THREE.Mesh(mainBoxGeo, mainBoxMat);
        mainBoxMesh.position.y = -slotH / 2 + palletH + boxH / 2;
        mainBoxMesh.castShadow = true;
        mainBoxMesh.receiveShadow = true;
        mainBoxMesh.userData = { slotNum };
        slotMeshGroup.add(mainBoxMesh);

        // 3. Packaging Tape Strap (scaled to dynamic box height)
        const tapeGeo = new THREE.BoxGeometry(slotW / 3.8, boxH + 0.1, slotD - 3.6);
        const tapeMat = new THREE.MeshStandardMaterial({
          color: tapeColor,
          roughness: 0.3,
          metalness: 0.1
        });
        const tapeMesh = new THREE.Mesh(tapeGeo, tapeMat);
        tapeMesh.position.y = -slotH / 2 + palletH + boxH / 2;
        slotMeshGroup.add(tapeMesh);

        // 4. White Shipping Label (Placed flat on front face of box for realistic detail)
        const labelW = slotW / 4.5;
        const labelH = Math.max(4, boxH / 3.5);
        const labelGeo = new THREE.PlaneGeometry(labelW, labelH);
        const labelMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide
        });
        const labelMesh = new THREE.Mesh(labelGeo, labelMat);
        // Position at front face of the cardboard box
        labelMesh.position.set(-slotW / 4, -slotH / 2 + palletH + boxH / 2, slotD / 2 - 1.9);
        slotMeshGroup.add(labelMesh);

        // Subtle box edges highlight (scaled dynamically)
        const edges = new THREE.EdgesGeometry(mainBoxGeo);
        const edgesLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: tapeColor, opacity: 0.3, transparent: true }));
        edgesLines.position.y = -slotH / 2 + palletH + boxH / 2;
        slotMeshGroup.add(edgesLines);

        // Accumulate center of gravity metrics
        totalW += weight;
        weightedX += cellX * weight;
        weightedY += (-slotH / 2 + palletH + boxH / 2) * weight; // Vertical CoG is now dynamic based on stack height!
        weightedZ += center.z * weight;
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

    const isTopHeavy = cogY > (startY + size.y * 0.6);
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
      <p className="text-center text-[9.5px] text-slate-400 font-semibold tracking-wide flex items-center justify-center gap-1.5">
        <span>🖱 Drag stops onto 3D container slots</span>
        <span className="text-slate-200">|</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-xs" /> Center of Gravity overlay</span>
      </p>
    </div>
  );
};

export default VehicleCanvas;
