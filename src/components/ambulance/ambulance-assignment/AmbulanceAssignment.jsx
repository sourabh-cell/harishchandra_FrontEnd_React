import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDrivers,
  selectDrivers,
  selectDriversStatus,
  fetchAmbulances,
  selectAmbulances,
  selectAmbulancesStatus,
  addAssignment,
} from "../../../features/ambulanceSlice";
import Swal from "sweetalert2";

const AmbulanceAssignment = () => {
  const [formData, setFormData] = useState({
    ambulanceId: "",
    driverId: "",
    status: "",
    fromLocation: "",
    toLocation: "",
    startTime: "",
    endTime: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ambulances from backend
  const ambulances = useSelector(selectAmbulances) || [];
  const ambulancesStatus = useSelector(selectAmbulancesStatus);
  const dispatch = useDispatch();

  // drivers from backend
  const drivers = useSelector(selectDrivers) || [];
  const driversStatus = useSelector(selectDriversStatus);

  const assignmentStatus = [
    { label: "Scheduled", value: "SCHEDULED" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
  ];

  // Auto-hide alerts after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // fetch drivers on mount
  useEffect(() => {
    if (driversStatus === "idle") dispatch(fetchDrivers());
  }, [dispatch, driversStatus]);

  // fetch ambulances on mount
  useEffect(() => {
    if (ambulancesStatus === "idle") dispatch(fetchAmbulances());
  }, [dispatch, ambulancesStatus]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.ambulanceId ||
      !formData.driverId ||
      !formData.status ||
      !formData.fromLocation ||
      !formData.toLocation ||
      !formData.startTime ||
      !formData.endTime
    ) {
      const msg = "Please fill in all required fields.";
      setError(msg);
      setSuccess("");
      Swal.fire({ icon: "warning", title: "Missing fields", text: msg });
      return;
    }

    // Build payload matching API shape
    const payload = {
      ambulanceId: Number(formData.ambulanceId),
      driverId: Number(formData.driverId),
      fromLocation: formData.fromLocation,
      toLocation: formData.toLocation,
      status: formData.status,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };

    const doSubmit = async () => {
      setSubmitting(true);
      try {
        const res = await dispatch(addAssignment(payload)).unwrap();
        const msg =
          res?.message ||
          (res?.data && res.data.message) ||
          "Assignment created.";
        // show backend message
        Swal.fire({
          title: msg,
          icon: "success",
          timer: 1600,
          showConfirmButton: false,
        });
        setFormData({
          ambulanceId: "",
          driverId: "",
          status: "",
          fromLocation: "",
          toLocation: "",
          startTime: "",
          endTime: "",
        });
        setSuccess(msg);
        setError("");
      } catch (err) {
        console.error("Add assignment failed:", err);
        const backendMsg =
          err?.message ||
          err?.data?.message ||
          JSON.stringify(err) ||
          "Failed to add assignment";
        Swal.fire({ title: "Failed", text: backendMsg, icon: "error" });
        setError(backendMsg);
        setSuccess("");
      } finally {
        setSubmitting(false);
      }
    };

    doSubmit();
  };

  return (
    <div className="full-width-card card shadow-sm border-0">
      {/* Header */}
      <div
        className="card-header text-white text-center py-3"
        style={{ backgroundColor: "#01C0C8", fontSize: "28px" }}
      >
        <i className="fa-solid fa-clipboard me-2"></i> Ambulance Assignment
      </div>

      {/* Body */}
      <div className="card-body p-4">
        {/* Error / Success Messages */}
        {error && (
          <div className="alert alert-danger fw-bold text-center">{error}</div>
        )}
        {success && (
          <div className="alert alert-success fw-bold text-center">
            {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Ambulance */}
            <div className="col-md-6">
              <label htmlFor="ambulanceId" className="form-label">
                Ambulance <span className="text-danger">*</span>
              </label>
              <select
                id="ambulanceId"
                className="form-select"
                value={formData.ambulanceId}
                onChange={handleChange}
                required
              >
                <option value="">Select Ambulance</option>
                {ambulancesStatus === "loading" && (
                  <option value="" disabled>
                    Loading ambulances...
                  </option>
                )}
                {ambulancesStatus === "failed" && (
                  <option value="" disabled>
                    Failed to load ambulances
                  </option>
                )}
                {ambulancesStatus === "succeeded" &&
                  ambulances.length === 0 && (
                    <option value="" disabled>
                      No ambulances available
                    </option>
                  )}
                {ambulancesStatus !== "loading" &&
                  Array.isArray(ambulances) &&
                  ambulances.map((amb) => (
                    <option
                      key={amb.id || amb.ambulanceId}
                      value={amb.id || amb.ambulanceId}
                    >
                      {amb.vehicleNumber ||
                        amb.vehicle_number ||
                        amb.displayName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Driver */}
            <div className="col-md-6">
              <label htmlFor="driverId" className="form-label">
                Driver <span className="text-danger">*</span>
              </label>
              <select
                id="driverId"
                className="form-select"
                value={formData.driverId}
                onChange={handleChange}
                required
              >
                <option value="">Select Driver</option>
                {driversStatus === "loading" && (
                  <option value="" disabled>
                    Loading drivers...
                  </option>
                )}
                {driversStatus === "failed" && (
                  <option value="" disabled>
                    Failed to load drivers
                  </option>
                )}
                {driversStatus === "succeeded" && drivers.length === 0 && (
                  <option value="" disabled>
                    No drivers available
                  </option>
                )}
                {driversStatus !== "loading" &&
                  Array.isArray(drivers) &&
                  drivers.map((driver) => (
                    <option
                      key={driver.id || driver.driverId}
                      value={driver.id || driver.driverId}
                    >
                      {driver.driverName || driver.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Status */}
            <div className="col-md-6">
              <label htmlFor="status" className="form-label">
                Status <span className="text-danger">*</span>
              </label>
              <select
                id="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                {assignmentStatus.map((s, index) => (
                  <option key={index} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* From Location */}
            <div className="col-md-6">
              <label htmlFor="fromLocation" className="form-label">
                From Location <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="fromLocation"
                className="form-control"
                placeholder="Enter Pickup Location"
                value={formData.fromLocation}
                onChange={handleChange}
                required
              />
            </div>

            {/* To Location */}
            <div className="col-md-6">
              <label htmlFor="toLocation" className="form-label">
                To Location <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="toLocation"
                className="form-control"
                placeholder="Enter Drop Location"
                value={formData.toLocation}
                onChange={handleChange}
                required
              />
            </div>

            {/* Start Time */}
            <div className="col-md-6">
              <label htmlFor="startTime" className="form-label">
                Start Time <span className="text-danger">*</span>
              </label>
              <input
                type="datetime-local"
                id="startTime"
                className="form-control"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            {/* End Time */}
            <div className="col-md-6">
              <label htmlFor="endTime" className="form-label">
                End Time <span className="text-danger">*</span>
              </label>
              <input
                type="datetime-local"
                id="endTime"
                className="form-control"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="col-12 text-center mt-4">
              <button
                type="submit"
                className="btn text-white btn-lg px-5"
                style={{ backgroundColor: "#01C0C8" }}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmbulanceAssignment;
