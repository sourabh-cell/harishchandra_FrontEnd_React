import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  createSchedule,
  updateSchedule,
  fetchSchedules,
  selectSchedules,
} from "../../../features/doctorScheduleSlice";
import Swal from "sweetalert2";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({ baseURL: API_BASE_URL });

function EditDoctorSchedule({ departments = [], doctors = [] }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const schedules = useSelector(selectSchedules) || [];

  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [departmentsList, setDepartmentsList] = useState(departments || []);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState(null);

  const [doctorsList, setDoctorsList] = useState(doctors || []);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState(null);

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
  };

  // Load existing schedule when editing
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      // try find in store first
      let found = schedules.find(
        (s) => String(s.id) === String(id) || String(s._id) === String(id)
      );
      if (!found) {
        try {
          await dispatch(fetchSchedules()).unwrap();
        } catch (err) {
          console.warn("Failed to fetch schedules:", err);
        }
        found = (selectSchedules({ doctorSchedule: { schedules } }) || []).find(
          (s) => String(s.id) === String(id) || String(s._id) === String(id)
        );
      }

      if (found) {
        setDepartmentId(
          String(found.departmentId ?? found.department?.id ?? "")
        );
        setDoctorId(
          String(found.doctorId ?? found.doctorId ?? found.doctor?.id ?? "")
        );
        // normalize times to HH:MM for input[type=time]
        const mapped = (found.weeklySchedule || initialSchedule).map(
          (w, i) => ({
            day: w.day || initialSchedule[i].day,
            startTime: w.startTime ? String(w.startTime).slice(0, 5) : "",
            endTime: w.endTime ? String(w.endTime).slice(0, 5) : "",
          })
        );
        setWeeklySchedule(mapped);
        setAppointmentFees(found.appointmentFees ?? found.fees ?? "");
      }
      // finished loading
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // fetch departments on mount
  useEffect(() => {
    let mounted = true;
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/doctor-schedule/departments");
        if (mounted)
          setDepartmentsList(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (mounted)
          setDepartmentsError(
            err.response?.data || err.message || "Network error"
          );
      } finally {
        if (mounted) setDepartmentsLoading(false);
      }
    };
    fetchDepartments();
    return () => {
      mounted = false;
    };
  }, []);

  // fetch doctors when department changes
  useEffect(() => {
    let mounted = true;
    if (!departmentId) {
      setDoctorsList([]);
      setDoctorsError(null);
      setDoctorsLoading(false);
      return;
    }
    const fetchDoctors = async () => {
      setDoctorsLoading(true);
      setDoctorsError(null);
      try {
        const res = await api.get(`/doctor-schedule/doctors/${departmentId}`);
        if (mounted) setDoctorsList(Array.isArray(res.data) ? res.data : []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departmentId) {
      Swal.fire("Validation", "Select a department.", "warning");
      return;
    }

    if (!doctorId) {
      Swal.fire("Validation", "Select a doctor.", "warning");
      return;
    }

    const payload = {
      departmentId: Number(departmentId),
      doctorId: Number(doctorId),
      appointmentFees: appointmentFees ? parseFloat(appointmentFees) : 0,
      // send times as HH:MM:SS if backend expects seconds
      weeklySchedule: weeklySchedule.map((w) => ({
        day: w.day,
        startTime: w.startTime
          ? w.startTime.length === 5
            ? `${w.startTime}:00`
            : w.startTime
          : null,
        endTime: w.endTime
          ? w.endTime.length === 5
            ? `${w.endTime}:00`
            : w.endTime
          : null,
      })),
    };

    try {
      setSubmitting(true);
      if (id) {
        await dispatch(updateSchedule({ id, scheduleData: payload })).unwrap();
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Schedule updated",
          timer: 1200,
          showConfirmButton: false,
        });
        navigate("/dashboard/view-doctor-schedule-list");
      } else {
        await dispatch(createSchedule(payload)).unwrap();
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Schedule saved successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        handleReset();
      }

      // success handled above per branch
    } catch (err) {
      Swal.fire("Save failed", err.message || "Something went wrong", "error");
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
        <i className="bi bi-calendar-week me-2"></i> Edit Doctor Timing Schedule
      </div>

      <div className="card-body">
        <form className="row g-3" onSubmit={handleSubmit} onReset={handleReset}>
          {/* Department */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Department</label>
            <select
              className="form-select"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setDoctorId("");
                setDoctorsList([]);
              }}
              disabled={!!id}
            >
              <option value="" disabled>
                {departmentsLoading
                  ? "Loading departments..."
                  : "Select Department"}
              </option>
              {departmentsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Doctor</label>
            <select
              className="form-select"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              disabled={!!id || !departmentId || doctorsLoading}
            >
              <option value="" disabled>
                {!departmentId
                  ? "Select department first"
                  : doctorsLoading
                  ? "Loading doctors..."
                  : "Select Doctor"}
              </option>
              {doctorsList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                  {doc.specialization ? ` - ${doc.specialization}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Weekly Schedule */}
          <div className="col-12 mt-4">
            <h6 className="fw-bold text-secondary border-bottom pb-2">
              Weekly Schedule
            </h6>

            <div className="row">
              <div className="col-md-6">
                <table className="table table-sm text-center">
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
                        <td>{s.day}</td>
                        <td>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={s.startTime}
                            onChange={(e) =>
                              handleTimeChange(idx, "startTime", e.target.value)
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

              <div className="col-md-6">
                <table className="table table-sm text-center">
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
                        <td>{s.day}</td>
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

          {/* Fees */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Appointment Fees (₹)
            </label>
            <input
              type="number"
              className="form-control"
              value={appointmentFees}
              min="0"
              onChange={(e) => setAppointmentFees(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="col-12 text-center mt-4">
            <button
              className="btn text-white"
              type="submit"
              style={{ backgroundColor: "#01c0c8" }}
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditDoctorSchedule;
