import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/common/ConfirmModal';
import DriverCard from '../../components/shared/DriverCard';

const DriverRegistry = () => {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search and Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Add Form state
  const [formStep, setFormStep] = useState(0);
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

  useEffect(() => {
    fetchDrivers();
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
      setIsAddModalOpen(false);
      
      // Reset all states
      setName('');
      setPhone('');
      setVehicleNumber('');
      setVehicleType('Mini Truck');
      setPayloadCapacity('');
      setLicenseNumber('');
      setRcNumber('');
      setAddress('');
      setInsuranceFile(null);
      setFormStep(0);
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setAadhaarNumber('');
      setLicenseClass('LMV');
      setLicenseExpiry('');
      setRcExpiry('');
      setVehicleModel('');
      setFuelType('Diesel');
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
          onClick={() => setIsAddModalOpen(true)}
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
              onClick={() => setIsAddModalOpen(true)}
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

      {/* Add Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[var(--color-surface)] rounded-[var(--card-border-radius)] max-w-lg w-full shadow-[var(--shadow-card-hover)] border border-[var(--color-border)] z-10 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex justify-between items-center">
              <div>
                <h2 className="text-[15.5px] font-black text-[var(--color-text-primary)]">🚚 Register Driver & Vehicle</h2>
                <p className="text-[11px] text-[var(--color-text-secondary)] font-semibold mt-0.5">Add a new transport asset to your fleet.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[var(--color-border)]/50 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Steps Progress Tabs */}
            <div className="px-5 pt-3.5 flex border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] gap-4 select-none">
              {[
                { id: 0, label: '👤 Driver Info' },
                { id: 1, label: '🛻 Vehicle Specs' },
                { id: 2, label: '💳 Payout & Docs' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFormStep(tab.id)}
                  className={`pb-2.5 text-[10.5px] font-black tracking-wide border-b-2 transition-all cursor-pointer ${
                    formStep === tab.id 
                      ? 'border-[var(--color-primary-500)] text-[var(--color-primary-600)]' 
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleAddDriver} className="p-5 space-y-4">
              {/* STEP 0: DRIVER INFO */}
              {formStep === 0 && (
                <div className="space-y-3.5">
                  {/* Row 1: Name and Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Driver Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)] placeholder:font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Phone Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)] placeholder:font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Emergency Contact */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Emergency Name</label>
                      <input
                        type="text"
                        placeholder="Next of kin name"
                        value={emergencyContactName}
                        onChange={e => setEmergencyContactName(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Emergency Phone</label>
                      <input
                        type="text"
                        placeholder="Next of kin phone"
                        value={emergencyContactPhone}
                        onChange={e => setEmergencyContactPhone(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                  </div>

                  {/* Row 3: Aadhaar & Address */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Aadhaar Card No.</label>
                      <input
                        type="text"
                        placeholder="e.g. 1234 5678 9012"
                        value={aadhaarNumber}
                        onChange={e => setAadhaarNumber(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Driver Address</label>
                      <input
                        type="text"
                        placeholder="e.g. Town/Village, State"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: LICENSE & VEHICLE SPECS */}
              {formStep === 1 && (
                <div className="space-y-3.5">
                  {/* Row 1: DL Number & DL Class */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">DL Number</label>
                      <input
                        type="text"
                        placeholder="e.g. MH04201100"
                        value={licenseNumber}
                        onChange={e => setLicenseNumber(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all uppercase placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">DL Class / Category</label>
                      <select
                        value={licenseClass}
                        onChange={e => setLicenseClass(e.target.value)}
                        className="w-full h-9.5 px-2 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all"
                      >
                        <option value="LMV">LMV (Light Motor Vehicle)</option>
                        <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                        <option value="MCWG">MCWG (Motorcycle with Gear)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: DL Expiry & Vehicle Model */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">DL Expiry Date</label>
                      <input
                        type="date"
                        value={licenseExpiry}
                        onChange={e => setLicenseExpiry(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Vehicle Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Tata Ace Gold"
                        value={vehicleModel}
                        onChange={e => setVehicleModel(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                  </div>

                  {/* Row 3: Vehicle No & Vehicle Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Vehicle Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. MH 12 AB 5678"
                        value={vehicleNumber}
                        onChange={e => setVehicleNumber(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all font-mono uppercase tracking-wider placeholder:text-[var(--color-text-muted)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Vehicle Type *</label>
                      <select
                        value={vehicleType}
                        onChange={e => setVehicleType(e.target.value)}
                        className="w-full h-9.5 px-2 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all"
                      >
                        <option value="Bike">🚴 Bike Box</option>
                        <option value="Tractor">🚜 Tractor Trolley</option>
                        <option value="Pickup">🛻 Pickup Vehicle</option>
                        <option value="Mini Truck">🚚 Mini Truck</option>
                        <option value="Large Truck">🚛 Large Truck</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Payload, Fuel Type & RC */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Payload (kg) *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 1000"
                        value={payloadCapacity}
                        onChange={e => setPayloadCapacity(e.target.value)}
                        className="w-full h-9.5 px-2 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Fuel Type</label>
                      <select
                        value={fuelType}
                        onChange={e => setFuelType(e.target.value)}
                        className="w-full h-9.5 px-1 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all"
                      >
                        <option value="Diesel">Diesel</option>
                        <option value="CNG">CNG</option>
                        <option value="Electric">Electric</option>
                        <option value="Petrol">Petrol</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">RC Number</label>
                      <input
                        type="text"
                        placeholder="e.g. MH12AB"
                        value={rcNumber}
                        onChange={e => setRcNumber(e.target.value)}
                        className="w-full h-9.5 px-2 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all uppercase placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DOCUMENTS & PAYOUTS */}
              {formStep === 2 && (
                <div className="space-y-3.5">
                  {/* Row 1: PAN & Insurance Expiry */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">PAN Number</label>
                      <input
                        type="text"
                        placeholder="e.g. ABCDE1234F"
                        value={panNumber}
                        onChange={e => setPanNumber(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all uppercase placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Insurance Policy No.</label>
                      <input
                        type="text"
                        placeholder="Policy number"
                        value={insurancePolicyNumber}
                        onChange={e => setInsurancePolicyNumber(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                  </div>

                  {/* Row 2: Bank Account Name & UPI ID */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Bank Account Holder</label>
                      <input
                        type="text"
                        placeholder="Account name"
                        value={bankAccountName}
                        onChange={e => setBankAccountName(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">UPI ID for Payout</label>
                      <input
                        type="text"
                        placeholder="e.g. driver@ybl"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                  </div>

                  {/* Row 3: Bank Account Number & IFSC Code */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Bank Account Number</label>
                      <input
                        type="text"
                        placeholder="Account number"
                        value={bankAccountNumber}
                        onChange={e => setBankAccountAccountNumber(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Bank IFSC Code</label>
                      <input
                        type="text"
                        placeholder="e.g. SBIN0001234"
                        value={bankAccountIfsc}
                        onChange={e => setBankAccountIfsc(e.target.value)}
                        className="w-full h-9.5 px-3 text-[12px] rounded-[var(--form-border-radius)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/15 outline-none transition-all uppercase placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                  </div>

                  {/* Row 4: Upload Insurance document */}
                  <div>
                    <label className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Insurance File Upload</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center justify-center h-10 px-4 rounded-[var(--form-border-radius)] border border-dashed border-[var(--color-border)] hover:border-primary-500 hover:bg-primary-50/20 text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-primary-600 transition-all cursor-pointer flex-1">
                        <span className="material-symbols-outlined text-[16px] mr-1.5">upload_file</span>
                        <span className="truncate">{insuranceFile ? insuranceFile.name : 'Choose Insurance Doc / PDF'}</span>
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
                          className="w-10 h-10 rounded-[var(--form-border-radius)] bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center border border-red-100 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Footer Navigation Controls */}
              <div className="pt-3.5 flex gap-2.5 border-t border-[var(--color-border)]/70">
                {formStep > 0 ? (
                  <button
                    type="button"
                    onClick={() => setFormStep(prev => prev - 1)}
                    disabled={isSubmitting}
                    className="flex-1 h-10 rounded-[var(--form-border-radius)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] text-[11.5px] font-black transition-all cursor-pointer active:scale-[0.98]"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 h-10 rounded-[var(--form-border-radius)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] text-[11.5px] font-black transition-all cursor-pointer active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                )}

                {formStep < 2 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (formStep === 0 && (!name || !phone)) {
                        toast.error('Please enter Driver Name and Phone Number');
                        return;
                      }
                      setFormStep(prev => prev + 1);
                    }}
                    className="flex-1 h-10 rounded-[var(--form-border-radius)] bg-slate-900 hover:bg-slate-800 text-white text-[11.5px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
                  >
                    Next Step ➔
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-10 rounded-[var(--form-border-radius)] bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white text-[11.5px] font-black shadow-sm shadow-[var(--color-primary-500)]/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Register Driver'}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
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
