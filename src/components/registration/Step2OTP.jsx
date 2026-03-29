import React from 'react';
import OTPVerificationView from '../common/OTPVerificationView';

const Step2OTP = ({ mobile, email, otp, onOtpChange, onOtpPaste, onOtpKeyDown, otpRefs, onVerify, onResend, timer, canResend, loading, onBack, colors }) => {
    return (
        <OTPVerificationView 
            title="Verify Identity."
            subtitle="We've sent a 6-digit code to"
            identifier={email || mobile}
            otp={otp}
            onOtpChange={onOtpChange}
            onOtpPaste={onOtpPaste}
            onOtpKeyDown={onOtpKeyDown}
            otpRefs={otpRefs}
            onVerify={onVerify}
            onResend={onResend}
            timer={timer}
            canResend={canResend}
            loading={loading}
            onBack={onBack}
            colors={colors}
            icon="enhanced_encryption"
        />
    );
};

export default Step2OTP;
