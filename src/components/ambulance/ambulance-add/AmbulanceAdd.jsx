import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAmbulanceFormData,
  selectAmbulanceFormData,
  selectAmbulanceFormDataStatus,
  addAmbulance,
  selectAddAmbulanceStatus,
  selectAddAmbulanceError,
} from "../../../features/ambulanceSlice";
import Swal from "sweetalert2";

const AmbulanceAdd = () => {
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    ambulanceType: "",
    ambulanceStatus: "",
    lastMaintenanceDate: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const formDataOptions = useSelector(selectAmbulanceFormData) || {};
  const formDataStatus = useSelector(selectAmbulanceFormDataStatus);

  // Use backend enum values as fallbacks to avoid validation errors
  const fallbackTypes = ["BASIC", "ICU"];

  const fallbackStatuses = ["AVAILABLE", "ON_DUTY", "MAINTENANCE"];

  const ambulanceTypes =
    formDataOptions.types && formDataOptions.types.length
      ? formDataOptions.types
      : fallbackTypes;

  const ambulanceStatuses =
    formDataOptions.statuses && formDataOptions.statuses.length
      ? formDataOptions.statuses
      : fallbackStatuses;

  // Normalize options to { value, label } regardless of backend shape
  const normalizeOptions = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => {
      if (item && typeof item === "object") {
        const label = item.name || item.label || item.type || String(item);
        const value = item.id ?? item.value ?? label;
        return { value, label };
      }
      return { value: String(item), label: String(item) };
    });
  };

  const typeOptions = normalizeOptions(ambulanceTypes);
  const statusOptions = normalizeOptions(ambulanceStatuses);

  useEffect(() => {
    if (formDataStatus === "idle") dispatch(fetchAmbulanceFormData());
  }, [dispatch, formDataStatus]);

  const addStatus = useSelector(selectAddAmbulanceStatus);
  const addError = useSelector(selectAddAmbulanceError);

  const formatError = (err) => {
    if (!err) return null;
    if (typeof err === "string") return err;
    if (typeof err.message === "string") return err.message;
    if (err.message && typeof err.message === "object")
      return JSON.stringify(err.message);
    return JSON.stringify(err);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.vehicleNumber &&
      formData.ambulanceType &&
      formData.ambulanceStatus &&
      formData.lastMaintenanceDate
    ) {
      // normalize status to backend enum values (trim & map variants)
      const normalizeStatus = (s) => {
        if (!s) return s;
        const raw = String(s).trim();
        if (["AVAILABLE", "ON_DUTY", "MAINTENANCE"].includes(raw)) return raw;
        const v = raw.toLowerCase();
        if (v === "available") return "AVAILABLE";
        if (["in use", "inuse", "on duty", "onduty", "on_duty"].includes(v))
          return "ON_DUTY";
        if (v.includes("maint")) return "MAINTENANCE";
        return raw.toUpperCase();
      };

      // normalize type to backend enum values
      const normalizeType = (t) => {
        if (!t) return t;
        if (t === "BASIC" || t === "ICU") return t;
        const v = String(t).trim().toLowerCase();
        if (v.includes("icu")) return "ICU";
        if (v.includes("basic") || v.includes("bls") || v.includes("life"))
          return "BASIC";
        // fallback: uppercase single word
        return String(t).toUpperCase();
      };

      const payload = {
        ...formData,
        ambulanceStatus: normalizeStatus(formData.ambulanceStatus),
        ambulanceType: normalizeType(formData.ambulanceType),
      };
      console.debug("Submitting ambulance payload", payload);

      // dispatch addAmbulance
      dispatch(addAmbulance(payload))
        .unwrap()
        .then((res) => {
          const msg =
            res?.message ||
            (res?.data && res.data.message) ||
            "Ambulance added successfully";
          setSuccess(msg);
          setError("");
          setFormData({
            vehicleNumber: "",
            ambulanceType: "",
            ambulanceStatus: "",
            lastMaintenanceDate: "",
          });
          Swal.fire({
            icon: "success",
            title: "Saved",
            text: msg,
            timer: 2000,
            showConfirmButton: false,
          });
          setTimeout(() => setSuccess(""), 2000);
        })
        .catch((err) => {
          // unwrap rejection may be a payload or Error
          const backendMsg =
            err?.message || err?.data?.message || err?.data || err || null;
          const text =
            formatError(err) || String(backendMsg) || "Failed to add ambulance";
          setError(text);
          setSuccess("");
          Swal.fire({
            icon: "error",
            title: "Failed",
            text,
          });
          setTimeout(() => setError(""), 3000);
        });
    } else {
      setError("Please fill all required fields.");
      setSuccess("");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div className="full-width-card card border-0 shadow-sm">
      {/* Header */}
      <div className="card-header text-white text-center py-3 bg-primary">
        <h4 className="mb-0">
          <i className="fas fa-ambulance me-2" />
          Add Ambulance
        </h4>
      </div>

      {/* Form Body */}
      <div className="card-body p-4">
        {/* Success Message */}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger">{formatError(error)}</div>
        )}
        {addError && (
          <div className="alert alert-danger">
            {Array.isArray(addError) ? (
              <ul className="mb-0">
                {addError.map((err, idx) => (
                  <li key={idx}>
                    {err.field ? `${err.field}: ` : ""}
                    {err.message || String(err)}
                  </li>
                ))}
              </ul>
            ) : Array.isArray(addError?.message) ? (
              <ul className="mb-0">
                {addError.message.map((err, idx) => (
                  <li key={idx}>
                    {err.field ? `${err.field}: ` : ""}
                    {err.message || String(err)}
                  </li>
                ))}
              </ul>
            ) : (
              formatError(addError)
            )}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Vehicle Number */}
            <div className="col-md-6">
              <label htmlFor="vehicleNumber" className="form-label">
                Vehicle Number (ex. MH12AB1234){" "}
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="vehicleNumber"
                placeholder="Enter Vehicle Number ex. MH12AB1234"
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* Ambulance Type */}
            <div className="col-md-6">
              <label htmlFor="ambulanceType" className="form-label">
                Ambulance Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="ambulanceType"
                value={formData.ambulanceType}
                onChange={handleChange}
                required
              >
                {formDataStatus === "loading" ? (
                  <option value="" disabled>
                    Loading types...
                  </option>
                ) : (
                  <>
                    <option value="">-- Select Ambulance Type --</option>
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Status */}
            <div className="col-md-6">
              <label htmlFor="ambulanceStatus" className="form-label">
                Status <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="ambulanceStatus"
                value={formData.ambulanceStatus}
                onChange={handleChange}
                required
              >
                {formDataStatus === "loading" ? (
                  <option value="" disabled>
                    Loading statuses...
                  </option>
                ) : (
                  <>
                    <option value="">Select Status</option>
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Last Maintenance Date */}
            <div className="col-md-6">
              <label htmlFor="lastMaintenanceDate" className="form-label">
                Last Maintenance Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="lastMaintenanceDate"
                value={formData.lastMaintenanceDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="col-12 text-center mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg px-4"
                disabled={addStatus === "loading"}
              >
                {addStatus === "loading" ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmbulanceAdd;
