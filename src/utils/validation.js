export const validateMobile = (mobile) => {
    if (!mobile) return "Phone number is required";
    if (!/^[6-9]\d{9}$/.test(mobile)) return "Enter a valid 10-digit mobile (e.g., 9876543210)";
    return null;
};

export const validateEmail = (email) => {
    if (!email) return "Email address is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email (e.g., name@example.com)";
    return null;
};

export const validatePincode = (pincode) => {
    if (!pincode) return "Pincode is required";
    if (!/^\d{6}$/.test(pincode)) return "Enter a valid 6-digit Pincode (e.g., 422001)";
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
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters for better security";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
        return "Include at least one uppercase letter and one number";
    }
    return null;
};
