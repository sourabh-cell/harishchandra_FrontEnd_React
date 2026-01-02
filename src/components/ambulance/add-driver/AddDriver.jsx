import React, { useState, useEffect } from "react";
import "./AddDriver.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAmbulances,
  selectAmbulances,
  selectAmbulancesStatus,
  selectAmbulancesError,
  addDriver,
} from "../../../features/ambulanceSlice";
import Swal from "sweetalert2";

const AddDriver = () => {
  const [formData, setFormData] = useState({
    driverName: "",
    licenseNumber: "",
    contactNumber: "",
    ambulanceId: "",
  });

  const dispatch = useDispatch();

  const ambulances = useSelector(selectAmbulances) || [];
  const ambulancesStatus = useSelector(selectAmbulancesStatus);
  const ambulancesError = useSelector(selectAmbulancesError);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ambulancesStatus === "idle") dispatch(fetchAmbulances());
  }, [dispatch, ambulancesStatus]);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // basic validation
    if (
      !formData.driverName ||
      !formData.licenseNumber ||
      !formData.contactNumber
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Fill all required fields.",
      });
      setSubmitting(false);
      return;
    }

    if (!formData.ambulanceId) {
      Swal.fire({
        icon: "warning",
        title: "Select ambulance",
        text: "Please select a valid ambulance.",
      });
      setSubmitting(false);
      return;
    }

    // ensure numeric ambulance id (avoid sending NaN which becomes null in JSON)
    const ambIdNum = Number(formData.ambulanceId);
    if (!Number.isFinite(ambIdNum)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid ambulance",
        text: "Selected ambulance ID is invalid.",
      });
      setSubmitting(false);
      return;
    }

    const payload = {
      driverName: formData.driverName,
      licenseNumber: formData.licenseNumber,
      contactNumber: formData.contactNumber,
      ambulanceId: ambIdNum,
    };

    try {
      // dispatch addDriver and unwrap for error handling
      await dispatch(addDriver(payload)).unwrap();
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Driver added successfully",
        timer: 1800,
        showConfirmButton: false,
      });
      setFormData({
        driverName: "",
        licenseNumber: "",
        contactNumber: "",
        ambulanceId: "",
      });
    } catch (err) {
      console.error("Add driver failed:", err);
      const message =
        err?.message ||
        err?.errors ||
        JSON.stringify(err) ||
        "Failed to add driver";
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: typeof message === "string" ? message : JSON.stringify(message),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0 m-0">
      {/* Header */}
      <div className="card-border">
        <div className="card-header d-flex justify-content-center align-items-center bg-info text-white rounded-top">
          <div className="text-center d-flex align-items-center">
            <i className="fa-solid fa-truck-medical me-2"></i>
            <span className="fs-5 fw-semibold">Add Driver</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form className=" p-4" onSubmit={handleSubmit}>
        <div className="row mb-4">
          {/* Driver Name */}
          <div className="col-md-6 mb-3">
            <label htmlFor="driverName" className="form-label">
              Driver Name
            </label>
            <input
              type="text"
              className="form-control"
              id="driverName"
              placeholder="Enter name"
              value={formData.driverName}
              onChange={handleChange}
              required
            />
          </div>

          {/* License Number */}
          <div className="col-md-6 mb-3">
            <label htmlFor="licenseNumber" className="form-label">
              Driver License Number
            </label>
            <input
              type="text"
              className="form-control"
              id="licenseNumber"
              placeholder="Enter license number"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row mb-4">
          {/* Contact Number */}
          <div className="col-md-6 mb-3">
            <label htmlFor="contactNumber" className="form-label">
              Contact No.
            </label>
            <input
              type="number"
              className="form-control"
              id="contactNumber"
              placeholder="Enter contact number"
              value={formData.contactNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Ambulance Dropdown */}
          <div className="col-md-6 mb-3">
            <label htmlFor="ambulanceType" className="form-label">
              Ambulance
            </label>
            <select
              id="ambulanceId"
              className="form-select"
              value={formData.ambulanceId}
              onChange={handleChange}
              required
              disabled={ambulancesStatus === "loading" || submitting}
            >
              <option value="">
                {ambulancesStatus === "loading"
                  ? "Loading ambulances..."
                  : "Choose Ambulance"}
              </option>

              {ambulances &&
                ambulances.map((a) => (
                  <option
                    key={a.ambulanceId || a.id}
                    value={a.ambulanceId || a.id}
                  >
                    {a.vehicleNumber}
                  </option>
                ))}
            </select>

            {ambulancesError && (
              <div className="text-danger small mt-1">
                {typeof ambulancesError === "string"
                  ? ambulancesError
                  : ambulancesError?.message}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="d-flex justify-content-center">
          <button
            type="submit"
            className="btn btn-primary px-4"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDriver;
