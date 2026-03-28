import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { STATES_DATA } from '../../constants/registration';
import { validateName, validateEmail, validatePassword, validatePincode } from '../../utils/validation';

const Step3ProfileDetails = ({ formData, onChange, onSubmit, loading, error, fieldErrors, title, subtitle }) => {
    // Real-time validation checks
    const isNameValid = formData.fullName?.length >= 3 && !validateName(formData.fullName);
    const isEmailValid = formData.email?.length > 5 && !validateEmail(formData.email);
    const isPasswordValid = formData.password?.length >= 8 && !validatePassword(formData.password);
    const isConfirmValid = formData.confirmPassword === formData.password && formData.confirmPassword.length > 0;
    const isPincodeValid = formData.pincode?.length === 6 && !validatePincode(formData.pincode);
    const isLocationValid = formData.state && formData.district;

    const allValid = isNameValid && isEmailValid && isPasswordValid && isConfirmValid && isPincodeValid && isLocationValid;

    return (
        <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title || "Your Profile."}</h1>
                <p className="text-slate-500 text-sm">{subtitle || "Completing your profile."}</p>
            </div>

            <div className="space-y-4">
                <Input 
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={onChange}
                    placeholder="First Last Name"
                    icon="person"
                    error={fieldErrors.fullName}
                    success={isNameValid}
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
                    success={isEmailValid}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        placeholder="Min 8 chars"
                        icon="lock"
                        error={fieldErrors.password}
                        success={isPasswordValid}
                    />
                    <Input 
                        label="Confirm"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={onChange}
                        placeholder="Re-enter"
                        icon="lock_reset"
                        error={fieldErrors.confirmPassword}
                        success={isConfirmValid}
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
                    success={isPincodeValid}
                />
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-500 text-[11px] font-black text-center py-2 bg-red-50/50 rounded-lg uppercase tracking-widest"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <Button 
                onClick={onSubmit}
                disabled={loading}
                fullWidth
                variant={allValid ? 'primary' : 'dark'}
                icon={loading ? "autorenew" : "done_all"}
            >
                {loading ? "SAVING..." : "CREATE ACCOUNT"}
            </Button>
        </motion.div>
    );
};

export default Step3ProfileDetails;
