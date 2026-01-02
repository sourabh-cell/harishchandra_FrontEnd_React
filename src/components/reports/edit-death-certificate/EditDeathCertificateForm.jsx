import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  createDeathCertificate,
  fetchDeathCertificate,
  updateDeathCertificate,
  selectSelectedDeathCertificate,
  selectSelectedDeathCertificateStatus,
  selectSelectedDeathCertificateError,
  fetchDeathCertificates,
  selectDeathCertificates,
  selectDeathCertificatesStatus,
  searchPatients,
  selectPatients,
  selectPatientsStatus,
} from "../../../features/birthAndDethSlice";

const EditDeathCertificateForm = () => {
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

  const [ageDetail, setAgeDetail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const selectedDeath = useSelector(selectSelectedDeathCertificate);
  const selectedStatus = useSelector(selectSelectedDeathCertificateStatus);
  const selectedError = useSelector(selectSelectedDeathCertificateError);
  // Fallback list for when GET /death-certificate/:id is not supported by backend
  const deathList = useSelector(selectDeathCertificates);
  const deathListStatus = useSelector(selectDeathCertificatesStatus);

  const isEdit = Boolean(id);
  const isLoadingRecord =
    isEdit && (selectedStatus === "loading" || selectedStatus === "idle");
  // Using only isLoadingRecord for disabling; submit state can be added if needed

  // Patients list for DOB fallback
  const patients = useSelector(selectPatients);
  const patientsStatus = useSelector(selectPatientsStatus);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  // 🧮 Auto-calculate age at death
  useEffect(() => {
    const dobStr = form.birthDate;
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

    setForm((prev) => ({ ...prev, age: String(years) }));
    setAgeDetail(display);
  }, [form.birthDate, form.deathDate]);

  // If editing, fetch the certificate once
  useEffect(() => {
    if (id) dispatch(fetchDeathCertificate(id));
  }, [id, dispatch]);

  // Fallback: if single fetch fails or returns nothing, ensure list is loaded
  useEffect(() => {
    if (!id) return;
    const needList =
      selectedStatus === "failed" ||
      selectedStatus === "idle" ||
      !selectedDeath;
    if (
      needList &&
      (deathListStatus === "idle" || deathListStatus === undefined)
    ) {
      dispatch(fetchDeathCertificates());
    }
  }, [id, selectedStatus, selectedDeath, deathListStatus, dispatch]);

  // DOB fallback: if birthDate missing but we have a patientId, fetch patients and fill DOB
  useEffect(() => {
    if (!id) return;
    const pid =
      selectedDeath?.patientId || form.patientId || form.hospitalPatientId;
    const birthMissing = !form.birthDate;
    if (!pid || !birthMissing) return;

    if (patientsStatus === "idle" || patientsStatus === undefined) {
      dispatch(searchPatients());
      return;
    }

    if (patientsStatus === "succeeded" && Array.isArray(patients)) {
      const found = patients.find(
        (p) =>
          String(p.id) === String(pid) || String(p.patientId) === String(pid)
      );
      const dob = found?.dateOfBirth || found?.dob || found?.birthDate;
      if (dob) {
        setForm((prev) => ({ ...prev, birthDate: dob }));
      }
    }
  }, [
    id,
    selectedDeath,
    form.patientId,
    form.hospitalPatientId,
    form.birthDate,
    patientsStatus,
    patients,
    dispatch,
  ]);

  // Populate form when selectedDeath arrives in edit mode
  useEffect(() => {
    if (id && selectedStatus === "succeeded" && selectedDeath) {
      setForm((prev) => ({
        ...prev,
        deceasedName:
          selectedDeath.fullName ||
          selectedDeath.deceasedName ||
          prev.deceasedName,
        gender: selectedDeath.gender || prev.gender,
        deathDate:
          selectedDeath.dateOfDeath ||
          selectedDeath.deathDate ||
          prev.deathDate,
        birthDate: selectedDeath.dateOfBirth || prev.birthDate,
        deathTime:
          selectedDeath.timeOfDeath ||
          selectedDeath.deathTime ||
          prev.deathTime,
        age: selectedDeath.ageAtDeath ?? selectedDeath.age ?? prev.age,
        cause: selectedDeath.causeOfDeath || selectedDeath.cause || prev.cause,
        place: selectedDeath.placeOfDeath || selectedDeath.place || prev.place,
        address: selectedDeath.address || prev.address,
        contactNumber:
          selectedDeath.contactNumber ||
          selectedDeath.mobileNumber ||
          prev.contactNumber,
        hospitalPatientId: selectedDeath.patientId || prev.hospitalPatientId,
        patientId: selectedDeath.patientId ?? prev.patientId,
        doctor:
          selectedDeath.attendingDoctor || selectedDeath.doctor || prev.doctor,
        issueDate: selectedDeath.issueDate || prev.issueDate,
        certNumber: selectedDeath.certificateNumber || prev.certNumber,
      }));
    }
  }, [id, selectedStatus, selectedDeath]);

  // Populate form from list fallback when available
  useEffect(() => {
    if (!id) return;
    if (selectedStatus === "succeeded" && selectedDeath) return; // already populated
    if (deathListStatus === "succeeded" && Array.isArray(deathList)) {
      const found = deathList.find((d) => String(d.id) === String(id));
      if (found) {
        setForm((prev) => ({
          ...prev,
          deceasedName:
            found.fullName || found.deceasedName || prev.deceasedName,
          gender: found.gender || prev.gender,
          deathDate: found.dateOfDeath || found.deathDate || prev.deathDate,
          birthDate: found.dateOfBirth || prev.birthDate,
          deathTime: found.timeOfDeath || found.deathTime || prev.deathTime,
          age: found.ageAtDeath ?? found.age ?? prev.age,
          cause: found.causeOfDeath || found.cause || prev.cause,
          place: found.placeOfDeath || found.place || prev.place,
          address: found.address || prev.address,
          contactNumber:
            found.contactNumber || found.mobileNumber || prev.contactNumber,
          hospitalPatientId: found.patientId || prev.hospitalPatientId,
          patientId: found.patientId ?? prev.patientId,
          doctor: found.attendingDoctor || found.doctor || prev.doctor,
          issueDate: found.issueDate || prev.issueDate,
          certNumber: found.certificateNumber || prev.certNumber,
        }));
      }
    }
  }, [id, selectedStatus, selectedDeath, deathListStatus, deathList]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (id) {
      // Edit mode -> update
      dispatch(updateDeathCertificate({ id, deathData: form }))
        .unwrap()
        .then(() => {
          // Refresh list so manage page updates automatically
          dispatch(fetchDeathCertificates());
          Swal.fire({
            icon: "success",
            title: "Updated",
            text: "Death Certificate updated successfully",
            timer: 2000,
            showConfirmButton: false,
          });
          navigate(-1);
        })
        .catch((err) => {
          console.error("Failed to update death certificate:", err);
          Swal.fire({
            icon: "error",
            title: "Update failed",
            text: String(err?.message || err || "Unknown error"),
          });
        });
    } else {
      // Create new
      dispatch(createDeathCertificate(form))
        .unwrap()
        .then(() => {
          // Refresh list so manage page updates automatically after create
          dispatch(fetchDeathCertificates());
          Swal.fire({
            icon: "success",
            title: "Saved",
            text: "Death Certificate saved successfully",
            timer: 2000,
            showConfirmButton: false,
          });
          navigate(-1);
        })
        .catch((err) => {
          console.error("Failed to create death certificate:", err);
          Swal.fire({
            icon: "error",
            title: "Save failed",
            text: String(err?.message || err || "Unknown error"),
          });
        });
    }
  };

  // no separate reset handler; Cancel button navigates back

  return (
    <>
      <div className="card full-width-card shadow-sm w-100 border-0">
        <div
          className="card-header text-white text-center"
          style={{ backgroundColor: "#01C0C8", border: "none" }}
        >
          <h3 className="mb-0">
            <i className="bi bi-heart-pulse me-2"></i>Edit Death Certificate
            Form
          </h3>
        </div>

        <form className="card-body" onSubmit={handleSubmit}>
          {isEdit && selectedStatus === "loading" && (
            <div className="alert alert-info py-2">Loading record…</div>
          )}
          {isEdit &&
            selectedStatus === "failed" &&
            deathListStatus !== "succeeded" && (
              <div className="alert alert-danger py-2">
                Failed to load record:{" "}
                {String(selectedError || "Unknown error")}
              </div>
            )}
          <div className="row mb-3">
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
                disabled={isLoadingRecord}
                required
              />
            </div>
          </div>

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
                disabled={isLoadingRecord}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Gender</label>
              <select
                className="form-select"
                id="gender"
                value={form.gender}
                onChange={handleChange}
                disabled={isLoadingRecord}
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
          </div>

          <div className="row mb-3">
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
                disabled={isLoadingRecord}
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
                disabled={isLoadingRecord}
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
                disabled={isLoadingRecord}
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
                disabled={isLoadingRecord}
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
                disabled={isLoadingRecord}
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
                disabled={isLoadingRecord}
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
              disabled={isLoadingRecord}
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
              disabled={isLoadingRecord}
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
                disabled={isLoadingRecord}
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
                disabled={isLoadingRecord}
                required
              />
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn text-white me-2"
              style={{ backgroundColor: "#01C0C8" }}
              disabled={isLoadingRecord}
            >
              {isEdit ? (
                <>
                  <i className="bi bi-save me-2"></i> Update Certificate
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i> Save Certificate
                </>
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
              className="btn btn-secondary"
            >
              <i className="bi bi-arrow-left"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditDeathCertificateForm;
