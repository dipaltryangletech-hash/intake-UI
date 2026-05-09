import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/Auth/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the shared assignments page if they are in the wrong place
    return <Navigate to="/assignments" replace />;
  }

  return children;
};

export default ProtectedRoute;
