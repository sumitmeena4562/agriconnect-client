import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  User, Phone, Mail, FileText, CreditCard, ShieldCheck, MapPin, 
  Landmark, Wallet, Bell, Globe, Lock, Key, CheckCircle2, AlertCircle,
  Eye, EyeOff, Save, Download, Sparkles, Navigation, Layers, ShieldAlert
} from 'lucide-react';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi'
];

/* ─── Compact & Simple Input Component ────────────────────────────────── */
const CompactInput = ({ label, icon: Icon, className = '', wrapperClass = '', type = 'text', hint = '', ...props }) => {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  return (
    <div className={`flex flex-col gap-1 ${wrapperClass}`}>
      {label && (
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
          <span>{label}</span>
          {hint && <span className="text-[9px] font-normal text-slate-400 normal-case">{hint}</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-2.5 text-slate-400 pointer-events-none">
            <Icon size={14} />
          </div>
        )}
        <input
          type={isPwd ? (show ? 'text' : 'password') : type}
          className={`w-full h-[34px] ${Icon ? 'pl-8' : 'pl-2.5'} pr-2.5 text-[11.5px] font-medium text-slate-800 bg-white border border-slate-200 rounded-lg outline-none transition-all
            hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200
            placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${isPwd ? 'pr-8' : ''} ${className}`}
          {...props}
        />
        {isPwd && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Compact Select Component ───────────────────────────────────────── */
const CompactSelect = ({ label, icon: Icon, options = [], wrapperClass = '', ...props }) => (
  <div className={`flex flex-col gap-1 ${wrapperClass}`}>
    {label && <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</label>}
    <div className="relative flex items-center">
      {Icon && (
        <div className="absolute left-2.5 text-slate-400 pointer-events-none">
          <Icon size={14} />
        </div>
      )}
      <select
        className={`w-full h-[34px] ${Icon ? 'pl-8' : 'pl-2.5'} pr-8 text-[11.5px] font-medium text-slate-800 bg-white border border-slate-200 rounded-lg outline-none transition-all
          hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 cursor-pointer appearance-none`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        {...props}
      >
        <option value="">Select State…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  </div>
);

/* ─── Simple Toggle Switch ───────────────────────────────────────────── */
const CompactToggle = ({ checked, onChange, label, description, icon: Icon }) => (
  <div 
    onClick={() => onChange({ target: { checked: !checked } })}
    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
      checked ? 'bg-emerald-50/40 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'
    }`}
  >
    <div className="flex items-center gap-2.5">
      {Icon && (
        <div className={`p-1.5 rounded-lg ${checked ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          <Icon size={15} />
        </div>
      )}
      <div>
        <p className="text-[12px] font-bold text-slate-800 leading-snug">{label}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${checked ? 'bg-emerald-600' : 'bg-slate-200'}`}>
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  </div>
);

const TABS = [
  { id: 'kyc',         label: 'Personal & KYC',      icon: User,        badge: 'KYC' },
  { id: 'location',    label: 'Farm & GPS',           icon: MapPin,      badge: 'GPS' },
  { id: 'bank',        label: 'Bank & UPI',           icon: Landmark,    badge: 'Payout' },
  { id: 'preferences', label: 'App Settings',         icon: Bell,        badge: 'Alerts' },
  { id: 'security',    label: 'Security & Auth',      icon: Lock,        badge: 'Auth' },
];

/* ─── Main Compact Settings Component ─────────────────────────────── */
const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl && TABS.some(t => t.id === tabFromUrl) ? tabFromUrl : 'kyc');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('idle');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    aadhaarNumber: '1234-5678-9012', panNumber: 'ABCDE1234F', kccCardId: 'KCC-MH-992810',
    state: '', district: '', village: '', landHoldingAcres: '5.5',
    lat: '', lng: '',
    accountName: '', accountNumber: '', ifscCode: '', upiId: '',
    payoutPreference: 'UPI Instant Transfer',
    whatsappAlerts: true, smsAlerts: true, preferredLanguage: 'Hindi',
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    if (tabFromUrl && TABS.some(t => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  /* ── Load Profile & Settings Data ── */
  useEffect(() => {
    const load = async () => {
      try {
        const local = JSON.parse(localStorage.getItem('agri_profile_v2') || '{}');
        const res = await api.get('/farmers/profile');
        const { user, profile } = res.data?.data || {};

        setForm(p => ({
          ...p,
          name:             user?.name                      || local.name            || '',
          phone:            user?.phone                     || local.phone           || '',
          email:            user?.email                     || local.email           || '',
          aadhaarNumber:    profile?.kycDetails?.aadhaarNumber || local.aadhaarNumber  || '1234-5678-9012',
          panNumber:        profile?.kycDetails?.panNumber     || local.panNumber      || 'ABCDE1234F',
          kccCardId:        profile?.kycDetails?.kccCardId     || local.kccCardId      || 'KCC-MH-992810',
          state:            profile?.location?.state        || local.state           || '',
          district:         profile?.location?.district     || local.district        || '',
          village:          profile?.location?.village      || local.village         || '',
          landHoldingAcres: profile?.farmDetails?.landHoldingAcres || profile?.farmDetails?.landSize || local.landHoldingAcres || '5.5',
          lat:              profile?.location?.coordinates?.lat || local.lat          || '',
          lng:              profile?.location?.coordinates?.lng || local.lng          || '',
          accountName:      user?.bankDetails?.accountName  || local.accountName     || '',
          accountNumber:    user?.bankDetails?.accountNumber || local.accountNumber   || '',
          ifscCode:         user?.bankDetails?.ifscCode     || local.ifscCode        || '',
          upiId:            user?.bankDetails?.upiId        || local.upiId           || `${user?.phone || 'farmer'}@upi`,
          payoutPreference: user?.bankDetails?.payoutPreference || local.payoutPreference || 'UPI Instant Transfer',
          whatsappAlerts:   user?.preferences?.whatsappAlerts   ?? local.whatsappAlerts  ?? true,
          smsAlerts:        user?.preferences?.smsAlerts        ?? local.smsAlerts       ?? true,
          preferredLanguage:user?.preferences?.preferredLanguage|| local.preferredLanguage || 'Hindi',
        }));
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  /* ── Leaflet Satellite Map ── */
  useEffect(() => {
    if (activeTab !== 'location') return;
    let isSubscribed = true;

    const initMap = () => {
      if (!mapRef.current || !isSubscribed) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      const L = window.L;
      if (!L) return;
      const lat = parseFloat(form.lat) || 22.7196;
      const lng = parseFloat(form.lng) || 75.8577;
      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([lat, lng], 14);
      
      L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        subdomains: ['mt0','mt1','mt2','mt3'], maxZoom: 20
      }).addTo(map);

      const m = L.circleMarker([lat, lng], { radius: 8, color: '#10b981', fillColor: '#10b981', fillOpacity: 0.8 }).addTo(map);
      mapInstanceRef.current = map;
      markerRef.current = m;

      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 300);
    };

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => { if (isSubscribed) initMap(); };
      document.head.appendChild(script);

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
    }

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab]);

  const set = (name, val) => setForm(p => ({ ...p, [name]: val }));
  const handle = e => {
    const { name, value, type, checked } = e.target;
    set(name, type === 'checkbox' ? checked : value);
  };

  /* ── GPS Scan ── */
  const scanGPS = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setForm(p => ({ ...p, lat, lng }));
        setGpsAccuracy(Math.round(accuracy));
        setGpsStatus('success');
        toast.success('GPS coordinates captured!');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        }
      },
      () => { setGpsStatus('error'); toast.error('GPS failed. Check location permission.'); },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  /* ── Save Form Data ── */
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTab === 'security') {
        if (!form.currentPassword) {
          toast.error('Enter current password');
          setIsSubmitting(false);
          return;
        }
        if (!form.newPassword || form.newPassword.length < 6) {
          toast.error('New password must be at least 6 characters');
          setIsSubmitting(false);
          return;
        }
        if (form.newPassword !== form.confirmPassword) {
          toast.error('New passwords do not match!');
          setIsSubmitting(false);
          return;
        }

        const res = await api.put('/farmers/change-password', {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        });
        
        toast.success(res.data.message || 'Password updated! 🔒');
        setForm(p => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }));
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('agri_profile_v2', JSON.stringify(form));

      await api.put('/farmers/profile', {
        name: form.name || undefined,
        email: form.email || undefined,
        bankDetails: {
          accountName: form.accountName || undefined,
          accountNumber: form.accountNumber || undefined,
          ifscCode: form.ifscCode || undefined,
          upiId: form.upiId || undefined,
          payoutPreference: form.payoutPreference || undefined,
        },
        preferences: {
          whatsappAlerts: form.whatsappAlerts,
          smsAlerts: form.smsAlerts,
          preferredLanguage: form.preferredLanguage,
        },
        kycDetails: {
          aadhaarNumber: form.aadhaarNumber || undefined,
          panNumber: form.panNumber || undefined,
          kccCardId: form.kccCardId || undefined,
        },
        location: {
          state: form.state || undefined,
          district: form.district || undefined,
          village: form.village || undefined,
          coordinates: (form.lat && form.lng) ? { lat: +form.lat, lng: +form.lng } : undefined,
        },
        farmDetails: {
          landHoldingAcres: form.landHoldingAcres ? +form.landHoldingAcres : undefined,
          landSize: form.landHoldingAcres ? +form.landHoldingAcres : undefined,
        }
      });

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser && form.name) {
        storedUser.name = form.name;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }

      toast.success('Settings & Profile saved! ✅');
    } catch (err) {
      console.error('Save error:', err);
      const msg = err.response?.data?.message || 'Save failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Download KYC PDF ── */
  const downloadKYC = async () => {
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont('helvetica','bold');
      doc.text('AgriConnect', 14, 18);
      doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.text('OFFICIAL FARMER KYC CERTIFICATE', 14, 26);
      doc.setFontSize(7); doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

      autoTable(doc, {
        startY: 48, theme: 'grid',
        head: [['Field','Registered Detail']],
        body: [
          ['Producer Full Name', form.name],['Mobile', form.phone],['Email', form.email || 'N/A'],
          ['Aadhaar Number', form.aadhaarNumber],['PAN Number', form.panNumber],['KCC ID', form.kccCardId],
          ['State', form.state],['District', form.district],['Village', form.village],
          ['Land Size', `${form.landHoldingAcres} Acres`],
          ['GPS Coordinates', form.lat ? `${form.lat}, ${form.lng}` : 'N/A'],
          ['Bank Account', form.accountNumber ? `•••• ${form.accountNumber.slice(-4)} (${form.ifscCode})` : 'N/A'],
          ['UPI ID', form.upiId || 'N/A'],
        ],
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      });
      doc.save(`AgriConnect_KYC_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('KYC Certificate downloaded!');
    } catch { toast.error('PDF export failed'); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 pb-8">

      {/* ── Compact Header Banner ── */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shrink-0 shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <span className="text-emerald-400 font-black text-lg">
                {form.name?.charAt(0)?.toUpperCase() || 'F'}
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xs sm:text-sm font-black text-white leading-tight truncate">{form.name || 'AgriConnect Farmer'}</h1>
              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                ✓ Verified Producer
              </span>
            </div>
            <p className="text-[10px] text-slate-300 mt-0.5 truncate">
              {[form.village, form.district, form.state].filter(Boolean).join(', ') || 'Location details pending'}
              {form.landHoldingAcres && <span className="text-emerald-400 font-bold ml-1">• {form.landHoldingAcres} Acres</span>}
              {form.kccCardId && <span className="font-mono text-slate-400 ml-1">• {form.kccCardId}</span>}
            </p>
          </div>
        </div>

        <button
          onClick={downloadKYC}
          className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/10 hover:bg-emerald-600 border border-white/20 text-white text-[10.5px] font-bold transition-all cursor-pointer active:scale-[0.98]"
        >
          <Download size={13} />
          <span>KYC PDF</span>
        </button>
      </div>

      {/* ── 2-Column Compact Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">

        {/* Left Compact Sidebar Menu */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-2 shadow-sm space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 py-1">Settings Menu</p>

          <div className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-left transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-black shadow-sm border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-[11.5px]">{tab.label}</span>
                  </div>
                  <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-emerald-200/60 text-emerald-900' : 'bg-slate-100 text-slate-400'}`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Form Card */}
        <div className="md:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
                className="space-y-4"
              >

                {/* TAB 1: Personal & KYC */}
                {activeTab === 'kyc' && (
                  <>
                    <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-emerald-600">
                      <ShieldCheck size={16} />
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Personal Details & Mandi KYC Verification</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CompactInput label="Full Name" icon={User} name="name" value={form.name} onChange={handle} placeholder="Enter full name" />
                      <CompactInput label="Registered Mobile" icon={Phone} name="phone" value={form.phone} onChange={handle} disabled hint="Read-only" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CompactInput label="Email Address" icon={Mail} name="email" type="email" value={form.email} onChange={handle} placeholder="farmer@gmail.com" />
                      <CompactInput label="Kisan Credit Card (KCC) ID" icon={CreditCard} name="kccCardId" value={form.kccCardId} onChange={handle} className="uppercase font-mono" placeholder="KCC-MH-992810" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CompactInput label="Aadhaar Card (12-Digit)" icon={FileText} name="aadhaarNumber" value={form.aadhaarNumber} onChange={handle} className="font-mono" placeholder="1234-5678-9012" />
                      <CompactInput label="PAN Card Number" icon={FileText} name="panNumber" value={form.panNumber} onChange={handle} className="uppercase font-mono" placeholder="ABCDE1234F" />
                    </div>
                  </>
                )}

                {/* TAB 2: Farm Location & GPS */}
                {activeTab === 'location' && (
                  <>
                    <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-rose-500">
                      <MapPin size={16} />
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Farm Location & Live GPS Coordinates</h2>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                      <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[10.5px] font-semibold leading-tight">
                        Khet par maujood rehkar hi GPS scan karein taaki exact pickup coordinates link ho sakein.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <CompactSelect label="State / Rajya" icon={Globe} name="state" options={STATES} value={form.state} onChange={handle} />
                      <CompactInput label="District / Zila" icon={MapPin} name="district" value={form.district} onChange={handle} placeholder="e.g. Indore" />
                      <CompactInput label="Land Size (Acres)" icon={Landmark} name="landHoldingAcres" value={form.landHoldingAcres} onChange={handle} placeholder="e.g. 5.5" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <CompactInput label="Village / Gaon" icon={MapPin} name="village" value={form.village} onChange={handle} placeholder="e.g. Vijay Nagar" />
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">GPS Capture</label>
                        <button
                          type="button"
                          onClick={scanGPS}
                          className={`h-[34px] px-3 rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
                            gpsStatus === 'success' ? 'bg-emerald-50 border-emerald-400 text-emerald-700' :
                            gpsStatus === 'error'   ? 'bg-red-50 border-red-300 text-red-600' :
                            gpsStatus === 'loading' ? 'bg-slate-100 border-slate-300 text-slate-500' :
                            'bg-slate-800 text-white border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <Navigation size={14} className={gpsStatus === 'loading' ? 'animate-spin' : ''} />
                          <span>{gpsStatus === 'loading' ? 'Scanning GPS...' : gpsStatus === 'success' ? `GPS Captured (±${gpsAccuracy}m)` : '📍 Scan Farm GPS'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Satellite Map */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                          <Layers size={13} className="text-emerald-600" /> Satellite Preview
                        </span>
                        {form.lat && form.lng && (
                          <span className="text-[9.5px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {parseFloat(form.lat).toFixed(6)}, {parseFloat(form.lng).toFixed(6)}
                          </span>
                        )}
                      </div>
                      <div ref={mapRef} className="w-full h-[160px] rounded-lg border border-slate-200 overflow-hidden shadow-inner" />
                    </div>
                  </>
                )}

                {/* TAB 3: Bank Account & UPI */}
                {activeTab === 'bank' && (
                  <>
                    <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-blue-600">
                      <Landmark size={16} />
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Bank Details & Direct Payment Wallet</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CompactInput label="Account Holder Name" icon={User} name="accountName" value={form.accountName} onChange={handle} placeholder="Name as per bank" />
                      <CompactInput label="Account Number" icon={CreditCard} name="accountNumber" type="password" value={form.accountNumber} onChange={handle} placeholder="Account number" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CompactInput label="IFSC Code" icon={Landmark} name="ifscCode" value={form.ifscCode} onChange={handle} className="uppercase font-mono" placeholder="SBIN0001234" />
                      <CompactInput label="UPI ID (Instant Payments)" icon={Wallet} name="upiId" value={form.upiId} onChange={handle} className="font-mono text-emerald-700" placeholder="farmer@upi" />
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Primary Payout Settlement Mode</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { title: 'UPI Instant Transfer', desc: 'Direct 24x7 instant credit' },
                          { title: 'NEFT / IMPS Bank Transfer', desc: 'Standard bank settlement' }
                        ].map(({ title, desc }) => (
                          <div
                            key={title}
                            onClick={() => set('payoutPreference', title)}
                            className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                              form.payoutPreference === title
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <p className="text-[11.5px] leading-snug">{title}</p>
                              <p className="text-[9.5px] text-slate-400">{desc}</p>
                            </div>
                            {form.payoutPreference === title && (
                              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 4: Preferences */}
                {activeTab === 'preferences' && (
                  <>
                    <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-indigo-600">
                      <Bell size={16} />
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-700">App Preferences & Mandi Price Alerts</h2>
                    </div>

                    <div className="space-y-2">
                      <CompactToggle
                        icon={Bell}
                        label="WhatsApp Mandi Price Alerts"
                        description="Daily crop price updates on WhatsApp"
                        checked={form.whatsappAlerts}
                        onChange={e => set('whatsappAlerts', e.target.checked)}
                      />

                      <CompactToggle
                        icon={Phone}
                        label="SMS Order & Dispatch Alerts"
                        description="Get buyer confirmations via SMS"
                        checked={form.smsAlerts}
                        onChange={e => set('smsAlerts', e.target.checked)}
                      />

                      <div className="space-y-1 pt-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Preferred Interface Language</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { val: 'Hindi',   label: 'हिंदी (Hindi)' },
                            { val: 'English', label: 'English (English)' },
                            { val: 'Marathi', label: 'मराठी (Marathi)' },
                          ].map(({ val, label }) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => set('preferredLanguage', val)}
                              className={`h-[34px] rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                form.preferredLanguage === val
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-black shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 5: Security */}
                {activeTab === 'security' && (
                  <>
                    <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-rose-500">
                      <ShieldAlert size={16} />
                      <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Security & Account Password</h2>
                    </div>

                    <div className="space-y-3">
                      <CompactInput label="Current Password" icon={Key} name="currentPassword" type="password" value={form.currentPassword} onChange={handle} placeholder="Current password" />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CompactInput label="New Password" icon={Lock} name="newPassword" type="password" value={form.newPassword} onChange={handle} placeholder="Minimum 6 characters" />
                        <CompactInput label="Confirm New Password" icon={Lock} name="confirmPassword" type="password" value={form.confirmPassword} onChange={handle} placeholder="Confirm password" />
                      </div>

                      {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
                        <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                          <AlertCircle size={13} />
                          <span>Passwords do not match</span>
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Save Button */}
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-[34px] px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11.5px] font-black transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        <span>Saving…</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save {TABS.find(t => t.id === activeTab)?.label}</span>
                      </>
                    )}
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
