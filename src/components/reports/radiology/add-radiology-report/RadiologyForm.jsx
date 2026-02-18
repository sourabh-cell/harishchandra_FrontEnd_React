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
  fetchActivePatientVisits,
  selectActivePatientVisits,
  selectActivePatientVisitsStatus,
} from "../../../../features/commanSlice";

export default function RadiologyForm() {
  const today = new Date().toISOString().split('T')[0];
  const [tests, setTests] = useState([
    { name: "", findings: "", cost: 0, idProof: null },
  ]);
  const [form, setForm] = useState({
    patientName: "",
    age: "",
    gender: "",
    contact: "",
    email: "",
    scanType: "",
    reportDate: today,
    imagingTime: "",
    // new fields for payload
    patientVisitId: "",
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
  const activePatientVisits = useSelector(selectActivePatientVisits) || [];
  const activePatientVisitsStatus = useSelector(selectActivePatientVisitsStatus);
  
  const [patientQuery, setPatientQuery] = useState("");
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [patientNameQuery, setPatientNameQuery] = useState("");
  const [patientNameSuggestions, setPatientNameSuggestions] = useState([]);
  const [showPatientNameSuggestions, setShowPatientNameSuggestions] = useState(false);
  const [activePatientField, setActivePatientField] = useState(null); // Track which field is active
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
    if (id === "patientName" || id === "patientHospitalId") {
      const q = value.trim().toLowerCase();
      setPatientQuery(q);
      setShowPatientSuggestions(!!q);
      setPatientNameQuery(q);
      setShowPatientNameSuggestions(!!q);
      setActivePatientField(id); // Track which field is active
      // clear any previously bound internal id when user types a new hospital id
      if (id === "patientHospitalId") {
        setForm((prev) => ({ ...prev, patientId: "", patientVisitId: "" }));
      }
    }
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const validateAll = () => {
    const newValid = {};
    let ok = true;
    const errors = [];
    const required = {
      patientName: { regex: /^[A-Za-z\s]{3,60}$/, label: "Patient Name" },
      age: { regex: /^[0-9]{1,3}$/, label: "Age" },
      gender: { regex: /.+/, label: "Gender" },
      contact: { regex: /^[0-9]{10}$/, label: "Contact" },
      scanType: { regex: /.+/, label: "Scan Type" },
      reportDate: { regex: /.+/, label: "Report Date" },
      imagingTime: { regex: /.+/, label: "Imaging Time" },
      radiologyPerformedByName: { regex: /.+/, label: "Radiology Technician" },
    };
    Object.entries(required).forEach(([k, { regex, label }]) => {
      // coerce value to string safely before trimming to avoid "trim is not a function" errors
      const raw = form[k];
      const str = raw === undefined || raw === null ? "" : String(raw).trim();
      if (!regex.test(str)) {
        newValid[k] = false;
        ok = false;
        errors.push(label);
      } else {
        newValid[k] = true;
      }
    });
    // Check if at least one test is filled
    const hasValidTest = tests.some(t => t.name.trim() !== "");
    if (!hasValidTest) {
      ok = false;
      errors.push("At least one scan/procedure must be specified");
    }
    setValid(newValid);
    return { ok, errors };
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Load patients for suggestions
  useEffect(() => {
    if (patientsStatus === "idle") dispatch(fetchPatients());
  }, [dispatch, patientsStatus]);

  // Load active patient visits for suggestions
  useEffect(() => {
    if (activePatientVisitsStatus === "idle") dispatch(fetchActivePatientVisits());
  }, [dispatch, activePatientVisitsStatus]);

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
          p.code ||
          "",
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

  // Update patient name suggestions from activePatientVisits
  useEffect(() => {
    if (!patientNameQuery) return setPatientNameSuggestions([]);
    const q = patientNameQuery.toLowerCase();
    const matches = (activePatientVisits || [])
      .map((p) => ({
        raw: p,
        patientVisitId: p.patientVisitId || "",
        patientName: p.patientName || "",
        gender: p.gender || "",
        age: p.age || "",
        hospitalPatientId: p.hospitalPatientId || "",
        doctorName: p.doctorName || "",
        contactNumber: p.contactNumber || "",
        email: p.email || "",
      }))
      .filter(
        (p) =>
          (p.patientName || "").toLowerCase().includes(q)
      )
      .slice(0, 10);
    setPatientNameSuggestions(matches);
  }, [patientNameQuery, activePatientVisits]);

  // Update doctor suggestions when query or doctor list changes
  const doctorNameIds = useSelector(selectDoctorNameIds) || [];
  const doctorNameIdsStatus = useSelector(selectDoctorNameIdsStatus);
  
  // Load doctor name-ids for doctor suggestions
  useEffect(() => {
    if (doctorNameIdsStatus === "idle") dispatch(fetchDoctorNameIds());
  }, [dispatch, doctorNameIdsStatus]);
  
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
  
  // Load radiology technicians for suggestions
  useEffect(() => {
    if (techniciansStatus === "idle") dispatch(fetchRadiologyTechnicians());
  }, [dispatch, techniciansStatus]);
  
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
      .slice(0, 20);
    setTechnicianSuggestions(matches);
  }, [technicianQuery, technicians]);

  const handleTechnicianQueryChange = (e) => {
    const v = e.target.value || "";
    setForm((prev) => ({ ...prev, radiologyPerformedByName: v }));
    const q = String(v).trim().toLowerCase();
    setTechnicianQuery(q);
    setShowTechnicianSuggestions(!!q);
  };

  const handleTechnicianFocus = () => {
    if ((technicians || []).length > 0) {
      const top = (technicians || [])
        .slice(0, 10)
        .map((t) => ({ id: String(t.id || ""), name: t.name || "" }));
      setTechnicianSuggestions(top);
      setShowTechnicianSuggestions(true);
    } else if (techniciansStatus === "loading") {
      setShowTechnicianSuggestions(true);
    } else {
      if (techniciansStatus === "idle") dispatch(fetchRadiologyTechnicians());
      setShowTechnicianSuggestions(true);
    }
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

  const handleDoctorFocus = () => {
    if ((doctorNameIds || []).length > 0) {
      const top = (doctorNameIds || [])
        .slice(0, 10)
        .map((d) => ({ id: String(d.id || ""), name: d.name || "" }));
      setDoctorSuggestions(top);
      setShowDoctorSuggestions(true);
    } else if (doctorNameIdsStatus === "loading") {
      setShowDoctorSuggestions(true);
    } else {
      if (doctorNameIdsStatus === "idle") dispatch(fetchDoctorNameIds());
      setShowDoctorSuggestions(true);
    }
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
    
    // Check if this is from activePatientVisits (has patientVisitId) or patients list
    const isActiveVisit = raw.patientVisitId || raw.patientName;
    
    let name, hospId, ageVal, genderVal, contactVal, emailVal, patientVisitId, doctorNameVal;
    
    if (isActiveVisit) {
      // Handle activePatientVisits format
      patientVisitId = raw.patientVisitId || "";
      hospId = raw.hospitalPatientId || raw.patientHospitalId || "";
      name = raw.patientName || "";
      ageVal = raw.age;
      doctorNameVal = raw.doctorName || "";
      
      // normalize gender
      let g = (raw.gender || "").toLowerCase();
      if (g.startsWith("m")) genderVal = "Male";
      else if (g.startsWith("f")) genderVal = "Female";
      else genderVal = raw.gender || "";
      
      contactVal = raw.contactNumber || raw.contact || "";
      emailVal = raw.email || "";
    } else {
      // Handle patients list format
      name = raw.name || `${raw.firstName || ""} ${raw.lastName || ""}`.trim();
      hospId = raw.patient_hospital_id || raw.hospitalId || raw.hospitalID || raw.code || "";
      
      // age
      ageVal = raw.age || raw.ageYears;
      if (!ageVal && raw.dob) {
        const bd = new Date(raw.dob);
        if (!isNaN(bd.getTime())) {
          const diff = Date.now() - bd.getTime();
          ageVal = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
        }
      }
      
      let g = (raw.gender && String(raw.gender)) || "";
      if (g) {
        g = g.toLowerCase();
        if (g.startsWith("m")) genderVal = "Male";
        else if (g.startsWith("f")) genderVal = "Female";
        else genderVal = "Other";
      } else {
        genderVal = "";
      }
      
      contactVal = raw.contactInfo || raw.contactNumber || raw.mobile || raw.phone || raw.contact || "";
      emailVal = raw.email || raw.contactEmail || raw.emailAddress || "";
      patientVisitId = "";
      doctorNameVal = "";
    }

    setForm((prev) => ({
      ...prev,
      patientName: name,
      age: ageVal || prev.age,
      gender: genderVal || prev.gender,
      contact: contactVal || prev.contact,
      email: emailVal || prev.email,
      doctorName: doctorNameVal || prev.doctorName,
      patientId: raw.id || raw._id || prev.patientId,
      patientVisitId: patientVisitId || prev.patientVisitId,
      patientHospitalId: hospId || prev.patientHospitalId,
    }));
    setShowPatientSuggestions(false);
    setPatientSuggestions([]);
    setPatientQuery("");
    setShowPatientNameSuggestions(false);
    setPatientNameSuggestions([]);
    setPatientNameQuery("");
  };

  const saveData = async () => {
    const validation = validateAll();
    if (!validation.ok) {
      Swal.fire({
        icon: "warning",
        title: "Validation Errors",
        text: validation.errors.join(", "),
      });
      return;
    }
    // resolve IDs from typed names if user didn't pick suggestion
    let patientId = Number(form.patientId);
    let patientVisitId = Number(form.patientVisitId);
    let doctorId = form.doctorId ? Number(form.doctorId) : NaN;
    let radiologyPerformedById = form.radiologyPerformedById
      ? Number(form.radiologyPerformedById)
      : NaN;

    // if patientVisitId missing but patientId present, use patientId as fallback
    if (Number.isNaN(patientVisitId) && !Number.isNaN(patientId)) {
      patientVisitId = patientId;
    }

    // if patientVisitId missing, try to find from activePatientVisits by hospital ID
    if (Number.isNaN(patientVisitId) && form.patientHospitalId) {
      const found = (activePatientVisits || []).find(p => 
        String(p.hospitalPatientId || "").toLowerCase() === String(form.patientHospitalId).toLowerCase()
      );
      if (found && found.patientVisitId) {
        patientVisitId = Number(found.patientVisitId);
      }
    }

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
      (Number.isNaN(patientVisitId) && Number.isNaN(patientId)) ||
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
      patientVisitId: Number(form.patientVisitId) || patientId,
      doctorId: doctorId,
      doctorName: form.doctorName || null,
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
    <div className="container p-0 m-0">
      <style>{`
        body { font-family: Inter, sans-serif; background:#f2fbfc; }
        .card-main { background:white; border-radius:12px 12px 0 0; margin:0 auto; padding:0; box-shadow:0 4px 12px rgba(0,0,0,0.05); overflow:hidden; }
        .card-header { background:#01C0C8; color:white; text-align:center; padding:12px 0; font-size:22px; font-weight:600; border-radius:12px 12px 0 0; }
        .card-body { padding:20px; }
        .section-title { background:#01C0C8; color:white; font-weight:600; margin-bottom:10px; font-size:18px; padding:6px 10px; border-radius:4px; }
        .btn-theme { background:#01C0C8; color:white; border:none; }
        .btn-outline-theme { border:1px solid #01C0C8; color:#01C0C8; background:white; }
        .table thead { background:#f6ffff; }
        .no-print { display:inline; }
        .table td, .table th { vertical-align: middle !important; }
        .form-control-sm { padding:3px 6px; font-size:0.875rem; }
        @media print { .no-print { display:none !important; } .card-main { box-shadow:none; border-radius:0; } }
        #testsTable thead th {
          background: #01C0C8 !important;
          color: #ffffff !important;
          text-align: center;
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

      <div className="card-main">
        <div className="card-header">
          <i className="fas fa-x-ray me-2"></i> HMS Radiology & Diagnostics
        </div>

        <div className="card-body">
          {/* Patient Information */}
          <div className="mb-3">
            <div className="section-title">Patient Information</div>
            <div className="row g-3">
              <div className="col-md-4" style={{ position: "relative" }}>
                <label>Patient Name *</label>
                <input
                  id="patientName"
                  className="form-control"
                  value={form.patientName}
                  onChange={handleFormChange}
                  placeholder="e.g. Rahul Sharma"
                  autoComplete="off"
                  required
                />
                {showPatientNameSuggestions && patientNameSuggestions.length > 0 && (
                  <div
                    className="list-group position-absolute"
                    style={{ zIndex: 999, width: '100%' }}
                  >
                    {patientNameSuggestions.map((ps, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => handleSelectPatient(ps)}
                      >
                        <strong>{ps.patientName}</strong> — {ps.raw?.hospitalPatientId || ps.hospitalPatientId || "-"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-md-2">
                <label>Age *</label>
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
                <label>Gender *</label>
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
                <label>Contact *</label>
                <input
                  id="contact"
                  className="form-control"
                  value={form.contact}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="col-md-6" style={{ position: "relative" }}>
                <label>Patient Hospital ID *</label>
                <input
                  id="patientHospitalId"
                  className="form-control"
                  value={form.patientHospitalId}
                  onChange={handleFormChange}
                  placeholder="e.g. HOSP123"
                  required
                />
                {showPatientSuggestions && patientSuggestions.length > 0 && activePatientField === 'patientHospitalId' && (
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
                        <strong>{ps.raw?.patient_hospital_id || ps.id || "-"}</strong> — {ps.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-md-3" style={{ position: "relative" }}>
                <label>Doctor Name *</label>
                <input
                  id="doctorName"
                  className="form-control"
                  value={form.doctorName}
                  onChange={handleDoctorQueryChange}
                  onFocus={handleDoctorFocus}
                  placeholder="Search doctor by name"
                  autoComplete="off"
                  required
                />
                {showDoctorSuggestions && (
                  <div
                    className="list-group position-absolute"
                    style={{ zIndex: 999 }}
                  >
                    {doctorNameIdsStatus === "loading" && (
                      <div className="list-group-item">Loading...</div>
                    )}
                    {doctorNameIdsStatus === "failed" && (
                      <button
                        type="button"
                        className="list-group-item list-group-item-action text-danger"
                        onClick={() => dispatch(fetchDoctorNameIds())}
                      >
                        Failed to load doctors — Retry
                      </button>
                    )}
                    {doctorNameIdsStatus !== "loading" &&
                      doctorNameIdsStatus !== "failed" &&
                      doctorSuggestions.length === 0 && (
                        <button
                          type="button"
                          className="list-group-item list-group-item-action disabled"
                        >
                          No matches
                        </button>
                      )}
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

          {/* Radiology + Billing */}
          <div className="mb-3 row">
            <div className="col-md-6">
              <div className="mb-3">
                <div className="section-title">Radiology Details</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label>Scan Type *</label>
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
                    <label>Report Date *</label>
                    <input
                      id="reportDate"
                      type="date"
                      className="form-control"
                      value={form.reportDate}
                      onChange={handleFormChange}
                      min={today}
                      max={today}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Imaging Time *</label>
                    <input
                      id="imagingTime"
                      type="time"
                      className="form-control"
                      value={form.imagingTime}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="col-md-6" style={{ position: "relative" }}>
                    <label>Radiology Technician *</label>
                    <input
                      id="radiologyPerformedByName"
                      className="form-control"
                      value={form.radiologyPerformedByName}
                      onChange={handleTechnicianQueryChange}
                      onFocus={handleTechnicianFocus}
                      placeholder="Search technician by name"
                      autoComplete="off"
                      required
                    />
                    {showTechnicianSuggestions && (
                      <div
                        className="list-group position-absolute"
                        style={{ zIndex: 999 }}
                      >
                        {techniciansStatus === "loading" && (
                          <div className="list-group-item">Loading...</div>
                        )}
                        {techniciansStatus === "failed" && (
                          <button
                            type="button"
                            className="list-group-item list-group-item-action text-danger"
                            onClick={() => dispatch(fetchRadiologyTechnicians())}
                          >
                            Failed to load technicians — Retry
                          </button>
                        )}
                        {techniciansStatus !== "loading" &&
                          techniciansStatus !== "failed" &&
                          technicianSuggestions.length === 0 && (
                            <button
                              type="button"
                              className="list-group-item list-group-item-action disabled"
                            >
                              No matches
                            </button>
                          )}
                        {technicianSuggestions.map((ts, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSelectTechnician(ts)}
                          >
                            {ts.name}{" "}
                            {ts.id ? (
                              <small className="text-muted">
                                {" "}
                                — #{ts.id}
                              </small>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label>Status *</label>
                    <input
                      type="text"
                      className="form-control"
                      value="Completed"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <div className="section-title">Billing Summary</div>
                <div className="border p-3 rounded d-flex justify-content-between">
                  <div>
                    <strong>Scans Count:</strong> {tests.length}
                  </div>
                  <div>
                    <strong>Total (₹):</strong> {totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Findings Table */}
          <div className="mb-3">
            <div className="section-title">Radiology Findings</div>
            <div className="table-responsive">
              <table className="table table-bordered align-middle" id="testsTable">
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
                          className="form-control form-control-sm"
                          value={row.name}
                          onChange={(e) =>
                            handleTestChange(i, "name", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          className="form-control form-control-sm"
                          value={row.findings}
                          onChange={(e) =>
                            handleTestChange(i, "findings", e.target.value)
                          }
                        />
                      </td>

                      <td style={{ width: 220 }}>
                        <div className="d-flex flex-column align-items-center">
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
                              className="text-truncate mt-1 text-center"
                              style={{ maxWidth: 200 }}
                            >
                              <strong>Selected:</strong> {row.idProof.name}
                            </small>
                          ) : (
                            <small className="text-muted mt-1 text-center">
                              No file selected
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="0"
                          value={row.cost}
                          onChange={(e) =>
                            handleTestChange(i, "cost", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          style={{ padding: "0 6px" }}
                          onClick={() => removeRow(i)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-start gap-2 no-print mt-3">
              <button
                className="btn btn-outline-theme"
                onClick={addRow}
              >
                + Add Scan
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={clearRows}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-3">
            <div className="section-title">Radiologist Remarks</div>
            <textarea
              rows="4"
              className="form-control"
              id="finalSummary"
              value={form.finalSummary}
              onChange={handleFormChange}
            ></textarea>
          </div>

          <div className="d-flex justify-content-center gap-2 mb-3 no-print">
            <button className="btn btn-theme" onClick={saveData}>
              Save
            </button>
          </div>

          <datalist id="testList">
            <option value="X-Ray Chest" />
            <option value="Ultrasound Abdomen" />
            <option value="MRI Brain" />
            <option value="CT Scan Whole Abdomen" />
          </datalist>
        </div>
      </div>
    </div>
  );
}
