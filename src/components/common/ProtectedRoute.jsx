import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getToken, getUser } from '../../utils/auth';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = getToken();
  const user = getUser();
  const location = useLocation();

  useEffect(() => {
    if (!token || !user) {
      toast.error('Please login to access this page');
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      toast.error('You are not authorized to view this page');
    }
  }, [token, user, allowedRoles]);

  if (!token || !user) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role mismatch, redirect to landing page
    return <Navigate to="/" replace />;
  }

  // Authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
