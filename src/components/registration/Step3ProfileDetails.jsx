import React from 'react';
import { motion } from 'framer-motion';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { STATES_DATA } from '../../constants/registration';

const Step3ProfileDetails = ({ formData, onChange, onSubmit, loading, error, fieldErrors, title, subtitle }) => {
    return (
        <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">{title || "Your Profile."}</h1>
                <p className="text-slate-500 text-sm">{subtitle || "Completing your profile."}</p>
            </div>

            <div className="space-y-4">
                <Input 
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={onChange}
                    placeholder="Enter your full name"
                    icon="person"
                    error={fieldErrors.fullName}
                />

                <Input 
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    placeholder="name@example.com"
                    icon="mail"
                    error={fieldErrors.email}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        placeholder="••••••"
                        icon="lock"
                        error={fieldErrors.password}
                    />
                    <Input 
                        label="Confirm"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={onChange}
                        placeholder="••••••"
                        icon="lock_reset"
                        error={fieldErrors.confirmPassword}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select 
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={onChange}
                        options={Object.keys(STATES_DATA)}
                        error={fieldErrors.state}
                    />
                    <Select 
                        label="District"
                        name="district"
                        value={formData.district}
                        onChange={onChange}
                        disabled={!formData.state}
                        options={formData.state ? STATES_DATA[formData.state] : []}
                        error={fieldErrors.district}
                    />
                </div>

                <Input 
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={onChange}
                    maxLength="6"
                    placeholder="6-digit code"
                    icon="location_on"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    error={fieldErrors.pincode}
                />
            </div>

            {error && (
                <div className="text-red-500 text-xs font-bold text-center py-2 bg-red-50 rounded-lg">
                    {error}
                </div>
            )}

            <Button 
                onClick={onSubmit}
                disabled={loading}
                fullWidth
                icon={loading ? "autorenew" : "done_all"}
            >
                {loading ? "SAVING..." : "FINISH"}
            </Button>
        </motion.div>
    );
};

export default Step3ProfileDetails;
