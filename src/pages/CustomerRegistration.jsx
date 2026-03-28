import React from 'react';
import BaseRegistrationPage from './BaseRegistrationPage';
import { REGISTRATION_ROLES } from '../constants/registration';

const CustomerRegistration = () => {
    const config = {
        title: "Buyer Registration",
        themeColor: "accent",
        badgeVariant: "warning",
        badgeClassName: "!bg-accent-50 !text-accent-600 border-none",
        badgeText: "Personal Account",
        step3: {
            title: "Profile Setup.",
            subtitle: "Tell us where to deliver."
        },
        success: {
            title: "Welcome, {name}!",
            subtitle: "Your registration is complete.",
            buttonText: "START SHOPPING",
            icon: "shopping_basket"
        }
    };

    return <BaseRegistrationPage role={REGISTRATION_ROLES.CUSTOMER} config={config} />;
};

export default CustomerRegistration;
