import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

const LiveLocationDetector = ({ onLocationDetected, colors = null, pincode = "" }) => {
    const activeColors = colors || { text: 'text-primary-500', bg: 'bg-primary-500', lightBg: 'bg-primary-50' };
    const [status, setStatus] = useState('idle'); // idle, detecting, success, error
    const [address, setAddress] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const detectLocation = () => {
        setStatus('detecting');
        setErrorMsg('');
        if (!navigator.geolocation) {
            setStatus('error');
            setErrorMsg('Geolocation not supported');
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
            (error) => {
                setStatus('error');
                if (error.code === 1) setErrorMsg('Permission Denied (Allow in Browser)');
                else if (error.code === 2) setErrorMsg('Position Unavailable');
                else if (error.code === 3) setErrorMsg('Request timed out');
                else setErrorMsg('Detection failed');
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    const handleManualVerify = () => {
        if (!pincode || pincode.length !== 6) {
            toast.error("Please enter a valid Pincode first");
            return;
        }
        setStatus('detecting');
        setTimeout(() => {
            // Mock coordinates for pincode-based verification
            onLocationDetected({ lat: 20.5937, lng: 78.9629, manual: true });
            setStatus('success');
            setAddress(`Location Verified via Pincode: ${pincode}`);
        }, 800);
    };

    return (
        <div className={`p-4 bg-white rounded-2xl border transition-all duration-500 overflow-hidden ${status === 'success' ? `border-${activeColors.text.replace('text-', '').replace('-600', '-300')} shadow-[0_0_20px_-5px_rgba(0,210,120,0.12)]` : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${status === 'success' ? activeColors.bg : 'bg-slate-100'}`}>
                        <span className={`material-symbols-outlined ${status === 'success' ? 'text-white' : 'text-slate-400'} text-2xl ${status === 'detecting' ? 'animate-spin' : ''}`}>
                            {status === 'success' ? 'verified' : status === 'detecting' ? 'progress_activity' : 'location_on'}
                        </span>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Real-time Location</p>
                        <p className={`text-[14px] font-bold ${status === 'success' ? 'text-slate-800' : status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                            {status === 'idle' && "Not Verified"}
                            {status === 'detecting' && "Pinpointing..."}
                            {status === 'success' && "Identity Location Verified"}
                            {status === 'error' && (errorMsg || "Detection Failed")}
                        </p>
                    </div>
                </div>
                
                <Button
                    onClick={detectLocation}
                    disabled={status === 'detecting' || status === 'success'}
                    size="sm"
                    variant={status === 'success' ? 'outline' : (colors.text.includes('primary') ? 'primary' : colors.text.includes('accent') ? 'accent' : 'dark')}
                    icon={status === 'detecting' ? null : status === 'success' ? "check_circle" : "gps_fixed"}
                    className={`min-w-[100px] ${status === 'success' ? 'border-primary-500 text-primary-600' : ''}`}
                >
                    {status === 'idle' && "DETECT"}
                    {status === 'detecting' && "..."}
                    {status === 'success' && "DONE"}
                    {status === 'error' && "RETRY"}
                </Button>
            </div>

            <AnimatePresence>
                {(address || status === 'error') && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, height: 0 }}
                        animate={{ opacity: 1, scale: 1, height: 'auto' }}
                        className="mt-4 overflow-hidden"
                    >
                        {status === 'success' ? (
                            <div className={`flex items-center gap-2 text-[12px] font-bold ${activeColors.text} bg-emerald-50/50 py-3 px-4 rounded-xl border border-emerald-100/50 shadow-sm`}>
                                <span className="material-symbols-outlined text-base">check_circle</span>
                                {address}
                            </div>
                        ) : (
                            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                                <p className="text-[10px] text-red-600 font-bold mb-2 text-center uppercase tracking-widest">Verification Stuck?</p>
                                <button 
                                    onClick={handleManualVerify}
                                    className="w-full py-2 bg-white text-slate-700 text-[11px] font-black rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm uppercase tracking-tighter"
                                >
                                    Verify via Pincode: {pincode || "------"}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LiveLocationDetector;
