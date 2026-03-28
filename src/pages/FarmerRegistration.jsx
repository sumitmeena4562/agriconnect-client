import React from 'react';
import BaseRegistrationPage from './BaseRegistrationPage';
import { REGISTRATION_ROLES } from '../constants/registration';

const FarmerRegistration = () => {
    const config = {
        title: "Farmer Registration",
        themeColor: "primary",
        badgeVariant: "slate",
        badgeText: "Secure Flow",
        step3: {
            title: "Farmer Profile.",
            subtitle: "Tell us about your farm location."
        },
        success: {
            title: "Welcome, {name}!",
            subtitle: "Your registration is complete.",
            buttonText: "GO TO DASHBOARD",
            icon: "space_dashboard"
        }
    };

    return <BaseRegistrationPage role={REGISTRATION_ROLES.FARMER} config={config} />;
};

export default FarmerRegistration;
