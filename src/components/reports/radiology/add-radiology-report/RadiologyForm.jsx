import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  createRadiology,
  fetchRadiologyTechnicians,
  selectRadiologyTechnicians,
  selectRadiologyTechniciansStatus,
} from "../../../../features/radiologySlice";
import {
  fetchPatients,
  selectPatients,
  selectPatientsStatus,
  fetchDoctorNameIds,
  selectDoctorNameIds,
  selectDoctorNameIdsStatus,
} from "../../../../features/commanSlice";

export default function RadiologyForm() {
  const [tests, setTests] = useState([
    { name: "", findings: "", cost: 0, idProof: null },
  ]);
  const [form, setForm] = useState({
    patientName: "",
    age: "",
    gender: "",
    contact: "",
    scanType: "",
    reportDate: "",
    imagingTime: "",
    reportedBy: "",
    // new fields for payload
    patientId: "",
    patientHospitalId: "",
    doctorId: "",
    doctorName: "",
    radiologyPerformedById: "",
    radiologyPerformedByName: "",
    finalSummary: "",
    status: "COMPLETED",
  });
  const [valid, setValid] = useState({});
  const patients = useSelector(selectPatients) || [];
  const patientsStatus = useSelector(selectPatientsStatus);
  const [patientQuery, setPatientQuery] = useState("");
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [doctorQuery, setDoctorQuery] = useState("");
  const [doctorSuggestions, setDoctorSuggestions] = useState([]);
  const [showDoctorSuggestions, setShowDoctorSuggestions] = useState(false);
  const [technicianQuery, setTechnicianQuery] = useState("");
  const [technicianSuggestions, setTechnicianSuggestions] = useState([]);
  const [showTechnicianSuggestions, setShowTechnicianSuggestions] =
    useState(false);

  const RADIOLOGY_CATALOG = {
    "X-Ray Chest": { cost: 500 },
    "Ultrasound Abdomen": { cost: 1200 },
    "MRI Brain": { cost: 5000 },
    "CT Scan Whole Abdomen": { cost: 6500 },
  };

  const addRow = () => {
    setTests([...tests, { name: "", findings: "", cost: 0, idProof: null }]);
  };

  const clearRows = () => {
    setTests([{ name: "", findings: "", cost: 0, idProof: null }]);
  };

  const handleTestChange = (index, field, value) => {
    const updated = [...tests];
    updated[index][field] = value;

    if (field === "name" && RADIOLOGY_CATALOG[value]) {
      updated[index].cost = RADIOLOGY_CATALOG[value].cost;
    }

    setTests(updated);
  };

  const handleFileChange = (index, file) => {
    const updated = [...tests];
    updated[index].idProof = file || null;
    setTests(updated);
  };

  const removeRow = (index) => {
    const updated = tests.filter((_, i) => i !== index);
    setTests(updated.length ? updated : [{ name: "", findings: "", cost: 0 }]);
  };

  const totalAmount = tests.reduce(
    (sum, t) => sum + (parseFloat(t.cost) || 0),
    0
  );

  const validAge = (e) => {
    if (e.target.value < 1) e.target.value = "";
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handlePatientNameChange = (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, patientName: v }));
    const q = v.trim().toLowerCase();
    setPatientQuery(q);
    setShowPatientSuggestions(!!q);
  };

  const validateAll = () => {
    const newValid = {};
    let ok = true;
    const required = {
      patientName: /^[A-Za-z\s]{3,60}$/,
      age: /^[0-9]{1,3}$/,
      gender: /.+/,
      contact: /^[0-9]{10}$/,
      scanType: /.+/,
      reportDate: /.+/,
      imagingTime: /.+/,
      reportedBy: /.+/,
    };
    Object.entries(required).forEach(([k, regex]) => {
      // coerce value to string safely before trimming to avoid "trim is not a function" errors
      const raw = form[k];
      const str = raw === undefined || raw === null ? "" : String(raw).trim();
      if (!regex.test(str)) {
        newValid[k] = false;
        ok = false;
      } else {
        newValid[k] = true;
      }
    });
    setValid(newValid);
    return ok;
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Load patients for suggestions
  useEffect(() => {
    if (patientsStatus === "idle") dispatch(fetchPatients());
    // also ensure doctors name-id list is loaded for doctor suggestions
    // fetchDoctorNameIds will populate selector used below
    dispatch(fetchDoctorNameIds());
    // fetch radiology technicians for searchable technician field
    dispatch(fetchRadiologyTechnicians());
  }, [dispatch, patientsStatus]);

  // Update patient suggestions when query or patients change
  useEffect(() => {
    if (!patientQuery) return setPatientSuggestions([]);
    const q = patientQuery.toLowerCase();
    const matches = (patients || [])
      .map((p) => ({
        raw: p,
        id:
          p.patient_hospital_id ||
          p.hospitalId ||
          p.hospitalID ||
          String(p.id || p._id || ""),
        name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      }))
      .filter(
        (p) =>
          (p.id || "").toLowerCase().includes(q) ||
          (p.name || "").toLowerCase().includes(q)
      )
      .slice(0, 10);
    setPatientSuggestions(matches);
  }, [patientQuery, patients]);

  // Update doctor suggestions when query or doctor list changes
  const doctorNameIds = useSelector(selectDoctorNameIds) || [];
  const doctorNameIdsStatus = useSelector(selectDoctorNameIdsStatus);

  useEffect(() => {
    if (!doctorQuery) return setDoctorSuggestions([]);
    const q = doctorQuery.toLowerCase();
    const matches = (doctorNameIds || [])
      .map((d) => ({
        raw: d,
        id: String(d.id || d._id || d.key || ""),
        name: d.name || d.fullName || d.label || "",
      }))
      .filter(
        (d) =>
          (d.id || "").toLowerCase().includes(q) ||
          (d.name || "").toLowerCase().includes(q)
      )
      .slice(0, 10);
    setDoctorSuggestions(matches);
  }, [doctorQuery, doctorNameIds]);

  // technicians selectors
  const technicians = useSelector(selectRadiologyTechnicians) || [];
  const techniciansStatus = useSelector(selectRadiologyTechniciansStatus);

  // Update technician suggestions when query or technicians list changes
  useEffect(() => {
    if (!technicianQuery) return setTechnicianSuggestions([]);
    const q = technicianQuery.toLowerCase();
    const matches = (technicians || [])
      .map((t) => ({
        raw: t,
        id: String(t.id || t._id || t._id || ""),
        name: t.name || t.fullName || t.label || t.firstName || "",
      }))
      .filter(
        (t) =>
          (t.name || "").toLowerCase().includes(q) ||
          (t.id || "").toLowerCase().includes(q)
      )
      .slice(0, 10);
    setTechnicianSuggestions(matches);
  }, [technicianQuery, technicians]);

  const handleTechnicianQueryChange = (e) => {
    const v = e.target.value || "";
    setForm((prev) => ({ ...prev, radiologyPerformedByName: v }));
    const q = String(v).trim().toLowerCase();
    setTechnicianQuery(q);
    setShowTechnicianSuggestions(!!q);
  };

  const handleSelectTechnician = (t) => {
    const raw = t.raw || t;
    const id = raw.id || raw._id || raw._id || raw.key || "";
    const name = raw.name || raw.fullName || raw.label || raw.firstName || "";
    setForm((prev) => ({
      ...prev,
      radiologyPerformedById: String(id),
      radiologyPerformedByName: name,
    }));
    setShowTechnicianSuggestions(false);
    setTechnicianSuggestions([]);
    setTechnicianQuery("");
  };

  const handleDoctorQueryChange = (e) => {
    const v = e.target.value || "";
    setForm((prev) => ({ ...prev, doctorName: v }));
    const q = String(v).trim().toLowerCase();
    setDoctorQuery(q);
    setShowDoctorSuggestions(!!q);
  };

  const handleSelectDoctor = (d) => {
    const raw = d.raw || d;
    const id = raw.id || raw._id || raw.key || raw.id;
    const name = raw.name || raw.fullName || raw.label || "";
    setForm((prev) => ({ ...prev, doctorId: String(id), doctorName: name }));
    setShowDoctorSuggestions(false);
    setDoctorSuggestions([]);
    setDoctorQuery("");
  };

  const handleSelectPatient = (p) => {
    const raw = p.raw || p;
    const name =
      raw.name || `${raw.firstName || ""} ${raw.lastName || ""}`.trim();
    const hospId =
      raw.patient_hospital_id ||
      raw.hospitalId ||
      raw.hospitalID ||
      raw.code ||
      "";
    // age
    let ageVal = raw.age || raw.ageYears;
    if (!ageVal && raw.dob) {
      const bd = new Date(raw.dob);
      if (!isNaN(bd.getTime())) {
        const diff = Date.now() - bd.getTime();
        ageVal = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
      }
    }
    let genderVal = (raw.gender && String(raw.gender)) || "";
    if (genderVal) {
      const g = genderVal.toLowerCase();
      if (g.startsWith("m")) genderVal = "Male";
      else if (g.startsWith("f")) genderVal = "Female";
      else genderVal = "Other";
    }
    const contactVal =
      raw.contactInfo ||
      raw.contactNumber ||
      raw.mobile ||
      raw.phone ||
      raw.contact ||
      "";

    setForm((prev) => ({
      ...prev,
      patientName: name,
      age: ageVal || prev.age,
      gender: genderVal || prev.gender,
      contact: contactVal || prev.contact,
      patientId: raw.id || raw._id || prev.patientId,
      patientHospitalId: hospId || prev.patientHospitalId,
    }));
    setShowPatientSuggestions(false);
    setPatientSuggestions([]);
    setPatientQuery("");
  };

  const saveData = async () => {
    if (!validateAll()) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please fill all required fields.",
      });
      return;
    }
    // resolve IDs from typed names if user didn't pick suggestion
    let patientId = Number(form.patientId);
    let doctorId = form.doctorId ? Number(form.doctorId) : NaN;
    let radiologyPerformedById = form.radiologyPerformedById
      ? Number(form.radiologyPerformedById)
      : NaN;

    // if doctorId missing but doctorName present, try to resolve from doctorNameIds
    if (Number.isNaN(doctorId) && form.doctorName) {
      const match = (doctorNameIds || []).find((d) => {
        const name = (d.name || d.fullName || "").toLowerCase();
        return name === String(form.doctorName).trim().toLowerCase();
      });
      if (match) {
        doctorId = Number(match.id || match._id || match.key);
        setForm((prev) => ({ ...prev, doctorId: String(doctorId) }));
      }
    }

    // if technician id missing but name present, try to resolve from technicians list
    if (Number.isNaN(radiologyPerformedById) && form.radiologyPerformedByName) {
      const matchT = (technicians || []).find((t) => {
        const name = (t.name || t.fullName || t.firstName || "").toLowerCase();
        return (
          name === String(form.radiologyPerformedByName).trim().toLowerCase()
        );
      });
      if (matchT) {
        radiologyPerformedById = Number(matchT.id || matchT._id || matchT.key);
        setForm((prev) => ({
          ...prev,
          radiologyPerformedById: String(radiologyPerformedById),
        }));
      }
    }

    if (
      Number.isNaN(patientId) ||
      Number.isNaN(doctorId) ||
      Number.isNaN(radiologyPerformedById)
    ) {
      Swal.fire({
        icon: "error",
        title: "Invalid IDs",
        text: "Please select Patient, Doctor and Technician from suggestions so valid IDs are available.",
      });
      return;
    }

    const reportPayload = {
      patientId: patientId,
      doctorId: doctorId,
      radiologyPerformedById: radiologyPerformedById,
      // include reportDate so backend stores the selected date
      reportDate: form.reportDate || "",
      // include imaging time separately (HH:mm)
      imagingTime: form.imagingTime || "",
      finalSummary: form.finalSummary || "",
      // backend expects 'reportStatus' according to provided payload example
      reportStatus: (form.status || "PENDING").toUpperCase(),
      scanDetails: tests.map((t) => ({
        scanName: t.name || "",
        findings: t.findings || "",
        impression: t.findings || "",
        cost: parseFloat(Number(t.cost || 0).toFixed(2)) || 0,
      })),
    };
    console.log("Radiology Report Payload:", reportPayload);
    // Build FormData so we can send files + report JSON as multipart/form-data
    const formData = new FormData();
    formData.append("report", JSON.stringify(reportPayload));

    // Append each selected file under the 'files' key (multiple files allowed)
    tests.forEach((t) => {
      if (t.idProof) {
        formData.append("files", t.idProof);
      }
    });

    try {
      await dispatch(createRadiology(formData)).unwrap();
      Swal.fire({
        icon: "success",
        title: "Created",
        text: "Radiology report created.",
        timer: 1400,
        showConfirmButton: false,
      });
      navigate("/dashboard/manage-radiology-reports");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err?.message || "Failed to create radiology report",
      });
    }
  };

  return (
    <>
      {" "}
      {/* Alignment & Table Fix CSS */}
      <style>{`
        #testsTable thead th {
          background: #01C0C8 !important;
          color: #ffffff !important;
          border-color: #01C0C8 !important;
          text-align: center;
        }
        #testsTable, #testsTable th, #testsTable td {
          border-color: #01C0C8 !important;
        }
        #testsTable td, #testsTable th {
          vertical-align: middle;
        }
        #testsTable td:nth-child(1) { width: 32%; }
        #testsTable td:nth-child(2) { width: 40%; }
        #testsTable td:nth-child(3) { width: 15%; }
        #testsTable td:nth-child(4) { width: 13%; text-align: center; }
 
        input.form-control, select.form-select, textarea.form-control {
          height: 38px !important;
          padding: 6px 10px !important;
        }
        textarea.form-control {
          height: auto !important;
        }
        /* make per-row file input compact */
        #testsTable input[type="file"] { padding: 4px 6px; }
      `}</style>
      <div className="container-fluid">
        {/* Header */}
        <div
          className="p-3 mb-3 text-white text-center"
          style={{ background: "#01C0C8", margin: "-32px" }}
        >
          <h3 className="mb-0">HMS Radiology & Diagnostics</h3>
        </div>

        {/* Patient Information */}
        <div className="full-width-card card mb-3">
          <div className="p-2 text-white" style={{ background: "#01C0C8" }}>
            <h5 className="mb-0">Patient Information</h5>
          </div>

          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4" style={{ position: "relative" }}>
                <label className="form-label">Patient Name *</label>
                <input
                  id="patientName"
                  className="form-control"
                  value={form.patientName}
                  onChange={handlePatientNameChange}
                  placeholder="e.g. Rahul Sharma"
                  autoComplete="off"
                  required
                />
                {showPatientSuggestions && patientSuggestions.length > 0 && (
                  <div
                    className="list-group position-absolute"
                    style={{ zIndex: 999 }}
                  >
                    {patientSuggestions.map((ps, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => handleSelectPatient(ps)}
                      >
                        <strong>{ps.id || "-"}</strong> — {ps.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-md-2">
                <label className="form-label">Age *</label>
                <input
                  id="age"
                  type="number"
                  min="1"
                  onInput={validAge}
                  className="form-control"
                  value={form.age}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Gender *</label>
                <select
                  id="gender"
                  className="form-select"
                  value={form.gender}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Contact *</label>
                <input
                  id="contact"
                  className="form-control"
                  value={form.contact}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Patient Hospital ID *</label>
                <input
                  id="patientHospitalId"
                  className="form-control"
                  value={form.patientHospitalId}
                  onChange={handleFormChange}
                  placeholder="e.g. HOSP123"
                  required
                />
              </div>
              <div className="col-md-3" style={{ position: "relative" }}>
                <label className="form-label">Doctor ID *</label>
                <input
                  id="doctorName"
                  className="form-control"
                  value={form.doctorName}
                  onChange={handleDoctorQueryChange}
                  placeholder="Search doctor by name"
                  autoComplete="off"
                  required
                />
                {showDoctorSuggestions && doctorSuggestions.length > 0 && (
                  <div
                    className="list-group position-absolute"
                    style={{ zIndex: 999 }}
                  >
                    {doctorSuggestions.map((ds, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => handleSelectDoctor(ds)}
                      >
                        {ds.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Radiology + Billing */}
        <div className="row">
          {/* Radiology Details */}
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="p-2 text-white" style={{ background: "#01C0C8" }}>
                <h5 className="mb-0">Radiology Details</h5>
              </div>

              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Scan Type *</label>
                    <select
                      id="scanType"
                      className="form-select"
                      value={form.scanType}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select</option>
                      <option>X-Ray</option>
                      <option>Ultrasound</option>
                      <option>MRI</option>
                      <option>CT Scan</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Report Date *</label>
                    <input
                      id="reportDate"
                      type="date"
                      className="form-control"
                      value={form.reportDate}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Imaging Time *</label>
                    <input
                      id="imagingTime"
                      type="time"
                      className="form-control"
                      value={form.imagingTime}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Reported By *</label>
                    <input
                      id="reportedBy"
                      className="form-control"
                      value={form.reportedBy}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="col-md-3" style={{ position: "relative" }}>
                    <label className="form-label">Radiology Technician *</label>
                    <input
                      id="radiologyPerformedByName"
                      className="form-control"
                      value={form.radiologyPerformedByName}
                      onChange={handleTechnicianQueryChange}
                      placeholder="Search technician by name"
                      autoComplete="off"
                      required
                    />
                    {showTechnicianSuggestions &&
                      technicianSuggestions.length > 0 && (
                        <div
                          className="list-group position-absolute"
                          style={{ zIndex: 999 }}
                        >
                          {technicianSuggestions.map((ts, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="list-group-item list-group-item-action"
                              onClick={() => handleSelectTechnician(ts)}
                            >
                              {ts.name || ts.id || "-"}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Status *</label>
                    <select
                      id="status"
                      className="form-select"
                      value={form.status}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="p-2 text-white" style={{ background: "#01C0C8" }}>
                <h5 className="mb-0">Billing Summary</h5>
              </div>
              <div className="card-body" style={{ minHeight: "206px" }}>
                <div className="border rounded p-3 d-flex justify-content-between">
                  <div>
                    <div>Scans Count</div>
                    <h4>{tests.length}</h4>
                  </div>
                  <div>
                    <div>Total (₹)</div>
                    <h4>{totalAmount.toFixed(2)}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Findings Table */}
        <div className="full-width-card card mb-3">
          <div className="p-2 text-white" style={{ background: "#01C0C8" }}>
            <h5 className="mb-0">Radiology Findings</h5>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered" id="testsTable">
                <thead>
                  <tr>
                    <th>Scan / Procedure</th>
                    <th>Findings / Observation</th>
                    <th>Upload ID Proof</th>
                    <th>Cost (₹)</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {tests.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          list="testList"
                          className="form-control"
                          value={row.name}
                          onChange={(e) =>
                            handleTestChange(i, "name", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          className="form-control"
                          value={row.findings}
                          onChange={(e) =>
                            handleTestChange(i, "findings", e.target.value)
                          }
                        />
                      </td>

                      <td style={{ width: 220 }}>
                        <div className="d-flex flex-column align-items-start">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="form-control form-control-sm"
                            onChange={(e) =>
                              handleFileChange(i, e.target.files[0])
                            }
                          />
                          {row.idProof ? (
                            <small
                              className="text-truncate mt-1"
                              style={{ maxWidth: 200 }}
                            >
                              <strong>Selected:</strong> {row.idProof.name}
                            </small>
                          ) : (
                            <small className="text-muted mt-1">
                              No file selected
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          value={row.cost}
                          onChange={(e) =>
                            handleTestChange(i, "cost", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => removeRow(i)}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn btn-outline-primary btn-sm me-2"
              onClick={addRow}
            >
              + Add Scan
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={clearRows}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Remarks */}
        <div className="full-width-card card mb-3">
          <div className="p-2 text-white" style={{ background: "#01C0C8" }}>
            <h5 className="mb-0">Radiologist Remarks</h5>
          </div>
          <div className="card-body">
            <textarea
              rows="3"
              className="form-control"
              id="finalSummary"
              value={form.finalSummary}
              onChange={handleFormChange}
            ></textarea>
          </div>
        </div>

        {/* Save */}
        <div className="text-center mb-3">
          <button
            className="btn text-white"
            style={{ background: "#01C0C8" }}
            onClick={saveData}
          >
            Save
          </button>
        </div>
      </div>
      <datalist id="testList">
        <option value="X-Ray Chest" />
        <option value="Ultrasound Abdomen" />
        <option value="MRI Brain" />
        <option value="CT Scan Whole Abdomen" />
      </datalist>
    </>
  );
}
