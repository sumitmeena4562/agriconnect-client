import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth';

const SharedCropLinkHandler = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      // Redirect to login, passing the original path as a redirect parameter
      navigate(`/login?redirect=${encodeURIComponent(`/crops/${id}`)}`, { replace: true });
      return;
    }

    if (user.role === 'FARMER') {
      navigate(`/farmer-dashboard/crops/${id}`, { replace: true });
    } else {
      navigate(`/vendor-dashboard/crops/${id}`, { replace: true });
    }
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-body)]">
      <div className="w-8 h-8 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
    </div>
  );
};

export default SharedCropLinkHandler;
