import React from 'react';
import BaseRegistrationPage from './BaseRegistrationPage';
import { REGISTRATION_ROLES } from '../constants/registration';

const VendorRegistration = () => {
    const config = {
        title: "Vendor Registration",
        themeColor: "info",
        badgeVariant: "info",
        badgeClassName: "!bg-info-50 !text-info-600 border-none",
        badgeText: "B2B Portal",
        step3: {
            title: "Business Profile.",
            subtitle: "Official registration details."
        },
        success: {
            title: "Registered!",
            subtitle: "Your business is now live.",
            buttonText: "GO TO DASHBOARD",
            icon: "business_center"
        }
    };

    return <BaseRegistrationPage role={REGISTRATION_ROLES.VENDOR} config={config} />;
};

export default VendorRegistration;
