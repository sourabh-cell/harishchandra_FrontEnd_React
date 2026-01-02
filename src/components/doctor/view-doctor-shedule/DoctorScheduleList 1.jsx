import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSchedules,
  selectSchedules,
  selectSchedulesStatus,
  fetchDepartments,
  selectDepartments,
  selectDepartmentsStatus,
} from "../../../features/doctorScheduleSlice";
import { deleteSchedule } from "../../../features/doctorScheduleSlice";
import Swal from "sweetalert2";
import { NavLink } from "react-router-dom";

export default function DoctorScheduleList() {
  const dispatch = useDispatch();
  const schedules = useSelector(selectSchedules);
  const schedulesStatus = useSelector(selectSchedulesStatus);
  const departments = useSelector(selectDepartments) || [];
  const departmentsStatus = useSelector(selectDepartmentsStatus);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  // Fetch schedules on mount
  useEffect(() => {
    dispatch(fetchSchedules());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Show bootstrap modal when a schedule is selected
  useEffect(() => {
    if (!selectedSchedule) return;
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
      setSelectedSchedule(null);
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
  }, [selectedSchedule]);

  useEffect(() => {
    const searchInput = document.getElementById("searchInput");
    const departmentFilter = document.getElementById("departmentFilter");
    const tableBody = document.getElementById("tableBody");
    const countDisplay = document.getElementById("countDisplay");

    function filterTable() {
      if (!searchInput || !departmentFilter || !tableBody || !countDisplay)
        return;

      const searchValue = (searchInput.value || "").toLowerCase();
      const departmentValue = departmentFilter.value || "";
      const rows = tableBody.getElementsByTagName("tr") || [];
      let count = 0;

      for (let row of rows) {
        // skip rows that aren't regular data rows (e.g., loading or 'no data' rows)
        const cell0 = row.cells && row.cells[0];
        const cell1 = row.cells && row.cells[1];
        if (!cell0) {
          // hide non-data rows by default
          row.style.display = "none";
          continue;
        }

        const doctorName = (cell0.textContent || "").toLowerCase();
        const specialization =
          cell1 && cell1.textContent ? cell1.textContent : "";

        const matchesSearch =
          doctorName.includes(searchValue) ||
          (specialization || "").toLowerCase().includes(searchValue);
        const matchesDepartment =
          !departmentValue || specialization === departmentValue;

        if (matchesSearch && matchesDepartment) {
          row.style.display = "";
          count++;
        } else {
          row.style.display = "none";
        }
      }
      countDisplay.textContent = count;
    }

    searchInput && searchInput.addEventListener("keyup", filterTable);
    departmentFilter &&
      departmentFilter.addEventListener("change", filterTable);

    // Use event delegation on table body for actions (delete/edit/view handled separately)
    const tableClickHandler = (e) => {
      const deleteBtn = e.target.closest(".delete-btn");
      if (deleteBtn) {
        const row = deleteBtn.closest("tr");
        const scheduleId = row?.getAttribute("data-id");
        if (!scheduleId) return;

        Swal.fire({
          title: "Delete schedule?",
          text: "This will remove the schedule permanently.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await dispatch(deleteSchedule(scheduleId)).unwrap();
              Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1200,
                showConfirmButton: false,
              });
              // refresh filter/count
              filterTable();
            } catch (err) {
              const msg =
                (err && (err.message || JSON.stringify(err))) ||
                "Failed to delete";
              Swal.fire({ icon: "error", title: "Delete failed", text: msg });
            }
          }
        });

        return;
      }

      // edit handled by NavLink in the row; nothing to do here
    };

    tableBody && tableBody.addEventListener("click", tableClickHandler);

    return () => {
      searchInput && searchInput.removeEventListener("keyup", filterTable);
      departmentFilter &&
        departmentFilter.removeEventListener("change", filterTable);
      tableBody && tableBody.removeEventListener("click", tableClickHandler);
    };
  }, [schedulesStatus, dispatch]);

  return (
    <div className="full-width-card card shadow-lg border-0">
      {/* Header */}
      <div
        className="d-sm-flex align-items-center justify-content-between px-4 py-3 text-white"
        style={{
          backgroundColor: "#01c0c8",
          borderTopLeftRadius: ".5rem",
          borderTopRightRadius: ".5rem",
        }}
      >
        <div className="d-flex align-items-center mx-auto">
          <i className="bi bi-calendar-check-fill fs-4 me-2"></i>
          <h5 className="mb-0">Doctor Schedule List</h5>
        </div>
      </div>

      {/* Body */}
      <div className="card-body p-4">
        {/* Search + Department + Count Row */}
        <div className="row align-items-center mb-3">
          <div className="col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                id="searchInput"
                className="form-control"
                placeholder="Search doctor or specialization..."
              />
            </div>
          </div>

          <div className="col-md-3 mt-2 mt-md-0">
            <select
              id="departmentFilter"
              className="form-select form-select-sm"
            >
              <option value="">All Departments</option>
              {departmentsStatus === "loading" ? (
                <option disabled>Loading...</option>
              ) : (
                departments.map((d) => (
                  <option
                    key={d.id || d._id}
                    value={
                      d.departmentName ||
                      d.name ||
                      d.department ||
                      d.departmentName
                    }
                  >
                    {d.departmentName ||
                      d.name ||
                      d.department ||
                      d.departmentName}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="col-md-3 text-end mt-2 mt-md-0">
            <small className="text-muted">
              Showing <strong id="countDisplay">5</strong> results
            </small>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle" id="doctorTable">
            <thead>
              <tr className="text-muted small">
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Fees</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {schedulesStatus === "loading" && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}
              {schedulesStatus === "succeeded" &&
                schedules &&
                schedules.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No schedules found
                    </td>
                  </tr>
                )}
              {schedulesStatus === "succeeded" &&
                schedules &&
                schedules.map((schedule, i) => (
                  <tr
                    key={schedule.id || i}
                    data-id={schedule.id || schedule._id}
                  >
                    <td>
                      {schedule.doctorName || schedule.doctor?.name || "N/A"}
                    </td>
                    <td>
                      {schedule.departmentName ||
                        schedule.department?.name ||
                        schedule.specialization ||
                        "N/A"}
                    </td>
                    <td>₹{schedule.appointmentFees || schedule.fees || 0}</td>
                    <td>
                      {(() => {
                        // backend enums: ON_LEAVE, RESIGNED, ACTIVE
                        const raw = (
                          schedule.status ||
                          (typeof schedule.active === "boolean"
                            ? schedule.active
                              ? "ACTIVE"
                              : "RESIGNED"
                            : undefined) ||
                          ""
                        )
                          .toString()
                          .toUpperCase();
                        let text = "Unknown";
                        let cls = "bg-secondary";
                        if (raw === "ACTIVE") {
                          text = "Active";
                          cls = "bg-success";
                        } else if (
                          raw === "ON_LEAVE" ||
                          raw === "ON-LEAVE" ||
                          raw === "ON LEAVE"
                        ) {
                          text = "On Leave";
                          cls = "bg-warning text-dark";
                        } else if (raw === "RESIGNED") {
                          text = "Resigned";
                          cls = "bg-danger";
                        }
                        return <span className={`badge ${cls}`}>{text}</span>;
                      })()}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary view-btn"
                        onClick={() => setSelectedSchedule(schedule)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>{" "}
                      <NavLink
                        className="btn btn-sm text-white edit-btn"
                        style={{ backgroundColor: "#01C0C8" }}
                        to={`/dashboard/edit-doctor-schedule/${schedule.id}`}
                      >
                        <i className="bi bi-pencil"></i>
                      </NavLink>{" "}
                      <button className="btn btn-sm btn-outline-danger delete-btn">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <div className="modal fade" id="viewModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{ backgroundColor: "#01C0C8" }}
            >
              <h5 className="modal-title text-white">Doctor Details</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body" id="viewContent">
              {selectedSchedule ? (
                <div>
                  <h6>Schedules for {selectedSchedule.doctorName}</h6>
                  <p>
                    <strong>Department:</strong>{" "}
                    {selectedSchedule.departmentName ||
                      selectedSchedule.department?.name ||
                      "-"}
                  </p>
                  <p>
                    <strong>Fees:</strong> ₹
                    {selectedSchedule.appointmentFees ??
                      selectedSchedule.fees ??
                      0}
                  </p>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm">
                      <thead className="table-secondary">
                        <tr>
                          <th>Day</th>
                          <th>Start</th>
                          <th>End</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedSchedule.weeklySchedule || []).map(
                          (s, idx) => (
                            <tr key={idx}>
                              <td>{s.day}</td>
                              <td>{s.startTime || "Off"}</td>
                              <td>{s.endTime || "Off"}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
