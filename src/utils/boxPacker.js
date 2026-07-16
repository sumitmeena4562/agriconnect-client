// Available Box Types (dimensions in cm, capacities)
export const BOX_TYPES = [
  { id: 'S', name: 'Small Box', length: 60, width: 40, height: 30, maxWeight: 20, volume: 0.072 },
  { id: 'M', name: 'Medium Box', length: 65, width: 50, height: 40, maxWeight: 35, volume: 0.130 },
  { id: 'L', name: 'Large Box', length: 80, width: 60, height: 50, maxWeight: 50, volume: 0.240 },
  { id: 'XL', name: 'Extra Large Box', length: 100, width: 80, height: 60, maxWeight: 80, volume: 0.480 }
];

// Crop Characteristics dictionary (Enterprise Vegetable Properties)
export const CROP_PROPERTIES = {
  tomato: { density: 400, fragility: 'High', maxWeightPerBox: 15, fillingRatio: 0.75, color: '#fda4af', tapeColor: '#dc2626' }, // rose-300 / red-600
  capsicum: { density: 350, fragility: 'High', maxWeightPerBox: 12, fillingRatio: 0.75, color: '#86efac', tapeColor: '#16a34a' }, // green-300 / green-600
  mango: { density: 450, fragility: 'High', maxWeightPerBox: 18, fillingRatio: 0.80, color: '#fef08a', tapeColor: '#eab308' }, // yellow-200 / yellow-500
  strawberry: { density: 300, fragility: 'High', maxWeightPerBox: 10, fillingRatio: 0.70, color: '#fca5a5', tapeColor: '#e11d48' }, // red-300 / rose-600
  potato: { density: 750, fragility: 'Low', maxWeightPerBox: 40, fillingRatio: 0.95, color: '#c08758', tapeColor: '#78350f' }, // kraft-dark / brown
  onion: { density: 700, fragility: 'Low', maxWeightPerBox: 35, fillingRatio: 0.95, color: '#fed7aa', tapeColor: '#c2410c' }, // orange-200 / orange-700
  garlic: { density: 650, fragility: 'Low', maxWeightPerBox: 30, fillingRatio: 0.95, color: '#f1f5f9', tapeColor: '#475569' }, // slate-100 / slate-600
  cabbage: { density: 250, fragility: 'Medium', maxWeightPerBox: 20, fillingRatio: 0.85, color: '#bbf7d0', tapeColor: '#15803d' }, // green-200 / green-700
  coriander: { density: 180, fragility: 'Medium', maxWeightPerBox: 10, fillingRatio: 0.80, color: '#86efac', tapeColor: '#166534' }, // green-300 / green-800
  spinach: { density: 200, fragility: 'Medium', maxWeightPerBox: 12, fillingRatio: 0.80, color: '#4ade80', tapeColor: '#14532d' } // green-400 / green-900
};

export const getCropProp = (cropName = '') => {
  const name = cropName.toLowerCase();
  for (const key in CROP_PROPERTIES) {
    if (name.includes(key)) {
      return CROP_PROPERTIES[key];
    }
  }
  // Default properties for other vegetables
  return { density: 500, fragility: 'Medium', maxWeightPerBox: 25, fillingRatio: 0.85, color: '#d29b6c', tapeColor: '#b48256' }; // standard kraft brown
};

/**
 * Calculates optimal packaging for a set of orders.
 */
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
      trailerOccupancyData: []
    };
  }

  let totalWeight = 0;
  let totalVolume = 0;
  const recommendedBoxes = [];

  orders.forEach(order => {
    const cropName = order.crop?.name || 'Vegetables';
    const weight = order.requestedQuantity || 0;
    const cropProp = getCropProp(cropName);

    // Step 1: Calculate volume of vegetable (Volume = Weight / Density)
    const baseVolume = weight / cropProp.density;
    // Step 2 & 3: Add Packaging Buffer (15% i.e. x 1.15)
    const requiredVolume = baseVolume * 1.15;

    totalWeight += weight;
    totalVolume += requiredVolume;

    // Step 4: Split order into multiple boxes if necessary
    const maxWeightLimit = Math.min(cropProp.maxWeightPerBox, 80);
    const minBoxesByWeight = Math.ceil(weight / maxWeightLimit);

    // Recommended Box selection algorithm
    let chosenBox = BOX_TYPES[1]; // Default to Medium Box
    let minWastedVolume = Infinity;

    BOX_TYPES.forEach(box => {
      const singleBoxVol = box.volume * cropProp.fillingRatio;
      const boxesNeededByVol = Math.ceil(requiredVolume / singleBoxVol);
      const boxesNeeded = Math.max(minBoxesByWeight, boxesNeededByVol);
      
      const totalBoxVol = boxesNeeded * box.volume;
      const wastedVol = totalBoxVol - requiredVolume;

      const avgWeightPerBox = weight / boxesNeeded;
      if (avgWeightPerBox <= box.maxWeight && wastedVol >= 0 && wastedVol < minWastedVolume) {
        minWastedVolume = wastedVol;
        chosenBox = box;
      }
    });

    const singleBoxVol = chosenBox.volume * cropProp.fillingRatio;
    const finalBoxesCount = Math.max(minBoxesByWeight, Math.ceil(requiredVolume / singleBoxVol));

    recommendedBoxes.push({
      orderId: order._id,
      cropName,
      weight,
      boxType: chosenBox.id,
      boxName: chosenBox.name,
      boxDimensions: `${chosenBox.length}×${chosenBox.width}×${chosenBox.height} cm`,
      count: finalBoxesCount,
      volumePerBox: chosenBox.volume,
      weightPerBox: weight / finalBoxesCount,
      color: cropProp.color,
      tapeColor: cropProp.tapeColor,
      fragility: cropProp.fragility
    });
  });

  // Vehicle limit integrations
  const maxVehicleVolume = vehicleTemplate?.capacityVolume || 12.0; // m³
  const maxVehicleWeight = vehicleTemplate?.capacity || 2500; // kg

  const totalBoxesCount = recommendedBoxes.reduce((sum, b) => sum + b.count, 0);
  const totalBoxesVolume = recommendedBoxes.reduce((sum, b) => sum + (b.count * b.volumePerBox), 0);

  const weightUtilization = (totalWeight / maxVehicleWeight) * 100;
  const volumeUtilization = (totalBoxesVolume / maxVehicleVolume) * 100;
  const vehicleUtilization = Math.min(100, Math.round(Math.max(weightUtilization, volumeUtilization)));

  const remainingVolume = Math.max(0, maxVehicleVolume - totalBoxesVolume);
  const remainingWeight = Math.max(0, maxVehicleWeight - totalWeight);

  // Generate 3D digital twin slot occupancy
  const rows = vehicleTemplate?.rows || 2;
  const cols = vehicleTemplate?.cols || 3;

  const trailerOccupancyData = [];
  let currentBoxIndex = 0;

  // Flattened array of individual boxes
  const flatBoxes = [];
  recommendedBoxes.forEach(item => {
    for (let i = 0; i < item.count; i++) {
      flatBoxes.push(item);
    }
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const slotNum = r * cols + c + 1;
      const box = flatBoxes[currentBoxIndex] || null;

      trailerOccupancyData.push({
        slotIndex: slotNum,
        row: r,
        col: c,
        isFilled: !!box,
        color: box ? box.color : '#e2e8f0',
        tapeColor: box ? box.tapeColor : '#cbd5e1',
        cargoInfo: box ? {
          cropName: box.cropName,
          weight: Math.round(box.weightPerBox),
          boxType: box.boxType,
          fragility: box.fragility
        } : null
      });

      if (box) currentBoxIndex++;
    }
  }

  return {
    totalWeight,
    totalVolume: totalBoxesVolume.toFixed(3),
    recommendedBoxes,
    totalBoxesCount,
    vehicleUtilization,
    remainingCapacityVolume: remainingVolume.toFixed(3),
    remainingCapacityWeight: remainingWeight,
    trailerOccupancyData
  };
};
