import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  fetchRadiologyTechnicians,
  selectRadiologyTechnicians,
  selectRadiologyTechniciansStatus,
  fetchRadiologies,
  selectRadiologies,
  selectRadiologiesStatus,
  updateRadiology,
  fetchRadiologyById,
  selectCurrentRadiology,
  selectFetchRadiologyStatus,
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

export default function EditRadiologyForm() {
  // current editable state
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
    patientVisitId: "",
    patientHospitalId: "",
    doctorId: "",
    doctorName: "",
    radiologyPerformedById: "",
    radiologyPerformedByName: "",
    finalSummary: "",
    status: "PENDING",
  });
  // snapshot of initially loaded values so we can detect "no-change" saves
  const [initialForm, setInitialForm] = useState(null);
  const [initialTests, setInitialTests] = useState(null);
  // track if we've already auto-prefilled doctor name from doctorId once
  const [doctorPrefilled, setDoctorPrefilled] = useState(false);
  const [valid, setValid] = useState({});
  const patients = useSelector(selectPatients) || [];
  const patientsStatus = useSelector(selectPatientsStatus);
  const activePatientVisits = useSelector(selectActivePatientVisits) || [];
  const activePatientVisitsStatus = useSelector(selectActivePatientVisitsStatus);
  const [patientQuery, setPatientQuery] = useState("");
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  // Patient name autocomplete for active patient visits
  const [patientNameQuery, setPatientNameQuery] = useState("");
  const [patientNameSuggestions, setPatientNameSuggestions] = useState([]);
  const [showPatientNameSuggestions, setShowPatientNameSuggestions] = useState(false);
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
    // Also trigger patient name autocomplete from active patient visits
    setPatientNameQuery(v);
    setShowPatientNameSuggestions(!!v);
  };

  const handleSelectPatientName = (p) => {
    const raw = p.raw || p;
    
    // Extract patient data from active patient visit
    const patientVisitId = raw.patientVisitId || "";
    const hospId = raw.hospitalPatientId || raw.patientHospitalId || "";
    const name = raw.patientName || "";
    const ageVal = raw.age || "";
    
    // Normalize gender
    let genderVal = (raw.gender || "").toLowerCase();
    if (genderVal.startsWith("m")) genderVal = "Male";
    else if (genderVal.startsWith("f")) genderVal = "Female";
    else genderVal = raw.gender || "";
    
    const contactVal = raw.contactNumber || raw.contact || "";
    const doctorNameVal = raw.doctorName || "";

    setForm((prev) => ({
      ...prev,
      patientName: name,
      age: ageVal || prev.age,
      gender: genderVal || prev.gender,
      contact: contactVal || prev.contact,
      doctorName: doctorNameVal || prev.doctorName,
      patientVisitId: patientVisitId || prev.patientVisitId,
      patientHospitalId: hospId || prev.patientHospitalId,
    }));
    setShowPatientNameSuggestions(false);
    setPatientNameSuggestions([]);
    setPatientNameQuery("");
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
  const { id: routeId } = useParams();

  const allRadiologies = useSelector(selectRadiologies) || [];
  const allRadiologiesStatus = useSelector(selectRadiologiesStatus);
  const currentRadiology = useSelector(selectCurrentRadiology);
  const fetchRadiologyStatus = useSelector(selectFetchRadiologyStatus);

  // Load patients for suggestions
  useEffect(() => {
    if (patientsStatus === "idle") dispatch(fetchPatients());
    // also ensure doctors name-id list is loaded for doctor suggestions
    // fetchDoctorNameIds will populate selector used below
    dispatch(fetchDoctorNameIds());
    // fetch radiology technicians for searchable technician field
    dispatch(fetchRadiologyTechnicians());
    // fetch active patient visits for patient name autocomplete
    if (activePatientVisitsStatus === "idle") dispatch(fetchActivePatientVisits());
  }, [dispatch, patientsStatus, activePatientVisitsStatus]);

  // Fetch radiology by ID when routeId changes
  useEffect(() => {
    if (!routeId) return;
    console.log("Fetching radiology for ID:", routeId);
    if (fetchRadiologyStatus === "idle") {
      dispatch(fetchRadiologyById(routeId));
    }
  }, [dispatch, routeId, fetchRadiologyStatus]);

  // When currentRadiology loads, prefill the form for editing
  useEffect(() => {
    if (!routeId) return;
    if (fetchRadiologyStatus !== "succeeded" || !currentRadiology) return;
    
    console.log("currentRadiology data:", JSON.stringify(currentRadiology, null, 2));
    const found = currentRadiology;

    // Map backend fields to local form state
    console.debug("EditRadiologyForm prefill record:", found);
    const hospId =
      // top-level common keys
      found.hospitalPatientId ||
      found.patient_hospital_id ||
      found.patientHospitalId ||
      found.hospital_id ||
      found.hospitalID ||
      found.patient?.patient_hospital_id ||
      found.patient?.patientHospitalId ||
      // some APIs put fields under an attributes or data object
      (found.patient && (found.patient.attributes || {}).patient_hospital_id) ||
      (found.patient && (found.patient.attributes || {}).patientHospitalId) ||
      // other possible locations
      found.patient?.hospitalId ||
      found.patient?.hospital_id ||
      found.patient?.code ||
      found.patientCode ||
      "";
    console.debug("Resolved hospId:", hospId);
    const patientNameVal =
      found.patientName ||
      (found.patient &&
        (found.patient.name ||
          `${found.patient.firstName || ""} ${
            found.patient.lastName || ""
          }`.trim())) ||
      "";
    const ageVal = found.patientAge || found.age || found.patient?.age || "";
    let genderVal =
      found.patientGender ||
      found.patientSex ||
      found.gender ||
      found.patient_gender ||
      found.patient?.patientGender ||
      found.patient?.patientSex ||
      found.patient?.gender ||
      found.patient?.sex ||
      found.sex ||
      "";
    if (genderVal) {
      const g = String(genderVal).toLowerCase();
      if (g.startsWith("m")) genderVal = "Male";
      else if (g.startsWith("f")) genderVal = "Female";
      else genderVal = "Other";
    }
    const contactVal =
      found.patientContact ||
      found.contact ||
      found.phone ||
      found.patient?.contact ||
      found.patient?.phone ||
      "";

    setForm((prev) => ({
      ...prev,
      patientName: patientNameVal,
      age: ageVal,
      gender: genderVal,
      contact: contactVal,
      patientId:
        found.patientId ||
        found.patient_id ||
        found.patient?.id ||
        found.patient?._id ||
        prev.patientId,
      patientHospitalId: hospId || prev.patientHospitalId,
      doctorId: found.doctorId || found.doctor || prev.doctorId,
      doctorName: found.doctorName || found.doctor || prev.doctorName,
      radiologyPerformedById:
        found.radiologyPerformedById || prev.radiologyPerformedById,
      radiologyPerformedByName:
        found.radiologyPerformedByName || prev.radiologyPerformedByName,
      finalSummary:
        found.finalSummary ||
        found.report ||
        found.final_summary ||
        prev.finalSummary,
      status: (
        found.reportStatus ||
        found.status ||
        prev.status ||
        "PENDING"
      ).toUpperCase(),
      scanType:
        found.scanType ||
        found.scan_type ||
        found.modality ||
        prev.scanType ||
        "",
      reportDate: (() => {
        const rd =
          found.reportDate ||
          found.reportdate ||
          found.date ||
          found.createdAt ||
          "";
        if (!rd) return "";
        if (typeof rd === "string" && rd.includes("T")) return rd.split("T")[0];
        if (typeof rd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rd)) return rd;
        try {
          return new Date(rd).toISOString().split("T")[0];
        } catch (e) {
          return "";
        }
      })(),
      imagingTime:
        found.imagingTime || found.imagingtime || prev.imagingTime || "",
    }));

    // If patientHospitalId not set from record, try to get from patients list
    if (!hospId && form.patientId) {
      const patient = patients.find(p => String(p.id || p._id) === String(form.patientId));
      if (patient) {
        const patientHospId = patient.patient_hospital_id || patient.hospitalId || patient.hospitalID || patient.code || "";
        setForm(prev => ({ ...prev, patientHospitalId: patientHospId }));
      }
    }

    // Prefill tests from scanDetails
    if (Array.isArray(found.scanDetails) && found.scanDetails.length) {
      const mappedTests = found.scanDetails.map((s) => ({
        name: s.scanName || s.name || "",
        findings: s.findings || s.impression || "",
        cost: s.cost || 0,
        idProof: null,
      }));
      setTests(mappedTests);

      // Set scanType based on the first scan
      if (mappedTests.length > 0) {
        const firstName = mappedTests[0].name.toLowerCase();
        let scanType = "";
        if (firstName.includes("x-ray")) scanType = "X-Ray";
        else if (firstName.includes("ultrasound")) scanType = "Ultrasound";
        else if (firstName.includes("mri")) scanType = "MRI";
        else if (firstName.includes("ct")) scanType = "CT Scan";
        setForm((prev) => ({ ...prev, scanType: prev.scanType || scanType }));
      }
    }
  }, [fetchRadiologyStatus, currentRadiology, routeId]);

  // After the record and tests are prefetched into local state the first time,
  // capture a deep snapshot so we can later detect if the user actually changed anything.
  useEffect(() => {
    if (!routeId) return;
    if (fetchRadiologyStatus !== "succeeded") return;
    if (!form || !form.patientName) return;
    if (initialForm !== null || initialTests !== null) return;

    setInitialForm(JSON.parse(JSON.stringify(form)));
    setInitialTests(JSON.parse(JSON.stringify(tests)));
  }, [
    routeId,
    fetchRadiologyStatus,
    form,
    tests,
    initialForm,
    initialTests,
  ]);

  // Update patient hospital ID when patients load and form has patientId but no hospitalId
  useEffect(() => {
    if (patientsStatus === "succeeded" && form.patientId && !form.patientHospitalId) {
      const patient = patients.find(p => String(p.id || p._id) === String(form.patientId));
      if (patient) {
        const patientHospId = patient.patient_hospital_id || patient.hospitalId || patient.hospitalID || patient.code || "";
        setForm(prev => ({ ...prev, patientHospitalId: patientHospId }));
      }
    }
  }, [patientsStatus, patients, form.patientId, form.patientHospitalId]);

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

  // Update patient name suggestions from active patient visits when query changes
  useEffect(() => {
    if (!patientNameQuery) return setPatientNameSuggestions([]);
    const q = patientNameQuery.toLowerCase();
    const matches = (activePatientVisits || [])
      .map((p) => ({
        raw: p,
        id: String(p.patientVisitId || p.id || p._id || ""),
        name: p.patientName || `${p.firstName || ""} ${p.lastName || ""}`.trim(),
        display: `${p.patientName || ""} (${p.hospitalPatientId || p.patientHospitalId || "-"})`,
      }))
      .filter(
        (p) =>
          String(p.id || "").toLowerCase().includes(q) ||
          String(p.name || "").toLowerCase().includes(q)
      )
      .slice(0, 10);
    setPatientNameSuggestions(matches);
  }, [patientNameQuery, activePatientVisits]);

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

  // Populate technician name when technicians load and id is set but name is not
  useEffect(() => {
    if (techniciansStatus === "succeeded" && form.radiologyPerformedById && !form.radiologyPerformedByName) {
      const tech = technicians.find(t => String(t.id || t._id) === String(form.radiologyPerformedById));
      if (tech) {
        setForm(prev => ({ ...prev, radiologyPerformedByName: tech.name || tech.fullName || tech.firstName || "" }));
      }
    }
  }, [techniciansStatus, technicians, form.radiologyPerformedById, form.radiologyPerformedByName]);

  // Populate doctor name when doctorNameIds load and id is set but name is not
  useEffect(() => {
    // Only prefill once; after that, user is free to clear or change the text
    if (
      doctorNameIdsStatus === "succeeded" &&
      form.doctorId &&
      !form.doctorName &&
      !doctorPrefilled
    ) {
      const doc = doctorNameIds.find(d => String(d.id || d._id) === String(form.doctorId));
      if (doc) {
        setForm(prev => ({ ...prev, doctorName: doc.name || doc.fullName || "" }));
        setDoctorPrefilled(true);
      }
    }
  }, [doctorNameIdsStatus, doctorNameIds, form.doctorId, form.doctorName, doctorPrefilled]);

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
    setShowPatientNameSuggestions(false);
    setPatientNameSuggestions([]);
    setPatientNameQuery("");
  };

  const saveData = async () => {
    // run validation and stop if anything required is missing
    const { ok, errors } = validateAll();
    if (!ok) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text:
          errors && errors.length
            ? `Please correct the following: ${errors.join(", ")}.`
            : "Please fill all required fields.",
      });
      return;
    }

    // If nothing has changed compared to what was originally loaded, don't
    // call the API – just inform the user that there is nothing to update.
    if (initialForm && initialTests) {
      const formChanged =
        JSON.stringify(form || {}) !== JSON.stringify(initialForm || {});
      const testsChanged =
        JSON.stringify(tests || []) !== JSON.stringify(initialTests || []);

      if (!formChanged && !testsChanged) {
        Swal.fire({
          icon: "info",
          title: "No changes detected",
          text: "There is nothing to update. Please modify some fields before saving.",
        });
        return;
      }
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
      (Number.isNaN(doctorId) && !form.doctorName) ||
      (Number.isNaN(radiologyPerformedById) && !form.radiologyPerformedByName)
    ) {
      Swal.fire({
        icon: "error",
        title: "Invalid IDs",
        text: "Please select Patient, Doctor and Technician from suggestions or provide names.",
      });
      return;
    }

    const reportPayload = {
      patientId: patientId,
      patientVisitId: form.patientVisitId || patientId || null,
      doctorId: doctorId,
      radiologyPerformedById: radiologyPerformedById,
      reportDate: form.reportDate || "",
      imagingTime: form.imagingTime || "",
      finalSummary: form.finalSummary || "",
      reportStatus: (form.status || "PENDING").toUpperCase(),
      scanDetails: tests.map((t) => ({
        scanName: t.name || "",
        findings: t.findings || "",
        impression: t.findings || "",
        cost: parseFloat(Number(t.cost || 0).toFixed(2)) || 0,
      })),
      patientName: form.patientName || "",
      hospitalPatientId: form.patientHospitalId || "",
      patientAge: form.age || "",
      patientGender: form.gender || "",
      patientContact: form.contact || "",
      doctorName: form.doctorName || "",
      radiologyTechnicianName: form.radiologyPerformedByName || "",
      totalCost: totalAmount,
    };

    console.log("Edit Radiology Payload:", reportPayload);

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
      // Dispatch updateRadiology thunk with FormData payload
      const res = await dispatch(
        updateRadiology({ id: routeId, payload: formData })
      ).unwrap();
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Radiology report updated.",
        timer: 1400,
        showConfirmButton: false,
      });
      // Optionally navigate back to list
      navigate("/dashboard/manage-radiology-reports");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          err?.message ||
          err?.message?.message ||
          "Failed to update radiology report",
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
          <i className="fas fa-x-ray me-2"></i> Update HMS Radiology & Diagnostics
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
                        <strong>{ps.name}</strong> — {ps.raw?.patient_hospital_id || ps.id || "-"}
                      </button>
                    ))}
                  </div>
                )}
                {showPatientNameSuggestions && patientNameSuggestions.length > 0 && (
                  <div
                    className="list-group position-absolute"
                    style={{ zIndex: 999, width: "100%" }}
                  >
                    {patientNameSuggestions.map((ps, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => handleSelectPatientName(ps)}
                      >
                        {ps.display || ps.name}
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
              </div>
              <div className="col-md-3" style={{ position: "relative" }}>
                <label>Doctor Name *</label>
                <input
                  id="doctorName"
                  className="form-control"
                  value={form.doctorName}
                  onChange={handleDoctorQueryChange}
                  placeholder="Search doctor by name or ID"
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
                        {ds.name}{" "}
                        {ds.id ? (
                          <small className="text-muted">
                            {" "}
                            — #{ds.id}
                          </small>
                        ) : null}
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
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button className="btn btn-theme" onClick={saveData}>
              Update Report
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
