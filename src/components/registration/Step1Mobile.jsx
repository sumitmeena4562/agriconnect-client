import React from 'react';
import { motion } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';

const Step1Mobile = ({ mobile, onChange, onContinue, loading, error, fieldErrors }) => {
    return (
        <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">Join AgriConnect.</h1>
                <p className="text-slate-500 text-sm">Enter your mobile number to get started.</p>
            </div>

            <div className="space-y-4">
                <Input 
                    label="Mobile Number"
                    name="mobile"
                    maxLength="10"
                    placeholder="00000 00000"
                    value={mobile}
                    onChange={onChange}
                    prefix="+91"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    error={fieldErrors?.mobile || error}
                    autoFocus
                />

                <Button 
                    onClick={onContinue}
                    disabled={loading}
                    fullWidth
                    icon={loading ? "autorenew" : "arrow_forward"}
                >
                    {loading ? "SENDING..." : "CONTINUE"}
                </Button>
            </div>
            
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">verified</span> Verified
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">lock</span> Secure
                </div>
            </div>
        </motion.div>
    );
};

export default Step1Mobile;
