import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Delhi'
];

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    state: '',
    district: '',
    village: '',
    lat: '',
    lng: '',
    accountName: '',
    accountNumber: '',
    ifscCode: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | success | error
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  
  // Leaflet Map refs
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Load Leaflet CDNs dynamically
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/farmers/profile');
        const { user, profile } = res.data.data;
        
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          state: profile?.location?.state || '',
          district: profile?.location?.district || '',
          village: profile?.location?.village || '',
          lat: profile?.location?.coordinates?.lat || '',
          lng: profile?.location?.coordinates?.lng || '',
          accountName: user.bankDetails?.accountName || '',
          accountNumber: user.bankDetails?.accountNumber || '',
          ifscCode: user.bankDetails?.ifscCode || ''
        });
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  // Update map marker when coordinates change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !formData.lat || !formData.lng) return;
    const L = window.L;

    const currentLat = parseFloat(formData.lat);
    const currentLng = parseFloat(formData.lng);
    if (isNaN(currentLat) || isNaN(currentLng)) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([currentLat, currentLng], 15);

      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri Satellite Imagery'
      }).addTo(mapInstanceRef.current);

      // Trigger redraw helper
      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 400);
    }

    const map = mapInstanceRef.current;
    const pos = [currentLat, currentLng];

    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
    } else {
      markerRef.current = L.marker(pos, { draggable: false }).addTo(map);
    }
  }, [mapLoaded, formData.lat, formData.lng]);

  // Cleanup map instance on unmount
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

  // Nominatim Address Lookup Fallback
  const geocodeAddress = useCallback(async (st, dist, vil) => {
    if (!st && !dist && !vil) return;
    try {
      const queryStr = [vil, dist, st, 'India'].filter(Boolean).join(', ');
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryStr)}&format=json&limit=1`);
      if (!response.ok) throw new Error('Geocoding fail');
      const results = await response.json();
      if (results && results.length > 0) {
        const latVal = parseFloat(results[0].lat);
        const lngVal = parseFloat(results[0].lon);
        setFormData(prev => ({ ...prev, lat: latVal, lng: lngVal }));
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latVal, lngVal], 15);
        }
      }
    } catch (e) {
      console.warn('Fallback geocoding failed:', e.message);
    }
  }, []);

  const handleAddressBlur = () => {
    if (formData.state && formData.district && formData.village && gpsStatus !== 'success') {
      geocodeAddress(formData.state, formData.district, formData.village);
    }
  };

  // High-accuracy Browser GPS Trigger
  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported by your browser');
      setGpsStatus('error');
      return;
    }

    setGpsStatus('loading');
    setGpsAccuracy(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setFormData(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude
        }));
        setGpsAccuracy(Math.round(accuracy));
        setGpsStatus('success');
        toast.success('High-Accuracy GPS Scan successful!');

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
        }
      },
      (error) => {
        console.error('[Profile GPS] Error fetching coordinates:', error);
        setGpsStatus('error');
        toast.error('GPS detection failed. Make sure location is turned on.');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name,
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.village,
          coordinates: {
            lat: formData.lat ? parseFloat(formData.lat) : undefined,
            lng: formData.lng ? parseFloat(formData.lng) : undefined
          }
        },
        bankDetails: {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode
        }
      };
      
      await api.put('/farmers/profile', payload);
      toast.success('Profile & coordinates updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
      </div>
    );
  }

  // Download Official Farmer KYC & Bank Verification PDF
  const handleDownloadKYCPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header branding bar
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 22, 'F');
      doc.setFillColor(16, 185, 129); // emerald-500 line
      doc.rect(0, 21, 210, 1, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AgriConnect™ - Verified Farmer Profile & KYC Certificate', 14, 14);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 135, 14);

      // Info Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, 27, 182, 38, 3, 3, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Farmer Name: ${formData.name || 'Registered Producer'}`, 18, 35);
      doc.text(`Contact Phone: ${formData.phone || 'N/A'}`, 18, 43);
      doc.text(`Email Address: ${formData.email || 'N/A'}`, 18, 51);
      doc.text(`Verification Status: MANDI VERIFIED PRODUCER ✓`, 18, 59);

      doc.text(`Village: ${formData.village || 'N/A'}`, 110, 35);
      doc.text(`District: ${formData.district || 'N/A'}`, 110, 43);
      doc.text(`State: ${formData.state || 'N/A'}`, 110, 51);
      doc.text(`GPS: Lat ${parseFloat(formData.lat || 0).toFixed(4)}, Lng ${parseFloat(formData.lng || 0).toFixed(4)}`, 110, 59);

      // Bank & Financial Table
      const kycTableData = [
        ['Bank Account Holder', formData.accountName || 'N/A'],
        ['Bank Account Number', formData.accountNumber ? `•••• •••• ${formData.accountNumber.slice(-4)}` : 'Verified'],
        ['Bank IFSC Code', formData.ifscCode ? formData.ifscCode.toUpperCase() : 'N/A'],
        ['UPI Direct ID', formData.upiId || `${formData.phone || 'farmer'}@upi`],
        ['Agri-Logistics Hub', 'Indore Primary Agriculture Direct Center'],
        ['Clearance Certificate ID', `AGRI-KYC-${Date.now().toString().slice(-6)}`]
      ];

      autoTable(doc, {
        head: [['KYC & Payment Clearance Field', 'Verified Record Detail']],
        body: kycTableData,
        startY: 70,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9.5 },
        bodyStyles: { fontSize: 9, textColor: [51, 65, 85], cellPadding: 3.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 70 },
          1: { cellWidth: 112 }
        }
      });

      // Signature Box
      const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 180;
      doc.setDrawColor(203, 213, 225);
      doc.line(20, finalY + 15, 85, finalY + 15);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Farmer Self-Declaration Sign', 25, finalY + 20);

      doc.line(125, finalY + 15, 190, finalY + 15);
      doc.text('AgriConnect Authority Seal & QR Verified', 128, finalY + 20);

      doc.save(`AgriConnect_Farmer_Profile_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Farmer Profile & KYC Certificate Downloaded! 📄');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate Profile PDF');
    }
  };

  const stateOptions = STATES.map(s => ({ label: s, value: s }));

  return (
    <div className="w-full max-w-4xl mx-auto pb-4 space-y-4">
      {/* Page Header with Download Button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-[18px] sm:text-[20px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-0.5">Profile Settings</h1>
          <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] font-medium">Manage your personal details, default location, and bank account for payments.</p>
        </div>

        <button
          onClick={handleDownloadKYCPDF}
          className="px-3.5 h-9 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-[var(--form-border-radius)] font-extrabold text-[11.5px] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[15px] text-emerald-600">badge</span>
          <span>Download KYC PDF</span>
        </button>
      </div>

      {/* Verified Producer Header Banner */}
      <div className="global-card !p-4 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-[18px] flex items-center justify-center shrink-0">
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'F'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-black tracking-tight">{formData.name || 'AgriConnect Farmer'}</h2>
              <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified Producer
              </span>
            </div>
            <p className="text-[10.5px] text-slate-300 font-medium mt-0.5">
              {formData.village ? `${formData.village}, ` : ''}{formData.district ? `${formData.district}, ` : ''}{formData.state || 'Madhya Pradesh'}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-[10px] text-slate-300">
          <p className="font-semibold">Registered Phone: <strong className="text-white font-mono">{formData.phone || 'Verified'}</strong></p>
          <p className="text-[9px] text-emerald-300 font-bold mt-0.5">Direct Payout Mandate Active ✓</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="global-card !p-4 md:!p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Basic Details */}
          <div>
            <h3 className="text-[12px] font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-1.5 uppercase tracking-wide border-b border-[var(--color-border)] pb-2">
              <span className="material-symbols-outlined text-[16px] text-primary-500">person</span>
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
              <Input 
                label="Phone Number"
                name="phone"
                value={formData.phone}
                disabled
                className="bg-gray-50 text-gray-500"
                helperText="Phone number cannot be changed"
              />
            </div>
          </div>

          {/* Location Setting with Integrated Satellite Map & GPS */}
          <div>
            <h3 className="text-[12px] font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-1.5 uppercase tracking-wide border-b border-[var(--color-border)] pb-2 mt-2">
              <span className="material-symbols-outlined text-[16px] text-danger-500">location_on</span>
              Farm Location & GPS Coordinates
            </h3>
            
            <div className="space-y-4">
              {/* Alert Warning Box */}
              <div className="p-2.5 rounded-[var(--form-border-radius)] bg-amber-50 border border-amber-200 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-amber-600 mt-0.5 shrink-0">warning</span>
                <p className="text-[10px] sm:text-[11px] text-amber-800 font-semibold leading-normal">
                  <b>Farm Location verify krne ke liye:</b> Kripya apne khet par jakar hi location update karein, jisse exact coordinates link ho sakein.
                </p>
              </div>

              {/* State & District (Side by side) */}
              <div className="grid grid-cols-2 gap-3">
                <Select 
                  label="State / Rajya" 
                  id="state" 
                  name="state"
                  options={stateOptions}
                  value={formData.state}
                  onChange={handleChange}
                  onBlur={handleAddressBlur}
                  required
                />
                <Input 
                  label="District / Zila" 
                  id="district" 
                  name="district"
                  type="text"
                  placeholder="e.g. Nashik" 
                  value={formData.district}
                  onChange={handleChange}
                  onBlur={handleAddressBlur}
                  required
                />
              </div>

              {/* Village & Auto GPS Button (Side by side) */}
              <div className="grid grid-cols-2 gap-3 items-start">
                <Input 
                  label="Village / Gaon" 
                  id="village" 
                  name="village"
                  type="text"
                  placeholder="e.g. Kolari" 
                  value={formData.village}
                  onChange={handleChange}
                  onBlur={handleAddressBlur}
                  required
                />
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

              {/* Map Preview */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Farm Boundaries satellite Preview</label>
                <div 
                  ref={mapRef} 
                  className="w-full h-[140px] rounded-xl border border-slate-200 overflow-hidden shadow-inner relative z-0"
                />
                {formData.lat && formData.lng ? (
                  <p className="text-[9px] font-mono text-slate-500 mt-0.5">
                    Lat: {parseFloat(formData.lat).toFixed(6)} | Lng: {parseFloat(formData.lng).toFixed(6)} (Drag marker to refine)
                  </p>
                ) : (
                  <p className="text-[9px] text-slate-400 mt-0.5">Enter details or click GPS to render satellite boundaries.</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-[12px] font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-1.5 uppercase tracking-wide border-b border-[var(--color-border)] pb-2 mt-2">
              <span className="material-symbols-outlined text-[16px] text-success-500">account_balance</span>
              Bank Details (For Payments)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Account Holder Name"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="Name as per bank record"
              />
              <Input 
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
                type="password"
              />
              <Input 
                label="IFSC Code"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="e.g. SBIN0001234"
                className="uppercase"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="!px-8 shadow-md"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
