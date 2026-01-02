import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDrivers,
  selectDrivers,
  selectDriversStatus,
  selectDriversError,
} from "../../../features/ambulanceSlice";

const DriverTable = ({ searchQuery, refreshKey }) => {
  const dispatch = useDispatch();
  const drivers = useSelector(selectDrivers) || [];
  const driversStatus = useSelector(selectDriversStatus);
  const driversError = useSelector(selectDriversError);

  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // popup
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (driversStatus === "idle") dispatch(fetchDrivers());
  }, [dispatch, driversStatus]);

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [refreshKey, dispatch]);

  useEffect(() => {
    setFilteredDrivers(drivers);
    setCurrentPage(1);
  }, [drivers]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setFilteredDrivers(drivers);
    } else {
      const lower = searchQuery.toLowerCase();

      const filtered = drivers.filter((drv) =>
        Object.values(drv).some((value) =>
          String(value).toLowerCase().includes(lower)
        )
      );

      setFilteredDrivers(filtered);
    }

    setCurrentPage(1);
  }, [searchQuery, drivers]);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentData = filteredDrivers.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  const openPopup = (driver) => {
    setSelectedDriver(driver);
    setShowPopup(true);
  };

  return (
    <>
      {driversStatus === "loading" && (
        <div className="p-3 small text-muted">Loading drivers...</div>
      )}

      {driversStatus === "failed" && (
        <div className="p-3 text-danger small">
          Failed to load drivers:{" "}
          {String(driversError?.message || driversError)}
        </div>
      )}

      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th>Sr.No</th>
            <th>Driver Name</th>
            <th>License Number</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {currentData && currentData.length > 0 ? (
            currentData.map((drv, index) => (
              <tr key={drv.id || drv.driverId || index}>
                <td>{firstIndex + index + 1}</td>

                <td>{drv.driverName || drv.name}</td>
                <td>{drv.licenseNumber || drv.license}</td>
                <td>{drv.contactNumber || drv.phone}</td>

                <td className="text-center">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => openPopup(drv)}
                    title="Edit Driver"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No driver records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-end">
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

      {/* ================================
          POPUP FORM (INSIDE SAME FILE)
      ================================= */}
      {showPopup && selectedDriver && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          ></div>

          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content shadow-lg">
                <div
                  className="modal-header"
                  style={{ background: "#00C5D1", color: "white" }}
                >
                  <h5 className="modal-title">
                    <i className="bi bi-truck"></i> Edit Driver
                  </h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowPopup(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <DriverEditForm
                    driver={selectedDriver}
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

/* ========================================
   DRIVER POPUP FORM COMPONENT
======================================== */
const DriverEditForm = ({ driver, onClose }) => {
  const [formData, setFormData] = useState({
    driverName: driver.driverName || "",
    licenseNumber: driver.licenseNumber || "",
    contactNumber: driver.contactNumber || "",
    ambulanceNumber: driver.ambulanceNumber || "",
  });

  const ambulanceOptions = [
    "MH32ER7890",
    "MH12AB1234",
    "MH14XY9087",
    "MH31PQ4567",
    "MH20KL7788",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveDriver = () => {
    console.log("Updated Driver:", formData);
    // TODO: API update dispatch
    onClose();
  };

  return (
    <>
      {/* Driver Name & License */}
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Driver Name</label>
          <input
            type="text"
            name="driverName"
            className="form-control"
            value={formData.driverName}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Driver License Number</label>
          <input
            type="text"
            name="licenseNumber"
            className="form-control"
            value={formData.licenseNumber}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Contact Number & Ambulance */}
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Contact Number</label>
          <input
            type="number"
            name="contactNumber"
            className="form-control"
            value={formData.contactNumber}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Ambulance</label>
          <select
            name="ambulanceNumber"
            className="form-select"
            value={formData.ambulanceNumber}
            onChange={handleChange}
          >
            <option value="">Choose Ambulance</option>
            {ambulanceOptions.map((num, index) => (
              <option key={index} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center mt-3">
        <button
          className="btn text-white"
          onClick={saveDriver}
          style={{ background: "#00C5D1" }}
        >
          Save
        </button>
      </div>
    </>
  );
};

export default DriverTable;
