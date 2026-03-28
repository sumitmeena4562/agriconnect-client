import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import AvatarPicker from './AvatarPicker';
import DateInput from '../ui/DateInput';
import LiveLocationDetector from './LiveLocationDetector';
import { STATES_DATA } from '../../constants/registration';
import { checkAvailability } from '../../services/api';
import { 
    validateName, validateEmail, validatePassword, validatePincode, 
    validateDOB, validateGender, calculatePasswordStrength 
} from '../../utils/validation';

const Step3ProfileDetails = ({ formData, onChange, onSubmit, loading, error, fieldErrors, title, subtitle, colors }) => {
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState(null); // null, true, false
    const [emailCheckError, setEmailCheckError] = useState("");

    // Real-time validation checks
    const isNameValid = formData.fullName?.length >= 3 && !validateName(formData.fullName);
    const isEmailValid = formData.email?.length > 5 && !validateEmail(formData.email) && (emailAvailable !== false);
    const isPasswordValid = formData.password?.length >= 8 && !validatePassword(formData.password);
    const isConfirmValid = formData.confirmPassword === formData.password && formData.confirmPassword.length > 0;
    const isPincodeValid = formData.pincode?.length === 6 && !validatePincode(formData.pincode);
    const isLocationValid = formData.state && formData.district;
    const isDOBValid = formData.dob && !validateDOB(formData.dob);
    const isGenderValid = formData.gender && !validateGender(formData.gender);
    
    const passwordStrength = calculatePasswordStrength(formData.password);

    const allValid = isNameValid && isEmailValid && isPasswordValid && isConfirmValid && isPincodeValid && isLocationValid && isDOBValid && isGenderValid;

    const checkEmailAvailability = async () => {
        if (!formData.email || validateEmail(formData.email)) return;
        
        setEmailLoading(true);
        setEmailCheckError("");
        try {
            const response = await checkAvailability({ email: formData.email });
            setEmailAvailable(response.data.available);
            if (!response.data.available) {
                setEmailCheckError("Email is already registered");
            }
        } catch (err) {
            console.error("Availability check failed:", err);
        } finally {
            setEmailLoading(false);
        }
    };

    // Auto check after typing stops (debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.email && !validateEmail(formData.email)) {
                checkEmailAvailability();
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [formData.email]);
    return (
        <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="space-y-1 text-left">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title || "Profile Details."}</h1>
                <p className="text-slate-500 text-sm">{subtitle || "Complete your profile to get started."}</p>
            </div>

            <div className="space-y-4">
                <AvatarPicker 
                    selectedAvatar={formData.profilePic} 
                    onSelect={(id) => onChange({ target: { name: 'profilePic', value: id } })} 
                    colors={colors}
                />

                <Input 
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={onChange}
                    placeholder="Enter full name"
                    icon="person"
                    error={fieldErrors.fullName}
                    success={isNameValid}
                    colors={colors}
                />

                <div className="grid grid-cols-2 gap-4">
                    <DateInput 
                        label="Date of Birth"
                        value={formData.dob}
                        onChange={onChange}
                        error={fieldErrors.dob}
                        success={isDOBValid}
                        colors={colors}
                    />
                    <Select 
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        onChange={onChange}
                        options={["Male", "Female", "Other", "Prefer not to say"]}
                        error={fieldErrors.gender}
                        success={isGenderValid}
                        colors={colors}
                    />
                </div>

                <Input 
                    label="Email Id"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    placeholder="name@example.com"
                    icon="mail"
                    error={fieldErrors.email || emailCheckError}
                    success={isEmailValid && emailAvailable}
                    loading={emailLoading}
                    colors={colors}
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
                        strength={passwordStrength}
                        colors={colors}
                    />
                    <Input 
                        label="Confirm"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={onChange}
                        placeholder="Repeat password"
                        icon="lock_reset"
                        error={fieldErrors.confirmPassword}
                        success={isConfirmValid}
                        colors={colors}
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
                        success={!!formData.state}
                        colors={colors}
                    />
                    <Select 
                        label="District"
                        name="district"
                        value={formData.district}
                        onChange={onChange}
                        disabled={!formData.state}
                        options={formData.state ? STATES_DATA[formData.state] : []}
                        error={fieldErrors.district}
                        success={!!formData.district}
                        colors={colors}
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
                    colors={colors}
                />

                <LiveLocationDetector 
                    onLocationDetected={(coords) => onChange({ target: { name: 'location', value: coords } })} 
                    colors={colors}
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
                disabled={loading || emailLoading}
                fullWidth
                variant={allValid ? (colors.text.includes('primary') ? 'primary' : colors.text.includes('accent') ? 'accent' : 'dark') : 'dark'}
                icon={loading ? "autorenew" : "done_all"}
            >
                {loading ? "SAVING..." : "CREATE ACCOUNT"}
            </Button>
        </motion.div>
    );
};

export default Step3ProfileDetails;
