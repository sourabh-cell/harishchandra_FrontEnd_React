import { useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../features/authSlice";

/**
 * Hook to schedule a session timeout popup + redirect
 * @param {number|null} exp - JWT expiry timestamp in milliseconds
 */
export default function useSessionTimeout(exp) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!exp) return;

    const timeoutMs = exp - Date.now();
    if (timeoutMs <= 0) return;

    // console.log("Session timeout scheduled in", timeoutMs, "ms");

    const timerId = setTimeout(() => {
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please login again.",
        icon: "warning",
        confirmButtonText: "Login Again",
        confirmButtonColor: "#01c0c8", // header color
        allowOutsideClick: false,
        timer: 6000,
        timerProgressBar: true,
        didOpen: () => {
          // Make the timer progress bar orange for better visibility
          try {
            const bar = document.querySelector(".swal2-timer-progress-bar");
            if (bar) bar.style.background = "orange";
          } catch (err) {
            console.warn(
              "useSessionTimeout: failed to style timer progress bar",
              err
            );
          }
        },
      }).then(() => {
        try {
          dispatch(logout());
        } catch (e) {
          console.warn("useSessionTimeout: logout dispatch failed", e);
          try {
            localStorage.removeItem("auth");
          } catch (err) {
            console.warn(
              "useSessionTimeout: failed to remove auth from localStorage",
              err
            );
          }
        }
        navigate("/"); // or navigate("/login")
      });

      // Auto redirect after 6s if user does nothing
      setTimeout(() => {
        try {
          dispatch(logout());
        } catch (e) {
          console.warn(
            "useSessionTimeout: logout dispatch failed (timeout)",
            e
          );
          try {
            localStorage.removeItem("auth");
          } catch (err) {
            console.warn(
              "useSessionTimeout: failed to remove auth from localStorage (timeout)",
              err
            );
          }
        }
        navigate("/"); // or navigate("/login")
      }, 6000);
    }, timeoutMs);

    return () => clearTimeout(timerId);
  }, [exp, navigate, dispatch]);
}
