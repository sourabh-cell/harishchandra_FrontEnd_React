import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssignmentHistory,
  selectAssignmentHistory,
  selectAssignmentHistoryStatus,
} from "../../../features/ambulanceSlice";

const ViewAmbulanceAssignmentCompletedTable = ({ refreshKey }) => {
  const dispatch = useDispatch();
  const history = useSelector(selectAssignmentHistory) || [];
  const historyStatus = useSelector(selectAssignmentHistoryStatus);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (historyStatus === "idle") dispatch(fetchAssignmentHistory());
  }, [dispatch, historyStatus]);

  useEffect(() => {
    dispatch(fetchAssignmentHistory());
  }, [refreshKey]);

  // ---------- FILTER LOGIC ----------
  const filteredData = useMemo(() => {
    return history.filter((item) => {
      const search = searchQuery.toLowerCase();

      const matchesSearch =
        item.ambulance?.vehicleNumber?.toLowerCase().includes(search) ||
        item.driver?.driverName?.toLowerCase().includes(search) ||
        item.fromLocation?.toLowerCase().includes(search) ||
        item.toLocation?.toLowerCase().includes(search);

      const startTime = item.startTime ? new Date(item.startTime) : null;

      const matchStartDate = filterStartDate
        ? startTime && startTime >= new Date(filterStartDate)
        : true;

      const matchEndDate = filterEndDate
        ? startTime && startTime <= new Date(filterEndDate)
        : true;

      return matchesSearch && matchStartDate && matchEndDate;
    });
  }, [history, searchQuery, filterStartDate, filterEndDate]);

  // ---------- PAGINATION LOGIC ----------
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <>
      {/* Search + Filters */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search ambulance / driver / location"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={filterStartDate}
            onChange={(e) => {
              setFilterStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={filterEndDate}
            onChange={(e) => {
              setFilterEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="tab-pane fade show active" id="assignmentHistoryData">
        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr>
              <th>Sr.No</th>
              <th>Ambulance</th>
              <th>Driver</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Start Time</th>
              <th>End Time</th>
            </tr>
          </thead>

          <tbody>
            {currentData.length > 0 ? (
              currentData.map((assign, index) => (
                <tr key={assign.id}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{assign.ambulance?.vehicleNumber || "-"}</td>
                  <td>{assign.driver?.driverName || "-"}</td>
                  <td>{assign.fromLocation}</td>
                  <td>{assign.toLocation}</td>
                  <td>
                    <span className="badge bg-success">{assign.status}</span>
                  </td>
                  <td>{assign.startTime}</td>
                  <td>{assign.endTime}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No completed assignment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- PAGINATION BUTTONS ---------- */}
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
    </>
  );
};

export default ViewAmbulanceAssignmentCompletedTable;
