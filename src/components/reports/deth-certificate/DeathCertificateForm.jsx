import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  searchPatients,
  selectPatients,
  selectPatientsStatus,
  selectPatientsError,
  createDeathCertificate,
  fetchDeathCertificates,
} from "../../../features/birthAndDethSlice";

const DeathCertificateForm = () => {
  const [form, setForm] = useState({
    hospitalName: "HarishChandra Hospital",
    certNumber: "",
    deceasedName: "",
    gender: "",
    deathDate: "",
    birthDate: "",
    deathTime: "",
    age: "",
    cause: "",
    place: "",
    address: "",
    contactNumber: "",
    hospitalPatientId: "",
    patientId: null,
    doctor: "",
    signatory: "",
    issueDate: "",
  });

  const [patientSearch, setPatientSearch] = useState("");
  // patients are now stored in Redux; keep local filtered list only
  const [patientsLocal, setPatientsLocal] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [ageDetail, setAgeDetail] = useState("");
  // ✅ Existing handleChange
  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const dispatch = useDispatch();
  const patients = useSelector(selectPatients);
  const patientsStatus = useSelector(selectPatientsStatus);
  const patientsError = useSelector(selectPatientsError);

  // Load patients into Redux on mount
  useEffect(() => {
    dispatch(searchPatients());
  }, [dispatch]);

  // Normalize Redux patients into a local consistent shape for filtering
  useEffect(() => {
    const normalized = (patients || []).map((p) => {
      if (!p || typeof p !== "object") return p;
      const id = p.id ?? p.patientId ?? p._id ?? null;
      const name = p.name ?? p.fullName ?? p.patient_name ?? "";
      const hospital_patient_id =
        p.hospital_patient_id ?? p.hospitalPatientId ?? p.hospital_id ?? "";
      const contactNumber =
        p.contactNumber ?? p.contact_number ?? p.phone ?? p.mobile ?? "";
      const address = p.address ?? p.addr ?? p.addressLine ?? "";
      const attendingDoctor =
        p.attendingDoctor ??
        p.attending_doctor ??
        p.doctor ??
        p.attDoctor ??
        "";
      const gender = p.gender ?? p.sex ?? "";
      const birthDate =
        p.birthDate ?? p.dob ?? p.date_of_birth ?? p.DOB ?? p.birth_date ?? "";
      return {
        ...p,
        id,
        name,
        hospital_patient_id,
        contactNumber,
        address,
        attendingDoctor,
        gender,
        birthDate,
      };
    });
    setPatientsLocal(normalized);
  }, [patients]);

  // Calculate age when DOB or Date of Death changes
  useEffect(() => {
    const dobStr = form.birthDate || form.dob;
    const dodStr = form.deathDate;
    if (!dobStr || !dodStr) {
      setAgeDetail("");
      return;
    }

    const dob = new Date(dobStr);
    const dod = new Date(dodStr);
    if (isNaN(dob) || isNaN(dod) || dod < dob) {
      setAgeDetail("");
      return;
    }

    let years = dod.getFullYear() - dob.getFullYear();
    let months = dod.getMonth() - dob.getMonth();
    let days = dod.getDate() - dob.getDate();

    if (days < 0) {
      months -= 1;
      // days in previous month of dod
      const prevMonth = new Date(dod.getFullYear(), dod.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const display = `${years} yr${years !== 1 ? "s" : ""} ${months} mo${
      months !== 1 ? "s" : ""
    } ${days} d`;
    // set numeric age (years) in form.age, but keep detailed text in ageDetail
    setForm((prev) => ({ ...prev, age: String(years) }));
    setAgeDetail(display);
  }, [form.birthDate, form.dob, form.deathDate]);

  // Filter patients as user types (use normalized local patients)
  useEffect(() => {
    if (!patientSearch) {
      setFilteredPatients([]);
      setIsDropdownOpen(false);
      return;
    }

    const q = String(patientSearch).trim().toLowerCase();
    const filtered = patientsLocal.filter((p) => {
      if (!p) return false;
      const hp = (p.hospital_patient_id || "").toString().toLowerCase();
      const idStr = p.id ? String(p.id).toLowerCase() : "";
      const name = (p.name || "").toLowerCase();
      return hp.includes(q) || idStr.includes(q) || name.includes(q);
    });

    setFilteredPatients(filtered);
    setIsDropdownOpen(true);
  }, [patientSearch, patientsLocal]);

  // If the search resolves to a single exact match, populate gender from DB
  useEffect(() => {
    if (!patientSearch) return;
    if (!filteredPatients || filteredPatients.length !== 1) return;
    const p = filteredPatients[0];
    if (!p) return;

    const q = String(patientSearch).trim().toLowerCase();
    const hp = (p.hospital_patient_id || "").toString().toLowerCase();
    const idStr = p.id ? String(p.id).toLowerCase() : "";
    const name = (p.name || "").toLowerCase();

    // Exact-match on hospital id, id or full name
    if (q === hp || q === idStr || q === name) {
      setForm((prev) => ({
        ...prev,
        gender: p.gender || prev.gender,
        hospitalPatientId:
          p.hospital_patient_id || p.id || prev.hospitalPatientId,
        birthDate: p.birthDate || prev.birthDate,
        deceasedName: p.name || prev.deceasedName,
      }));
      // close dropdown since we've auto-filled
      setIsDropdownOpen(false);
      setFilteredPatients([]);
    }
  }, [filteredPatients, patientSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch createDeathCertificate thunk (slice will map to backend payload)
    dispatch(createDeathCertificate(form))
      .unwrap()
      .then((res) => {
        console.log("Death certificate created:", res);
        // Refresh list so manage page updates automatically
        dispatch(fetchDeathCertificates());
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Death Certificate saved successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        // Optionally reset the form
        // setForm({ ...initial state ... });
      })
      .catch((err) => {
        console.error("Failed to create death certificate:", err);
        Swal.fire({
          icon: "error",
          title: "Save failed",
          text: String(err?.message || err || "Unknown error"),
        });
      });
    // Optionally reset the form
    // setForm({ ...initial state ... });
    // setPatientId("");
  };

  return (
    <>
      {/* Form Section */}
      <div className="card full-width-card shadow-sm w-100 border-0">
        <div
          className="card-header text-white text-center"
          style={{ backgroundColor: "#01C0C8", border: "none" }}
        >
          <h3 className="mb-0">
            <i className="bi bi-heart-pulse me-2"></i>Death Certificate Form
          </h3>
        </div>

        <form className="card-body" onSubmit={handleSubmit}>
          {/* 🔍 Search by Patient ID */}
          <div className="row mb-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Hospital Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="hospitalName"
                value={form.hospitalName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 position-relative">
              <label className="form-label fw-semibold">
                Patient (Name or ID)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or patient ID"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                onFocus={() => {
                  if (filteredPatients.length) setIsDropdownOpen(true);
                }}
                autoComplete="off"
              />

              {isDropdownOpen && (
                <div
                  className="list-group position-absolute w-100"
                  style={{ zIndex: 2000, maxHeight: 220, overflowY: "auto" }}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  {patientsStatus === "loading" ? (
                    <div className="list-group-item">Loading...</div>
                  ) : filteredPatients.length > 0 ? (
                    filteredPatients.map((p) => (
                      <button
                        type="button"
                        key={p.id || p.hospital_patient_id}
                        className="list-group-item list-group-item-action"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            deceasedName: p.name || prev.deceasedName,
                            gender: p.gender || prev.gender,
                            contactNumber:
                              p.contactNumber || prev.contactNumber,
                            address: p.address || prev.address,
                            doctor: p.attendingDoctor || prev.doctor,
                            hospitalPatientId:
                              p.hospital_patient_id || p.id || "",
                            patientId: p.id ?? prev.patientId ?? null,
                            birthDate: p.birthDate || prev.birthDate || "",
                          }));
                          setPatientSearch(
                            `${p.name} (${p.hospital_patient_id || p.id})`
                          );
                          setIsDropdownOpen(false);
                        }}
                      >
                        {p.name} ({p.hospital_patient_id})
                      </button>
                    ))
                  ) : (
                    <div className="list-group-item">No match found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {patientsError && (
            <p className="text-danger fw-semibold">{patientsError}</p>
          )}

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="deceasedName"
                value={form.deceasedName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Gender</label>
              <select
                className="form-select"
                id="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Mobile Number</label>
              <input
                type="text"
                className="form-control"
                id="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="Enter contact number"
                maxLength={15}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9+]/g, "");
                }}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                id="birthDate"
                value={form.birthDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Date of Death</label>
              <input
                type="date"
                className="form-control"
                id="deathDate"
                value={form.deathDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Time of Death</label>
              <input
                type="time"
                className="form-control"
                id="deathTime"
                value={form.deathTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Age at Death</label>
              <input
                type="number"
                className="form-control"
                id="age"
                value={form.age}
                onChange={handleChange}
                placeholder="Enter age"
                required
              />
              {ageDetail && (
                <div className="form-text text-muted mt-1">{ageDetail}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Cause of Death</label>
              <input
                type="text"
                className="form-control"
                id="cause"
                value={form.cause}
                onChange={handleChange}
                placeholder="Enter cause of death"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Place of Death</label>
            <input
              type="text"
              className="form-control"
              id="place"
              value={form.place}
              onChange={handleChange}
              placeholder="Hospital / Ward Name"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Address</label>
            <textarea
              className="form-control"
              id="address"
              value={form.address}
              onChange={handleChange}
              rows="2"
              placeholder="Enter address"
            ></textarea>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Attending Doctor / Certifying Officer *
              </label>
              <input
                type="text"
                className="form-control"
                id="doctor"
                value={form.doctor}
                onChange={handleChange}
                placeholder="Enter doctor name"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Issue Date *</label>
              <input
                type="date"
                className="form-control"
                id="issueDate"
                value={form.issueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn text-white me-2"
              style={{ backgroundColor: "#01C0C8" }}
            >
              <i className="bi bi-save me-2"></i> Save Certificate
            </button>
            <button type="reset" className="btn btn-secondary">
              <i className="bi bi-arrow-left"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default DeathCertificateForm;
