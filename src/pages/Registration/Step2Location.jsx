import React, { useState, useEffect, useRef, useCallback } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { validateLocationString, validateRequired } from '../../utils/validation';

const Step2Location = ({ data, updateData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | success | error
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  
  // Leaflet Map states
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // 1. Validate individual fields
  const validateField = (name, value) => {
    let errMsg = '';
    if (name === 'state') errMsg = validateRequired(value);
    if (name === 'district') errMsg = validateLocationString(value, 'District');
    if (name === 'village') errMsg = validateLocationString(value, 'Village');
    
    setErrors((prev) => ({ ...prev, [name]: errMsg }));
    return errMsg === '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
    validateField(name, value);
  };

  // 2. Load Leaflet CDNs dynamically
  useEffect(() => {
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // 3. Nominatim Geocoding Fallback (Text Address ➔ Coords)
  const geocodeAddress = useCallback(async (st, dist, vil) => {
    if (!st && !dist && !vil) return;
    try {
      // Find coordinates in India
      const queryStr = [vil, dist, st, 'India'].filter(Boolean).join(', ');
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryStr)}&format=json&limit=1`);
      if (!response.ok) throw new Error('Geocoding response error');
      const results = await response.json();
      if (results && results.length > 0) {
        const latVal = parseFloat(results[0].lat);
        const lngVal = parseFloat(results[0].lon);
        updateData({ lat: latVal, lng: lngVal });
        return { lat: latVal, lng: lngVal };
      }
    } catch (e) {
      console.warn('Geocoding fallback failed:', e.message);
    }
    return null;
  }, [updateData]);

  // Geocode address when user changes inputs (debounce/onBlur effect)
  const handleAddressBlur = () => {
    if (data.state && data.district && data.village) {
      // If user hasn't successfully fetched via High Accuracy GPS yet, trigger geocoding fallback
      if (gpsStatus !== 'success') {
        geocodeAddress(data.state, data.district, data.village);
      }
    }
  };

  // 4. Auto-detect high-accuracy GPS
  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }

    setGpsStatus('loading');
    setGpsAccuracy(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Save coordinates
        updateData({
          lat: latitude,
          lng: longitude
        });

        setGpsAccuracy(Math.round(accuracy));
        setGpsStatus('success');

        // Clean up errors for geocoding since we have high-accuracy coords now
        setErrors(prev => ({ ...prev, gps: '' }));
      },
      (error) => {
        console.error('[Registration GPS] Error fetching position:', error);
        setGpsStatus('error');
      },
      {
        enableHighAccuracy: true, // Force satellite GPS chip
        timeout: 12000,           // Wait up to 12s
        maximumAge: 0             // Fresh coordinates only
      }
    );
  };

  // 5. Leaflet Map render and update
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = window.L;

    const currentLat = data.lat || 20.5937; // Default India Center
    const currentLng = data.lng || 78.9629;
    const defaultZoom = data.lat && data.lng ? 15 : 4;

    // Initialize Map Instance
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([currentLat, currentLng], defaultZoom);

      // Default Satellite tiles so farmers can see their actual fields/houses
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri Satellite Imagery'
      }).addTo(mapInstanceRef.current);

      // Fix Leaflet container size bug (gray box issue)
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
    }

    const map = mapInstanceRef.current;

    // Draw or Update Draggable Marker
    if (data.lat && data.lng) {
      const pos = [data.lat, data.lng];
      map.setView(pos, map.getZoom() < 10 ? 15 : map.getZoom());

      if (markerRef.current) {
        markerRef.current.setLatLng(pos);
      } else {
        markerRef.current = L.marker(pos, {
          draggable: false
        }).addTo(map);
      }
    } else {
      // Remove marker if coordinates are cleared
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }
  }, [mapLoaded, data.lat, data.lng, updateData]);

  // Clean up Leaflet on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    const isStateValid = validateField('state', data.state || '');
    const isDistrictValid = validateField('district', data.district || '');
    const isVillageValid = validateField('village', data.village || '');

    // GPS/Coordinates warning check
    if (!data.lat || !data.lng) {
      setErrors((prev) => ({
        ...prev,
        gps: '⚠️ Location coordinates are required. Kripya GPS Auto-Detect karein ya Address fill karein.'
      }));
      return;
    }

    if (isStateValid && isDistrictValid && isVillageValid) {
      nextStep();
    }
  };

  const stateOptions = [
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Punjab', label: 'Punjab' },
  ];

  return (
    <form onSubmit={handleNext} className="space-y-3">
      {/* Sleek Warning Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-[10.5px] leading-tight text-amber-900 flex items-start gap-1.5">
        <span className="material-symbols-outlined text-[14px] shrink-0 text-amber-600">warning</span>
        <p><b>Khet par khade hokar register karein:</b> Maal pick khet se hoga, isliye correct coordinate hona zaroori hai.</p>
      </div>

      {/* Grouped Address Inputs (Side-by-Side) */}
      <div className="grid grid-cols-2 gap-2.5">
        <Select 
          label="State" 
          id="state" 
          name="state"
          options={stateOptions}
          value={data.state || ''}
          onChange={handleChange}
          onBlur={handleAddressBlur}
          error={errors.state}
          required
        />
        <Input 
          label="District" 
          id="district" 
          name="district"
          type="text"
          placeholder="Nashik" 
          value={data.district || ''}
          onChange={handleChange}
          onBlur={handleAddressBlur}
          error={errors.district}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 items-start">
        <Input 
          label="Village / Gaon" 
          id="village" 
          name="village"
          type="text"
          placeholder="Kolari" 
          value={data.village || ''}
          onChange={handleChange}
          onBlur={handleAddressBlur}
          error={errors.village}
          required
        />
        {/* GPS Detector button wrapper with spacer label for pixel-perfect alignment */}
        <div className="flex flex-col">
          <span className="block text-[13px] font-bold mb-1.5 opacity-0 select-none pointer-events-none">GPS Spacer</span>
          <button
            type="button"
            onClick={handleAutoDetect}
            className={`w-full h-[40px] px-2 rounded-[var(--form-border-radius)] text-[11px] font-black flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              gpsStatus === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : gpsStatus === 'error'
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-900 shadow-sm'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {gpsStatus === 'success' ? 'check_circle' : gpsStatus === 'loading' ? 'sync' : 'gps_fixed'}
            </span>
            {gpsStatus === 'loading'
              ? 'Scanning...'
              : gpsStatus === 'success'
              ? `Acc: ~${gpsAccuracy}m`
              : '📍 Auto GPS'}
          </button>
        </div>
      </div>

      {/* Errors display */}
      {errors.gps && (
        <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 py-1 px-2.5 rounded-lg">
          {errors.gps}
        </p>
      )}

      {/* Map visual confirmation (Sleek height) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-50 flex flex-col h-[130px] relative">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 z-10 bg-white">
            <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-slate-500">Loading Map...</span>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full z-0" />
      </div>

      {data.lat && data.lng && (
        <div className="flex justify-between items-center bg-slate-100/50 px-2 py-1 rounded-lg text-[9px] font-mono text-slate-500 border border-slate-200/50">
          <span>LAT: {data.lat.toFixed(5)} / LNG: {data.lng.toFixed(5)}</span>
          <span className="bg-emerald-500 text-white font-sans text-[7.5px] font-extrabold uppercase px-1 rounded">Confirmed</span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={prevStep}>Back</Button>
        <Button type="submit" disabled={gpsStatus === 'loading'}>Next Step</Button>
      </div>
    </form>
  );
};

export default Step2Location;
