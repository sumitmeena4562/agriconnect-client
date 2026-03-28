export const validateMobile = (mobile) => {
    if (!mobile) return "Mobile number is required";
    if (!/^[6-9]\d{9}$/.test(mobile)) return "Please enter a valid 10-digit mobile number";
    return null;
};

export const validateEmail = (email) => {
    if (!email) return "Email address is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
};

export const validatePincode = (pincode) => {
    if (!pincode) return "Pincode is required";
    if (!/^\d{6}$/.test(pincode)) return "Enter a valid 6-digit Pincode";
    return null;
};

export const validateName = (name) => {
    if (!name) return "Full Name is required";
    if (name.trim().split(' ').length < 2) return "Please enter both first and last name";
    if (!/^[a-zA-Z\s]*$/.test(name)) return "Name should only contain alphabets";
    if (name.length < 3) return "Name must be at least 3 characters long";
    return null;
};

export const validatePassword = (password) => {
    if (!password) return "Password is required for account security";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
        return "Include at least one uppercase letter and one number";
    }
    return null;
};

export const validateGender = (gender) => {
    if (!gender) return "Please select your gender";
    return null;
};

export const validateDOB = (dob) => {
    if (!dob) return "Date of birth is required";
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) return "You must be 18+ to register";
    return null;
};

/**
 * Calculates password strength (0-100)
 */
export const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
};

export const getStrengthColor = (strength) => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-orange-500';
    if (strength <= 75) return 'bg-yellow-500';
    return 'bg-primary-500';
};

export const getStrengthText = (strength) => {
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
};
