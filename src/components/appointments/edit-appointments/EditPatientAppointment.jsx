import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  selectPatients,
  selectDepartments,
  fetchPatients,
  fetchDepartments,
} from "../../../features/commanSlice";
import {
  createAppointment,
  updateAppointment,
} from "../../../features/appointmentSlice";
import Swal from "sweetalert2";
import { useParams, useNavigate, useLocation } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EditPatientAppointment() {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const appointmentId = params?.id || null;
  const location = useLocation();
  const isFromList = location?.state?.fromList === true;
  const navAppointment = location?.state?.appointment || null;

  // Helper to get today's date in YYYY-MM-DD format (local time)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Ref to track last valid date
  const lastValidDateRef = useRef(getTodayDate());

  // Helper function to check if date is in the past (local time)
  const isPastDate = (dateString) => {
    if (!dateString) return true;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    return dateString < todayString;
  };

  // Read from Redux only
  const patients = useSelector(selectPatients);
  const storeDepartments = useSelector(selectDepartments);

  const [selectedPatientHospitalId, setSelectedPatientHospitalId] =
    useState("");
  const [patientId, setPatientId] = useState(null);
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
  // Initialize appointmentDate with today's date
  const [appointmentDate, setAppointmentDate] = useState(getTodayDate());
  const [appointmentTime, setAppointmentTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [status, setStatus] = useState("SCHEDULED");
  const [appointmentLoaded, setAppointmentLoaded] = useState(false);
  const [prefilling, setPrefilling] = useState(false);

  // store departments into local state
  useEffect(() => {
    setDepartments(Array.isArray(storeDepartments) ? storeDepartments : []);
  }, [storeDepartments]);

  // autofill patient info when a patient_hospital_id is selected
  useEffect(() => {
    if (!selectedPatientHospitalId) return;
    if (prefilling) return; // avoid overwriting fields during initial prefill

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
      // In edit mode, don't clear if we don't find the patient in store
      if (appointmentId) return;

      // Only clear for create flow when no selection data is available
      setAge("");
      setGender("");
      setPhone("");
      setAddress("");
    }
  }, [
    selectedPatientHospitalId,
    patients,
    appointmentId,
    appointmentLoaded,
    prefilling,
  ]);

  // submit appointment
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: prevent past date selection
    if (appointmentDate && isPastDate(appointmentDate)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Date",
        text: "Cannot select a past date",
      });
      return;
    }

    // Try to find patient in Redux store first
    const patient = (patients || []).find(
      (p) =>
        String(p.patient_hospital_id) === String(selectedPatientHospitalId) ||
        String(p.id) === String(selectedPatientHospitalId)
    );

    // Use patient from store, or fallback to stored patientId state
    const patientIdFromStore = patient?.id;
    const finalPatientId = patientIdFromStore || patientId;

    if (!finalPatientId) {
      Swal.fire({
        icon: "error",
        title: "No patient",
        text: "Please select a patient",
      });
      return;
    }

    // doctor id resolution
    let doctorId = null;
    if (selectedDoctorId) {
      const asNum = Number(selectedDoctorId);
      if (!Number.isNaN(asNum)) {
        doctorId = asNum;
      }
    }

    if (!doctorId) {
      Swal.fire({
        icon: "error",
        title: "Doctor required",
        text: "Please select a valid doctor.",
      });
      return;
    }

    const payload = {
      patientId: finalPatientId,
      doctorId,
      departmentId: Number(selectedDepartmentId) || null,
      appointmentDate,
      appointmentTime,
      status,
      symptoms,
    };

    // delegate snake_case conversion to thunks if used; keep for backwards compatibility
    payload.patient_id = payload.patientId;
    payload.doctor_id = payload.doctorId;
    payload.department_id = payload.departmentId;

    try {
      if (appointmentId) {
        // Edit existing appointment via Redux thunk
        const res = await dispatch(
          updateAppointment({ id: appointmentId, data: payload })
        ).unwrap();
        const successMsg =
          res?.message ?? res?.data?.message ?? "Appointment updated";
        await Swal.fire({ icon: "success", title: successMsg });
        navigate("/dashboard/view-patient-appointments");
      } else {
        const res = await dispatch(createAppointment(payload)).unwrap();
        const successMsg =
          res?.message ?? res?.data?.message ?? "Appointment created";
        await Swal.fire({ icon: "success", title: successMsg });

        // Reset
        setSelectedPatientHospitalId("");
        setPatientQuery("");
        setAge("");
        setGender("");
        setPhone("");
        setAddress("");
        setSelectedDepartmentId("");
        setDoctors([]);
        setSelectedDoctorId("");
        setAppointmentDate(getTodayDate());
        setAppointmentTime("");
        setSymptoms("");
        setStatus("SCHEDULED");
      }
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message || err?.message || JSON.stringify(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: backendMsg,
      });
    }
  };

  // If editing an appointment, fetch its data and populate the form
  useEffect(() => {
    // Validate appointment ID - must be a valid number
    const isValidId = appointmentId &&
                      appointmentId !== "all" &&
                      !isNaN(Number(appointmentId)) &&
                      String(appointmentId).trim().length > 0;

    if (!isValidId) {
      Swal.fire({
        icon: "error",
        title: "Invalid Appointment",
        text: "Please select a valid appointment to edit",
      }).then(() => {
        window.location.replace("/dashboard/view-patient-appointments");
      });
      return;
    }

    // Only auto-fetch & populate when the user navigated from the appointments list
    // (clicking Edit). When the page is loaded directly / refreshed we skip populating
    // so patient contact fields remain empty as requested.
    if (!appointmentId || !isFromList) return;

    // If the link passed the appointment in navigation state, use it for instant population
    if (navAppointment) {
      setPrefilling(true);
      const data = navAppointment || {};

      const pid = data.patient_id ?? data.patientId ?? data.patient?.id;
      const doctor = data.doctor_id ?? data.doctorId ?? data.doctor?.id;
      const dept =
        data.department_id ?? data.departmentId ?? data.department?.id;

      // Use patient's hospital id for selection if available
      const patientHospitalId =
        data.patientHospitalId ??
        data.patient_hospital_id ??
        data.patient?.patientHospitalId ??
        data.patient?.patient_hospital_id ??
        pid;
      setSelectedPatientHospitalId(patientHospitalId || "");
      setPatientId(pid || null);

      // Find the patient in the store using hospital ID to get full details (gender, address)
      const fullPatient = patients.find(
        (p) =>
          String(p.patient_hospital_id || p.patientHospitalId) ===
            String(patientHospitalId) || String(p.id) === String(pid)
      );

      // Populate patient display/name
      const patientObj = data.patient || fullPatient || null;
      const nameFromData =
        (patientObj && (patientObj.firstName || patientObj.first_name)) ||
        data.patientName ||
        data.patient ||
        "";
      const lastFromData =
        (patientObj && (patientObj.lastName || patientObj.last_name)) || "";
      const displayName = `${nameFromData} ${lastFromData}`.trim();
      setPatientQuery(
        displayName ? `${displayName} (${patientHospitalId || ""})` : ""
      );

      // Populate patient contact fields - prefer full patient from store, fallback to appointment data
      setAge(
        fullPatient?.age ?? patientObj?.age ?? data.age ?? data.patientAge ?? ""
      );
      setGender(
        fullPatient?.gender ??
          patientObj?.gender ??
          data.gender ??
          data.patientGender ??
          ""
      );
      setPhone(
        fullPatient?.contactInfo ??
          fullPatient?.emergencyContact ??
          patientObj?.contactInfo ??
          patientObj?.emergencyContact ??
          data.contactInfo ??
          data.phone ??
          data.patientPhone ??
          data.patientContact ??
          ""
      );

      const addrSource =
        fullPatient?.address || patientObj?.address || data.address || null;
      const addrVal = addrSource
        ? `${addrSource.addressLine || addrSource.address_line || ""}, ${
            addrSource.city || ""
          }, ${addrSource.state || ""} ${
            addrSource.pincode || addrSource.postal || ""
          }`
            .trim()
            .replace(/^,\s*|,\s*$/g, "")
            .replace(/,\s*,/g, ",")
        : "";
      setAddress(addrVal);

      setSelectedDepartmentId(dept ? String(dept) : "");
      setSelectedDoctorId(doctor ? String(doctor) : "");

      // Set appointment date, but if it's in the past, use today's date
      const fetchedDate = data.appointmentDate ?? data.appointment_date ?? "";
      setAppointmentDate(
        fetchedDate && !isPastDate(fetchedDate) ? fetchedDate : getTodayDate()
      );
      setAppointmentTime(data.appointmentTime ?? data.appointment_time ?? "");
      setSymptoms(data.symptoms ?? "");
      setStatus(data.status ?? "SCHEDULED");

      // load doctors for department if present and fetch patient details if missing
      (async () => {
        if (dept) {
          try {
            const dr = await axios.get(`${API_BASE_URL}/doctor/${dept}`);
            setDoctors(dr.data || []);
          } catch {
            // ignore
          }
        }

        // ensure departments loaded if needed
        if (
          dept &&
          (!Array.isArray(storeDepartments) || storeDepartments.length === 0)
        ) {
          try {
            await dispatch(fetchDepartments()).unwrap();
          } catch {
            // ignore
          }
        }

        // If we couldn't get full patient details from store initially, fetch patients now
        if (!fullPatient && patientHospitalId) {
          try {
            const fetched = await dispatch(fetchPatients()).unwrap();
            const list = Array.isArray(fetched) ? fetched : fetched?.data || [];
            const found = list.find(
              (x) =>
                String(x.patient_hospital_id || x.patientHospitalId) ===
                  String(patientHospitalId) || String(x.id) === String(pid)
            );
            if (found) {
              setGender((prev) => prev || found.gender || "");
              const addrSrc = found.address || null;
              const addrText = addrSrc
                ? `${addrSrc.addressLine || addrSrc.address_line || ""}, ${
                    addrSrc.city || ""
                  }, ${addrSrc.state || ""} ${
                    addrSrc.pincode || addrSrc.postal || ""
                  }`
                    .trim()
                    .replace(/^,\s*|,\s*$/g, "")
                    .replace(/,\s*,/g, ",")
                : "";
              setAddress((prev) => prev || addrText);
              setPhone(
                (prev) =>
                  prev || found.contactInfo || found.emergencyContact || ""
              );
              setAge((prev) => prev || found.age || "");
            }
          } catch {
            // ignore
          }
        }
      })();

      setAppointmentLoaded(true);
      setPrefilling(false);
      return;
    }

    let mounted = true;
    (async () => {
      setPrefilling(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/appointment/${appointmentId}`
        );
        const data = res.data || {};
        if (!mounted) return;

        // Map backend fields to our form
        const pid = data.patient_id ?? data.patientId ?? data.patient?.id;
        const doctor = data.doctor_id ?? data.doctorId ?? data.doctor?.id;
        const dept =
          data.department_id ?? data.departmentId ?? data.department?.id;

        // Use patient's hospital id for selection if available
        const patientHospitalId =
          data.patient_hospital_id ?? data.patient?.patient_hospital_id ?? pid;
        setSelectedPatientHospitalId(patientHospitalId || "");
        setPatientId(pid || null);

        // Populate patient display/name and contact fields from fetched data
        let patientObj = data.patient || null;

        // If appointment response did not include patient details, try to find in redux store
        if (!patientObj && pid) {
          const found = (patients || []).find(
            (x) =>
              String(x.id) === String(pid) ||
              String(x.patient_hospital_id) === String(patientHospitalId)
          );
          if (found) {
            patientObj = found;
          } else {
            try {
              const fetched = await dispatch(fetchPatients()).unwrap();
              const list = Array.isArray(fetched)
                ? fetched
                : fetched?.data || [];
              const found2 = list.find(
                (x) =>
                  String(x.id) === String(pid) ||
                  String(x.patient_hospital_id) === String(patientHospitalId)
              );
              if (found2) patientObj = found2;
            } catch {
              // ignore
            }
          }
        }

        const nameFromData =
          (patientObj && (patientObj.firstName || patientObj.first_name)) ||
          data.patientName ||
          "";
        const lastFromData =
          (patientObj && (patientObj.lastName || patientObj.last_name)) || "";
        const displayName = `${nameFromData} ${lastFromData}`.trim();
        setPatientQuery(
          displayName ? `${displayName} (${patientHospitalId || ""})` : ""
        );

        // Fill age/gender/phone/address from all possible sources
        setAge(patientObj?.age ?? data.age ?? data.patientAge ?? "");
        setGender(
          patientObj?.gender ?? data.gender ?? data.patientGender ?? ""
        );
        setPhone(
          patientObj?.contactInfo ??
            patientObj?.emergencyContact ??
            data.contactInfo ??
            data.phone ??
            data.patientPhone ??
            data.patientContact ??
            ""
        );

        const addrFromData = patientObj?.address || data.address || null;
        const addr = addrFromData
          ? `${addrFromData.addressLine || addrFromData.address_line || ""}, ${
              addrFromData.city || ""
            }, ${addrFromData.state || ""} ${
              addrFromData.pincode || addrFromData.postal || ""
            }`
          : "";
        setAddress(addr);

        // Normalize ids to strings for select controls
        setSelectedDepartmentId(dept ? String(dept) : "");
        setSelectedDoctorId(doctor ? String(doctor) : "");

        // If department is present but store doesn't have departments loaded, fetch them
        if (
          dept &&
          (!Array.isArray(storeDepartments) || storeDepartments.length === 0)
        ) {
          try {
            await dispatch(fetchDepartments()).unwrap();
          } catch {
            // ignore
          }
        }

        // Set appointment date, but if it's in the past, use today's date
        const fetchedDate = data.appointmentDate ?? data.appointment_date ?? "";
        setAppointmentDate(
          fetchedDate && !isPastDate(fetchedDate) ? fetchedDate : getTodayDate()
        );
        setAppointmentTime(data.appointmentTime ?? data.appointment_time ?? "");
        setSymptoms(data.symptoms ?? "");
        setStatus(data.status ?? "SCHEDULED");

        // load doctors for department if present
        if (dept) {
          try {
            const dr = await axios.get(`${API_BASE_URL}/doctor/${dept}`);
            if (mounted) setDoctors(dr.data || []);
          } catch {
            // ignore
          }
        }
        // mark that appointment data has been applied to the form
        setAppointmentLoaded(true);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Failed to load appointment",
          text: err?.message || "",
        });
      }
      setPrefilling(false);
    })();

    return () => {
      mounted = false;
    };
  }, [
    appointmentId,
    dispatch,
    patients,
    storeDepartments,
    isFromList,
    navAppointment,
  ]);

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
            {/* Patient Search */}
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
              />
            </div>

            {/* Departments */}
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
                    setDoctors(res.data || []);
                  } catch (err) {
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
                    {d.department_name || d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctors */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Select Doctor</label>
              <select
                className="form-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                <option value="">-- Select doctor --</option>
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

            {/* Appointment date */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Appointment Date</label>
              <input
                type="date"
                className="form-control"
                required
                value={appointmentDate}
                min={getTodayDate()}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  // Prevent past dates
                  if (!selectedDate || isPastDate(selectedDate)) {
                    Swal.fire({
                      icon: "error",
                      title: "Invalid Date",
                      text: "Cannot select a past date. Please select today or a future date.",
                    });
                    // Reset to last valid date
                    setAppointmentDate(lastValidDateRef.current);
                    return;
                  }
                  // Update last valid date when a valid date is selected
                  lastValidDateRef.current = selectedDate;
                  setAppointmentDate(selectedDate);
                }}
              />
            </div>

            {/* Time */}
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

          {/* Submit */}
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

