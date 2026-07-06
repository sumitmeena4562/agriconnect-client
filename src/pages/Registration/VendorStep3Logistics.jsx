import React, { useState, useEffect, useRef, useCallback } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const VendorStep3Logistics = ({ data, updateData, submitForm, prevStep }) => {
  const [errors, setErrors] = useState({});
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | success | error
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  
  // Leaflet Map refs
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // 1. Validation Logic
  const validate = () => {
    let newErrors = {};
    if (!data.state || data.state.trim().length < 2) newErrors.state = "State is required";
    if (!data.city || data.city.trim().length < 2) newErrors.city = "City is required";
    if (!data.godownAddress || data.godownAddress.trim().length < 5) newErrors.godownAddress = "Please enter a complete address";
    
    // GPS coordinates validation
    if (!data.lat || !data.lng) {
      newErrors.gps = "⚠️ Delivery coordinates are required. Kripya GPS Auto-Detect karein ya Address fill karein.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // 2. Dynamic CDN Loading for Leaflet
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

  // 3. Nominatim Geocoding Fallback for Text Address ➔ Coords
  const geocodeAddress = useCallback(async (st, ct, adr) => {
    if (!st && !ct && !adr) return;
    try {
      const queryStr = [adr, ct, st, 'India'].filter(Boolean).join(', ');
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryStr)}&format=json&limit=1`);
      if (!response.ok) throw new Error('Geocoding response error');
      const results = await response.json();
      if (results && results.length > 0) {
        const latVal = parseFloat(results[0].lat);
        const lngVal = parseFloat(results[0].lon);
        updateData({ lat: latVal, lng: lngVal });
        setErrors(prev => ({ ...prev, gps: '' }));
        return { lat: latVal, lng: lngVal };
      }
    } catch (e) {
      console.warn('Vendor Geocoding fallback failed:', e.message);
    }
    return null;
  }, [updateData]);

  // Geocode address when user changes inputs (onBlur event)
  const handleAddressBlur = () => {
    if (data.state && data.city && data.godownAddress) {
      if (gpsStatus !== 'success') {
        geocodeAddress(data.state, data.city, data.godownAddress);
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
        
        updateData({
          lat: latitude,
          lng: longitude
        });

        setGpsAccuracy(Math.round(accuracy));
        setGpsStatus('success');

        // Clear GPS warning error
        setErrors(prev => ({ ...prev, gps: '' }));
      },
      (error) => {
        console.error('[Vendor Registration GPS] Error:', error);
        setGpsStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  // 5. Leaflet Map setup and sync
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = window.L;

    const currentLat = data.lat || 20.5937; // Default India Center
    const currentLng = data.lng || 78.9629;
    const defaultZoom = data.lat && data.lng ? 15 : 4;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true })
        .setView([currentLat, currentLng], defaultZoom);

      // Default Satellite tiles so vendors can see actual building landmarks
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      submitForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
      {/* Sleek Warning Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-[10.5px] leading-tight text-amber-900 flex items-start gap-1.5">
        <span className="material-symbols-outlined text-[14px] shrink-0 text-amber-600">warning</span>
        <p><b>Godown par khade hokar register karein:</b> Delivery vehicle routes aur automatic distance calculations isi coordinates se set honge.</p>
      </div>

      {/* Grouped State & City (Side-by-Side) */}
      <div className="grid grid-cols-2 gap-2.5">
        <Input 
          label="State" 
          id="state" 
          name="state"
          type="text"
          placeholder="Maharashtra" 
          value={data.state || ''}
          onChange={handleChange}
          onBlur={handleAddressBlur}
          error={errors.state}
          required
        />
        <Input 
          label="City / District" 
          id="city" 
          name="city"
          type="text"
          placeholder="Nashik" 
          value={data.city || ''}
          onChange={handleChange}
          onBlur={handleAddressBlur}
          error={errors.city}
          required
        />
      </div>

      {/* Godown Address & GPS Button Group */}
      <div className="space-y-1">
        <label htmlFor="godownAddress" className="block text-[13px] font-bold text-slate-700">
          Godown Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="godownAddress"
          name="godownAddress"
          value={data.godownAddress || ''}
          onChange={handleChange}
          onBlur={handleAddressBlur}
          placeholder="Complete address of your shop/godown"
          className={`w-full px-3 py-1.5 bg-white border ${errors.godownAddress ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-500'} rounded-[var(--form-border-radius)] text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all`}
          rows="2"
          required
        />
        {errors.godownAddress && (
          <p className="text-[10px] font-bold text-red-500">{errors.godownAddress}</p>
        )}
      </div>

      {/* GPS Detector button */}
      <div>
        <button
          type="button"
          onClick={handleAutoDetect}
          className={`w-full h-[38px] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
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
            ? 'Scanning GPS...'
            : gpsStatus === 'success'
            ? `Detected! Accuracy: ~${gpsAccuracy}m`
            : '📍 Auto-Detect Godown Location'}
        </button>
      </div>

      {/* Errors displays */}
      {errors.gps && (
        <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 py-1 px-2.5 rounded-lg">
          {errors.gps}
        </p>
      )}

      {/* Satellite map view (Sleek height) */}
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

      <div className="mt-4 flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
        <Button type="submit" disabled={gpsStatus === 'loading'}>Complete Registration</Button>
      </div>
    </form>
  );
};

export default VendorStep3Logistics;
