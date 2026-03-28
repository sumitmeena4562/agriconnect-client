import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveLocationDetector = ({ onLocationDetected, colors = null }) => {
    const activeColors = colors || { text: 'text-primary-500', bg: 'bg-primary-500', lightBg: 'bg-primary-50' };
    const [status, setStatus] = useState('idle'); // idle, detecting, success, error
    const [address, setAddress] = useState('');

    const detectLocation = () => {
        setStatus('detecting');
        if (!navigator.geolocation) {
            setStatus('error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                onLocationDetected({ lat: latitude, lng: longitude });
                
                // Optional: Short mock for address fetching UI
                setTimeout(() => {
                    setStatus('success');
                    setAddress("Location Verified Successfully!");
                }, 1000);
            },
            () => {
                setStatus('error');
            }
        );
    };

    return (
        <div className="p-4 bg-slate-50 rounded-[28px] border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${status === 'success' ? 'bg-green-100 text-green-600' : `${activeColors.lightBg} ${activeColors.text}`}`}>
                        <span className="material-symbols-outlined">
                            {status === 'success' ? 'check_circle' : 'location_on'}
                        </span>
                    </div>
                    <div>
                        <p className="text-[12px] font-black text-slate-800 tracking-tight leading-none mb-1">LIVE LOCATION</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase italic">Z+ Real-time Tracking</p>
                    </div>
                </div>
                
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={detectLocation}
                    disabled={status === 'detecting' || status === 'success'}
                    className={`
                        px-4 py-2 rounded-xl text-[10px] font-black transition-all shadow-sm
                        ${status === 'success' ? 'bg-green-500 text-white' : 'bg-white text-slate-800 hover:bg-slate-100'}
                    `}
                >
                    {status === 'idle' && "DETECT NOW"}
                    {status === 'detecting' && "SEARCHING..."}
                    {status === 'success' && "VERIFIED"}
                    {status === 'error' && "RETRY"}
                </motion.button>
            </div>

            <AnimatePresence>
                {address && (
                    <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] font-bold text-green-600 bg-white/50 py-1.5 px-3 rounded-lg border border-green-100 text-center"
                    >
                        {address}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LiveLocationDetector;
