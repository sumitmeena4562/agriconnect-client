import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ConfirmModal from '../../components/common/ConfirmModal';
import DriverCard from '../../components/shared/DriverCard';
import CustomSelect from '../../components/ui/CustomSelect';

const DriverRegistry = () => {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormViewActive, setIsFormViewActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search and Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Add Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Mini Truck');
  const [payloadCapacity, setPayloadCapacity] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [address, setAddress] = useState('');
  const [insuranceFile, setInsuranceFile] = useState(null);

  // Real-world compliance & financial states
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [licenseClass, setLicenseClass] = useState('LMV');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [rcExpiry, setRcExpiry] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [fuelType, setFuelType] = useState('Diesel');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountAccountNumber] = useState('');
  const [bankAccountIfsc, setBankAccountIfsc] = useState('');
  const [upiId, setUpiId] = useState('');

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, driverId: null, isLoading: false });

  const [dbVehicleTypes, setDbVehicleTypes] = useState([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);

  // Search & custom select dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Two Wheeler': return '🛵';
      case 'Electric Vehicle': return '⚡';
      case 'Three Wheeler': return '🛺';
      case 'Mini Commercial Vehicle': return '🚚';
      case 'Mini Truck': return '🚛';
      case 'Pickup Truck': return '🛻';
      case 'Light Commercial Vehicle': return '🚐';
      case 'Agricultural Vehicle': return '🚜';
      case 'Cold Chain Vehicle': return '❄️';
      case 'Heavy Commercial Vehicle': return '🚛';
      default: return '🚚';
    }
  };

  const filteredVehicles = dbVehicleTypes.filter(v => 
    v.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.vehicleCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/drivers');
      setDrivers(res.data.data);
    } catch (error) {
      toast.error('Failed to load fleet drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicleTypes = async () => {
    try {
      const res = await api.get('/drivers/vehicle-types');
      if (res.data.success) {
        setDbVehicleTypes(res.data.data);
        if (res.data.data.length > 0) {
          const first = res.data.data[0];
          setSelectedVehicleType(first);
          setVehicleType(first.vehicleName);
          setPayloadCapacity(first.capacityKg);
          if (first.fuelType && first.fuelType.length > 0) {
            setFuelType(first.fuelType[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch vehicle types', error);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchVehicleTypes();

    // Click outside dropdown handler
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!name || !phone || !vehicleNumber || !vehicleType || !payloadCapacity) {
      toast.error('Name, Phone, Vehicle Number, Type and Payload are required');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Uploading documents & registering...');
    try {
      let uploadedDocUrl = '';
      if (insuranceFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('images', insuranceFile);
        
        const uploadRes = await api.post('/upload', uploadFormData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        });
        if (uploadRes.data.success && uploadRes.data.urls.length > 0) {
          uploadedDocUrl = uploadRes.data.urls[0];
        }
      }

      const res = await api.post('/drivers', { 
        name, 
        phone, 
        vehicleNumber, 
        vehicleType, 
        payloadCapacity: Number(payloadCapacity), 
        licenseNumber,
        rcNumber,
        address,
        insuranceDoc: uploadedDocUrl,
        emergencyContactName,
        emergencyContactPhone,
        aadhaarNumber,
        licenseClass,
        licenseExpiry,
        rcExpiry,
        vehicleModel,
        fuelType,
        insurancePolicyNumber,
        insuranceExpiry,
        panNumber,
        bankAccountName,
        bankAccountNumber,
        bankAccountIfsc,
        upiId
      });
      toast.success(res.data.message || 'Driver registered successfully!', { id: toastId });
      setIsFormViewActive(false);
      
      // Reset all states
      setName('');
      setPhone('');
      setVehicleNumber('');
      if (dbVehicleTypes.length > 0) {
        const first = dbVehicleTypes[0];
        setSelectedVehicleType(first);
        setVehicleType(first.vehicleName);
        setPayloadCapacity(first.capacityKg);
        if (first.fuelType && first.fuelType.length > 0) {
          setFuelType(first.fuelType[0]);
        }
      } else {
        setSelectedVehicleType(null);
        setVehicleType('');
        setPayloadCapacity('');
        setFuelType('Diesel');
      }
      setLicenseNumber('');
      setRcNumber('');
      setAddress('');
      setInsuranceFile(null);
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setAadhaarNumber('');
      setLicenseClass('LMV');
      setLicenseExpiry('');
      setRcExpiry('');
      setVehicleModel('');
      setInsurancePolicyNumber('');
      setInsuranceExpiry('');
      setPanNumber('');
      setBankAccountName('');
      setBankAccountAccountNumber('');
      setBankAccountIfsc('');
      setUpiId('');
      
      fetchDrivers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (driverId) => {
    setDeleteModal({ isOpen: true, driverId, isLoading: false });
  };

  const confirmDelete = async () => {
    const { driverId } = deleteModal;
    if (!driverId) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    const toastId = toast.loading('Removing driver...');
    try {
      const res = await api.delete(`/drivers/${driverId}`);
      toast.success(res.data.message || 'Driver removed successfully!', { id: toastId });
      setDeleteModal({ isOpen: false, driverId: null, isLoading: false });
      fetchDrivers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Removal failed', { id: toastId });
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Client-side filtering logic
  const filteredDrivers = drivers.filter(drv => {
    const matchesKeyword = drv.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                           drv.vehicleNumber.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                           drv.phone.includes(searchKeyword);
    const matchesType = filterVehicleType === 'All' || drv.vehicleType === filterVehicleType;
    const matchesStatus = filterStatus === 'All' || drv.status === filterStatus;
    return matchesKeyword && matchesType && matchesStatus;
  });

  if (isFormViewActive) {
    return (
      <div className="w-full max-w-5xl mx-auto pb-6">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-5 px-1">
          <button 
            type="button"
            onClick={() => setIsFormViewActive(false)}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-[17px] font-black text-[var(--color-text-primary)] leading-none mb-1">
              🚚 Register Driver & Vehicle
            </h1>
            <p className="text-[10.5px] text-[var(--color-text-secondary)] font-medium">
              Create a new transport asset profile in your active fleet.
            </p>
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Left Column: Form Inputs (60% width) */}
          <div className="lg:col-span-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--card-border-radius)] p-5 shadow-sm space-y-6">
            <form onSubmit={handleAddDriver} className="space-y-6">
              
              {/* Section 1: Driver Profile details */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-1.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-indigo-500">person</span>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Driver Profile Details</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Driver Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Phone Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      Aadhaar Card No. <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1234 5678 9012"
                      value={aadhaarNumber}
                      onChange={e => setAadhaarNumber(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                    <span className="text-[8px] text-slate-400 font-semibold block mt-1">12-digit UID for identity validation</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      Driver Address <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Town/Village, State"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                    <span className="text-[8px] text-slate-400 font-semibold block mt-1">Current address of the driver</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      Contact Person <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Family member name"
                      value={emergencyContactName}
                      onChange={e => setEmergencyContactName(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      Emergency Phone <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Emergency contact phone"
                      value={emergencyContactPhone}
                      onChange={e => setEmergencyContactPhone(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Vehicle Specs & Registry */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-1.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-indigo-500">local_shipping</span>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Vehicle Specs & Registry</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Vehicle Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. MH 12 AB 5678"
                      value={vehicleNumber}
                      onChange={e => setVehicleNumber(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] font-mono uppercase hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                      required
                    />
                    <span className="text-[8px] text-slate-400 font-semibold block mt-1">RTO plate registration number</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      Vehicle Model <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tata Ace Gold"
                      value={vehicleModel}
                      onChange={e => setVehicleModel(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                    <span className="text-[8px] text-slate-400 font-semibold block mt-1">Vehicle brand & model name</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative" ref={dropdownRef}>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Vehicle Type <span className="text-rose-500">*</span></label>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full h-9.5 px-3 rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 flex items-center justify-between text-[12px] font-semibold transition-all cursor-pointer"
                    >
                      {selectedVehicleType ? (
                        <span className="flex items-center gap-2">
                          <span>{getCategoryIcon(selectedVehicleType.vehicleCategory)}</span>
                          <span className="font-extrabold text-slate-850">{selectedVehicleType.vehicleName}</span>
                          <span className="text-[8.5px] text-slate-400 font-bold">({selectedVehicleType.vehicleCategory})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Select Vehicle Type</span>
                      )}
                      <span className="material-symbols-outlined text-[16px] text-slate-400 transition-transform duration-200" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                        keyboard_arrow_down
                      </span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
                        {/* Search Box */}
                        <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50">
                          <span className="material-symbols-outlined text-[15px] text-slate-400">search</span>
                          <input
                            type="text"
                            placeholder="Search vehicle type or category..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full text-[11px] bg-transparent outline-none border-none text-slate-705 placeholder:text-slate-400"
                            onClick={e => e.stopPropagation()}
                          />
                        </div>

                        {/* List items */}
                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                          {filteredVehicles.map(v => (
                            <button
                              key={v._id || v.vehicleName}
                              type="button"
                              onClick={() => {
                                setSelectedVehicleType(v);
                                setVehicleType(v.vehicleName);
                                setPayloadCapacity(v.capacityKg);
                                if (v.fuelType && v.fuelType.length > 0) {
                                  setFuelType(v.fuelType[0]);
                                }
                                setIsDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-base bg-slate-100 w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200/50">
                                  {getCategoryIcon(v.vehicleCategory)}
                                </span>
                                <div>
                                  <p className="text-[11.5px] font-black text-slate-800 leading-tight">{v.vehicleName}</p>
                                  <p className="text-[9px] text-slate-450 font-bold leading-none mt-0.5">{v.useCase}</p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-indigo-50 border border-indigo-100 text-indigo-700 block">
                                  {v.capacityKg} kg
                                </span>
                                <span className="text-[8px] text-slate-400 font-semibold block mt-0.5">Max {v.maxOrders} orders</span>
                              </div>
                            </button>
                          ))}
                          {filteredVehicles.length === 0 && (
                            <div className="p-4 text-center text-slate-400 text-[10.5px]">
                              No vehicles match search
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Fuel Type</label>
                    <select
                      value={fuelType}
                      onChange={e => setFuelType(e.target.value)}
                      className="w-full h-9.5 px-2 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all"
                    >
                      {selectedVehicleType && selectedVehicleType.fuelType && selectedVehicleType.fuelType.length > 0 ? (
                        selectedVehicleType.fuelType.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))
                      ) : (
                        <>
                          <option value="Diesel">Diesel</option>
                          <option value="CNG">CNG</option>
                          <option value="Electric">Electric</option>
                          <option value="Petrol">Petrol</option>
                        </>
                      )}
                    </select>
                    <span className="text-[8px] text-slate-400 font-semibold block mt-1">For trip fuel cost estimation</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">Payload Capacity (kg) <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1000"
                      value={payloadCapacity}
                      onChange={e => setPayloadCapacity(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                      required
                    />
                    <span className="text-[8px] text-slate-400 font-semibold block mt-1">Maximum load limit in kg</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      RC Certificate No. <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MH12AB1234"
                      value={rcNumber}
                      onChange={e => setRcNumber(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all uppercase placeholder:text-slate-300"
                    />
                    <span className="text-[8px] text-slate-400 font-semibold block mt-1">Vehicle Registration Certificate No.</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Bank & Settlement Compliance */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-1.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-indigo-500">payments</span>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Bank Settlement Info</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      Account Holder Name <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Account name"
                      value={bankAccountName}
                      onChange={e => setBankAccountName(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      UPI ID for Payout <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. driver@ybl"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                    <span className="text-[8px] text-slate-400 font-semibold block mt-1">Instant payouts address (PhonePe/GPay)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      Bank Account Number <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Account number"
                      value={bankAccountNumber}
                      onChange={e => setBankAccountAccountNumber(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      Bank IFSC Code <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001234"
                      value={bankAccountIfsc}
                      onChange={e => setBankAccountIfsc(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all uppercase placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-1.5 pt-1.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-rose-500">description</span>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Identity & Compliance Docs</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      DL Number <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MH04201100"
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all uppercase placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">DL Class / Category</label>
                    <select
                      value={licenseClass}
                      onChange={e => setLicenseClass(e.target.value)}
                      className="w-full h-9.5 px-2 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all"
                    >
                      <option value="LMV">LMV (Light Motor Vehicle)</option>
                      <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                      <option value="MCWG">MCWG (Motorcycle with Gear)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      DL Expiry Date <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={licenseExpiry}
                      onChange={e => setLicenseExpiry(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      PAN Card Number <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={panNumber}
                      onChange={e => setPanNumber(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all uppercase placeholder:text-slate-300"
                    />
                    <span className="text-[8px] text-slate-400 font-semibold block mt-1">For tax & TDS compliance check</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      Insurance Policy No. <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. POL-1234"
                      value={insurancePolicyNumber}
                      onChange={e => setInsurancePolicyNumber(e.target.value)}
                      className="w-full h-9.5 px-3 text-[12px] rounded-xl border border-slate-200 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-slate-350 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      Insurance File Copy <span className="text-[8.5px] font-normal text-slate-400 italic">(Optional)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center justify-center h-9.5 px-4 rounded-xl border border-dashed border-slate-250 hover:border-slate-400 hover:bg-slate-50 text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-all cursor-pointer flex-1">
                        <span className="material-symbols-outlined text-[16px] mr-1.5">upload_file</span>
                        <span className="truncate">{insuranceFile ? insuranceFile.name : 'Choose Doc / PDF'}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={e => setInsuranceFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {insuranceFile && (
                        <button
                          type="button"
                          onClick={() => setInsuranceFile(null)}
                          className="w-9.5 h-9.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-650 flex items-center justify-center border border-red-100 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormViewActive(false)}
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-xl border border-slate-250 text-slate-500 hover:bg-slate-50 text-[12px] font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white text-[12px] font-bold shadow-sm shadow-[var(--color-primary-500)]/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      Register Driver
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Dynamic Specs Preview (20% width) */}
          <div className="lg:col-span-2 lg:sticky lg:top-4 space-y-4">
            {selectedVehicleType ? (
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 space-y-4 select-none">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/50">
                  <span className="font-black text-slate-800 text-[13px] tracking-tight flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-indigo-500 leading-none">info</span>
                    Specs Blueprint
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase tracking-wider">
                    {selectedVehicleType.vehicleCategory}
                  </span>
                </div>
                
                <div className="space-y-2.5 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9.5px]">Model / Name</span>
                    <span className="font-extrabold text-slate-800 text-[11.5px]">{selectedVehicleType.vehicleName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9.5px]">Max Payload Limit</span>
                    <span className="font-black text-slate-800 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded text-emerald-700">{selectedVehicleType.capacityKg} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9.5px]">Max Orders Allowed</span>
                    <span className="font-extrabold text-slate-800">{selectedVehicleType.maxOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9.5px]">Dimensions (LxWxH)</span>
                    <span className="font-extrabold text-slate-800">
                      {selectedVehicleType.dimensions.length} × {selectedVehicleType.dimensions.width} × {selectedVehicleType.dimensions.height}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9.5px]">Fuel Allowed</span>
                    <span className="font-extrabold text-slate-850 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">{selectedVehicleType.fuelType.join(', ')}</span>
                  </div>
                  {selectedVehicleType.batteryRange && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[9.5px]">Battery Range</span>
                      <span className="font-extrabold text-slate-800">{selectedVehicleType.batteryRange}</span>
                    </div>
                  )}
                  {selectedVehicleType.temperatureRange && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold uppercase text-[9.5px]">Temp Range</span>
                      <span className="font-extrabold text-slate-800 text-rose-600">{selectedVehicleType.temperatureRange}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/50 space-y-2">
                  <div>
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block mb-0.5">Ideal Use Case</span>
                    <p className="text-[10.5px] font-semibold text-slate-700 italic leading-relaxed">{selectedVehicleType.useCase}</p>
                  </div>
                  
                  <div className="pt-2">
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block mb-1">Required Documents:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedVehicleType.requiredDocuments.map((doc, dIdx) => (
                        <span key={dIdx} className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8.5px] font-black flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[9px] font-black">check</span>
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-250 rounded-2xl p-6 text-center text-slate-400 text-[11px] select-none">
                Select a vehicle type to preview blueprints.
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Download Registered Fleet Carriers Directory PDF
  const handleDownloadFleetPDF = () => {
    if (!drivers || drivers.length === 0) {
      toast.error('No registered fleet drivers to export.');
      return;
    }
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header branding bar
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 20, 'F');
      doc.setFillColor(16, 185, 129); // emerald-500 line
      doc.rect(0, 19, 210, 1, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('AgriConnect™ - Registered Fleet Carriers & Driver Directory', 14, 13);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 135, 13);

      // Meta Info Box
      const availableCount = drivers.filter(d => d.status === 'Available').length;
      const totalPayload = drivers.reduce((acc, d) => acc + (Number(d.payloadCapacity) || 0), 0);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, 25, 182, 22, 2, 2, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Registered Carriers: ${drivers.length} Drivers`, 18, 32);
      doc.text(`Available Drivers: ${availableCount} Ready`, 18, 41);

      doc.text(`Combined Fleet Payload: ${totalPayload.toLocaleString('en-IN')} Kg`, 105, 32);
      doc.text(`Hub Location: Indore Agri-Logistics Hub`, 105, 41);

      // Fleet Table
      const tableColumn = ['Driver Name & Phone', 'Vehicle Type', 'License Plate', 'Payload Cap', 'DL Number', 'RC / Insurance', 'Fleet Status'];
      const tableRows = drivers.map(d => [
        `${d.name}\nMob: ${d.phone}`,
        d.vehicleType || 'Mini Truck',
        d.vehicleNumber || 'Reg Pending',
        `${d.payloadCapacity || 0} Kg`,
        d.licenseNumber ? d.licenseNumber.toUpperCase() : 'N/A',
        d.rcNumber ? d.rcNumber.toUpperCase() : 'Verified',
        d.status || 'Available'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 52,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85], cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 28 },
          2: { fontStyle: 'bold', cellWidth: 28 },
          3: { fontStyle: 'bold', cellWidth: 22 },
          4: { cellWidth: 24 },
          5: { cellWidth: 22 },
          6: { fontStyle: 'bold', cellWidth: 18 }
        }
      });

      // Signature Box
      const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 180;
      if (finalY < 260) {
        doc.setDrawColor(203, 213, 225);
        doc.line(20, finalY + 12, 85, finalY + 12);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Fleet Logistics Manager Sign', 25, finalY + 16);

        doc.line(125, finalY + 12, 190, finalY + 12);
        doc.text('Transport Authority Clearance Seal', 130, finalY + 16);
      }

      doc.save(`AgriConnect_Fleet_Directory_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Fleet Drivers Directory PDF Downloaded! 📄');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate Fleet Directory PDF');
    }
  };

  // Metrics Calculations
  const availableDriversCount = drivers.filter(d => d.status === 'Available').length;
  const onDeliveryCount = drivers.filter(d => d.status === 'On Delivery' || d.status === 'In Transit').length;
  const totalFleetPayload = drivers.reduce((acc, d) => acc + (Number(d.payloadCapacity) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-1 flex items-center gap-2">
            <span>🚚</span> My Drivers & Vehicles
          </h1>
          <p className="text-[11.5px] text-[var(--color-text-secondary)] font-medium">
            Add and manage drivers who will deliver crops to buyers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownloadFleetPDF}
            className="px-3.5 h-9.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-[var(--form-border-radius)] font-extrabold text-[11.5px] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[15px] text-emerald-600">picture_as_pdf</span>
            <span>Export Fleet PDF</span>
          </button>

          <button
            onClick={() => setIsFormViewActive(true)}
            className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white px-4 h-9.5 rounded-[var(--form-border-radius)] font-bold text-[11.5px] shadow-sm shadow-[var(--color-primary-500)]/10 hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] shrink-0"
          >
            <span className="material-symbols-outlined text-[15px] font-bold">add</span>
            Add Vehicle
          </button>
        </div>
      </div>

      {/* ── Fleet Metrics Overview Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">badge</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Total Drivers</p>
            <p className="text-[15px] font-black text-slate-900 leading-none mt-0.5">{drivers.length} Vehicles</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Available Ready</p>
            <p className="text-[15px] font-black text-emerald-700 leading-none mt-0.5">{availableDriversCount} Drivers</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">On Delivery</p>
            <p className="text-[15px] font-black text-amber-700 leading-none mt-0.5">{onDeliveryCount} Active</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">weight</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Fleet Payload</p>
            <p className="text-[15px] font-black text-indigo-700 leading-none mt-0.5">{totalFleetPayload.toLocaleString()} Kg</p>
          </div>
        </div>
      </div>

      {/* ── Search & Advanced Filters Bar ── */}
      <div className="global-card !p-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0 w-full">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search driver name, vehicle plate #..." 
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            className="w-full pl-8.5 pr-3 h-8 text-[11.5px] rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary-500 transition-all outline-none"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          {/* Vehicle Type Filter */}
          <CustomSelect 
            value={filterVehicleType}
            onChange={(val) => setFilterVehicleType(val)}
            icon="local_shipping"
            minWidth="155px"
            options={[
              { label: 'All Vehicle Types', value: 'All' },
              { label: 'Bike', value: 'Bike' },
              { label: 'Tractor', value: 'Tractor' },
              { label: 'Mini Truck', value: 'Mini Truck' },
              { label: 'Large Truck', value: 'Large Truck' }
            ]}
          />

          {/* Status Filter */}
          <CustomSelect 
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            icon="check_circle"
            minWidth="135px"
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Available', value: 'Available' },
              { label: 'On Delivery', value: 'On Delivery' }
            ]}
          />
        </div>
      </div>

      {/* ── Fleet Drivers Data Table ── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-3 border-primary-100 border-t-primary-600 animate-spin" />
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="global-card p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200">
            <span className="material-symbols-outlined text-[26px] text-slate-400">local_shipping</span>
          </div>
          <h3 className="text-[14px] font-extrabold text-slate-800 mb-1">No Fleet Drivers Found</h3>
          <p className="text-[11.5px] text-slate-400 max-w-xs mx-auto mb-4 leading-relaxed">
            {drivers.length === 0 
              ? "Register your drivers and vehicles to assign dispatches and track shipments."
              : "No drivers match your current search criteria."}
          </p>
          {drivers.length === 0 && (
            <button 
              onClick={() => setIsFormViewActive(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-[11px] shadow-sm transition-all cursor-pointer"
            >
              Register First Driver
            </button>
          )}
        </div>
      ) : (
        <div className="global-card overflow-hidden !p-0 border border-slate-200/80 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 text-[9.5px] font-extrabold uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Driver & Contact</th>
                  <th className="py-2.5 px-3.5">Vehicle & Specs</th>
                  <th className="py-2.5 px-3.5 text-center">Plate #</th>
                  <th className="py-2.5 px-3.5 text-right">Payload Cap</th>
                  <th className="py-2.5 px-3.5">Compliance Docs</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredDrivers.map((drv) => (
                  <tr key={drv._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Driver Name & Contacts */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 font-black text-[12px] flex items-center justify-center shrink-0 border border-primary-100">
                          {drv.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 leading-tight truncate text-[12px]">{drv.name}</h4>
                          <a
                            href={`tel:${drv.phone}`}
                            className="text-[10px] font-bold text-slate-500 hover:text-primary-600 hover:underline transition-colors block mt-0.5 font-mono"
                          >
                            Mob: {drv.phone}
                          </a>
                          {drv.emergencyContactPhone && (
                            <p className="text-[8.5px] text-slate-400 font-medium truncate">
                              SOS: {drv.emergencyContactName ? `${drv.emergencyContactName} (` : ''}{drv.emergencyContactPhone}{drv.emergencyContactName ? ')' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Vehicle Type & Fuel Specs */}
                    <td className="py-2.5 px-3.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-slate-400 shrink-0">
                            {drv.vehicleType?.toLowerCase().includes('bike') ? 'two_wheeler' : drv.vehicleType?.toLowerCase().includes('tractor') ? 'agriculture' : 'local_shipping'}
                          </span>
                          <span className="font-bold text-slate-800 text-[11.5px]">{drv.vehicleType || 'Mini Truck'}</span>
                        </div>
                        {drv.fuelType && (
                          <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">
                            Fuel: {drv.fuelType} {drv.vehicleModel ? `• ${drv.vehicleModel}` : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Vehicle Plate Number */}
                    <td className="py-2.5 px-3.5 text-center">
                      <span className="font-mono text-[9.5px] font-black bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 uppercase inline-block">
                        {drv.vehicleNumber || 'REG PENDING'}
                      </span>
                    </td>

                    {/* Payload Capacity */}
                    <td className="py-2.5 px-3.5 text-right font-black text-slate-900 text-[11.5px]">
                      {(drv.payloadCapacity || 0).toLocaleString()} Kg
                    </td>

                    {/* DL, RC & Insurance Compliance Docs */}
                    <td className="py-2.5 px-3.5">
                      <div className="text-[10px] leading-tight space-y-0.5">
                        <p className="font-semibold text-slate-600">DL: <strong className="font-extrabold text-slate-800 uppercase">{drv.licenseNumber || 'VERIFIED'}</strong></p>
                        <p className="text-[9px] text-slate-400 font-medium">RC: <strong className="uppercase font-semibold text-slate-600">{drv.rcNumber || 'VERIFIED'}</strong></p>
                        {drv.insuranceDocUrl && (
                          <a
                            href={drv.insuranceDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[8.5px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <span className="material-symbols-outlined text-[10px]">file_present</span>
                            <span>Insurance Copy 📄</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Fleet Status */}
                    <td className="py-2.5 px-3.5 text-center">
                      {drv.status === 'Available' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs select-none">
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[10px] font-black leading-none">check</span>
                          </span>
                          <span>Available</span>
                        </span>
                      ) : drv.status === 'On Delivery' || drv.status === 'In Transit' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs select-none">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[10px] font-black leading-none">schedule</span>
                          </span>
                          <span>On Delivery</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs select-none">
                          <span className="w-4 h-4 rounded-full bg-slate-400 text-white flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[10px] font-black leading-none">pause</span>
                          </span>
                          <span>{drv.status || 'Offline'}</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Call Driver */}
                        <a
                          href={`tel:${drv.phone}`}
                          title="Call Driver"
                          className="w-7 h-7 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors flex items-center justify-center cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">call</span>
                        </a>

                        {/* Share Tracking Link */}
                        <button
                          onClick={() => {
                            const link = `${window.location.origin}/driver-batch?driverId=${drv._id}`;
                            navigator.clipboard.writeText(link);
                            toast.success('Driver tracking link copied!');
                          }}
                          title="Share Tracking Link"
                          className="w-7 h-7 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        </button>

                        {/* Delete Carrier */}
                        <button
                          onClick={() => handleDeleteClick(drv._id)}
                          disabled={drv.status === 'On Delivery'}
                          title={drv.status === 'On Delivery' ? 'Cannot remove active carrier' : 'Remove Driver'}
                          className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => !deleteModal.isLoading && setDeleteModal({ isOpen: false, driverId: null, isLoading: false })}
        onConfirm={confirmDelete}
        title="Remove Driver?"
        description="Are you sure you want to remove this driver/vehicle from your fleet list? This action cannot be undone."
        confirmText="Yes, Remove"
        isLoading={deleteModal.isLoading}
        isDanger={true}
      />
    </div>
  );
};

export default DriverRegistry;
