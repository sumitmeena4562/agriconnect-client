import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CropCard from '../../components/shared/CropCard';
import ConfirmModal from '../../components/common/ConfirmModal';
import { CROP_CATEGORIES } from '../../constants/cropConstants';

const MyCrops = () => {
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Advanced Features State
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCrops, setTotalCrops] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, cropId: null, isLoading: false });

  const fetchCrops = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.get(`/api/crops?keyword=${keyword}&category=${category}&sort=${sort}&page=${page}&limit=10`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (res.data.data.length === 0 && page > 1) {
        // If we are on a page > 1 and it's empty (e.g. deleted the last item), go back a page
        setPage(prev => prev - 1);
      } else {
        setCrops(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCrops(res.data.total);
      }
    } catch (error) {
      toast.error('Failed to load crops');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, category, sort, page]);

  useEffect(() => {
    // Adding a small debounce for search
    const timer = setTimeout(() => {
      fetchCrops();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCrops]);

  const navigate = useNavigate();

  const handleEdit = (cropId) => {
    navigate(`/farmer-dashboard/crops/edit/${cropId}`);
  };

  const handleDelete = (cropId) => {
    setDeleteModal({ isOpen: true, cropId, isLoading: false });
  };

  const confirmDelete = async () => {
    const cropId = deleteModal.cropId;
    if (!cropId) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.delete(`/api/crops/${cropId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Crop deleted successfully');
      setDeleteModal({ isOpen: false, cropId: null, isLoading: false });
      // Refresh the current page to ensure pagination stays correct
      fetchCrops();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete crop');
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleSearchChange = (e) => {
    setKeyword(e.target.value);
    setPage(1); // Reset to page 1 on new search
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[18px] sm:text-[20px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-0.5">My Crops</h1>
          <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] font-medium">Manage your listed produce. ({totalCrops} total)</p>
        </div>
        <Link 
          to="/farmer-dashboard/crops/new"
          className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg font-bold text-[11px] shadow-sm shadow-primary-500/20 transition-all flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          <span className="hidden sm:inline">Add New Crop</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Advanced Filters Section */}
      <div className="global-card !p-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={keyword}
              onChange={handleSearchChange}
              className="form-input w-full pl-9 !h-[36px] !text-[12px] bg-[var(--color-bg-body)]"
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">category</span>
            <select 
              value={category}
              onChange={handleCategoryChange}
              className="form-input w-full pl-9 !h-[36px] !text-[12px] bg-[var(--color-bg-body)] appearance-none"
            >
              <option value="All">All Categories</option>
              {CROP_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">sort</span>
            <select 
              value={sort}
              onChange={handleSortChange}
              className="form-input w-full pl-9 !h-[36px] !text-[12px] bg-[var(--color-bg-body)] appearance-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : crops.length === 0 ? (
        <div className="global-card text-center py-10 px-4">
          <div className="w-12 h-12 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[24px] text-[var(--color-text-secondary)]">yard</span>
          </div>
          <h3 className="text-[14px] font-bold text-[var(--color-text-primary)] mb-1.5">No crops found</h3>
          <p className="text-[10px] text-[var(--color-text-secondary)] mb-4 max-w-xs mx-auto">
            {keyword || category !== 'All' 
              ? "We couldn't find any crops matching your search criteria. Try changing the filters."
              : "You haven't listed any crops for sale. Add your first crop to connect with buyers."}
          </p>
          {keyword || category !== 'All' ? (
            <button 
              onClick={() => { setKeyword(''); setCategory('All'); setSort('newest'); }}
              className="inline-block bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg font-bold text-[11px] transition-colors"
            >
              Clear Filters
            </button>
          ) : (
            <Link 
              to="/farmer-dashboard/crops/new"
              className="inline-block bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-lg font-bold text-[11px] transition-colors"
            >
              Add First Crop
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {crops.map((crop) => (
              <CropCard 
                key={crop._id} 
                crop={crop} 
                onEdit={handleEdit}
                onDelete={handleDelete}
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
                className={`w-8 h-8 flex items-center justify-center rounded-lg border ${page === 1 ? 'border-gray-200 text-gray-300' : 'border-primary-200 text-primary-600 hover:bg-primary-50'} transition-colors`}
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              
              <span className="text-[11px] font-bold text-gray-500 px-2">
                Page {page} of {totalPages}
              </span>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border ${page === totalPages ? 'border-gray-200 text-gray-300' : 'border-primary-200 text-primary-600 hover:bg-primary-50'} transition-colors`}
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
    </div>
  );
};

export default MyCrops;
