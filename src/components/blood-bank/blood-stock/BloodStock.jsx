import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStock, useUnit, clearStock, updateStockItems } from "../../../features/bloodStockSlice";
import { fetchActivePatientVisits, selectActivePatientVisits } from "../../../features/commanSlice";
import "./BloodStock.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const BloodStock = () => {
  const dispatch = useDispatch();
  const { items: bloodStock, loading, error, success } = useSelector((state) => state.bloodStock);
  const activePatientVisits = useSelector(selectActivePatientVisits);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [formData, setFormData] = useState({
    patientName: "",
    unitsUsed: 1,
  });
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const patientInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchStock());
    dispatch(fetchActivePatientVisits());
  }, [dispatch]);

  // Handle success after using unit
  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Blood unit used successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      setFormData({ patientName: "", unitsUsed: 1 });
      setSelectedStock(null);
      // Refresh to get updated data
      dispatch(clearStock());
      dispatch(fetchStock());
    }
  }, [success, dispatch]);

  // Handle error
  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Failed to use blood unit",
      });
    }
  }, [error]);

  // Filter patient suggestions based on input
  useEffect(() => {
    if (formData.patientName.trim() && activePatientVisits && activePatientVisits.length > 0) {
      const filtered = activePatientVisits.filter(patient =>
        patient.patientName && 
        patient.patientName.toLowerCase().includes(formData.patientName.toLowerCase())
      );
      setPatientSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setPatientSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.patientName, activePatientVisits]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (patientInputRef.current && !patientInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUseUnit = (stock) => {
    setSelectedStock(stock);
    setFormData({ patientName: "", unitsUsed: 1 });
    setShowModal(true);
  };

  const handleSelectPatient = (patient) => {
    setFormData({ 
      ...formData, 
      patientName: patient.patientName || patient.name || "",
      patientId: patient.patientVisitId || patient.id
    });
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.patientName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: "Please select or enter patient name",
      });
      return;
    }

    if (formData.unitsUsed < 1 || formData.unitsUsed > selectedStock.unitsAvailable) {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: `Please enter valid units (1-${selectedStock.unitsAvailable})`,
      });
      return;
    }

    // Optimistically update the local state immediately
    const updatedStock = bloodStock.map(stock => {
      if (stock.id === selectedStock.id) {
        return {
          ...stock,
          unitsAvailable: stock.unitsAvailable - formData.unitsUsed
        };
      }
      return stock;
    });
    
    // Update the Redux state directly for immediate UI update
    dispatch(updateStockItems(updatedStock));

    // Close modal immediately
    setShowModal(false);
    setFormData({ patientName: "", unitsUsed: 1 });
    setSelectedStock(null);

    // Show success message
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Blood unit used successfully!",
      timer: 2000,
      showConfirmButton: false,
    });

    // Make the API call in background
    dispatch(useUnit({
      stockId: selectedStock.id,
      unitsUsed: formData.unitsUsed,
      patientVisitId: formData.patientId,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="card full-width-card shadow-lg border-0 rounded-3 overflow-hidden">
      {/* Header */}
      <div className="card-header text-white d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center mx-auto mx-md-0">
          <i className="fa-solid fa-droplet fa-lg me-2"></i>
          <h4 className="mb-0 fw-semibold">Blood Stock</h4>
        </div>

        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-light custom-hover text-white btn-sm fw-semibold"
            onClick={() => dispatch(fetchStock())}
          >
            <i className="fa-solid fa-sync-alt me-1"></i> Refresh
          </button>
          <button className="btn btn-outline-light custom-hover text-white btn-sm fw-semibold">
            <i className="fa-regular fa-clock me-1"></i> Expired Units
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-body">
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger" role="alert">
            Error loading blood stock: {error.message || "Failed to fetch data"}
          </div>
        )}

        {!loading && !error && bloodStock && bloodStock.length > 0 && (
          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center mb-0">
              <thead className="table-light">
                <tr>
                  <th>SL.NO</th>
                  <th>Stock ID</th>
                  <th>Blood Group</th>
                  <th>Units Available</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bloodStock.map((stock, index) => (
                  <tr key={stock.id || index}>
                    <td>{index + 1}</td>
                    <td>{stock.stockId || "N/A"}</td>
                    <td>
                      <span className={`badge ${stock.bloodGroup === 'O+' ? 'text-bg-danger' : stock.bloodGroup === 'A+' ? 'text-bg-primary' : stock.bloodGroup === 'B+' ? 'text-bg-warning' : stock.bloodGroup === 'AB+' ? 'text-bg-info' : 'text-bg-secondary'}`}>
                        {stock.bloodGroup || "N/A"}
                      </span>
                    </td>
                    <td>
                      {stock.unitsAvailable > 0 ? (
                        <span className="badge bg-success">{stock.unitsAvailable}</span>
                      ) : (
                        <span className="badge bg-secondary">0</span>
                      )}
                    </td>
                    <td>{formatDate(stock.expiryDate)}</td>
                    <td>
                      {stock.unitsAvailable > 0 ? (
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleUseUnit(stock)}
                        >
                          Use Unit
                        </button>
                      ) : (
                        <button className="btn btn-secondary btn-sm" disabled>
                          No Units
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (!bloodStock || bloodStock.length === 0) && (
          <div className="text-center py-4 text-muted">
            <i className="fa-solid fa-inbox fa-2x mb-3 d-block"></i>
            No blood stock data available.
          </div>
        )}

        <p className="mt-3 text-muted small mb-0">
          Note: Actions are enabled only when units are available and not
          expired.
        </p>
      </div>

      {/* Use Unit Modal */}
      {showModal && selectedStock && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header text-white" style={{ background: "#01C0C8" }}>
                <h5 className="modal-title">Use Blood Unit</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3 position-relative" ref={patientInputRef}>
                    <label className="form-label">Patient Name <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search or enter patient name"
                      value={formData.patientName}
                      onChange={(e) => {
                        setFormData({ ...formData, patientName: e.target.value });
                        setShowSuggestions(true);
                      }}
                      onFocus={() => {
                        if (formData.patientName.trim() && patientSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      autoComplete="off"
                      required
                    />
                    {showSuggestions && patientSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}>
                        {patientSuggestions.map((patient, index) => (
                          <li
                            key={index}
                            className="list-group-item list-group-item-action"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleSelectPatient(patient)}
                          >
                            <div className="fw-semibold">{patient.patientName || patient.name}</div>
                            <small className="text-muted">ID: {patient.patientVisitId || patient.id}</small>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Units to Use <span className="text-danger">*</span></label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="1"
                      max={selectedStock.unitsAvailable}
                      value={formData.unitsUsed}
                      onChange={(e) => setFormData({ ...formData, unitsUsed: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn text-white"
                    style={{ background: "#01C0C8" }}
                  >
                    Use Unit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodStock;
