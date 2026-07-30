import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import CropCard from '../../components/shared/CropCard';
import ConfirmModal from '../../components/common/ConfirmModal';
import CustomSelect from '../../components/ui/CustomSelect';
import CropCardSkeleton from '../../components/crops/CropCardSkeleton';
import QuickEditModal from '../../components/crops/QuickEditModal';
import { CROP_CATEGORIES } from '../../constants/cropConstants';

const MyCrops = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCrops, setTotalCrops] = useState(0);

  // Modals State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, cropId: null, isLoading: false });
  const [quickEditModal, setQuickEditModal] = useState({ isOpen: false, crop: null });

  const fetchCrops = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/crops?keyword=${keyword}&category=${category}&sort=${sort}&page=${page}&limit=12`, {
        headers: { 
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (res.data?.data) {
        if (res.data.data.length === 0 && page > 1) {
          setPage(prev => prev - 1);
        } else {
          setCrops(res.data.data);
          setTotalPages(res.data.totalPages || 1);
          setTotalCrops(res.data.total || res.data.data.length);
        }
      }
    } catch (error) {
      toast.error('Failed to load crops');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, category, sort, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCrops();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCrops]);

  const handleEdit = (cropId) => {
    navigate(`/farmer-dashboard/crops/edit/${cropId}`);
  };

  const handleQuickEdit = (crop) => {
    setQuickEditModal({ isOpen: true, crop });
  };

  const handleToggleStatus = async (cropId) => {
    try {
      const res = await api.patch(`/crops/${cropId}/status`, {});
      toast.success(res.data.message || 'Status updated');
      
      setCrops(prev => prev.map(crop => 
        crop._id === cropId ? { ...crop, status: res.data.data.status } : crop
      ));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = (cropId) => {
    setDeleteModal({ isOpen: true, cropId, isLoading: false });
  };

  const confirmDelete = async () => {
    const cropId = deleteModal.cropId;
    if (!cropId) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    try {
      await api.delete(`/crops/${cropId}`);
      toast.success('Crop deleted successfully');
      setDeleteModal({ isOpen: false, cropId: null, isLoading: false });
      fetchCrops();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete crop');
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // CSV Export for Produce Stock Report
  const handleExportCSV = () => {
    if (crops.length === 0) {
      toast.error('No crops available to export');
      return;
    }
    const headers = ['Crop Name', 'Category', 'Quantity', 'Unit', 'Price (₹)', 'Status', 'Location', 'Farming Method'];
    const rows = crops.map(c => [
      `"${c.name}"`,
      `"${c.category}"`,
      c.quantity,
      `"${c.unit}"`,
      c.price,
      `"${c.status}"`,
      `"${c.location || ''}"`,
      `"${c.farmingMethod || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `My_Produce_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventory report downloaded as CSV');
  };

  // Filter crops locally by status filter tab
  const filteredCrops = crops.filter(crop => {
    if (statusFilter === 'Available') return crop.status === 'Available';
    if (statusFilter === 'Sold Out') return crop.status === 'Sold Out';
    return true;
  });

  // Calculate summary metrics
  const availableCount = crops.filter(c => c.status === 'Available').length;
  const soldOutCount = crops.filter(c => c.status === 'Sold Out').length;
  const totalValuation = crops.reduce((sum, c) => sum + ((c.price || 0) * (c.quantity || 0)), 0);

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto px-1 sm:px-2 pb-10">
      
      {/* ── 1. Page Title & Action Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <h1 className="text-[19px] sm:text-[22px] font-black text-slate-900 tracking-tight leading-none">
            My Crops & Produce Inventory 🌾
          </h1>
          <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium mt-1">
            Manage harvest listings, update stock levels & monitor buyer inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            title="Download Inventory Report"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 px-3 py-2 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Add Crop Button */}
          <Link 
            to="/farmer-dashboard/crops/new"
            className="bg-primary-600 hover:bg-primary-700 active:scale-95 text-white px-3.5 py-2 rounded-xl font-black text-[11px] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Add New Harvest Crop</span>
          </Link>
        </div>
      </div>

      {/* ── 2. Inventory Metrics Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">yard</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Total Listings</p>
            <p className="text-[15px] font-black text-slate-900 leading-none mt-0.5">{totalCrops}</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-success-50 text-success-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Available Stock</p>
            <p className="text-[15px] font-black text-success-700 leading-none mt-0.5">{availableCount} Crops</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">remove_shopping_cart</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Sold Out</p>
            <p className="text-[15px] font-black text-slate-700 leading-none mt-0.5">{soldOutCount} Crops</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-info-50 text-info-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">payments</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Inventory Value</p>
            <p className="text-[15px] font-black text-slate-900 leading-none mt-0.5">₹{totalValuation.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* ── 3. Micro-Compact Filter Toolbar ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 px-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-xs">
        
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 shrink-0 overflow-x-auto">
          {[
            { id: 'All', label: 'All', count: crops.length },
            { id: 'Available', label: 'Available', count: availableCount },
            { id: 'Sold Out', label: 'Sold Out', count: soldOutCount }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === st.id
                  ? 'bg-primary-600 text-white shadow-xs font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{st.label}</span>
              <span className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                statusFilter === st.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {st.count}
              </span>
            </button>
          ))}
        </div>

        {/* Inputs Group: Search, Category, Sort */}
        <div className="flex items-center gap-2 flex-1 md:max-w-[530px] justify-end">
          
          {/* Search Box */}
          <div className="flex items-center gap-2 px-2.5 h-8 bg-slate-50 border border-slate-200 rounded-md flex-1 min-w-[130px] focus-within:border-primary-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary-100 transition-all">
            <span className="material-symbols-outlined text-[15px] leading-none text-slate-400 shrink-0 select-none flex items-center justify-center">search</span>
            <input 
              type="text" 
              placeholder="Search crop..." 
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              className="w-full bg-transparent border-none outline-none text-[11px] font-semibold text-slate-800 placeholder:text-slate-400 p-0 leading-none focus:ring-0 focus:outline-none"
            />
          </div>

          {/* Category Custom Dropdown */}
          <CustomSelect 
            value={category}
            onChange={(val) => { setCategory(val); setPage(1); }}
            icon="category"
            minWidth="145px"
            options={[
              { label: 'All Categories', value: 'All' },
              ...CROP_CATEGORIES.map(cat => ({ label: cat, value: cat }))
            ]}
          />

          {/* Sort Custom Dropdown */}
          <CustomSelect 
            value={sort}
            onChange={(val) => { setSort(val); setPage(1); }}
            icon="sort"
            minWidth="130px"
            options={[
              { label: 'Newest First', value: 'newest' },
              { label: 'Oldest First', value: 'oldest' },
              { label: 'Price: Low → High', value: 'price_asc' },
              { label: 'Price: High → Low', value: 'price_desc' }
            ]}
          />

        </div>
      </div>

      {/* ── 4. Crops Grid Content ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5">
          <CropCardSkeleton />
          <CropCardSkeleton />
          <CropCardSkeleton />
          <CropCardSkeleton />
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="global-card text-center py-12 px-4 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-[24px]">grass</span>
          </div>
          <h3 className="text-[13px] font-black text-slate-800">No crops found</h3>
          <p className="text-[10.5px] text-slate-500 max-w-xs font-medium">
            {keyword || category !== 'All' || statusFilter !== 'All'
              ? "No crops match your search or filter criteria. Try clearing active filters."
              : "You haven't listed any crops for sale. List your first harvest to connect with vendors."}
          </p>
          {keyword || category !== 'All' || statusFilter !== 'All' ? (
            <button 
              onClick={() => { setKeyword(''); setCategory('All'); setStatusFilter('All'); setSort('newest'); }}
              className="mt-1 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10.5px] rounded-lg transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          ) : (
            <Link 
              to="/farmer-dashboard/crops/new"
              className="mt-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-black text-[11px] rounded-lg transition-colors shadow-sm"
            >
              Add First Crop
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5">
            {filteredCrops.map((crop) => (
              <CropCard 
                key={crop._id} 
                crop={crop} 
                onEdit={handleEdit}
                onQuickEdit={handleQuickEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                actionType="farmer"
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 pb-4">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border ${page === 1 ? 'border-slate-200 text-slate-300' : 'border-primary-200 text-primary-600 hover:bg-primary-50'} transition-colors cursor-pointer disabled:opacity-50`}
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              
              <span className="text-[11px] font-bold text-slate-600 px-2">
                Page {page} of {totalPages}
              </span>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border ${page === totalPages ? 'border-slate-200 text-slate-300' : 'border-primary-200 text-primary-600 hover:bg-primary-50'} transition-colors cursor-pointer disabled:opacity-50`}
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => !deleteModal.isLoading && setDeleteModal({ isOpen: false, cropId: null, isLoading: false })}
        onConfirm={confirmDelete}
        title="Delete Crop"
        description="Are you sure you want to delete this crop? This action cannot be undone and it will be removed from the marketplace."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        icon="delete"
        isDanger={true}
        isLoading={deleteModal.isLoading}
      />

      {/* Quick Edit Stock & Price Modal */}
      <QuickEditModal 
        isOpen={quickEditModal.isOpen}
        crop={quickEditModal.crop}
        onClose={() => setQuickEditModal({ isOpen: false, crop: null })}
        onSuccess={(updatedCrop) => {
          setCrops(prev => prev.map(c => c._id === updatedCrop._id ? updatedCrop : c));
        }}
      />
    </div>
  );
};

export default MyCrops;
