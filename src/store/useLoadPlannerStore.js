import { create } from 'zustand';
import api from '../utils/api';

const VEHICLE_TEMPLATES = {
  container_truck: {
    type: 'container_truck',
    name: 'Container Truck',
    rows: 2,
    cols: 3,
    capacity: 2500, // kg
    dimensions: { width: 550, height: 160 }
  },
  mini_truck: {
    type: 'mini_truck',
    name: 'Mini Truck',
    rows: 2,
    cols: 2,
    capacity: 1500, // kg
    dimensions: { width: 380, height: 160 }
  },
  pickup_vehicle: {
    type: 'pickup_vehicle',
    name: 'Pickup Vehicle',
    rows: 1,
    cols: 3,
    capacity: 800, // kg
    dimensions: { width: 385, height: 95 }
  },
  bike_delivery: {
    type: 'bike_delivery',
    name: 'Bike Delivery Box',
    rows: 2,
    cols: 1,
    capacity: 150, // kg
    dimensions: { width: 140, height: 140 }
  },
  tractor_trolley: {
    type: 'tractor_trolley',
    name: 'Tractor Trolley',
    rows: 2,
    cols: 2,
    capacity: 2000, // kg
    dimensions: { width: 400, height: 155 }
  },
  warehouse: {
    type: 'warehouse',
    name: 'Warehouse Bay Layout',
    rows: 3,
    cols: 4,
    capacity: 10000, // kg
    dimensions: { width: 600, height: 240 }
  }
};

export const useLoadPlannerStore = create((set, get) => ({
  vehicleTemplates: VEHICLE_TEMPLATES,
  activeTemplate: VEHICLE_TEMPLATES.container_truck,
  batch: null,
  localRouteStops: [],
  removedOrderIds: new Set(),
  savingPlan: false,
  draggedItem: null,

  setActiveTemplate: (templateType) => {
    const template = VEHICLE_TEMPLATES[templateType];
    if (template) {
      set({ activeTemplate: template });
      get().recalculateLoadingSequences();
    }
  },

  setBatch: (batch) => {
    set({ 
      batch, 
      localRouteStops: batch?.optimizedRoute || [],
      removedOrderIds: new Set()
    });
    
    // Choose appropriate vehicle template by driver vehicleType
    const vType = batch?.driver?.vehicleType;
    if (vType === 'Bike') {
      get().setActiveTemplate('bike_delivery');
    } else if (vType === 'Tractor') {
      get().setActiveTemplate('tractor_trolley');
    } else if (vType === 'Mini Truck') {
      get().setActiveTemplate('mini_truck');
    } else if (vType === 'Pickup') {
      get().setActiveTemplate('pickup_vehicle');
    } else {
      get().setActiveTemplate('container_truck');
    }
  },

  setDraggedItem: (item) => set({ draggedItem: item }),

  moveStop: (idx, direction) => {
    const stops = [...get().localRouteStops];
    const pickups = stops.filter(s => s.stopType === 'pickup');
    const deliveries = stops.filter(s => s.stopType === 'delivery');
    
    if (direction === 'up' && idx > 0) {
      const temp = deliveries[idx];
      deliveries[idx] = deliveries[idx - 1];
      deliveries[idx - 1] = temp;
    } else if (direction === 'down' && idx < deliveries.length - 1) {
      const temp = deliveries[idx];
      deliveries[idx] = deliveries[idx + 1];
      deliveries[idx + 1] = temp;
    }

    // Reassign sequences
    let seq = pickups.length + 1;
    deliveries.forEach((stop, index) => {
      stop.sequence = seq++;
      stop.loadingSequence = deliveries.length - index;
    });

    set({ localRouteStops: [...pickups, ...deliveries] });
  },

  removeOrderFromBatch: (orderId) => {
    set(state => {
      const updated = new Set(state.removedOrderIds);
      updated.add(String(orderId));
      return { removedOrderIds: updated };
    });

    const filtered = get().localRouteStops.filter(s => String(s.orderId) !== String(orderId));
    const pickups = filtered.filter(s => s.stopType === 'pickup');
    const deliveries = filtered.filter(s => s.stopType === 'delivery');

    let seq = 1;
    pickups.forEach((stop) => { stop.sequence = seq++; });
    deliveries.forEach((stop, index) => {
      stop.sequence = seq++;
      stop.loadingSequence = deliveries.length - index;
    });

    set({ localRouteStops: [...pickups, ...deliveries] });
  },

  recalculateLoadingSequences: () => {
    const stops = [...get().localRouteStops];
    const pickups = stops.filter(s => s.stopType === 'pickup');
    const deliveries = stops.filter(s => s.stopType === 'delivery');

    deliveries.forEach((stop, index) => {
      stop.loadingSequence = deliveries.length - index;
    });

    set({ localRouteStops: [...pickups, ...deliveries] });
  },

  saveLoadPlan: async (navigate) => {
    const { batch, localRouteStops, removedOrderIds } = get();
    if (!batch) return;
    
    set({ savingPlan: true });
    try {
      const res = await api.put(`/batches/${batch._id}/load-plan`, {
        optimizedRoute: localRouteStops,
        orderIdsToRemove: Array.from(removedOrderIds)
      });
      if (res.data.success) {
        set({ savingPlan: false });
        if (navigate) {
          navigate('/farmer-dashboard/batches');
        }
        return true;
      }
    } catch (err) {
      set({ savingPlan: false });
      throw err;
    }
  }
}));
