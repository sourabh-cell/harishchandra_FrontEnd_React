import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchAssignments,
  selectAssignments,
  selectAssignmentsStatus,
  updateAssignment,
} from "../../../features/ambulanceSlice";

const AssignmentTable = ({ searchQuery, onEdit }) => {
  const dispatch = useDispatch();

  const assignments = useSelector(selectAssignments) || [];
  const assignmentsStatus = useSelector(selectAssignmentsStatus);

  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const statusOptions = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

  useEffect(() => {
    if (assignmentsStatus === "idle") dispatch(fetchAssignments());
  }, [dispatch, assignmentsStatus]);

  useEffect(() => {
    setFilteredAssignments(assignments);
  }, [assignments]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setFilteredAssignments(assignments);
      return;
    }

    const lower = searchQuery.toLowerCase();

    const filtered = assignments.filter((assign) =>
      Object.values(assign).some((value) =>
        String(value).toLowerCase().includes(lower)
      )
    );

    setFilteredAssignments(filtered);
  }, [searchQuery, assignments]);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentData = filteredAssignments.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredAssignments.length / rowsPerPage);

  return (
    <div
      className="tab-pane fade show active"
      id="assignmentData"
      role="tabpanel"
    >
      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th>Sr.No</th>
            <th>Ambulance</th>
            <th>Driver</th>
            <th>Patient</th>
            <th>From</th>
            <th>To</th>
            <th>Status</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Actions</th> {/* NEW COLUMN */}
          </tr>
        </thead>

        <tbody>
          {currentData.length > 0 ? (
            currentData.map((assign, index) => (
              <tr key={assign.id}>
                <td>{indexOfFirst + index + 1}</td>

                <td>
                  {assign.ambulance?.vehicleNumber ||
                    assign.ambulanceVehicleNumber ||
                    assign.ambulance?.vehicle_number ||
                    "-"}
                </td>

                <td>
                  {assign.driver?.driverName ||
                    assign.driverName ||
                    assign.driver?.name ||
                    "-"}
                </td>

                <td>
                  {assign.patient?.firstName || assign.patientName || "-"}
                </td>

                <td>{assign.fromLocation}</td>
                <td>{assign.toLocation}</td>

                {/* STATUS DROPDOWN */}
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={assign.status || ""}
                    disabled={updatingId === assign.id}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      setUpdatingId(assign.id);

                      try {
                        const resp = await dispatch(
                          updateAssignment({
                            id: assign.id,
                            updates: { status: newStatus },
                          })
                        ).unwrap();

                        Swal.fire({
                          title: resp?.message || "Status updated successfully",
                          icon: "success",
                          timer: 1300,
                          showConfirmButton: false,
                        });

                        dispatch(fetchAssignments());
                      } catch (err) {
                        Swal.fire({
                          title: "Failed",
                          text: err?.message || "Unable to update",
                          icon: "error",
                        });
                      } finally {
                        setUpdatingId(null);
                      }
                    }}
                  >
                    <option value="">-- Select --</option>
                    {statusOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>

                <td>{assign.startTime}</td>
                <td>{assign.endTime}</td>

                {/* === EDIT BUTTON === */}
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => onEdit?.(assign)}
                    title="Edit Assignment"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">
                No assignment records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <nav>
          <ul
            className="pagination justify-content-end"
            style={{ marginTop: "30px" }}
          >
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <li
                key={num}
                className={`page-item ${num === currentPage ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default AssignmentTable;
