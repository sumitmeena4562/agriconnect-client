import { useState, useEffect, useRef } from 'react';
import { 
    sendOtp as apiSendOtp, 
    verifyOtp as apiVerifyOtp, 
    registerUser as apiRegisterUser 
} from '../services/api';
import { 
    validateMobile, 
    validateEmail, 
    validatePincode, 
    validateName, 
    validatePassword 
} from '../utils/validation';
import { toast } from 'react-hot-toast';

export const useRegistrationForm = (initialData) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [verificationToken, setVerificationToken] = useState("");
    const [formData, setFormData] = useState(initialData);
    const otpRefs = useRef([]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...formData.otp];
        newOtp[index] = value.slice(-1);
        setFormData(prev => ({ ...prev, otp: newOtp }));

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Timer Logic for OTP
    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mobile' || name === 'pincode') {
            if (!/^\d*$/.test(value)) return;
        }
        setError("");
        setFieldErrors(prev => ({ ...prev, [name]: "" }));
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSendOtp = async () => {
        const { mobile, email } = formData;
        const mobileErr = /^[6-9]\d{9}$/.test(mobile) ? "" : "Enter valid 10-digit mobile";
        const emailErr = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter valid email";

        if (mobileErr || emailErr) {
            setFieldErrors({ mobile: mobileErr, email: emailErr });
            toast.error("Please fill all details correctly");
            return;
        }

        setLoading(true);
        setError("");
        try {
            // Send both to backend
            const response = await apiSendOtp({ mobile, email });
            if (response.data.success) {
                toast.success(response.data.message || "OTP sent to your email!");
                setTimer(30);
                setCanResend(false);
                setStep(2);
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to send OTP";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!formData.otp.every(v => v !== "")) {
            toast.error("Please enter the complete OTP");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const otpCode = formData.otp.join('');
            const response = await apiVerifyOtp(formData.mobile, otpCode);
            if (response.data.success) {
                toast.success("Identity verified!");
                setVerificationToken(response.data.verificationToken);
                // Pre-fill email if it was verified
                if (response.data.email) {
                    setFormData(prev => ({ ...prev, email: response.data.email }));
                }
                setStep(3);
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Invalid OTP";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (role, onSuccess) => {
        const errors = {};
        const nameErr = validateName(formData.fullName);
        const emailErr = validateEmail(formData.email);
        const pinErr = validatePincode(formData.pincode);
        const passErr = validatePassword(formData.password);
        
        if (nameErr) errors.fullName = nameErr;
        if (emailErr) errors.email = emailErr;
        if (pinErr) errors.pincode = pinErr;
        if (passErr) errors.password = passErr;
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
        if (!formData.state) errors.state = "Required";
        if (!formData.district) errors.district = "Required";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            toast.error("Please fix the errors in the form");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const userData = {
                name: formData.fullName,
                mobile: formData.mobile,
                email: formData.email, 
                password: formData.password, 
                role,
                state: formData.state,
                district: formData.district,
                pincode: formData.pincode,
                language: formData.language,
                verificationToken: verificationToken
            };

            const response = await apiRegisterUser(userData);
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                toast.success("Registration Successful!");
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Registration failed. Please try again.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const prevStep = () => {
        setError("");
        setStep(prev => prev - 1);
    };

    return {
        step, setStep,
        loading, setLoading,
        error, setError,
        fieldErrors, setFieldErrors,
        timer, setTimer,
        canResend, setCanResend,
        verificationToken, setVerificationToken,
        formData, setFormData,
        otpRefs,
        handleChange,
        handleSendOtp,
        handleVerifyOtp,
        handleOtpChange,
        handleOtpKeyDown,
        handleSubmit,
        prevStep
    };
};
