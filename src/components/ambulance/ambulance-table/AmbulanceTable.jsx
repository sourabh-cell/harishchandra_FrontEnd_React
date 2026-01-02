import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAmbulances,
  selectAmbulances,
  selectAmbulancesStatus,
  selectAmbulancesError,
} from "../../../features/ambulanceSlice";

const AmbulanceTable = ({ refreshKey, searchQuery }) => {
  const dispatch = useDispatch();

  const ambulances = useSelector(selectAmbulances) || [];
  const status = useSelector(selectAmbulancesStatus);
  const error = useSelector(selectAmbulancesError);

  const [filteredAmbulances, setFilteredAmbulances] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Popup states
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAmbulances());
    }
  }, [dispatch, status]);

  useEffect(() => {
    dispatch(fetchAmbulances());
  }, [refreshKey, dispatch]);

  useEffect(() => {
    setFilteredAmbulances(ambulances);
    setCurrentPage(1);
  }, [ambulances]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setFilteredAmbulances(ambulances);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = ambulances.filter((amb) =>
        Object.values(amb).some((value) =>
          String(value).toLowerCase().includes(lower)
        )
      );
      setFilteredAmbulances(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, ambulances]);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentData = filteredAmbulances.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredAmbulances.length / itemsPerPage);

  const openEditPopup = (amb) => {
    setSelectedAmbulance(amb);
    setShowPopup(true);
  };

  return (
    <>
      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th>Sr.No</th>
            <th>Ambulance Number</th>
            <th>Type</th>
            <th>Status</th>
            <th>Last Maintenance Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {status === "loading" && (
            <tr>
              <td colSpan="6" className="text-center">
                Loading ambulances...
              </td>
            </tr>
          )}

          {status === "failed" && (
            <tr>
              <td colSpan="6" className="text-center text-danger">
                {typeof error === "string"
                  ? error
                  : error?.message || "Failed to load ambulances"}
              </td>
            </tr>
          )}

          {(status === "succeeded" || status === "idle") &&
            (currentData.length > 0 ? (
              currentData.map((amb, index) => (
                <tr key={amb.id || amb.ambulanceId || index}>
                  <td>{firstIndex + index + 1}</td>
                  <td>{amb.vehicleNumber}</td>
                  <td>{amb.ambulanceType}</td>

                  {/* Updated Colored Status Column */}
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={amb.ambulanceStatus}
                      onChange={(e) => onStatusChange(amb.id, e.target.value)}
                      style={{
                        fontWeight: "bold",
                        paddingRight: "32px", // more space for arrow
                        appearance: "auto", // ensures arrow is visible
                        WebkitAppearance: "auto",
                        backgroundColor:
                          amb.ambulanceStatus === "AVAILABLE"
                            ? "#d4edda"
                            : amb.ambulanceStatus === "ON_DUTY"
                            ? "#fff3cd"
                            : "#e2e3e5",
                        color:
                          amb.ambulanceStatus === "AVAILABLE"
                            ? "#0ca430ff"
                            : amb.ambulanceStatus === "ON_DUTY"
                            ? "#856404"
                            : "#383d41",
                      }}
                    >
                      <option
                        value="AVAILABLE"
                        style={{ color: "green", fontWeight: "bold" }}
                      >
                        ● Available
                      </option>
                      <option
                        value="ON_DUTY"
                        style={{ color: "orange", fontWeight: "bold" }}
                      >
                        ● On Duty
                      </option>
                      <option
                        value="MAINTENANCE"
                        style={{ color: "gray", fontWeight: "bold" }}
                      >
                        ● Maintenance
                      </option>
                    </select>
                  </td>

                  <td>{amb.lastMaintenanceDate}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => openEditPopup(amb)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No ambulance records found.
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-end mt-2">
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

      {/* Popup */}
      {showPopup && selectedAmbulance && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          ></div>

          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Edit Ambulance</h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowPopup(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <PopupForm
                    data={selectedAmbulance}
                    onClose={() => setShowPopup(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

/* ===================================
   POPUP FORM WITH COLORED STATUS
=================================== */

const PopupForm = ({ data, onClose }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: data.vehicleNumber,
    ambulanceType: data.ambulanceType,
    ambulanceStatus: data.ambulanceStatus,
    lastMaintenanceDate: data.lastMaintenanceDate,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Updated:", formData);
    onClose();
  };

  return (
    <>
      <div className="mb-3">
        <label className="form-label">Ambulance Number</label>
        <input
          type="text"
          className="form-control"
          name="vehicleNumber"
          value={formData.vehicleNumber}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Ambulance Type</label>
        <select
          name="ambulanceType"
          className="form-select"
          value={formData.ambulanceType}
          onChange={handleChange}
        >
          <option value="BASIC">Basic</option>
          <option value="ICU">ICU</option>
        </select>
      </div>

      {/* ===== STATUS WITH COLOR ===== */}

      <div className="mb-3">
        <label className="form-label">Status</label>

        <select
          name="ambulanceStatus"
          className="form-select"
          value={formData.ambulanceStatus}
          onChange={handleChange}
        >
          <option value="AVAILABLE" style={{ color: "green", fontWeight: 600 }}>
            ● Available
          </option>

          <option value="ON_DUTY" style={{ color: "orange", fontWeight: 600 }}>
            ● On Duty
          </option>

          <option
            value="MAINTENANCE"
            style={{ color: "gray", fontWeight: 600 }}
          >
            ● Maintenance
          </option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Last Maintenance Date</label>
        <input
          type="date"
          className="form-control"
          name="lastMaintenanceDate"
          value={formData.lastMaintenanceDate}
          onChange={handleChange}
        />
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button className="btn btn-success" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </>
  );
};

export default AmbulanceTable;
