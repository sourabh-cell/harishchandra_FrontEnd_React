import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createSchedule } from "../../../features/doctorScheduleSlice";
import Swal from "sweetalert2";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({ baseURL: API_BASE_URL });

function AddDoctorSchedule() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentId, setDepartmentId] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState(null);
  const [doctorId, setDoctorId] = useState("");

  const initialSchedule = [
    { day: "Mon", startTime: "", endTime: "" },
    { day: "Tue", startTime: "", endTime: "" },
    { day: "Wed", startTime: "", endTime: "" },
    { day: "Thu", startTime: "", endTime: "" },
    { day: "Fri", startTime: "", endTime: "" },
    { day: "Sat", startTime: "", endTime: "" },
  ];

  const [weeklySchedule, setWeeklySchedule] = useState(initialSchedule);

  const [appointmentFees, setAppointmentFees] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/doctor-schedule/departments");
        if (mounted) setDepartments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (mounted)
          setError(err.response?.data || err.message || "Network error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDepartments();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!departmentId) {
      setDoctors([]);
      setDoctorsError(null);
      setDoctorsLoading(false);
      return;
    }

    const fetchDoctors = async () => {
      setDoctorsLoading(true);
      setDoctorsError(null);
      try {
        const res = await api.get(`/doctor-schedule/doctors/${departmentId}`);
        if (mounted) setDoctors(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (mounted)
          setDoctorsError(err.response?.data || err.message || "Network error");
      } finally {
        if (mounted) setDoctorsLoading(false);
      }
    };
    fetchDoctors();
    return () => {
      mounted = false;
    };
  }, [departmentId]);

  const handleTimeChange = (index, field, value) => {
    setWeeklySchedule((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleReset = () => {
    setDepartmentId("");
    setDoctorId("");
    setWeeklySchedule(initialSchedule);
    setAppointmentFees("");
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!departmentId) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Select a department.",
      });
      return;
    }
    if (!doctorId) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Select a doctor.",
      });
      return;
    }

    const payload = {
      departmentId: Number(departmentId),
      doctorId: Number(doctorId),
      appointmentFees: appointmentFees ? parseFloat(appointmentFees) : 0,
      weeklySchedule: weeklySchedule.map((s) => ({
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    };

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);
      // Use Redux Toolkit thunk (axios) to create schedule
      await dispatch(createSchedule(payload)).unwrap();
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Schedule saved successfully",
        timer: 1800,
        showConfirmButton: false,
      });
      handleReset();
    } catch (err) {
      // err may be a string/object from rejectWithValue
      const message =
        (err && (err.message || JSON.stringify(err))) ||
        "Failed to save schedule.";
      Swal.fire({ icon: "error", title: "Save failed", text: message });
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="full-width-card card border-0 shadow">
      <div
        className="card-header text-white text-center fw-bold fs-4 py-3"
        style={{ backgroundColor: "#01c0c8" }}
      >
        <i className="bi bi-calendar-week me-2"></i> Doctor Timing Schedule
      </div>

      <div className="card-body">
        <form className="row g-3" onSubmit={handleSubmit} onReset={handleReset}>
          {/* Doctor Info */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Department</label>
            <select
              className="form-select"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setDoctorId("");
                setDoctors([]);
              }}
            >
              <option value="" disabled>
                {loading ? "Loading departments..." : "Select Department"}
              </option>

              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName}
                </option>
              ))}
            </select>
            {error && (
              <div className="text-danger small mt-1">
                Failed to load: {error}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Doctor</label>
            <select
              className="form-select"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              disabled={!departmentId || doctorsLoading}
            >
              <option value="" disabled>
                {!departmentId
                  ? "Select department first"
                  : doctorsLoading
                  ? "Loading doctors..."
                  : "Select Doctor"}
              </option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                  {doc.specialization ? ` - ${doc.specialization}` : ""}
                </option>
              ))}
            </select>
            {doctorsError && (
              <div className="text-danger small mt-1">
                Failed to load doctors: {doctorsError}
              </div>
            )}
          </div>

          {/* Weekly Schedule */}
          <div className="col-12 mt-4">
            <h6 className="fw-bold text-secondary border-bottom pb-2">
              Weekly Schedule
            </h6>
            <div className="row">
              {/* Left Column (Mon-Wed) */}
              <div className="col-md-6">
                <div className="table-responsive">
                  <table className="table table-sm align-middle text-center">
                    <thead className="table-light">
                      <tr>
                        <th>Day</th>
                        <th>Start</th>
                        <th>End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklySchedule.slice(0, 3).map((s, idx) => (
                        <tr key={s.day}>
                          <td className="fw-semibold">{s.day}</td>
                          <td>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={s.startTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  idx,
                                  "startTime",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={s.endTime}
                              onChange={(e) =>
                                handleTimeChange(idx, "endTime", e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column (Thu-Sat) */}
              <div className="col-md-6">
                <div className="table-responsive">
                  <table className="table table-sm align-middle text-center">
                    <thead className="table-light">
                      <tr>
                        <th>Day</th>
                        <th>Start</th>
                        <th>End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklySchedule.slice(3, 6).map((s, idx) => (
                        <tr key={s.day}>
                          <td className="fw-semibold">{s.day}</td>
                          <td>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={s.startTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  idx + 3,
                                  "startTime",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={s.endTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  idx + 3,
                                  "endTime",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Common Fees */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Appointment Fees (₹)
            </label>
            <div className="input-group">
              <span className="input-group-text">₹</span>
              <input
                type="number"
                className="form-control"
                placeholder="Enter total fees"
                min="0"
                value={appointmentFees}
                onChange={(e) => setAppointmentFees(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit status */}
          {submitError && (
            <div className="col-12 text-danger">{submitError}</div>
          )}
          {submitSuccess && (
            <div className="col-12 text-success">{submitSuccess}</div>
          )}

          {/* Buttons */}
          <div className="col-12 text-center mt-4">
            <button
              type="reset"
              className="button bg-secondary me-2 px-3"
              disabled={submitting}
            >
              <i className="bi bi-x-circle me-1"></i> Reset
            </button>
            <button
              type="submit"
              className="button text-white px-3"
              style={{ backgroundColor: "#01c0c8" }}
              disabled={submitting}
            >
              <i className="bi bi-save me-1"></i>{" "}
              {submitting ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDoctorSchedule;
