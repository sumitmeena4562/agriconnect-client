import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/common/ConfirmModal';
import DriverCard from '../../components/shared/DriverCard';

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
        <button
          onClick={() => setIsFormViewActive(true)}
          className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white px-4 h-9.5 rounded-[var(--form-border-radius)] font-bold text-[11.5px] shadow-sm shadow-[var(--color-primary-500)]/10 hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] shrink-0 w-fit self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[15px] font-bold">add</span>
          Add Vehicle
        </button>
      </div>

      {/* Search and Advanced Filters */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--card-border-radius)] p-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-text-muted)]">search</span>
            <input 
              type="text" 
              placeholder="Search by driver, vehicle #..." 
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 h-[36px] text-[12px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-body)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/10 outline-none transition-all placeholder:text-[var(--color-text-secondary)] placeholder:font-medium"
            />
          </div>

          {/* Vehicle Type Filter */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-[var(--color-text-muted)]">local_shipping</span>
            <select 
              value={filterVehicleType}
              onChange={e => setFilterVehicleType(e.target.value)}
              className="w-full pl-9 pr-3 h-[36px] text-[12px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-body)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/10 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Vehicle Types</option>
              <option value="Bike">Bike</option>
              <option value="Tractor">Tractor</option>
              <option value="Mini Truck">Mini Truck</option>
              <option value="Large Truck">Large Truck</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-[var(--color-text-muted)]">check_circle</span>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full pl-9 pr-3 h-[36px] text-[12px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-body)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/10 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Delivery">On Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-3 border-[var(--color-primary-100)] border-t-[var(--color-primary-600)] animate-spin"></div>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--card-border-radius)] shadow-[var(--shadow-card)] text-center py-16 px-6">
          <div className="w-16 h-16 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]/50">
            <span className="material-symbols-outlined text-[28px] text-[var(--color-text-secondary)]">local_shipping</span>
          </div>
          <h3 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1">No vehicles found</h3>
          <p className="text-[11.5px] text-[var(--color-text-secondary)] max-w-xs mx-auto mb-5 leading-relaxed">
            {drivers.length === 0 
              ? "Register your own drivers and trucks to offer transport services and coordinate live trackable crop delivery."
              : "No drivers match your current search keywords or filters."}
          </p>
          {drivers.length === 0 && (
            <button 
              onClick={() => setIsFormViewActive(true)}
              className="inline-block bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)] text-[var(--color-primary-700)] px-4 py-2 rounded-lg font-bold text-[11px] border border-[var(--color-primary-100)] transition-all cursor-pointer active:scale-[0.97]"
            >
              Register First Driver
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredDrivers.map((drv) => (
              <DriverCard 
                key={drv._id} 
                driver={drv} 
                onDelete={handleDeleteClick} 
              />
            ))}
          </AnimatePresence>
        </motion.div>
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
