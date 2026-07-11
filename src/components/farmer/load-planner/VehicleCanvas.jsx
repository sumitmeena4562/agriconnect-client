import React, { useRef } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Group } from 'react-konva';
import { useLoadPlannerStore } from '../../../store/useLoadPlannerStore';
import { toast } from 'react-hot-toast';

const VehicleCanvas = () => {
  const { 
    activeTemplate, 
    localRouteStops, 
    removedOrderIds, 
    batch, 
    setDraggedItem, 
    draggedItem,
    localRouteStops: routeStops
  } = useLoadPlannerStore();

  const stageContainerRef = useRef(null);

  const activeOrders = batch?.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
  const deliveryStops = routeStops.filter(
    s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId))
  );

  // Setup Dimensions
  const canvasW = 760;
  const canvasH = 300;
  
  // Calculate slot dimensions based on template configs
  const rows = activeTemplate.rows;
  const cols = activeTemplate.cols;
  const tWidth = activeTemplate.dimensions.width;
  const tHeight = activeTemplate.dimensions.height;

  // Center the vehicle in canvas
  const startX = 140 + (550 - tWidth) / 2; // Cabin is on the left
  const startY = (canvasH - tHeight) / 2 - 10;

  const slotW = tWidth / cols;
  const slotH = tHeight / rows;

  // LIFO Check Helper
  const checkLifoViolation = (stop) => {
    return deliveryStops.some(other => {
      return other.loadingSequence > stop.loadingSequence && stop.sequence < other.sequence;
    });
  };

  // Convert client drop coordinates to canvas coordinates
  const handleHTMLDrop = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    const stageContainer = stageContainerRef.current;
    if (!stageContainer) return;

    const rect = stageContainer.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;

    // Check if drop is inside trailer bounds
    if (dropX >= startX && dropX <= startX + tWidth && dropY >= startY && dropY <= startY + tHeight) {
      const colIdx = Math.floor((dropX - startX) / slotW);
      const rowIdx = Math.floor((dropY - startY) / slotH);
      const targetSlot = rowIdx * cols + colIdx;
      const targetLoadSeq = targetSlot + 1;

      // Find if another order is already placed in this slot
      const existingStop = deliveryStops.find(s => s.loadingSequence === targetLoadSeq);
      
      // Update stops
      const pickups = routeStops.filter(s => s.stopType === 'pickup');
      const deliveries = [...deliveryStops];

      // Find the dragged stop
      const draggedStopIdx = deliveries.findIndex(s => String(s.orderId) === String(draggedItem.orderId));
      if (draggedStopIdx !== -1) {
        const draggedStop = deliveries[draggedStopIdx];

        if (existingStop) {
          // Swap loading sequences
          const tempSeq = existingStop.loadingSequence;
          existingStop.loadingSequence = draggedStop.loadingSequence;
          draggedStop.loadingSequence = tempSeq;
        } else {
          draggedStop.loadingSequence = targetLoadSeq;
        }

        // Reassign route sequences (sequence = pickup_count + deliveries sorted by loadingSequence DESC)
        // Deliveries are sorted by sequence: Deliveries loaded last (loadingSequence N) deliver first (sequence 1)
        const sortedDeliveries = [...deliveries].sort((a, b) => b.loadingSequence - a.loadingSequence);
        let seq = pickups.length + 1;
        sortedDeliveries.forEach(stop => {
          stop.sequence = seq++;
        });

        // Save back to store
        useLoadPlannerStore.setState({ localRouteStops: [...pickups, ...deliveries] });
        toast.success(`Positioned cargo in slot ${targetLoadSeq}`);
      }
    }

    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Render vector cabin profiles based on vehicle template type
  const renderVehicleCabin = () => {
    const type = activeTemplate.type;
    const baseColor = '#e2e8f0';
    const borderColor = '#94a3b8';
    
    // Y positioning align with trailer
    const bottomY = startY + tHeight;

    if (type === 'bike_delivery') {
      // Draw a scooter/bike profile on the left
      return (
        <Group>
          {/* Frame */}
          <Line points={[startX - 100, bottomY - 10, startX - 80, bottomY - 35, startX - 50, bottomY - 35, startX - 10, bottomY - 20]} stroke={borderColor} strokeWidth={3} lineCap="round" />
          <Line points={[startX - 80, bottomY - 35, startX - 70, bottomY - 60, startX - 55, bottomY - 60]} stroke={borderColor} strokeWidth={2.5} lineCap="round" /> {/* Handlebars */}
          {/* Wheels */}
          <Circle cx={startX - 90} cy={bottomY - 10} r={10} fill="#334155" stroke={borderColor} strokeWidth={2} />
          <Circle cx={startX - 90} cy={bottomY - 10} r={3} fill="#cbd5e1" />
          <Circle cx={startX - 20} cy={bottomY - 10} r={10} fill="#334155" stroke={borderColor} strokeWidth={2} />
          <Circle cx={startX - 20} cy={bottomY - 10} r={3} fill="#cbd5e1" />
        </Group>
      );
    }

    if (type === 'tractor_trolley') {
      // Draw a realistic tractor on the left
      return (
        <Group>
          {/* Big Rear wheel */}
          <Circle cx={startX - 30} cy={bottomY - 15} r={18} fill="#1e293b" stroke={borderColor} strokeWidth={3} />
          <Circle cx={startX - 30} cy={bottomY - 15} r={6} fill="#f1f5f9" />
          {/* Small Front wheel */}
          <Circle cx={startX - 85} cy={bottomY - 10} r={10} fill="#1e293b" stroke={borderColor} strokeWidth={2.5} />
          <Circle cx={startX - 85} cy={bottomY - 10} r={3} fill="#f1f5f9" />
          {/* Body */}
          <Rect x={startX - 95} y={bottomY - 45} width={45} height={35} fill={baseColor} stroke={borderColor} strokeWidth={2} cornerRadius={3} />
          {/* Cabin cap */}
          <Rect x={startX - 50} y={bottomY - 65} width={30} height={50} fill={baseColor} stroke={borderColor} strokeWidth={2} cornerRadius={4} />
          <Rect x={startX - 45} y={bottomY - 60} width={12} height={20} fill="#334155" />
          {/* Chimney / Silencer */}
          <Line points={[startX - 80, bottomY - 45, startX - 80, bottomY - 75]} stroke="#64748b" strokeWidth={3} lineCap="round" />
        </Group>
      );
    }

    if (type === 'pickup_vehicle') {
      // Small pickup cab
      return (
        <Group>
          {/* Cab body */}
          <path d={`M${startX - 50} ${bottomY} L${startX - 50} ${bottomY - 45} C${startX - 50} ${bottomY - 48}, ${startX - 46} ${bottomY - 50}, ${startX - 40} ${bottomY - 50} L${startX - 15} ${bottomY - 50} C${startX - 8} ${bottomY - 50}, ${startX - 4} ${bottomY - 45}, ${startX - 2} ${bottomY - 35} L${startX} ${bottomY - 35} L${startX} ${bottomY} Z`} fill={baseColor} stroke={borderColor} strokeWidth={2} />
          {/* Window */}
          <path d={`M${startX - 30} ${bottomY - 45} L${startX - 15} ${bottomY - 45} L${startX - 6} ${bottomY - 35} L${startX - 30} ${bottomY - 35} Z`} fill="#334155" />
          {/* Wheel */}
          <Circle cx={startX - 25} cy={bottomY - 10} r={10} fill="#1e293b" stroke={borderColor} strokeWidth={2.5} />
          <Circle cx={startX - 25} cy={bottomY - 10} r={4} fill="#f8fafc" />
        </Group>
      );
    }

    if (type === 'warehouse') {
      // Warehouse outline
      return null;
    }

    // Default: Container Truck / Mini Truck
    return (
      <Group>
        {/* Exhaust pipe */}
        <Line points={[startX - 120, startY + 5, startX - 120, bottomY - 35]} stroke="#64748b" strokeWidth={4} lineCap="round" />
        {/* Cabin shell */}
        <path d={`M${startX - 130} ${bottomY} L${startX - 130} ${bottomY - 58} C${startX - 130} ${bottomY - 62}, ${startX - 126} ${bottomY - 64}, ${startX - 120} ${bottomY - 64} L${startX - 75} ${bottomY - 64} C${startX - 65} ${bottomY - 64}, ${startX - 55} ${bottomY - 74}, ${startX - 49} ${bottomY - 84} L${startX - 22} ${bottomY - 84} C${startX - 16} ${bottomY - 84}, ${startX - 12} ${bottomY - 80}, ${startX - 9} ${bottomY - 75} L${startX - 3} ${bottomY - 52} L${startX} ${bottomY - 52} L${startX} ${bottomY} Z`} fill={baseColor} stroke={borderColor} strokeWidth={2} />
        {/* Window */}
        <path d={`M${startX - 62} ${bottomY - 58} L${startX - 48} ${bottomY - 78} L${startX - 32} ${bottomY - 78} C${startX - 30} ${bottomY - 78}, ${startX - 28} ${bottomY - 77}, ${startX - 27} ${bottomY - 75} L${startX - 18} ${bottomY - 58} Z`} fill="#1e293b" />
        {/* Front wheel */}
        <Circle cx={startX - 35} cy={bottomY - 10} r={12} fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
        <Circle cx={startX - 35} cy={bottomY - 10} r={4} fill="#f8fafc" />
      </Group>
    );
  };

  return (
    <div 
      ref={stageContainerRef}
      onDragOver={handleDragOver}
      onDrop={handleHTMLDrop}
      className="flex items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-3xl relative overflow-hidden select-none"
    >
      <Stage width={canvasW} height={canvasH}>
        <Layer>
          {/* ── Visual Cabin Profile ── */}
          {renderVehicleCabin()}

          {/* ── Trailer Outline ── */}
          {activeTemplate.type !== 'warehouse' && (
            <Rect
              x={startX}
              y={startY}
              width={tWidth}
              height={tHeight}
              stroke="#64748b"
              strokeWidth={3}
              fill="#f1f3f5"
              cornerRadius={activeTemplate.type === 'pickup_vehicle' ? 4 : [0, 8, 8, 0]}
            />
          )}

          {/* ── Warehouse Outer Boundaries ── */}
          {activeTemplate.type === 'warehouse' && (
            <Rect
              x={startX}
              y={startY}
              width={tWidth}
              height={tHeight}
              stroke="#cbd5e1"
              strokeWidth={4}
              strokeScaleEnabled={false}
              dash={[6, 4]}
              fill="#fafafa"
              cornerRadius={12}
            />
          )}

          {/* ── Visual Slots inside Trailer/Warehouse ── */}
          {(() => {
            const cells = [];
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const slotIdx = r * cols + c;
                const slotNum = slotIdx + 1;
                const cellX = startX + c * slotW + 5;
                const cellY = startY + r * slotH + 5;
                const cellW = slotW - 10;
                const cellH = slotH - 10;

                const stop = deliveryStops.find(s => s.loadingSequence === slotNum);

                if (!stop) {
                  // Empty slot rendering
                  cells.push(
                    <Group key={`empty-${slotIdx}`}>
                      <Rect
                        x={cellX}
                        y={cellY}
                        width={cellW}
                        height={cellH}
                        fill="#f8f9fa"
                        stroke="#cbd5e1"
                        strokeWidth={1.5}
                        dash={[4, 4]}
                        cornerRadius={8}
                      />
                      <Text
                        x={cellX + 5}
                        y={cellY + cellH / 2 - 5}
                        width={cellW - 10}
                        text={`SLOT ${slotNum}`}
                        fontSize={8.5}
                        fontStyle="bold"
                        align="center"
                        fill="#94a3b8"
                      />
                    </Group>
                  );
                } else {
                  // Filled slot rendering
                  const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
                  const isViolated = checkLifoViolation(stop);

                  cells.push(
                    <Group key={`cargo-${stop.orderId}`}>
                      <Rect
                        x={cellX}
                        y={cellY}
                        width={cellW}
                        height={cellH}
                        fill={isViolated ? '#fdf4ff' : '#ffffff'}
                        stroke={isViolated ? '#c084fc' : '#e2e8f0'}
                        strokeWidth={2}
                        cornerRadius={8}
                        shadowColor="#0f172a"
                        shadowBlur={1}
                        shadowOpacity={0.04}
                        shadowOffset={{ x: 0, y: 1 }}
                      />
                      
                      {/* Top Row Stops Tag */}
                      <Text
                        x={cellX + 8}
                        y={cellY + 8}
                        text={`S-${stop.sequence - routeStops.filter(s => s.stopType === 'pickup').length}`}
                        fontSize={8}
                        fontStyle="black"
                        fill={isViolated ? '#a855f7' : '#4f46e5'}
                      />

                      {/* Weight Tag (top right) */}
                      <Text
                        x={cellX + cellW - 55}
                        y={cellY + 8}
                        width={48}
                        text={`${order?.requestedQuantity || 0} ${order?.crop?.unit || ''}`}
                        fontSize={8}
                        fontStyle="bold"
                        align="right"
                        fill="#64748b"
                      />

                      {/* Crop Name (bold middle) */}
                      <Text
                        x={cellX + 8}
                        y={cellY + cellH / 2 - 6}
                        width={cellW - 16}
                        text={order?.crop?.name || 'Crop'}
                        fontSize={10.5}
                        fontStyle="black"
                        align="center"
                        wrap="char"
                        fill="#1e293b"
                      />

                      {/* Loading Sequence */}
                      <Text
                        x={cellX + 8}
                        y={cellY + cellH - 16}
                        text={`L-${stop.loadingSequence}`}
                        fontSize={8}
                        fontStyle="bold"
                        fill="#94a3b8"
                      />

                      {/* Status indicator */}
                      {isViolated ? (
                        <Text
                          x={cellX + cellW - 55}
                          y={cellY + cellH - 16}
                          width={48}
                          text="LIFO ALERT"
                          fontSize={7.5}
                          fontStyle="black"
                          align="right"
                          fill="#a855f7"
                        />
                      ) : (
                        <Text
                          x={cellX + cellW - 55}
                          y={cellY + cellH - 16}
                          width={48}
                          text="LOADED"
                          fontSize={7.5}
                          fontStyle="black"
                          align="right"
                          fill="#059669"
                        />
                      )}
                    </Group>
                  );
                }
              }
            }
            return cells;
          })()}

          {/* ── Trailer Wheels (for Trucks/Trolleys) ── */}
          {activeTemplate.type !== 'warehouse' && activeTemplate.type !== 'bike_delivery' && activeTemplate.type !== 'tractor_trolley' && (
            <Group>
              <Circle cx={startX + 40} cy={startY + tHeight + 2} r={10} fill="#1e293b" stroke="#cbd5e1" strokeWidth={1.5} />
              <Circle cx={startX + 40} cy={startY + tHeight + 2} r={3} fill="#cbd5e1" />
              <Circle cx={startX + 60} cy={startY + tHeight + 2} r={10} fill="#1e293b" stroke="#cbd5e1" strokeWidth={1.5} />
              <Circle cx={startX + 60} cy={startY + tHeight + 2} r={3} fill="#cbd5e1" />

              <Circle cx={startX + tWidth - 50} cy={startY + tHeight + 2} r={10} fill="#1e293b" stroke="#cbd5e1" strokeWidth={1.5} />
              <Circle cx={startX + tWidth - 50} cy={startY + tHeight + 2} r={3} fill="#cbd5e1" />
              <Circle cx={startX + tWidth - 30} cy={startY + tHeight + 2} r={10} fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
              <Circle cx={startX + tWidth - 30} cy={startY + tHeight + 2} r={3} fill="#cbd5e1" />
            </Group>
          )}

          {/* Trolley wheel configuration */}
          {activeTemplate.type === 'tractor_trolley' && (
            <Group>
              <Circle cx={startX + 60} cy={startY + tHeight + 2} r={12} fill="#1e293b" stroke="#cbd5e1" strokeWidth={1.5} />
              <Circle cx={startX + 60} cy={startY + tHeight + 2} r={4} fill="#cbd5e1" />

              <Circle cx={startX + tWidth - 60} cy={startY + tHeight + 2} r={12} fill="#1e293b" stroke="#cbd5e1" strokeWidth={1.5} />
              <Circle cx={startX + tWidth - 60} cy={startY + tHeight + 2} r={4} fill="#cbd5e1" />
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default VehicleCanvas;
