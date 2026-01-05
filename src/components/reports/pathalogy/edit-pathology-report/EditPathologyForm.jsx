import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  createPathology,
  resetCreateState,
  selectCreatePathologyStatus,
  selectCreatePathologyError,
} from "../../../../features/pathologySlice";
import { updatePathology } from "../../../../features/pathologySlice";
import { removePathologyFromCache } from "../../../../features/pathologySlice";
import { fetchPathologies } from "../../../../features/pathologySlice";
import {
  fetchLabTechnicians,
  selectLabTechnicians,
  selectLabTechniciansStatus,
} from "../../../../features/pathologySlice";
import { fetchPathologyById } from "../../../../features/pathologySlice";
import {
  fetchPatients,
  selectPatients,
  selectPatientsStatus,
  fetchDoctorNameIds,
  selectDoctorNameIds,
  selectDoctorNameIdsStatus,
} from "../../../../features/commanSlice";

export default function EditPathologyForm() {
  const THEME = "#01C0C8";

  const TEST_CATALOG = {
    Hemoglobin: {
      units: "g/dL",
      range: "M:13.5-17.5 / F:12.0-15.5",
      cost: 120,
    },
    "Blood Sugar (Fasting)": { units: "mg/dL", range: "70-100", cost: 80 },
    "Blood Sugar (PP)": { units: "mg/dL", range: "<140", cost: 90 },
    "Total WBC": { units: "x10^9/L", range: "4.0-11.0", cost: 100 },
    "Platelet Count": { units: "x10^9/L", range: "150-400", cost: 150 },
    TSH: { units: "µIU/mL", range: "0.4-4.0", cost: 200 },
    HBA1C: { units: "%", range: "4.0-5.6", cost: 220 },
  };

  const [tests, setTests] = useState([
    { name: "", result: "", units: "", range: "", cost: 0 },
  ]);
  const [remarks, setRemarks] = useState("");
  const [form, setForm] = useState({
    patientName: "",
    age: "",
    gender: "",
    contact: "",
    patientHospitalId: "",
    patientInternalId: "",
    doctor: "",
    doctorId: "",
    labTechnicianId: "",
    labTechnicianName: "",
    email: "",
    sampleType: "Blood",
    collectedOn: "",
    collectedTime: "",
    reportStatus: "",
  });
  const dispatch = useDispatch();
  const { id: reportId } = useParams();
  const navigate = useNavigate();
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
  const [valid, setValid] = useState({});
  const [isVisible, setIsVisible] = useState(true);
  const printRef = useRef();

  const totalTests = tests.length;
  const totalAmount = tests.reduce(
    (sum, t) => sum + (parseFloat(t.cost) || 0),
    0
  );

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    if (id === "patientName" && /[^a-zA-Z\s.]/.test(value)) return;
    if (id === "age" && /[^0-9]/.test(value)) return;
    if (id === "contact" && (/[^0-9]/.test(value) || value.length > 10)) return;
    // Allow hospital IDs with letters, numbers, hyphen, underscore, slash and spaces
    if (id === "patientHospitalId" && /[^a-zA-Z0-9\-_\/ ]/.test(value)) return;
    setForm((prev) => ({ ...prev, [id]: value }));
    if (id === "patientName" || id === "patientHospitalId") {
      const q = value.trim().toLowerCase();
      setPatientQuery(q);
      setShowPatientSuggestions(!!q);
      // clear any previously bound internal id when user types a new hospital id
      if (id === "patientHospitalId")
        setForm((prev) => ({ ...prev, patientInternalId: "" }));
    }
    if (id === "doctor") {
      const q = value.trim().toLowerCase();
      setDoctorQuery(q);
      setShowDoctorSuggestions(!!q);
      // clear any previously selected doctorId when typing
      setForm((prev) => ({ ...prev, doctorId: "" }));
    }
    if (id === "labTechnicianName") {
      const q = value.trim().toLowerCase();
      setTechnicianQuery(q);
      setShowTechnicianSuggestions(!!q);
      // clear any previously selected technician id when typing
      setForm((prev) => ({ ...prev, labTechnicianId: "" }));
    }
  };

  // Load patients for suggestions
  React.useEffect(() => {
    if (patientsStatus === "idle") dispatch(fetchPatients());
  }, [dispatch, patientsStatus]);

  const doctorNameIds = useSelector(selectDoctorNameIds) || [];
  const doctorNameIdsStatus = useSelector(selectDoctorNameIdsStatus);

  // Load doctor name-ids for doctor suggestions
  React.useEffect(() => {
    if (doctorNameIdsStatus === "idle") dispatch(fetchDoctorNameIds());
  }, [dispatch, doctorNameIdsStatus]);

  // lab technicians from pathology slice
  const labTechnicians = useSelector(selectLabTechnicians) || [];
  const labTechniciansStatus = useSelector(selectLabTechniciansStatus);

  // Load lab technicians for suggestions
  React.useEffect(() => {
    if (labTechniciansStatus === "idle") dispatch(fetchLabTechnicians());
  }, [dispatch, labTechniciansStatus]);

  // Fetch existing pathology by id and populate form
  React.useEffect(() => {
    if (!reportId) return;
    dispatch(fetchPathologyById(reportId))
      .unwrap()
      .then((data) => {
        const rec = data || {};
        // patient
        console.debug("fetchPathologyById - record:", rec);
        const patientName =
          rec.patientName ||
          rec.patient?.name ||
          rec.patientFullName ||
          rec.patient?.fullName ||
          "";

        // patient hospital id: try multiple common keys and nested locations
        const patientHospitalId =
          rec.patientHospitalId ||
          rec.hospitalPatientId ||
          rec.patient?.patient_hospital_id ||
          rec.patient?.hospitalId ||
          rec.patient_hospital_id ||
          rec.patient?.patientHospitalId ||
          rec.patient?.hospitalPatientId ||
          rec.patient?.id ||
          "";

        const patientInternalId =
          rec.patientId ||
          rec.patient?.id ||
          rec.patient?._id ||
          rec.patientInternalId ||
          null;

        // age: check direct fields, nested patient, or derive from dob
        let ageVal =
          rec.age ||
          rec.patientAge ||
          rec.ageYears ||
          rec.patient?.age ||
          rec.patient?.ageYears ||
          null;
        if (!ageVal) {
          const dob = rec.dob || rec.patient?.dob || rec.patient?.dateOfBirth;
          if (dob) {
            const bd = new Date(dob);
            if (!isNaN(bd.getTime())) {
              const diff = Date.now() - bd.getTime();
              ageVal = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
            }
          }
        }

        // contact: check several common locations
        const contactVal =
          rec.contact ||
          rec.contactNumber ||
          rec.patientContact ||
          rec.phone ||
          rec.mobile ||
          rec.patient?.contact ||
          rec.patient?.contactNumber ||
          rec.patient?.mobile ||
          rec.patient?.phone ||
          rec.contactInfo ||
          "";

        // gender: normalize to match select options (Male/Female/Other)
        let genderVal =
          rec.gender ||
          rec.sex ||
          rec.patient?.gender ||
          rec.patient?.sex ||
          "";
        if (genderVal) {
          const g = String(genderVal).toLowerCase();
          if (g.startsWith("m")) genderVal = "Male";
          else if (g.startsWith("f")) genderVal = "Female";
          else genderVal = "Other";
        }

        // email: try a few nested variants
        let emailVal =
          rec.email ||
          rec.patient?.email ||
          rec.contact?.email ||
          rec.patientContactEmail ||
          "";

        // If gender or email are still missing, try to resolve them from the
        // loaded patients list using the patient internal id returned by the
        // pathology record (rec.patientId / patientInternalId).
        try {
          const lookupId =
            patientInternalId || rec.patientId || rec.patient?.id || null;
          if (
            (patients || []).length > 0 &&
            lookupId != null &&
            !genderVal &&
            !emailVal
          ) {
            const found = (patients || []).find((p) => {
              const candidate =
                p.id || p._id || p.patientId || p.patient_id || null;
              return String(candidate) === String(lookupId);
            });
            if (found) {
              if (!genderVal) {
                const graw =
                  found.gender || found.sex || found.patient_gender || "";
                const gstr = String(graw).toLowerCase();
                if (gstr.startsWith("m")) genderVal = "Male";
                else if (gstr.startsWith("f")) genderVal = "Female";
                else if (graw) genderVal = "Other";
              }
              if (!emailVal) {
                emailVal =
                  found.email || found.contactEmail || found.emailAddress || "";
              }
            }
          } else if ((patients || []).length > 0 && lookupId != null) {
            // If one of them missing, still try to fill individually
            const found = (patients || []).find((p) => {
              const candidate =
                p.id || p._id || p.patientId || p.patient_id || null;
              return String(candidate) === String(lookupId);
            });
            if (found) {
              if (!genderVal) {
                const graw =
                  found.gender || found.sex || found.patient_gender || "";
                const gstr = String(graw).toLowerCase();
                if (gstr.startsWith("m")) genderVal = "Male";
                else if (gstr.startsWith("f")) genderVal = "Female";
                else if (graw) genderVal = "Other";
              }
              if (!emailVal)
                emailVal =
                  found.email || found.contactEmail || found.emailAddress || "";
            }
          }
        } catch (e) {
          console.debug("Patient lookup failed:", e);
        }

        console.debug("Resolved fields:", {
          patientHospitalId,
          patientInternalId,
          contactVal,
          genderVal,
          emailVal,
        });

        // doctor
        const doctorName = rec.doctorName || rec.doctor?.name || "";
        const doctorId =
          rec.doctorId || rec.doctor?.id || rec.doctor?._id || "";

        // technician
        const techName = rec.labTechnicianName || rec.labTechnician?.name || "";
        const techId =
          rec.labTechnicianId ||
          rec.labTechnician?.id ||
          rec.labTechnician?._id ||
          "";

        // tests
        const tresults = Array.isArray(rec.testResults)
          ? rec.testResults
          : rec.test_results || rec.tests || [];
        const mappedTests = (tresults || []).map((tr) => ({
          name: tr.testName || tr.name || "",
          result: tr.resultValue || tr.result || "",
          units: tr.units || "",
          range: tr.referenceRange || tr.range || "",
          cost: tr.cost || 0,
        }));

        // remarks
        const remarksVal = rec.remarks || rec.note || "";

        // collectedOn/time
        const collectedOn =
          rec.collectedOn || rec.collected_on || rec.date || "";
        let collectedTime =
          rec.collectionTime || rec.collection_time || rec.time || "";
        // normalize 'hh:mm AM/PM' -> 'HH:MM'
        if (collectedTime && /AM|PM/i.test(collectedTime)) {
          const m = collectedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (m) {
            let hh = Number(m[1]);
            const mm = m[2];
            const ap = m[3].toUpperCase();
            if (ap === "PM" && hh < 12) hh += 12;
            if (ap === "AM" && hh === 12) hh = 0;
            collectedTime = `${String(hh).padStart(2, "0")}:${mm}`;
          }
        }

        setForm((prev) => ({
          ...prev,
          patientName: patientName || prev.patientName,
          age: ageVal || prev.age,
          gender: genderVal || prev.gender,
          contact: contactVal || prev.contact,
          email: emailVal || prev.email,
          patientHospitalId: patientHospitalId || prev.patientHospitalId,
          patientInternalId: patientInternalId || prev.patientInternalId,
          doctor: doctorName || prev.doctor,
          doctorId: doctorId || prev.doctorId,
          labTechnicianName: techName || prev.labTechnicianName,
          labTechnicianId: techId || prev.labTechnicianId,
          sampleType: rec.sampleType || rec.sample_type || prev.sampleType,
          collectedOn: collectedOn || prev.collectedOn,
          collectedTime: collectedTime || prev.collectedTime,
          reportStatus: rec.reportStatus || rec.status || "PENDING",
        }));
        if (mappedTests.length) setTests(mappedTests);
        setRemarks(remarksVal);
      })
      .catch((err) => {
        console.error("Failed to fetch pathology:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to load",
          text: "Unable to fetch pathology data.",
        });
      });
  }, [dispatch, reportId, patients]);

  // Update suggestions when patientQuery or patients change
  React.useEffect(() => {
    if (!patientQuery) return setPatientSuggestions([]);
    const q = patientQuery.toLowerCase();
    const matches = (patients || [])
      .map((p) => ({
        raw: p,
        id:
          p.patient_hospital_id || p.hospitalId || p.hospitalID || p.code || "",
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

  // Update doctor suggestions when doctorQuery or fetched doctorNameIds change
  React.useEffect(() => {
    // debug log: show loaded doctorNameIds and current query
    console.debug(
      "doctorNameIdsStatus:",
      doctorNameIdsStatus,
      "count:",
      (doctorNameIds || []).length
    );
    console.debug("doctorQuery:", doctorQuery);
    if (!doctorQuery) {
      setDoctorSuggestions([]);
      return;
    }
    const q = doctorQuery.toLowerCase();
    const matches = (doctorNameIds || [])
      .map((d) => ({ id: String(d.id || ""), name: d.name || "" }))
      .filter(
        (d) =>
          d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)
      )
      .slice(0, 10);
    console.debug("Doctor Matches:", matches);
    setDoctorSuggestions(matches);
  }, [doctorQuery, doctorNameIds]);

  // show top doctors when input is focused (helps debugging/makes suggestions discoverable)
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
      // trigger fetch if somehow still idle
      if (doctorNameIdsStatus === "idle") dispatch(fetchDoctorNameIds());
      setShowDoctorSuggestions(true);
    }
  };

  // Update technician suggestions when query or labTechnicians change
  React.useEffect(() => {
    if (!technicianQuery) return setTechnicianSuggestions([]);
    const q = technicianQuery.toLowerCase();
    const matches = (labTechnicians || [])
      .map((t) => ({ id: String(t.id || ""), name: t.name || "" }))
      .filter(
        (t) =>
          t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
      )
      .slice(0, 10);
    setTechnicianSuggestions(matches);
  }, [technicianQuery, labTechnicians]);

  const handleTechnicianFocus = () => {
    if ((labTechnicians || []).length > 0) {
      const top = (labTechnicians || [])
        .slice(0, 10)
        .map((t) => ({ id: String(t.id || ""), name: t.name || "" }));
      setTechnicianSuggestions(top);
      setShowTechnicianSuggestions(true);
    } else if (labTechniciansStatus === "loading") {
      setShowTechnicianSuggestions(true);
    } else {
      if (labTechniciansStatus === "idle") dispatch(fetchLabTechnicians());
      setShowTechnicianSuggestions(true);
    }
  };

  const handleSelectTechnician = (t) => {
    setForm((prev) => ({
      ...prev,
      labTechnicianName: t.name || "",
      labTechnicianId: t.id || "",
    }));
    setShowTechnicianSuggestions(false);
    setTechnicianSuggestions([]);
    setTechnicianQuery("");
  };

  const handleSelectPatient = (p) => {
    const raw = p.raw || p;
    const hospId =
      raw.patient_hospital_id ||
      raw.hospitalId ||
      raw.hospitalID ||
      raw.code ||
      "";
    const name =
      raw.name || `${raw.firstName || ""} ${raw.lastName || ""}`.trim();
    // determine age: prefer explicit age, fallback to ageYears, then derive from dob if present
    let ageVal = raw.age || raw.ageYears;
    if (!ageVal && raw.dob) {
      const bd = new Date(raw.dob);
      if (!isNaN(bd.getTime())) {
        const diff = Date.now() - bd.getTime();
        ageVal = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
      }
    }

    // normalize gender to match select options (Male/Female/Other)
    let genderVal = (raw.gender && String(raw.gender)) || "";
    if (genderVal) {
      const g = genderVal.toLowerCase();
      if (g.startsWith("m")) genderVal = "Male";
      else if (g.startsWith("f")) genderVal = "Female";
      else genderVal = "Other";
    }

    // contact may be present in different fields (contactInfo, contactNumber, mobile, phone)
    const contactVal =
      raw.contactInfo ||
      raw.contactNumber ||
      raw.mobile ||
      raw.phone ||
      raw.contact ||
      "";

    setForm((prev) => ({
      ...prev,
      patientHospitalId: hospId || String(raw.id || ""),
      patientInternalId: raw.id || "",
      patientName: name,
      age: ageVal || prev.age,
      gender: genderVal || prev.gender,
      contact: contactVal || prev.contact,
      email: raw.email || prev.email,
    }));
    setShowPatientSuggestions(false);
    setPatientSuggestions([]);
    setPatientQuery("");
  };

  const handleSelectDoctor = (d) => {
    setForm((prev) => ({
      ...prev,
      doctor: d.name || "",
      doctorId: d.id || "",
    }));
    setShowDoctorSuggestions(false);
    setDoctorSuggestions([]);
    setDoctorQuery("");
  };

  const handleAddTest = () =>
    setTests([
      ...tests,
      { name: "", result: "", units: "", range: "", cost: 0 },
    ]);
  const handleClearTests = () =>
    setTests([{ name: "", result: "", units: "", range: "", cost: 0 }]);

  const handleTestChange = (index, key, value) => {
    const newTests = [...tests];
    if (key === "cost" && /[^0-9.]/.test(value)) return;
    newTests[index][key] = value;
    if (key === "name") {
      const t = TEST_CATALOG[value.trim()];
      newTests[index].units = t ? t.units : "";
      newTests[index].range = t ? t.range : "";
      newTests[index].cost = t ? t.cost : 0;
    }
    setTests(newTests);
  };

  const removeTestRow = (index) => {
    const newTests = tests.filter((_, i) => i !== index);
    setTests(
      newTests.length
        ? newTests
        : [{ name: "", result: "", units: "", range: "", cost: 0 }]
    );
  };

  const validateAll = () => {
    const newValid = {};
    let ok = true;
    const required = {
      patientName: /^[A-Za-z\s.]{3,60}$/,
      age: /^[0-9]{1,3}$/,
      gender: /.+/,
      contact: /^[0-9]{10}$/,
      // Accept alphanumeric, hyphen, underscore, slash and spaces; 1-50 chars
      patientHospitalId: /^[A-Za-z0-9\-_\/ ]{1,50}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    };
    Object.entries(required).forEach(([k, regex]) => {
      const raw = form[k];
      const sval = raw == null ? "" : String(raw);
      const v = sval.trim();
      if (!regex.test(v)) {
        newValid[k] = false;
        ok = false;
      } else newValid[k] = true;
    });
    setValid(newValid);
    const invalidFields = Object.keys(newValid).filter((k) => !newValid[k]);
    return { ok, invalidFields };
  };

  const handleSave = () => {
    const { ok, invalidFields } = validateAll();
    if (!ok) {
      const pretty = invalidFields
        .map((f) => `- ${f.replace(/([A-Z])/g, " $1").trim()}`)
        .join("\n");
      Swal.fire({
        icon: "warning",
        title: "Validation failed",
        html: `<pre style=\"text-align:left\">${pretty}</pre>`,
        text: "Please correct the highlighted fields before saving.",
      });
      console.debug("Validation failed fields:", invalidFields, "form:", form);
      return;
    }
    // build payload matching backend contract
    const collectionTime = (() => {
      const t = form.collectedTime || "";
      if (!t) return "";
      const [hh, mm] = t.split(":");
      let hour = Number(hh);
      const suffix = hour >= 12 ? "PM" : "AM";
      if (hour === 0) hour = 12;
      if (hour > 12) hour = hour - 12;
      return `${String(hour).padStart(2, "0")}:${mm} ${suffix}`;
    })();

    // Determine numeric patientId to send. Prefer selected internal id, else try to lookup by hospital id.
    let patientIdToSend = null;
    if (
      form.patientInternalId &&
      !Number.isNaN(Number(form.patientInternalId))
    ) {
      patientIdToSend = Number(form.patientInternalId);
    } else if (!Number.isNaN(Number(form.patientHospitalId))) {
      patientIdToSend = Number(form.patientHospitalId);
    } else {
      // try to find patient by hospital id from loaded patients
      const found = (patients || []).find((pt) => {
        const hid =
          pt.patient_hospital_id ||
          pt.hospitalId ||
          pt.hospitalID ||
          pt.code ||
          "";
        return (
          String(hid).toLowerCase() ===
          String(form.patientHospitalId || "").toLowerCase()
        );
      });
      if (found && (found.id || found._id || found.patientId)) {
        patientIdToSend = Number(found.id || found._id || found.patientId);
      }
    }

    if (patientIdToSend == null || Number.isNaN(patientIdToSend)) {
      Swal.fire({
        icon: "error",
        title: "Select Patient",
        text: "Please select the patient from suggestions so a valid internal patient id is available.",
      });
      return;
    }

    // Resolve labTechnicianId: prefer numeric, else try to extract digits, otherwise block submit
    let labTechnicianIdToSend = null;
    const rawLab = form.labTechnicianId;
    if (
      rawLab !== null &&
      rawLab !== undefined &&
      String(rawLab).trim() !== ""
    ) {
      if (!Number.isNaN(Number(rawLab))) {
        labTechnicianIdToSend = Number(rawLab);
      } else {
        const m = String(rawLab).match(/\d+/);
        if (m) labTechnicianIdToSend = Number(m[0]);
        else {
          Swal.fire({
            icon: "error",
            title: "Invalid Lab Technician ID",
            text: "Please provide a numeric lab technician id (e.g. 12) or select a technician.",
          });
          return;
        }
      }
    }

    const payload = {
      patientId: patientIdToSend,
      // also include patient-level fields so backend can update patient info
      patientName: form.patientName || undefined,
      patientHospitalId: form.patientHospitalId || undefined,
      age: form.age || undefined,
      gender: form.gender || undefined,
      contact: form.contact || undefined,
      email: form.email || undefined,
      doctorId:
        form.doctorId && !Number.isNaN(Number(form.doctorId))
          ? Number(form.doctorId)
          : form.doctorId || null,
      labTechnicianId: labTechnicianIdToSend || null,
      sampleType: form.sampleType || "",
      collectedOn: form.collectedOn || "",
      collectionTime: collectionTime,
      remarks: remarks || "",
      totalCost: parseFloat(Number(totalAmount).toFixed(2)) || 0,
      reportStatus: form.reportStatus || "PENDING",
      testResults: tests.map((t) => ({
        testName: t.name || "",
        resultValue: t.result || "",
        units: t.units || "",
        referenceRange: t.range || "",
        cost: parseFloat(Number(t.cost || 0).toFixed(2)) || 0,
      })),
    };

    console.debug("Submitting pathology payload:", payload);

    // Use updatePathology thunk to update an existing report
    dispatch(updatePathology({ reportId: reportId, payload }))
      .unwrap()
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Pathology updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        // reset form (optional)
        setForm({
          patientName: "",
          age: "",
          gender: "",
          contact: "",
          patientHospitalId: "",
          patientInternalId: "",
          doctor: "",
          doctorId: "",
          labTechnicianId: "",
          labTechnicianName: "",
          email: "",
          sampleType: "Blood",
          collectedOn: "",
          collectedTime: "",
          reportStatus: "",
        });
        setTests([{ name: "", result: "", units: "", range: "", cost: 0 }]);
        setRemarks("");
        // refetch pathologies to update the list
        dispatch(fetchPathologies());
        // hide this form and navigate back to manage list
        setIsVisible(false);
        navigate("/dashboard/manage-pathology-reports");
      })
      .catch((err) => {
        const text =
          (err && (err.message || JSON.stringify(err))) ||
          "Failed to update pathology";
        Swal.fire({ icon: "error", title: "Error", text });
      });
  };
  const handlePrint = () => {
    const { ok } = validateAll();
    if (ok) window.print();
  };

  return (
    isVisible && (
      <div className="container p-0 m-0" ref={printRef}>
        <style>{`
        body { font-family: Inter, sans-serif; background:#f2fbfc; }
        .card-main { background:white; border-radius:12px 12px 0 0; margin:0 auto; padding:0; box-shadow:0 4px 12px rgba(0,0,0,0.05); overflow:hidden; }
        .card-header { background:${THEME}; color:white; text-align:center; padding:12px 0; font-size:22px; font-weight:600; border-radius:12px 12px 0 0; }
        .card-body { padding:20px; }
        .section-title { background:${THEME}; color:white; font-weight:600; margin-bottom:10px; font-size:18px; padding:6px 10px; border-radius:4px; }
        .btn-theme { background:${THEME}; color:white; border:none; }
        .btn-outline-theme { border:1px solid ${THEME}; color:${THEME}; background:white; }
        .table thead { background:#f6ffff; }
        .no-print { display:inline; }
        .table td, .table th { vertical-align: middle !important; }
        .form-control-sm { padding:3px 6px; font-size:0.875rem; }
        @media print { .no-print { display:none !important; } .card-main { box-shadow:none; border-radius:0; } }
      `}</style>

        <div className="card-main">
          <div className="card-header">
            <i className="fas fa-vials me-2"></i> Update Pathology & Diagnostics
          </div>

          <div className="card-body">
            {/* Patient Info */}
            <div className="mb-3">
              <div className="section-title">Patient Information</div>
              <div className="row g-3">
                <div className="col-md-4">
                  <label>Patient Name</label>
                  <input
                    id="patientName"
                    className={`form-control ${
                      valid.patientName === false ? "is-invalid" : ""
                    }`}
                    value={form.patientName}
                    onChange={handleFormChange}
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div className="col-md-2">
                  <label>Age</label>
                  <input
                    id="age"
                    type="number"
                    className={`form-control ${
                      valid.age === false ? "is-invalid" : ""
                    }`}
                    value={form.age}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-md-2">
                  <label>Gender</label>
                  <select
                    id="gender"
                    className={`form-select ${
                      valid.gender === false ? "is-invalid" : ""
                    }`}
                    value={form.gender}
                    onChange={handleFormChange}
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label>Contact Number</label>
                  <input
                    id="contact"
                    type="number"
                    className={`form-control ${
                      valid.contact === false ? "is-invalid" : ""
                    }`}
                    value={form.contact}
                    onChange={handleFormChange}
                    placeholder="10-digit number"
                  />
                </div>
                <div className="col-md-3">
                  <label>Patient Hospital ID</label>
                  <input
                    id="patientHospitalId"
                    className={`form-control ${
                      valid.patientHospitalId === false ? "is-invalid" : ""
                    }`}
                    value={form.patientHospitalId}
                    onChange={handleFormChange}
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
                          <strong>
                            {ps.raw?.patient_hospital_id || ps.id || "-"}
                          </strong>{" "}
                          — {ps.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-md-4">
                  <label>Referring Doctor</label>
                  <input
                    id="doctor"
                    className="form-control"
                    value={form.doctor}
                    onChange={handleFormChange}
                    onFocus={handleDoctorFocus}
                    placeholder="Dr. Mehta"
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

                <div className="col-md-3">
                  <label>Email</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>

            {/* Sample & Billing */}
            <div className="mb-3 row">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="section-title">Sample Details</div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Sample Type</label>
                      <select
                        id="sampleType"
                        className="form-select"
                        value={form.sampleType}
                        onChange={handleFormChange}
                      >
                        <option>Blood</option>
                        <option>Urine</option>
                        <option>Stool</option>
                        <option>Swab</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label>Collected On</label>
                      <input
                        id="collectedOn"
                        type="date"
                        className="form-control"
                        value={form.collectedOn}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label>Collection Time</label>
                      <input
                        id="collectedTime"
                        type="time"
                        className="form-control"
                        value={form.collectedTime}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="col-md-6" style={{ position: "relative" }}>
                      <label>Lab Technician</label>
                      <input
                        id="labTechnicianName"
                        className="form-control"
                        value={form.labTechnicianName || ""}
                        onChange={handleFormChange}
                        onFocus={handleTechnicianFocus}
                        placeholder="Search technician by name"
                      />
                      {showTechnicianSuggestions && (
                        <div
                          className="list-group position-absolute"
                          style={{ zIndex: 999 }}
                        >
                          {labTechniciansStatus === "loading" && (
                            <div className="list-group-item">Loading...</div>
                          )}
                          {labTechniciansStatus === "failed" && (
                            <button
                              type="button"
                              className="list-group-item list-group-item-action text-danger"
                              onClick={() => dispatch(fetchLabTechnicians())}
                            >
                              Failed to load technicians — Retry
                            </button>
                          )}
                          {labTechniciansStatus !== "loading" &&
                            labTechniciansStatus !== "failed" &&
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
                      <label>Report Status</label>
                      <select
                        id="reportStatus"
                        className="form-select"
                        value={form.reportStatus}
                        onChange={handleFormChange}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="DELIVERED">Delivered</option>
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
                      <strong>Tests Count:</strong> {totalTests}
                    </div>
                    <div>
                      <strong>Total (₹):</strong> {totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="mb-3">
              <div className="section-title">Test Results</div>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Result</th>
                      <th>Units</th>
                      <th>Range</th>
                      <th>Cost</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((t, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            list="testList"
                            className="form-control form-control-sm"
                            value={t.name}
                            onChange={(e) =>
                              handleTestChange(i, "name", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={t.result}
                            onChange={(e) =>
                              handleTestChange(i, "result", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={t.units}
                            readOnly
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            value={t.range}
                            readOnly
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            type="number"
                            value={t.cost}
                            onChange={(e) =>
                              handleTestChange(i, "cost", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            style={{ padding: "0 6px" }}
                            onClick={() => removeTestRow(i)}
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
                  onClick={handleAddTest}
                >
                  + Add Test
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleClearTests}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Remarks */}
            <div className="mb-3">
              <div className="section-title">Remarks</div>
              <textarea
                rows="4"
                className="form-control"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
            </div>

            <div className="d-flex justify-content-center gap-2 mb-3 no-print">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  // Cancel: remove from local cache and return to manage page
                  try {
                    // Remove from localStorage cache used by the manage list
                    const LS_KEY = "hms_path_reports";
                    const list = JSON.parse(
                      localStorage.getItem(LS_KEY) || "[]"
                    );
                    const updated = list.filter(
                      (x) => String(x.id) !== String(reportId)
                    );
                    localStorage.setItem(LS_KEY, JSON.stringify(updated));
                  } catch (e) {
                    console.warn("Failed to update localStorage on cancel:", e);
                  }
                  // remove from redux cached pathologies so manage page reflects removal
                  if (reportId) dispatch(removePathologyFromCache(reportId));
                  setIsVisible(false);
                  // navigate back to manage list
                  navigate("/dashboard/manage-pathology-reports");
                }}
              >
                Cancel
              </button>
              <button className="btn btn-theme" onClick={handleSave}>
                Update Report
              </button>
            </div>

            <datalist id="testList">
              {Object.keys(TEST_CATALOG).map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
        </div>
      </div>
    )
  );
}
