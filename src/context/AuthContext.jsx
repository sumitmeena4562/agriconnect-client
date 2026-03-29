import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // PERSISTENCE: Check for existing session on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('agriconnect_token');
        const storedUser = localStorage.getItem('agriconnect_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            
            // Set global Axios Authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        
        // Persist to localStorage
        localStorage.setItem('agriconnect_token', authToken);
        localStorage.setItem('agriconnect_user', JSON.stringify(userData));
        
        // Set global Axios Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        toast.success(`Welcome back, ${userData.name}!`);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        
        // Clear localStorage
        localStorage.removeItem('agriconnect_token');
        localStorage.removeItem('agriconnect_user');
        
        // Clear global Axios Authorization header
        delete axios.defaults.headers.common['Authorization'];
        
        toast.success("Logged out successfully.");
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
