import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  createPatientVisit,
  clearError,
  clearSuccess,
} from "../../../features/createpatientvisitsSlice";
import { selectPatients, fetchPatients } from "../../../features/patientAutoSuggestionSlice";
import { selectDepartments, fetchDepartments } from "../../../features/commanSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CreatePatientVisit() {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector(
    (state) => state.patientVisits
  );
  const patients = useSelector(selectPatients);
  const storeDepartments = useSelector(selectDepartments);

  const [formData, setFormData] = useState({
    patientId: "",
    visitType: "",
    status: "",
    departmentId: "",
    doctorId: "",
    referredByDoctorId: "",
    referredToDoctorId: "",
    referredToDepartmentId: "",
    visitDate: "",
    symptoms: "",
    reason: "",
    appointmentId: "",
    // Display fields
    patientHospitalId: "",
    patientName: "",
    age: "",
    contact: "",
  });

  const [patientQuery, setPatientQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Fetch patients and departments on mount
  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Sync departments from store
  useEffect(() => {
    setDepartments(Array.isArray(storeDepartments) ? storeDepartments : []);
  }, [storeDepartments]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // Handle patient search
  const handlePatientSearch = (e) => {
    const query = e.target.value;
    setPatientQuery(query);
    setFormData((prev) => ({ ...prev, patientHospitalId: query }));

    if (!query) {
      setSuggestions([]);
      setSelectedPatientId(null);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = (patients || []).filter((p) => {
      const fullName = (p.patientName || "").toLowerCase();
      const hospitalId = String(p.patientHospitalId || "").toLowerCase();
      return fullName.includes(lowerQuery) || hospitalId.includes(lowerQuery);
    });

    setSuggestions(filtered.slice(0, 8));
  };

  // Handle patient selection from suggestions
  const handleSelectPatient = (patient) => {
    const patientId = patient.patientId || patient.id;
    setSelectedPatientId(patientId);
    setPatientQuery(
      `${patient.patientName || ""} (${patient.patientHospitalId || ""})`
    );
    setSuggestions([]);
    
    setFormData((prev) => ({
      ...prev,
      patientId: patientId,
      patientHospitalId: patient.patientHospitalId || "",
      patientName: patient.patientName || "",
      age: patient.age || "",
      contact: patient.contact || "",
    }));
  };

  // Handle department change - fetch doctors
  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      departmentId,
      doctorId: "", // Reset doctor selection
    }));
    setDoctors([]);

    if (!departmentId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/${departmentId}`);
      setDoctors(response.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare payload matching backend structure
    const payload = {
      patientId: formData.patientId ? Number(formData.patientId) : null,
      visitType: formData.visitType,
      status: formData.status,
      departmentId: formData.departmentId ? Number(formData.departmentId) : null,
      doctorId: formData.doctorId ? Number(formData.doctorId) : null,
      referredByDoctorId: formData.referredByDoctorId ? Number(formData.referredByDoctorId) : null,
      referredToDoctorId: formData.referredToDoctorId ? Number(formData.referredToDoctorId) : null,
      referredToDepartmentId: formData.referredToDepartmentId ? Number(formData.referredToDepartmentId) : null,
      visitDate: formData.visitDate,
      symptoms: formData.symptoms,
      reason: formData.reason,
      appointmentId: formData.appointmentId ? Number(formData.appointmentId) : null,
    };

    dispatch(createPatientVisit(payload));
  };

  return (
    <div className="card shadow">
      {/* Header */}
      <div className="card-header bg-info text-white text-center d-flex justify-content-center align-items-center gap-2">
        <i className="bi bi-person-plus-fill fs-4"></i>
        <span className="fw-semibold">Create Patient Visit</span>
      </div>

      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert">
            Patient visit created successfully!
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Patient Information */}
          <h5 className=" mb-3">Patient Information</h5>

          <div className="row g-3">
            {/* Patient Search with Auto-suggestion */}
            <div className="col-md-6 position-relative">
              <label className="form-label">
                Search Patient <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or hospital ID"
                value={patientQuery}
                onChange={handlePatientSearch}
              />
              {suggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100"
                  style={{
                    zIndex: 1000,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {suggestions.map((p) => (
                    <li
                      key={p.patientId}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSelectPatient(p)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="fw-semibold">{p.patientName}</div>
                      <div className="small text-muted">
                        ID: {p.patientHospitalId}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Patient Hospital ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="patientHospitalId"
                value={formData.patientHospitalId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Patient Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="patientName"
                value={formData.patientName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  setFormData({
                    ...formData,
                    patientName: value,
                  });
                }}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Patient Age <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Patient Contact <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Visit Details */}
          <h5 className=" mt-4 mb-3">Visit Details</h5>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Visit Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option>IPD</option>
                <option>OPD</option>
                <option>ER</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Visit Status <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option>ACTIVE</option>
                <option>COMPLETED</option>
                <option>DISCHARGE</option>
                <option>CANCEL</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Department <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleDepartmentChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name || dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Doctor <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.length === 0 && (
                  <option disabled>No doctors available</option>
                )}
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name || doc.doctorName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Referred By Doctor</label>
              <select
                className="form-select"
                name="referredByDoctorId"
                value={formData.referredByDoctorId}
                onChange={handleChange}
              >
                <option value="">Select</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Referred To Doctor</label>
              <select
                className="form-select"
                name="referredToDoctorId"
                value={formData.referredToDoctorId}
                onChange={handleChange}
              >
                <option value="">Select</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Visit Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Symptoms <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Reason <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Appointment ID</label>
              <input
                type="number"
                className="form-control"
                name="appointmentId"
                value={formData.appointmentId}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="text-center mt-4">
            <button
              type="submit"
              className="button text-white px-4"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Visit"}
            </button>
            <button type="reset" className="button btn-secondary px-4 ms-2">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePatientVisit;
