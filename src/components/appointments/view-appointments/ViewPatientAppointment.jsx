import { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAppointments,
  selectAppointments,
  selectAppointmentsStatus,
  selectAppointmentsError,
} from "../../../features/appointmentSlice";
import { NavLink } from "react-router-dom";

export default function ViewPatientAppointment() {
  const dispatch = useDispatch();
  const rawAppointments = useSelector(selectAppointments);
  const appointmentsStatus = useSelector(selectAppointmentsStatus);
  const appointmentsError = useSelector(selectAppointmentsError);
  const [selectedAppointment, setSelectedAppointment] = useState({
    patientName: "",
  });
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [modalData, setModalData] = useState({
    patient: "",
    age: "",
    phone: "",
    doctor: "",
    date: "",
    time: "",
    status: "SCHEDULED",
    id: null,
  });

  const modalRef = useRef(null);

  const themeColor = "#01C0C8";
  const hoverColor = "#019aa3"; // slightly darker

  const openModal = () => {
    try {
      if (modalRef.current) {
        const m = new window.bootstrap.Modal(modalRef.current);
        m.show();
      }
    } catch {}
  };

  // Show bootstrap modal when a schedule is selected
  useEffect(() => {
    if (!selectedAppointment) return;
    const viewModalEl = document.getElementById("viewModal");
    if (!viewModalEl) return;

    let modalInstance = null;
    try {
      if (window.bootstrap && typeof window.bootstrap.Modal === "function") {
        modalInstance = new window.bootstrap.Modal(viewModalEl);
        modalInstance.show();
      } else {
        viewModalEl.style.display = "block";
        viewModalEl.classList.add("show");
        document.body.classList.add("modal-open");
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop fade show";
        backdrop.setAttribute("data-react-backdrop", "1");
        document.body.appendChild(backdrop);
      }
    } catch (err) {
      console.error("Error showing modal:", err);
    }

    const cleanup = () => {
      try {
        if (modalInstance) modalInstance.hide();
        else {
          viewModalEl.style.display = "none";
          viewModalEl.classList.remove("show");
          document.body.classList.remove("modal-open");
          document
            .querySelectorAll(".modal-backdrop[data-react-backdrop]")
            .forEach((b) => b.remove());
        }
      } catch (err) {
        console.error("Error hiding modal during cleanup:", err);
      }
      setSelectedAppointment(null);
    };

    const closeBtn = viewModalEl.querySelector(".btn-close");
    if (closeBtn) closeBtn.onclick = cleanup;
    viewModalEl.addEventListener &&
      viewModalEl.addEventListener("hidden.bs.modal", cleanup);

    return () => {
      if (closeBtn) closeBtn.onclick = null;
      viewModalEl.removeEventListener &&
        viewModalEl.removeEventListener("hidden.bs.modal", cleanup);
      if (modalInstance) modalInstance.hide();
    };
  }, [selectedAppointment]);

  useEffect(() => {
    if (appointmentsStatus === "idle") {
      dispatch(fetchAppointments());
    }
  }, [appointmentsStatus, dispatch]);

  const appointments = useMemo(
    () =>
      (rawAppointments || []).map((a) => {
        const patientName =
          a.patient?.name ||
          a.patientName ||
          (a.patient_first_name || a.patientLastName
            ? `${a.patient_first_name || ""} ${
                a.patient_last_name || ""
              }`.trim()
            : a.patient) ||
          "";

        const rawStatus = a.status || a.appointmentStatus || "SCHEDULED";
        const upperStatus = String(rawStatus).toUpperCase();
        const allowedStatuses = ["SCHEDULED", "COMPLETED", "CANCELLED"];
        const normalizedStatus = allowedStatuses.includes(upperStatus)
          ? upperStatus
          : "SCHEDULED";

        const idValue =
          a.id ||
          a.appointmentId ||
          a.appointment_id ||
          a.appointment?.id ||
          "";

        const patientHospitalIdValue =
          a.patientHospitalId ||
          a.patient_hospital_id ||
          a.patient?.patientHospitalId ||
          a.patient?.patient_hospital_id ||
          a.patientId ||
          a.patient_id ||
          a.patient?.id ||
          a.patient?.patientId ||
          a.patient?.patient_id ||
          "";

        return {
          id: idValue,
          patientHospitalId: patientHospitalIdValue || "—",
          patient: patientName || "—",
          age: a.patient?.age || a.age || a.patientAge || "—",
          phone:
            a.patientContact ||
            a.patient?.patientContact ||
            a.patient?.contactInfo ||
            a.phone ||
            a.patientPhone ||
            "—",
          doctor:
            a.doctor?.name ||
            a.doctorName ||
            a.doctor?.fullName ||
            a.doctor ||
            "—",
          date: a.appointmentDate || a.date || "—",
          time: a.appointmentTime || a.time || "—",
          status: normalizedStatus,
        };
      }),
    [rawAppointments]
  );

  const viewRow = (index) => {
    setModalData(appointments[index]);
    openModal();
  };

  const statusColor = (status) => {
    return status === "SCHEDULED"
      ? themeColor
      : status === "COMPLETED"
      ? "green"
      : "red";
  };

  const filteredAppointments = appointments.filter((a) => {
    const needle = String(search || "")
      .trim()
      .toLowerCase();
    const matchSearch =
      needle === "" ||
      a.patient.toLowerCase().includes(needle) ||
      String(a.patientHospitalId || "")
        .toLowerCase()
        .includes(needle) ||
      String(a.phone || "")
        .toLowerCase()
        .includes(needle) ||
      a.doctor.toLowerCase().includes(needle);

    const matchStatus =
      statusFilter === "" ||
      a.status.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

  return (
    <>
      {/* Header */}
      <div className="container m-0 p-0">
        <div
          className="card-header text-center text-white py-3 rounded-top"
          style={{ backgroundColor: "#101C0C8" }}
        >
          <i className="bi bi-card-list me-2"></i> Patient Appointment List
        </div>

        {/* Search and Filter */}
        <div className="row px-4 mt-4 mb-2">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search patient, phone, doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-3 mb-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Filter by Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive px-4 pb-4">
          <table className="table table-bordered table-hover">
            <thead style={{ backgroundColor: themeColor, color: "white" }}>
              <tr>
                <th>Patient Hospital ID</th>
                <th>Patient</th>
                <th>Age</th>
                <th>Phone</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.map((a, index) => (
                <tr key={index}>
                  <td>{a.patientHospitalId}</td>
                  <td>{a.patient}</td>
                  <td>{a.age}</td>
                  <td>{a.phone}</td>
                  <td>{a.doctor}</td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: statusColor(a.status),
                        color: "white",
                      }}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="text-center">
                    {/* View Button */}
                    <button
                      className="btn1 bg-primary btn-sm text-white"
                      style={{
                        backgroundColor: themeColor,
                        border: `1px solid ${themeColor}`,
                      }}
                      onClick={() => {
                        setSelectedAppointment(a);
                        openModal();
                      }}
                      data-tooltip="View"
                    >
                      <i className="bi bi-eye"></i>
                    </button>

                    {/* Edit NavLink */}
                    <NavLink
                      to={`/dashboard/edit-patient-appointment/${a.id}`}
                      state={{
                        fromList: true,
                        appointment:
                          rawAppointments.find(
                            (r) =>
                              (r.id ||
                                r.appointmentId ||
                                r.appointment_id ||
                                r.appointment?.id) == a.id
                          ) || a,
                      }}
                      className="btn1 bg-warning btn-sm ms-2"
                      data-tooltip="Edit"
                    >
                      <i className="bi bi-pencil"></i>
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {appointmentsStatus === "loading" && (
            <div className="text-center py-2 small">
              Loading appointments...
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="viewEditModal"
        tabIndex="-1"
        ref={modalRef}
      >
        <div className="modal-dialog">
          <div className="modal-content border-0">
            <div
              className="modal-header text-white"
              style={{ backgroundColor: "#01C0C8" }}
            >
              <h5 className="modal-title">Appointment Details</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <div className="row">
                <div className="col-6">
                  <p>
                    <strong>Patient:</strong>{" "}
                    {selectedAppointment.patient ||
                      selectedAppointment.appointmentPatient ||
                      "-"}
                  </p>
                </div>

                <div className="col-3">
                  <p>
                    <strong>Age:</strong>{" "}
                    {selectedAppointment.age ||
                      selectedAppointment.appointmentAge ||
                      "-"}
                  </p>
                </div>

                <div className="col-3">
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedAppointment.phone ||
                      selectedAppointment.appointmentPhone ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-6">
                  <p>
                    <strong>Doctor:</strong>{" "}
                    {selectedAppointment.doctor ||
                      selectedAppointment.appointmentDoctor ||
                      "-"}
                  </p>
                </div>

                <div className="col-3">
                  <p>
                    <strong>Date:</strong>{" "}
                    {selectedAppointment.date ||
                      selectedAppointment.appointmentDate ||
                      "-"}
                  </p>
                </div>

                <div className="col-3">
                  <p>
                    <strong>Time:</strong>{" "}
                    {selectedAppointment.time ||
                      selectedAppointment.appointmentTime ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedAppointment.status ||
                    selectedAppointment.appointmentStatus ||
                    "-"}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="button text-white"
                style={{
                  backgroundColor: themeColor,
                  border: `1px solid ${themeColor}`,
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = hoverColor)
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = themeColor)
                }
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
