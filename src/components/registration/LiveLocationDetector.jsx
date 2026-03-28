import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

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
        <div className={`p-4 bg-white rounded-2xl border transition-all duration-500 overflow-hidden ${status === 'success' ? `border-${activeColors.text.replace('text-', '').replace('-600', '-300')} shadow-[0_0_20px_-5px_rgba(0,210,120,0.12)]` : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${status === 'success' ? activeColors.bg : 'bg-slate-100'}`}>
                        <span className={`material-symbols-outlined ${status === 'success' ? 'text-white' : 'text-slate-400'} text-2xl`}>
                            {status === 'success' ? 'verified_user' : status === 'detecting' ? 'sync' : 'location_on'}
                        </span>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Real-time Location</p>
                        <p className={`text-[14px] font-bold ${status === 'success' ? 'text-slate-800' : 'text-slate-500'}`}>
                            {status === 'idle' && "Not Verified"}
                            {status === 'detecting' && "Pinpointing..."}
                            {status === 'success' && "Location Verified"}
                            {status === 'error' && "Detection Failed"}
                        </p>
                    </div>
                </div>
                
                <Button
                    onClick={detectLocation}
                    disabled={status === 'detecting' || status === 'success'}
                    size="sm"
                    variant={status === 'success' ? 'glass' : (colors.text.includes('primary') ? 'primary' : colors.text.includes('accent') ? 'accent' : 'dark')}
                    icon={status === 'detecting' ? "autorenew" : status === 'success' ? "done" : null}
                    className="min-w-[100px]"
                >
                    {status === 'idle' && "DETECT"}
                    {status === 'detecting' && "..."}
                    {status === 'success' && "DONE"}
                    {status === 'error' && "RETRY"}
                </Button>
            </div>

            <AnimatePresence>
                {address && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 overflow-hidden"
                    >
                        <div className={`text-[11px] font-bold ${activeColors.text} bg-slate-50 py-2 px-3 rounded-xl border border-dashed border-slate-200 text-center italic`}>
                            {address}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LiveLocationDetector;
