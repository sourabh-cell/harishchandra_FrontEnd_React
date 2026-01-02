import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import {
  selectIsAuthenticated,
  selectAuthRoles,
} from "../../features/authSlice";

const ProtectedRoute = ({ allowedRoles, redirectTo = "/", children }) => {
  const isAuthed = useSelector(selectIsAuthenticated);
  const roles = useSelector(selectAuthRoles);

  if (!isAuthed) {
    return <Navigate to={redirectTo} replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const hasRole = roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Support both element-as-child and nested routes via Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
