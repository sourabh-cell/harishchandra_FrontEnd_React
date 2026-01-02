import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  requestOtp,
  validateOtp,
  resetPassword,
  resetForgotPassword,   // ✅ import reset action
  selectForgotStatus,
  selectForgotError,
  selectForgotMessage,
  selectForgotStep,
} from "../../../features/forgotPasswordSlice"; // adjust path if needed
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const dispatch = useDispatch();

  // Local form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [countdown, setCountdown] = useState(60);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redux selectors
  const forgotStatus = useSelector(selectForgotStatus);
  const forgotError = useSelector(selectForgotError);
  const forgotMessage = useSelector(selectForgotMessage);
  const forgotStep = useSelector(selectForgotStep);
  const navigate = useNavigate();

  // ✅ Reset flow every time this component mounts
  useEffect(() => {
    dispatch(resetForgotPassword());
  }, [dispatch]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (forgotStep === "otp" && countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [forgotStep, countdown]);

  // --- Handlers ---
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    dispatch(requestOtp(email))
      .unwrap()
      .then(() => setCountdown(60))
      .catch(() => { });
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    dispatch(validateOtp({ email, otp }))
      .unwrap()
      .catch(() => { });
  };

  const handleResendOtp = () => {
    dispatch(requestOtp(email))
      .unwrap()
      .then(() => setCountdown(60))
      .catch(() => { });
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Dispatch resetPassword with all fields
    dispatch(resetPassword({ email, otp, newPassword, confirmPassword }))
      .unwrap()
      .then(() => {
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");

        navigate("/", {
          state: { message: "Password reset successfully! Please log in." },
        });
      })
      .catch(() => { });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "380px" }}>
        <h4 className="text-center mb-3 text-primary">Forgot Password</h4>

        {/* Loader */}
        {forgotStatus === "loading" && (
          <div className="text-center mb-3">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="small mt-2">Please wait…</p>
          </div>
        )}

        {/* Success or Error Messages */}
        {forgotMessage && (
          <div className="alert alert-success text-center py-2">
            {forgotMessage}
          </div>
        )}
        {forgotError && (
          <div className="alert alert-danger text-center py-2">
            {forgotError}
          </div>
        )}

        {/* --- STEP 1: EMAIL --- */}
        {forgotStep === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Enter Registered Email
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Request OTP
            </button>
          </form>
        )}

        {/* --- STEP 2: OTP --- */}
        {forgotStep === "otp" && (
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                className="form-control"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Verify OTP
            </button>

            <div className="text-center mt-3">
              {countdown > 0 ? (
                <p className="text-muted small">
                  You can resend OTP in <b>{countdown}</b> seconds
                </p>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleResendOtp}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* --- STEP 3: RESET PASSWORD --- */}
        {forgotStep === "reset" && (
          <form onSubmit={handleResetSubmit}>
            <div className="mb-3 position-relative">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                role="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <i
                  className={`bi ${showNewPassword ? "bi-eye" : "bi-eye-slash"
                    }`}
                ></i>
              </span>
            </div>

            <div className="mb-3 position-relative">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                role="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i
                  className={`bi ${showConfirmPassword ? "bi-eye" : "bi-eye-slash"
                    }`}
                ></i>
              </span>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;