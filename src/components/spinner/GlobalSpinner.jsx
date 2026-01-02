import React from "react";
import { useSelector } from "react-redux";
import { selectAuthStatus } from "../../features/authSlice";
import "./GlobalSpinner.css";

const GlobalSpinner = () => {
  const authStatus = useSelector(selectAuthStatus);
  const loading = authStatus === "loading";
  if (!loading) return null;

  return (
    <div className="global-spinner-overlay">
      <div className="spinner-border" role="status" />
      <span className="loading-text">HMS</span>
    </div>
  );
};

export default GlobalSpinner;
