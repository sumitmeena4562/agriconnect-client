import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadAvatar } from '../../services/api';

const AVATARS = [
    { id: 'farmer_1', icon: 'agriculture', label: 'Classic Farmer' },
    { id: 'farmer_2', icon: 'psychology', label: 'Agri Expert' },
    { id: 'farmer_3', icon: 'home_work', label: 'Land Owner' },
    { id: 'vendor_1', icon: 'storefront', label: 'Trader' },
    { id: 'vendor_2', icon: 'local_shipping', label: 'Logistics' },
];

const AvatarPicker = ({ selectedAvatar, onSelect, colors = null }) => {
    const activeColors = colors || { text: 'text-primary-500', bg: 'bg-primary-500', lightBg: 'bg-primary-50' };
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const isCustomUrl = selectedAvatar?.startsWith('http');

    const handleUploadClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await uploadAvatar(formData);
            
            if (response.data.success && response.data.url) {
                onSelect(response.data.url);
            } else {
                alert(response.data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            const msg = error.response?.data?.message || 'Failed to upload image. Please try again.';
            alert(msg);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renderCheckmark = () => (
        <motion.div 
            layoutId="avatar-check"
            className={`absolute -top-1.5 -right-1.5 w-5 h-5 ${activeColors.bg} text-white rounded-full flex items-center justify-center border-2 border-white shadow-md z-10`}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        </motion.div>
    );

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Selection (Choose Avatar)</p>
            </div>
            
            <div className="grid grid-cols-6 gap-2 relative">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                />

                {/* Custom Upload Button */}
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isCustomUrl ? () => {} : handleUploadClick}
                    className={`
                        relative h-12 w-full rounded-2xl flex items-center justify-center transition-all duration-300 overflow-hidden group
                        ${isCustomUrl 
                            ? 'shadow-lg shadow-slate-200 border-2 overflow-visible' 
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}
                        ${isCustomUrl ? `border-${activeColors.text.replace('text-', '')}` : 'border border-transparent'}
                    `}
                    title="Upload Custom Photo"
                >
                    {uploading ? (
                        <span className={`material-symbols-outlined animate-spin ${activeColors.text}`}>
                            autorenew
                        </span>
                    ) : isCustomUrl ? (
                        <>
                            <div className="absolute inset-0 rounded-[14px] overflow-hidden">
                                <img src={selectedAvatar} alt="Custom Profile" className="w-full h-full object-cover" />
                            </div>
                            <div 
                                onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[14px] cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-white text-sm">edit</span>
                            </div>
                            {renderCheckmark()}
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                        </div>
                    )}
                </motion.button>

                {/* Preset Avatars */}
                {AVATARS.map((avatar) => (
                    <motion.button
                        key={avatar.id}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onSelect(avatar.id)}
                        className={`
                            relative h-12 w-full rounded-2xl flex items-center justify-center transition-all duration-300
                            ${selectedAvatar === avatar.id 
                                ? `${activeColors.bg} text-white shadow-lg shadow-slate-200` 
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
                        `}
                        title={avatar.label}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {avatar.icon}
                        </span>
                        {selectedAvatar === avatar.id && renderCheckmark()}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default AvatarPicker;
