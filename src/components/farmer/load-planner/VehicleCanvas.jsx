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

  const totalSlots = rows * cols;
  const slotW  = size.x / cols;        // each slot's width along truck length (X)
  const slotH  = size.y / rows;        // slot height for each layer (Y)
  const slotD  = size.z;               // full container interior depth (Z)
  const startX = center.x - size.x / 2;
  const bottomY = center.y - size.y / 2; // container floor Y in world space
  const cellZ   = center.z;

  const packagingReport = useLoadPlannerStore.getState().packagingReport;
  const occupancyData   = packagingReport?.trailerOccupancyData || [];
  const deliveryStops   = routeStops.filter(s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId)));

  console.log(`[update3DSlots] config - totalSlots: ${totalSlots}, occupancyDataLen: ${occupancyData.length}, deliveryStopsLen: ${deliveryStops.length}, center: [${center.x.toFixed(1)}, ${center.y.toFixed(1)}, ${center.z.toFixed(1)}], size: [${size.x.toFixed(1)}, ${size.y.toFixed(1)}, ${size.z.toFixed(1)}]`);

  const slotGroup = new THREE.Group();
  scene.add(slotGroup);
  slotMeshesRef.current.push(slotGroup);

  let totalW = 0, weightedX = 0, weightedY = 0, weightedZ = 0;

  // Pallet height = 8% of container height (realistic 15cm pallet vs ~2m container)
  const realPalletH = slotH * 0.08;

  for (let sIdx = 0; sIdx < totalSlots; sIdx++) {
    const slotNum = sIdx + 1;
    const c = sIdx % cols;
    const r = Math.floor(sIdx / cols);
    const cellX   = startX + c * slotW + slotW / 2;

    const slotOccupancy = occupancyData.find(item => item.slotIndex === slotNum);
    const slotGroup3    = new THREE.Group();
    slotGroup3.position.set(cellX, bottomY + r * slotH + realPalletH / 2, cellZ);
    slotGroup.add(slotGroup3);

    // ── Use slotOccupancy as single source of truth ──
    const stop       = deliveryStops.find(s => s.loadingSequence === slotNum);
    const isViolated = stop ? checkLifoViolation(stop, deliveryStops) : false;

    const boxInfo = stop
      ? packagingReport?.recommendedBoxes?.find(b => String(b.orderId) === String(stop.orderId))
      : slotOccupancy?.isFilled
        ? packagingReport?.recommendedBoxes?.[slotNum - 1]
        : null;

    console.log(`[update3DSlots] Slot ${slotNum} - occupied: ${!!slotOccupancy?.isFilled}, stop: ${!!stop}, boxInfo: ${!!boxInfo}, crop: ${boxInfo?.cropName || 'none'}, count: ${boxInfo?.count || 0}`);

    if (!slotOccupancy?.isFilled || !boxInfo) {
      // ── Empty slot wireframe ──
      const emptyGeo = new THREE.BoxGeometry(slotW - 4, slotH - 4, slotD - 8);
      const emptyMesh = new THREE.Mesh(emptyGeo, new THREE.MeshStandardMaterial({
        color: 0x94a3b8, transparent: true, opacity: 0.02, roughness: 0.8
      }));
      emptyMesh.userData = { slotNum };
      emptyMesh.position.y = slotH / 2 - realPalletH / 2;
      slotGroup3.add(emptyMesh);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xcbd5e1, opacity: 0.12, transparent: true });
      slotGroup3.add(new THREE.LineSegments(new THREE.EdgesGeometry(emptyGeo), edgeMat));
      continue;
    }

    // ── Parse colors from slotOccupancy (direct, reliable) ──
    let boxColor  = parseInt((slotOccupancy.color || '#d29b6c').replace('#', '0x'));
    let tapeColor = parseInt((slotOccupancy.tapeColor || '#b48256').replace('#', '0x'));
    if (isViolated) { boxColor = 0xfca5a5; tapeColor = 0xdc2626; }

    // ── 1. Wooden Pallet ──
    const palletMesh = new THREE.Mesh(
      new THREE.BoxGeometry(slotW - 4, realPalletH, slotD - 8),
      new THREE.MeshStandardMaterial({ color: 0x7c5a3c, roughness: 0.95, metalness: 0.05 })
    );
    palletMesh.castShadow = true;
    palletMesh.receiveShadow = true;
    slotGroup3.add(palletMesh);

    // ── 2. Box sizing: slot-proportional, preserving real box aspect ratio ──
    const dims  = boxInfo.boxDims || { l: 65, w: 45, h: 40 };
    const subW  = (slotW - 6) / 2;                               // 2 boxes per slot in X
    const subD  = (slotD - 8) / 2;                               // 2 boxes per slot in Z
    const subH  = Math.min(subW * (dims.h / dims.l) * 1.5, slotH * 0.28); // height capped at 28% slot

    const subBoxMat = new THREE.MeshStandardMaterial({ color: boxColor, roughness: 0.88, metalness: 0.0 });
    const tapeMat   = new THREE.MeshStandardMaterial({ color: tapeColor, roughness: 0.4, metalness: 0.1 });
    const labelMat  = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const glyphMat  = new THREE.MeshBasicMaterial({ color: 0x475569, side: THREE.DoubleSide });

    const halfX = subW / 2 + 1.0;
    const halfZ = subD / 2 + 1.0;
    const offsets = [
      { px: -halfX, pz:  halfZ, label: true  },
      { px:  halfX, pz:  halfZ, label: true  },
      { px: -halfX, pz: -halfZ, label: false },
      { px:  halfX, pz: -halfZ, label: false },
    ];
    const subBoxGeo = new THREE.BoxGeometry(subW, subH, subD);
    const boxCount  = boxInfo.count || 1;
    const weight    = boxInfo.weightPerBox || 0;

    for (let i = 0; i < boxCount; i++) {
      const layer  = Math.floor(i / 4);
      const { px, pz, label } = offsets[i % 4];
      const py = realPalletH / 2 + layer * subH + subH / 2;

      // Stop stacking if box top would exceed container roof
      if (py + subH / 2 > slotH - realPalletH) break;

      const boxMesh = new THREE.Mesh(subBoxGeo, subBoxMat);
      boxMesh.position.set(px, py, pz);
      boxMesh.castShadow = true;
      boxMesh.receiveShadow = true;
      slotGroup3.add(boxMesh);

      // Cross tape on top
      const tapeThk = subD * 0.12;
      const topTape  = new THREE.Mesh(new THREE.BoxGeometry(subW * 0.85, 0.8, tapeThk), tapeMat);
      topTape.position.set(px, py + subH / 2 + 0.3, pz);
      slotGroup3.add(topTape);
      const topTape2 = new THREE.Mesh(new THREE.BoxGeometry(tapeThk, 0.8, subD * 0.85), tapeMat);
      topTape2.position.set(px, py + subH / 2 + 0.3, pz);
      slotGroup3.add(topTape2);

      // Side tape + label (front-facing, first layer)
      if (label && layer === 0) {
        const lW = subW * 0.32, lH = Math.max(3, subH * 0.35);
        const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(lW, lH), labelMat);
        lMesh.position.set(px + subW * 0.22, py + subH * 0.15, pz + subD / 2 + 0.15);
        slotGroup3.add(lMesh);
      }

      // Edge highlight
      const edgeLines = new THREE.LineSegments(
        new THREE.EdgesGeometry(subBoxGeo),
        new THREE.LineBasicMaterial({ color: tapeColor, opacity: 0.25, transparent: true })
      );
      edgeLines.position.set(px, py, pz);
      slotGroup3.add(edgeLines);

      totalW    += weight;
      weightedX += cellX * weight;
      weightedY += (bottomY + r * slotH + realPalletH / 2 + py) * weight;
      weightedZ += cellZ * weight;
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
  const { activeTemplate, removedOrderIds, batch, setDraggedItem, draggedItem, localRouteStops: routeStops, packagingReport } = useLoadPlannerStore();
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
    renderer.shadowMap.type = THREE.PCFShadowMap;
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
      let largestVol = 0;

      modelScene.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;
        child.updateMatrixWorld(true);

        const wb = new THREE.Box3().setFromObject(child);
        const ws = wb.getSize(new THREE.Vector3());
        const vol = ws.x * ws.y * ws.z;

        // Container is Mesh.046 (largest by volume = 119M units)
        if (vol > largestVol) {
          largestVol = vol;
          largestMesh = child;
        }
      });

      const targetMesh = largestMesh;

      if (targetMesh) {
        const cargoBox = new THREE.Box3().setFromObject(targetMesh);
        const cargoSize = cargoBox.getSize(new THREE.Vector3());
        const cargoCenter = cargoBox.getCenter(new THREE.Vector3());

        console.log(`[TrailerBounds] cargoBox world - min: [${cargoBox.min.x.toFixed(1)}, ${cargoBox.min.y.toFixed(1)}, ${cargoBox.min.z.toFixed(1)}], max: [${cargoBox.max.x.toFixed(1)}, ${cargoBox.max.y.toFixed(1)}, ${cargoBox.max.z.toFixed(1)}], size: [${cargoSize.x.toFixed(1)}, ${cargoSize.y.toFixed(1)}, ${cargoSize.z.toFixed(1)}]`);

        // Container interior: apply tight insets
        const adjustedCenter = new THREE.Vector3(
          cargoCenter.x,
          cargoCenter.y,
          cargoCenter.z
        );
        const adjustedSize = new THREE.Vector3(
          cargoSize.x * 0.88,
          cargoSize.y * 0.78,
          cargoSize.z * 0.82
        );

        if (isCurrent) {
          setTrailerBounds({ center: adjustedCenter, size: adjustedSize });
        }

        // Make the container translucent so we see the boxes inside
        const applyTranslucent = (mat) => {
          mat.transparent = true;
          mat.opacity = 0.12;
          mat.color.setHex(0xcbd5e1);
          mat.roughness = 0.1;
          mat.metalness = 0.9;
          mat.depthWrite = false;
          mat.needsUpdate = true;
        };
        if (largestMesh?.material) {
          if (Array.isArray(largestMesh.material)) largestMesh.material.forEach(applyTranslucent);
          else applyTranslucent(largestMesh.material);
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
  // Re-draw slots reactively when stops update, trailer bounds are computed, or packaging report updates
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !trailerBounds) return;
    update3DSlots(scene, activeTemplate, routeStops, removedOrderIds, slotMeshesRef, checkLifoViolation, trailerBounds);
  }, [activeTemplate, routeStops, removedOrderIds, batch, trailerBounds, packagingReport]);

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
