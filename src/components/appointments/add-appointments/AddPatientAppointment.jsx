import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPatients,
  selectPatients,
  selectPatientsStatus,
} from "../../../features/commanSlice";
import {
  fetchDepartments,
  selectDepartments,
  selectDepartmentsStatus,
} from "../../../features/commanSlice";
import { createAppointment } from "../../../features/appointmentSlice";
import Swal from "sweetalert2";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddPatientAppointment() {
  const dispatch = useDispatch();
  const patients = useSelector(selectPatients);
  const patientsStatus = useSelector(selectPatientsStatus);

  const [selectedPatientHospitalId, setSelectedPatientHospitalId] =
    useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [status, setStatus] = useState("SCHEDULED");

  useEffect(() => {
    if (patientsStatus === "idle") dispatch(fetchPatients());
  }, [dispatch, patientsStatus]);

  const storeDepartments = useSelector(selectDepartments);
  const storeDepartmentsStatus = useSelector(selectDepartmentsStatus);

  useEffect(() => {
    if (storeDepartmentsStatus === "idle") dispatch(fetchDepartments());
  }, [dispatch, storeDepartmentsStatus]);

  useEffect(() => {
    setDepartments(Array.isArray(storeDepartments) ? storeDepartments : []);
  }, [storeDepartments]);

  // autofill fields when a patient_hospital_id is selected
  useEffect(() => {
    if (!selectedPatientHospitalId) return;
    const p = patients.find(
      (x) => String(x.patient_hospital_id) === String(selectedPatientHospitalId)
    );
    if (p) {
      setAge(p.age ?? "");
      setGender(p.gender ?? "");
      setPhone(p.contactInfo ?? p.emergencyContact ?? "");
      const addr = p.address
        ? `${p.address.addressLine || ""}, ${p.address.city || ""}, ${
            p.address.state || ""
          } ${p.address.pincode || ""}`
        : "";
      setAddress(addr);
    } else {
      setAge("");
      setGender("");
      setPhone("");
      setAddress("");
    }
  }, [selectedPatientHospitalId, patients]);

  // submit handler for appointment creation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // resolve patient id from selectedPatientHospitalId
    const patient = (patients || []).find(
      (p) =>
        String(p.patient_hospital_id) === String(selectedPatientHospitalId) ||
        String(p.id) === String(selectedPatientHospitalId)
    );
    const patientId = patient?.id;
    if (!patientId) {
      Swal.fire({
        icon: "error",
        title: "No patient",
        text: "Please select a patient",
      });
      return;
    }

    // Resolve doctorId to a number when possible. Avoid sending a doctor name string.
    let doctorId = null;
    if (selectedDoctorId) {
      const asNum = Number(selectedDoctorId);
      if (!Number.isNaN(asNum)) {
        doctorId = asNum;
      } else {
        // try to find a matching doctor object by label or fields
        const found = (doctors || []).find((doc) => {
          if (!doc) return false;
          if (doc.id && String(doc.id) === String(selectedDoctorId))
            return true;
          if (doc.doctorId && String(doc.doctorId) === String(selectedDoctorId))
            return true;
          const name = (
            doc.doctorName ||
            doc.name ||
            `${doc.firstName || doc.first_name || ""} ${
              doc.lastName || doc.last_name || ""
            }`
          ).trim();
          if (name && name === selectedDoctorId) return true;
          return false;
        });
        if (found && (found.id || found.doctorId)) {
          doctorId = Number(found.id || found.doctorId);
        } else {
          // last resort: try to parse any digits inside the value
          const digits = String(selectedDoctorId).match(/\d+/);
          if (digits) doctorId = Number(digits[0]);
        }
      }
    }

    // departmentId numeric coercion
    let departmentId = null;
    if (selectedDepartmentId) {
      const asNumDep = Number(selectedDepartmentId);
      departmentId = Number.isNaN(asNumDep) ? null : asNumDep;
    }

    // guard: require a valid doctor id before submitting
    if (doctorId == null) {
      Swal.fire({
        icon: "error",
        title: "Doctor required",
        text: "Please select a valid doctor before submitting.",
      });
      return;
    }

    const payload = {
      patientId: patientId,
      doctorId: doctorId,
      departmentId: departmentId,
      appointmentDate: appointmentDate || undefined,
      appointmentTime: appointmentTime || undefined,
      status: status || "SCHEDULED",
      symptoms: symptoms || "",
    };

    // include snake_case for backend compatibility
    payload.patient_id = payload.patientId;
    payload.doctor_id = payload.doctorId;
    payload.department_id = payload.departmentId;

    try {
      await dispatch(createAppointment(payload)).unwrap();
      Swal.fire({ icon: "success", title: "Appointment created" });
      // reset form
      setSelectedPatientHospitalId("");
      setPatientQuery("");
      setAge("");
      setGender("");
      setPhone("");
      setAddress("");
      setSelectedDepartmentId("");
      setDoctors([]);
      setSelectedDoctorId("");
      setAppointmentDate("");
      setAppointmentTime("");
      setSymptoms("");
      setStatus("SCHEDULED");
    } catch (err) {
      console.error("Create appointment failed", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err?.message || JSON.stringify(err),
      });
    }
  };

  return (
    <div className="full-width-card card shadow border-0">
      {/* Header */}
      <div
        className="text-center text-white fw-bold py-3"
        style={{
          backgroundColor: "#01c0c8",
          borderTopLeftRadius: ".5rem",
          borderTopRightRadius: ".5rem",
        }}
      >
        <i className="bi bi-calendar2-check me-2"></i>
        Patient Appointment Form
      </div>

      {/* Body */}
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Patient Search (autocomplete by name or patient_hospital_id) */}
            <div className="col-md-6 position-relative">
              <label className="form-label fw-bold">Search Patient</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or hospital id"
                value={patientQuery}
                onChange={(e) => {
                  const q = e.target.value;
                  setPatientQuery(q);
                  if (!q) return setSuggestions([]);
                  const low = q.toLowerCase();
                  const list = (patients || []).filter((p) => {
                    const full = `${p.firstName || ""} ${
                      p.lastName || ""
                    }`.toLowerCase();
                    const hid = String(
                      p.patient_hospital_id || ""
                    ).toLowerCase();
                    return full.includes(low) || hid.includes(low);
                  });
                  setSuggestions(list.slice(0, 8));
                }}
              />

              {suggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100"
                  style={{ zIndex: 2100, maxHeight: 200, overflowY: "auto" }}
                >
                  {suggestions.map((p) => (
                    <li
                      key={p.patient_hospital_id || p.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => {
                        setSelectedPatientHospitalId(
                          p.patient_hospital_id || p.id
                        );
                        setPatientQuery(
                          `${p.firstName} ${p.lastName} (${p.patient_hospital_id})`
                        );
                        setSuggestions([]);
                      }}
                    >
                      <div className="fw-semibold">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="small text-muted">
                        {p.patient_hospital_id}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Age */}
            <div className="col-md-3">
              <label className="form-label fw-bold">Age</label>
              <input
                type="number"
                className="form-control"
                value={age}
                readOnly
              />
            </div>

            {/* Gender */}
            <div className="col-md-3">
              <label className="form-label fw-bold">Gender</label>
              <input
                type="text"
                className="form-control"
                value={gender}
                readOnly
              />
            </div>

            {/* Phone */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={phone}
                readOnly
              />
            </div>

            {/* Address */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Address</label>
              <input
                type="text"
                className="form-control"
                value={address}
                readOnly
              />
            </div>

            {/* Symptoms */}
            <div className="col-md-12">
              <label className="form-label fw-bold">Symptoms / Problem</label>
              <textarea
                className="form-control"
                rows="3"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Fever, headache and body pain since last 2 days."
              />
            </div>
            {/* Department (from commanSlice) */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Department</label>
              <select
                className="form-select"
                value={selectedDepartmentId}
                onChange={async (e) => {
                  const id = e.target.value;
                  setSelectedDepartmentId(id);
                  setSelectedDoctorId("");
                  setDoctors([]);
                  if (!id) return;
                  try {
                    const res = await axios.get(`${API_BASE_URL}/doctor/${id}`);
                    const list = Array.isArray(res.data)
                      ? res.data
                      : res.data?.data || [];
                    setDoctors(list);
                  } catch (err) {
                    console.error(
                      "Failed to load doctors for department",
                      id,
                      err
                    );
                    Swal.fire({
                      icon: "error",
                      title: "Failed to load doctors",
                      text: err?.message || "",
                    });
                  }
                }}
              >
                <option value="">-- Select department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name || d.name || `Dept ${d.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor (populated from selected department) */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Select Doctor</label>
              <select
                className="form-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                <option value="">-- Select doctor --</option>
                {(!Array.isArray(doctors) || doctors.length === 0) && (
                  <option value="" disabled>
                    No doctors available
                  </option>
                )}
                {Array.isArray(doctors) &&
                  doctors.map((doc, idx) => {
                    if (!doc || typeof doc !== "object") return null;
                    const value = doc.id != null ? String(doc.id) : "";
                    if (!value) return null; // require a numeric id
                    const label =
                      doc.name || doc.doctorName || `Doctor ${value}`;
                    return (
                      <option key={`doc-${value}-${idx}`} value={value}>
                        {label}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Appointment Date */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Appointment Date</label>
              <input
                type="date"
                className="form-control"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Time</label>
              <input
                type="time"
                className="form-control"
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4 text-center">
            <button
              type="submit"
              className="btn text-white fw-bold px-4"
              style={{ background: "#01c0c8" }}
            >
              <i className="bi bi-save me-1"></i> Save Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
