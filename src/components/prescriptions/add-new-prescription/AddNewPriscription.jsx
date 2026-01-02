import "./AddNewPriscription.css";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { addPrescription } from "../../../features/priscriptionSlice";

import {
  fetchMedicines,
  selectMedicines,
  selectMedicinesStatus,
} from "../../../features/commanSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddNewPrescription() {
  const dispatch = useDispatch();

  // Department + Doctor
  const [selectedDept, setSelectedDept] = useState("");
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  // Patient Autocomplete
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState(null);
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");

  // Medicines from Redux (object map)
  const medicines = useSelector(selectMedicines);
  const medicinesStatus = useSelector(selectMedicinesStatus);

  // Remove when blank
  const [rows, setRows] = useState([
    { medicineId: "", medicineName: "", frequency: "", duration: "" },
  ]);

  const [medicineQuery, setMedicineQuery] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState(null);

  // Load medicines
  useEffect(() => {
    if (medicinesStatus === "idle") {
      dispatch(fetchMedicines());
    }
  }, [dispatch, medicinesStatus]);

  // Load departments
  useEffect(() => {
    let mounted = true;

    const fetchDepartments = async () => {
      setDepartmentsLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/doctor-schedule/departments`
        );
        const data = res.data?.data ?? res.data;
        if (mounted) setDepartments(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) setDepartmentsError(err.message);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
    return () => (mounted = false);
  }, []);

  // Load patients
  useEffect(() => {
    let mounted = true;

    const fetchPatientsList = async () => {
      setPatientsLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/patients/names-and-ids`);
        const data = res.data?.data ?? res.data;
        if (mounted) setPatients(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) setPatientsError(err.message);
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatientsList();
    return () => (mounted = false);
  }, []);

  const handleDeptChange = async (e) => {
    const deptId = e.target.value;
    setSelectedDept(deptId);
    setSelectedDoctorId("");

    if (!deptId) {
      setDoctors([]);
      return;
    }

    setDoctorsLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/doctor-schedule/doctors/${deptId}`
      );
      const data = res.data?.data ?? res.data;
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setDoctorsError(err.message);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Filter patient suggestions
  const filteredPatients = patientQuery
    ? patients
        .filter((p) => {
          const q = patientQuery.toLowerCase();
          return (
            String(p.fullName).toLowerCase().includes(q) ||
            String(p.hospitalPatientId).toLowerCase().includes(q)
          );
        })
        .slice(0, 10)
    : [];

  // Medicine suggestions FIXED
  const getFilteredMedicines = () => {
    if (!medicineQuery || activeRowIndex === null) return [];

    const q = medicineQuery.toLowerCase();

    return Object.entries(medicines || {})
      .filter(([id, name]) => name.toLowerCase().includes(q))
      .slice(0, 10)
      .map(([id, name]) => ({ id, name }));
  };

  const filteredMedicines = getFilteredMedicines();

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);

    if (field === "medicineName") {
      setActiveRowIndex(index);
      setMedicineQuery(value);
    }
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      { medicineId: "", medicineName: "", frequency: "", duration: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const fd = new FormData(form);

    const payload = {
      patientId: Number(fd.get("patientId")),
      doctorId: Number(fd.get("doctorId")),
      departmentId: Number(fd.get("departmentId")),
      prescriptionDate: fd.get("prescriptionDate"),
      symptoms: fd.get("symptoms"),
      diagnosis: fd.get("diagnosis"),
      additionalNotes: fd.get("additionalNotes"),

      medicines: rows
        .filter((m) => m.medicineId && m.frequency && m.duration)
        .map((m) => ({
          medicineId: Number(m.medicineId),
          frequency: m.frequency,
          duration: m.duration,
        })),
    };

    dispatch(addPrescription(payload))
      .unwrap()
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Prescription saved successfully",
          timer: 1600,
          showConfirmButton: false,
        });

        form.reset();
        setRows([
          { medicineId: "", medicineName: "", frequency: "", duration: "" },
        ]);
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err?.message || "Failed to save prescription",
        });
      });
  };

  const handleReset = () => {
    setSelectedDept("");
    setSelectedPatientId("");
    setRows([
      { medicineId: "", medicineName: "", frequency: "", duration: "" },
    ]);
    setMedicineQuery("");
    setActiveRowIndex(null);
  };

  return (
    <div className="prescription-card full-width-card card shadow border-0 rounded-3">
      <div
        className="text-white text-center py-3 rounded-top fw-semibold"
        style={{ backgroundColor: "#01C0C8" }}
      >
        <i className="bi bi-file-medical-fill me-2"></i>Patient Prescription
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <input
            type="hidden"
            name="patientId"
            value={selectedPatientId || ""}
          />
          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Select Patient Type *
              </label>
            </div>
            <div className="col-md-3">
              <input
                className="form-check-input custom-radio"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio1"
                value="option1"
              />
              <label className="form-check-label mx-2" htmlFor="inlineRadio1">
                OPD Patient
              </label>
            </div>

            <div className="col-md-3">
              <input
                className="form-check-input custom-radio"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio2"
                value="option2"
              />
              <label className="form-check-label mx-2" htmlFor="inlineRadio2">
                IPD Patient
              </label>
            </div>

            <div className="col-md-3">
              <input
                className="form-check-input custom-radio"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio3"
                value="option3"
              />
              <label className="form-check-label mx-2" htmlFor="inlineRadio3">
                ER Patient
              </label>
            </div>
          </div>
          <hr />
          {/* ---------------- Patient ---------------- */}
          <div className="row mb-4">
            <div className="col-md-6 position-relative">
              <label className="form-label fw-semibold">Patient Name *</label>
              <input
                type="text"
                className="form-control"
                value={patientQuery}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, ""); // remove numbers
                  setPatientQuery(value);
                  setSelectedPatientId("");
                }}
                autoComplete="off"
                required
              />

              {patientQuery && filteredPatients.length > 0 && (
                <ul
                  className="list-group position-absolute w-100"
                  style={{ zIndex: 1200 }}
                >
                  {filteredPatients.map((p) => (
                    <li
                      key={p.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => {
                        setPatientQuery(
                          `${p.fullName} (${p.hospitalPatientId})`
                        );
                        setSelectedPatientId(p.id);
                        setPatientAge(p.age || "");
                        setPatientGender(p.gender || "");
                      }}
                      role="button"
                    >
                      {p.fullName}{" "}
                      <small className="text-muted">
                        ({p.hospitalPatientId})
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Age</label>
              <input className="form-control" value={patientAge} readOnly />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Gender</label>
              <select className="form-select" value={patientGender} disabled>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          {/* ----------------Doctor & Date ---------------- */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Doctor *</label>
              <select
                name="doctorId"
                className="form-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Date *</label>
              <input
                type="date"
                name="prescriptionDate"
                className="form-control"
                required
              />
            </div>
          </div>

          {/* ---------------- Symptoms ---------------- */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Symptoms *</label>
            <textarea
              name="symptoms"
              className="form-control"
              rows="2"
              required
            ></textarea>
          </div>

          {/* ---------------- Diagnosis ---------------- */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Diagnosis *</label>
            <textarea
              name="diagnosis"
              className="form-control"
              rows="2"
              required
            ></textarea>
          </div>

          {/* ---------------- Prescription Table ---------------- */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Prescription Details *
            </label>

            <table className="table table-bordered text-center align-middle">
              <thead className="table-info">
                <tr>
                  <th>Medicine</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td className="position-relative">
                      <input
                        type="text"
                        className="form-control"
                        value={row.medicineName}
                        onChange={(e) => {
                          handleChange(index, "medicineName", e.target.value);
                          setActiveRowIndex(index);
                          setMedicineQuery(e.target.value);
                        }}
                        onFocus={() => {
                          setActiveRowIndex(index);
                          setMedicineQuery(row.medicineName);
                        }}
                        autoComplete="off"
                      />

                      {activeRowIndex === index &&
                        filteredMedicines.length > 0 && (
                          <ul
                            className="list-group position-absolute w-100"
                            style={{
                              zIndex: 1200,
                              maxHeight: "200px",
                              overflowY: "auto",
                            }}
                          >
                            {filteredMedicines.map((med) => (
                              <li
                                key={med.id}
                                className="list-group-item list-group-item-action"
                                onMouseDown={() => {
                                  const updated = [...rows];
                                  updated[index].medicineId = med.id;
                                  updated[index].medicineName = med.name;
                                  setRows(updated);
                                  setMedicineQuery("");
                                  setActiveRowIndex(null);
                                }}
                                role="button"
                              >
                                {med.name}
                              </li>
                            ))}
                          </ul>
                        )}
                    </td>

                    <td>
                      <select
                        className="form-select"
                        value={row.frequency}
                        onChange={(e) => {
                          const freq = parseInt(e.target.value);

                          // dosage per day based on selected frequency
                          let dosePerDay = 1;
                          if (freq === 2) dosePerDay = 2;
                          if (freq === 3) dosePerDay = 3;
                          if (freq === 4) dosePerDay = 4;

                          // total dose based on total days × dose per day
                          const totalDose = row.totalDays
                            ? row.totalDays * dosePerDay
                            : dosePerDay;

                          handleChange(index, "frequency", freq);
                          handleChange(index, "dosePerDay", dosePerDay);
                          handleChange(index, "totalDose", totalDose);
                        }}
                      >
                        <option value="">Select Frequency</option>

                        <option value="1">Daily (Once)</option>
                        <option value="2">Twice a Day</option>
                        <option value="3">Three Times a Day</option>
                        <option value="4">Four Times a Day</option>
                      </select>
                    </td>

                    <td>
                      <select
                        className="form-select"
                        value={row.duration}
                        onChange={(e) =>
                          handleChange(index, "duration", e.target.value)
                        }
                      >
                        <option value="">Select Duration</option>

                        {[...Array(30)].map((_, i) => (
                          <option key={i + 1} value={`${i + 1} Days`}>
                            {`${i + 1} Day${i + 1 > 1 ? "s" : ""}`}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveRow(index)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddRow}
            >
              Add Medicine
            </button>
          </div>

          {/* ---------------- Notes ---------------- */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Additional Notes</label>
            <textarea
              name="additionalNotes"
              className="form-control"
              rows="2"
            ></textarea>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: "#01C0C8" }}
            >
              Save Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
