export const validateMobile = (mobile) => {
    if (!mobile) return "Mobile number is required";
    if (!/^[6-9]\d{9}$/.test(mobile)) return "Enter a valid 10-digit mobile number (starting with 6-9)";
    return null;
};

export const validateEmail = (email) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Enter a valid email address";
    return null;
};

export const validatePincode = (pincode) => {
    if (!pincode) return "Pincode is required";
    if (!/^\d{6}$/.test(pincode)) return "Enter a valid 6-digit Pincode";
    return null;
};

export const validateName = (name) => {
    if (!name) return "Name is required";
    if (name.length < 3) return "Name must be at least 3 characters";
    if (!/^[a-zA-Z\s]*$/.test(name)) return "Name should only contain letters";
    return null;
};

export const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
};
