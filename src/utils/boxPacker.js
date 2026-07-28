// ─────────────────────────────────────────────────────────────────────────────
// Real-World Box Specifications (Indian Market Standard Vegetable Boxes)
// Dimensions: L × W × H in cm, Volume in m³
// ─────────────────────────────────────────────────────────────────────────────
export const BOX_TYPES = [
  { id: 'S',  name: 'Small Box',       length: 50,  width: 35,  height: 30, maxWeight: 15, volume: 0.0525 },
  { id: 'M',  name: 'Medium Box',      length: 65,  width: 45,  height: 40, maxWeight: 30, volume: 0.1170 },
  { id: 'L',  name: 'Large Box',       length: 80,  width: 55,  height: 50, maxWeight: 50, volume: 0.2200 },
  { id: 'XL', name: 'Extra Large Box', length: 100, width: 70,  height: 60, maxWeight: 80, volume: 0.4200 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Crop Properties — Indian Agricultural Standards
// density: kg/m³ (bulk density with air gaps)
// maxWeightPerBox: kg per box (fragility-adjusted limit)
// fillingRatio: usable space inside box (0–1)
// stackLimit: max number of box layers (fragility-based)
// ─────────────────────────────────────────────────────────────────────────────
export const CROP_PROPERTIES = {
  tomato:      { density: 380, fragility: 'High',   maxWeightPerBox: 12, fillingRatio: 0.72, stackLimit: 2, color: '#fda4af', tapeColor: '#dc2626' },
  capsicum:    { density: 320, fragility: 'High',   maxWeightPerBox: 10, fillingRatio: 0.70, stackLimit: 2, color: '#86efac', tapeColor: '#16a34a' },
  mango:       { density: 430, fragility: 'High',   maxWeightPerBox: 15, fillingRatio: 0.78, stackLimit: 2, color: '#fef08a', tapeColor: '#eab308' },
  strawberry:  { density: 280, fragility: 'High',   maxWeightPerBox: 8,  fillingRatio: 0.68, stackLimit: 2, color: '#fca5a5', tapeColor: '#e11d48' },
  potato:      { density: 720, fragility: 'Low',    maxWeightPerBox: 40, fillingRatio: 0.93, stackLimit: 5, color: '#c08758', tapeColor: '#78350f' },
  onion:       { density: 680, fragility: 'Low',    maxWeightPerBox: 35, fillingRatio: 0.92, stackLimit: 5, color: '#fed7aa', tapeColor: '#c2410c' },
  garlic:      { density: 620, fragility: 'Low',    maxWeightPerBox: 28, fillingRatio: 0.91, stackLimit: 4, color: '#f1f5f9', tapeColor: '#475569' },
  cabbage:     { density: 240, fragility: 'Medium', maxWeightPerBox: 18, fillingRatio: 0.82, stackLimit: 3, color: '#bbf7d0', tapeColor: '#15803d' },
  coriander:   { density: 170, fragility: 'Medium', maxWeightPerBox: 8,  fillingRatio: 0.78, stackLimit: 3, color: '#86efac', tapeColor: '#166534' },
  spinach:     { density: 190, fragility: 'Medium', maxWeightPerBox: 10, fillingRatio: 0.79, stackLimit: 3, color: '#4ade80', tapeColor: '#14532d' },
  carrot:      { density: 640, fragility: 'Low',    maxWeightPerBox: 30, fillingRatio: 0.90, stackLimit: 4, color: '#fb923c', tapeColor: '#c2410c' },
  cauliflower: { density: 220, fragility: 'Medium', maxWeightPerBox: 15, fillingRatio: 0.80, stackLimit: 3, color: '#f0fdf4', tapeColor: '#166534' },
  brinjal:     { density: 350, fragility: 'Medium', maxWeightPerBox: 20, fillingRatio: 0.80, stackLimit: 3, color: '#c4b5fd', tapeColor: '#7c3aed' },
  peas:        { density: 590, fragility: 'Low',    maxWeightPerBox: 25, fillingRatio: 0.88, stackLimit: 4, color: '#86efac', tapeColor: '#15803d' },
};

export const getCropProp = (cropName = '') => {
  const name = cropName.toLowerCase();
  for (const key in CROP_PROPERTIES) {
    if (name.includes(key)) return CROP_PROPERTIES[key];
  }
  return { density: 480, fragility: 'Medium', maxWeightPerBox: 22, fillingRatio: 0.85, stackLimit: 3, color: '#d29b6c', tapeColor: '#b48256' };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: calculatePackaging
//
// Real physics-based packing logic:
//   1. Volume of crop = weight / bulk_density
//   2. Required box volume = crop_volume / filling_ratio
//   3. Pick smallest box: weight/box ≤ maxWeightPerBox AND covers required volume
//   4. Container dimensions derived from capacityVolume
//   5. Layer count = min(stackLimit, floor(containerHeight / boxHeight))
// ─────────────────────────────────────────────────────────────────────────────
export const calculatePackaging = (orders, vehicleTemplate) => {
  if (!orders || orders.length === 0) {
    return {
      totalWeight: 0,
      totalVolume: '0.000',
      recommendedBoxes: [],
      totalBoxesCount: 0,
      vehicleUtilization: 0,
      remainingCapacityVolume: (vehicleTemplate?.capacityVolume || 12).toFixed(3),
      remainingCapacityWeight: vehicleTemplate?.capacity || 2500,
      trailerOccupancyData: [],
    };
  }

  const maxVehicleVolume = vehicleTemplate?.capacityVolume || 12.0; // m³
  const maxVehicleWeight = vehicleTemplate?.capacity || 2500;        // kg

  // Standard container interior dimensions
  // width = 2.4m, height = 2.2m, length derived from volume
  const containerW = 2.4;
  const containerH = 2.2;
  const containerL = maxVehicleVolume / (containerW * containerH);

  const rows = vehicleTemplate?.rows || 2;
  const cols = vehicleTemplate?.cols || 3;
  const totalSlots = rows * cols;

  let totalWeight = 0;
  const recommendedBoxes = [];

  orders.forEach(order => {
    const cropName = order.crop?.name || 'Vegetables';
    const weight   = order.requestedQuantity || 0;
    const prop     = getCropProp(cropName);

    // Step 1 & 2: How much box volume do we actually need?
    const produceVolM3       = weight / prop.density;
    const requiredBoxVolM3   = produceVolM3 / prop.fillingRatio;

    totalWeight += weight;

    // Step 3: Select best box type (least wasted space, within weight limit)
    const minBoxesByWeight = Math.ceil(weight / prop.maxWeightPerBox);
    let chosenBox  = BOX_TYPES[1];
    let bestScore  = Infinity;

    BOX_TYPES.forEach(box => {
      const effectiveVol = box.volume * prop.fillingRatio;
      const byVol        = Math.ceil(requiredBoxVolM3 / effectiveVol);
      const count        = Math.max(minBoxesByWeight, byVol);
      const avgW         = weight / count;
      if (avgW > box.maxWeight) return;

      const used   = count * box.volume;
      const wasted = used - requiredBoxVolM3;
      if (wasted < 0) return;

      const score = wasted + count * 0.01;
      if (score < bestScore) { bestScore = score; chosenBox = box; }
    });

    const effectiveVol = chosenBox.volume * prop.fillingRatio;
    const finalCount   = Math.max(minBoxesByWeight, Math.ceil(requiredBoxVolM3 / effectiveVol));

    // Step 4: How many layers fit in the container height?
    const boxHeightM   = chosenBox.height / 100;
    const maxLayers    = Math.min(prop.stackLimit, Math.floor(containerH / boxHeightM));

    recommendedBoxes.push({
      orderId:       order._id,
      cropName,
      weight,
      boxType:       chosenBox.id,
      boxName:       chosenBox.name,
      boxDimensions: `${chosenBox.length}×${chosenBox.width}×${chosenBox.height} cm`,
      count:         finalCount,
      maxLayers,
      boxHeightM,
      volumePerBox:  chosenBox.volume,
      weightPerBox:  weight / finalCount,
      color:         prop.color,
      tapeColor:     prop.tapeColor,
      fragility:     prop.fragility,
      boxDims:       { l: chosenBox.length, w: chosenBox.width, h: chosenBox.height },
    });
  });

  const totalBoxesCount  = recommendedBoxes.reduce((s, b) => s + b.count, 0);
  const totalBoxesVolume = recommendedBoxes.reduce((s, b) => s + b.count * b.volumePerBox, 0);

  const weightUtil        = (totalWeight / maxVehicleWeight) * 100;
  const volumeUtil        = (totalBoxesVolume / maxVehicleVolume) * 100;
  const vehicleUtilization = Math.min(100, Math.round(Math.max(weightUtil, volumeUtil)));

  // ── Trailer occupancy data (one slot per order, mapped by index) ──
  const trailerOccupancyData = [];

  recommendedBoxes.forEach((item, idx) => {
    const slotNum = idx + 1;
    if (slotNum > totalSlots) return;
    trailerOccupancyData.push({
      slotIndex: slotNum,
      row:       Math.floor(idx / cols),
      col:       idx % cols,
      isFilled:  true,
      color:     item.color,
      tapeColor: item.tapeColor,
      boxCount:  item.count,
      maxLayers: item.maxLayers,
      boxDims:   item.boxDims,
      cargoInfo: {
        cropName:  item.cropName,
        weight:    Math.round(item.weightPerBox),
        boxType:   item.boxType,
        fragility: item.fragility,
        count:     item.count,
      },
    });
  });

  // Fill remaining empty slots
  for (let i = recommendedBoxes.length + 1; i <= totalSlots; i++) {
    trailerOccupancyData.push({
      slotIndex: i, row: Math.floor((i-1)/cols), col: (i-1)%cols,
      isFilled: false, color: '#e2e8f0', tapeColor: '#cbd5e1',
      boxCount: 0, maxLayers: 0, boxDims: null, cargoInfo: null,
    });
  }

  return {
    totalWeight,
    totalVolume:             totalBoxesVolume.toFixed(3),
    recommendedBoxes,
    totalBoxesCount,
    vehicleUtilization,
    remainingCapacityVolume: Math.max(0, maxVehicleVolume - totalBoxesVolume).toFixed(3),
    remainingCapacityWeight: Math.max(0, maxVehicleWeight - totalWeight),
    trailerOccupancyData,
    containerDims:           { l: containerL, w: containerW, h: containerH },
  };
};
