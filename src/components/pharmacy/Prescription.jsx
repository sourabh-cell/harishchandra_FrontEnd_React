import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllPharmacyPrescriptions,
  selectPharmacyPrescriptions,
  selectFetchPharmacyPrescriptionsStatus,
  selectFetchPharmacyPrescriptionsError,
} from "../../features/pharmacyPrescriptionSlice";
import {
  fetchMedicines,
  selectMedicines,
} from "../../features/commanSlice";
import axiosInstance from "../../api/axiosConfig";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

function Prescription() {
  const dispatch = useDispatch();
  const prescriptions = useSelector(selectPharmacyPrescriptions);
  const fetchStatus = useSelector(selectFetchPharmacyPrescriptionsStatus);
  const fetchError = useSelector(selectFetchPharmacyPrescriptionsError);
  const medicines = useSelector(selectMedicines);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // Dispense modal state
  const [dispenseModalOpen, setDispenseModalOpen] = useState(false);
  const [dispenseItems, setDispenseItems] = useState([{ medicineId: "", medicineName: "", quantity: 1, searchResults: [] }]);
  const [loading, setLoading] = useState(false);
  const [activeMedicineIndex, setActiveMedicineIndex] = useState(null);
  
  // Refs for auto-suggestion dropdowns
  const suggestionRefs = useRef([]);

  const themeColor = "#01C0C8";

  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchAllPharmacyPrescriptions());
    }
  }, [fetchStatus, dispatch]);

  // Fetch medicines when dispense modal opens
  useEffect(() => {
    if (dispenseModalOpen) {
      dispatch(fetchMedicines());
    }
  }, [dispenseModalOpen, dispatch]);

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
  };

  const handleDispense = (prescription) => {
    console.log("Prescription data:", prescription);
    console.log("Prescription items:", prescription.items);
    setSelectedPrescription(prescription);
    setDispenseModalOpen(true);
    // Pre-populate with prescription items if available
    if (prescription.items && prescription.items.length > 0) {
      console.log("Pre-populating with prescription items...");
      setDispenseItems(
        prescription.items.map(item => ({
          medicineId: item.medicineId || item.id || "",
          medicineName: item.medicineName || item.name || "",
          quantity: item.quantity || 1
        }))
      );
    } else {
      setDispenseItems([{ medicineId: "", medicineName: "", quantity: 1, searchResults: [] }]);
    }
  };

  const closeDispenseModal = () => {
    setDispenseModalOpen(false);
    setDispenseItems([{ medicineId: "", medicineName: "", quantity: 1 }]);
  };

  const handleMedicineSearch = (index, searchTerm) => {
    console.log("Searching medicine at index:", index, "term:", searchTerm);
    const updatedItems = [...dispenseItems];
    updatedItems[index].medicineName = searchTerm;
    updatedItems[index].medicineId = "";
    console.log("Cleared medicineId for index:", index);
    setDispenseItems(updatedItems);
    setActiveMedicineIndex(index);

    if (searchTerm.length > 0) {
      // Convert medicines object to array and filter
      const medicinesArray = Object.entries(medicines).map(([id, name]) => ({
        id: parseInt(id),
        name
      }));
      
      console.log("All medicines array:", medicinesArray);
      
      const filtered = medicinesArray.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      console.log("Filtered results:", filtered);
      
      const itemsWithResults = [...dispenseItems];
      itemsWithResults[index].searchResults = filtered;
      setDispenseItems(itemsWithResults);
    } else {
      const itemsWithResults = [...dispenseItems];
      itemsWithResults[index].searchResults = [];
      setDispenseItems(itemsWithResults);
    }
  };

  const selectMedicine = (index, medicine) => {
    console.log("Selecting medicine at index:", index, "medicine:", medicine);
    const updatedItems = [...dispenseItems];
    updatedItems[index].medicineId = medicine.id;
    updatedItems[index].medicineName = medicine.name;
    updatedItems[index].searchResults = [];
    console.log("Updated item:", updatedItems[index]);
    setDispenseItems(updatedItems);
    setActiveMedicineIndex(null);
  };

  const addMedicineRow = () => {
    setDispenseItems([...dispenseItems, { medicineId: "", medicineName: "", quantity: 1, searchResults: [] }]);
  };

  const removeMedicineRow = (index) => {
    if (dispenseItems.length > 1) {
      const updatedItems = dispenseItems.filter((_, i) => i !== index);
      setDispenseItems(updatedItems);
    }
  };

  const updateQuantity = (index, quantity) => {
    const updatedItems = [...dispenseItems];
    const parsedQuantity = parseInt(quantity) || 0;
    updatedItems[index].quantity = parsedQuantity;
    setDispenseItems(updatedItems);
  };

  const handleSubmitDispense = async () => {
    // Log all dispenseItems to debug medicineId
    console.log("dispenseItems:", dispenseItems);
    
    // Validate
    const validItems = dispenseItems.filter(item => item.medicineId && item.quantity > 0);
    console.log("validItems:", validItems);
    
    if (validItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please add at least one medicine with valid quantity",
      });
      return;
    }

    if (!selectedPrescription || !selectedPrescription.id) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "No prescription selected",
      });
      return;
    }

    setLoading(true);
    const payload = validItems.map(item => ({
      medicineId: item.medicineId,
      quantity: item.quantity
    }));

    console.log("Payload being sent:", payload);

    try {
      const response = await axiosInstance.put(`/pharmacy/prescriptions/dispense/${selectedPrescription.id}`, payload);

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Dispense Successful",
          text: "Medicine Dispense SuccessFully",
          timer: 3000,
          showConfirmButton: false,
        });
        closeDispenseModal();
        dispatch(fetchAllPharmacyPrescriptions());
      } else {
        Swal.fire({
          icon: "error",
          title: "Dispense Failed",
          text: "Failed to dispense prescription",
        });
      }
    } catch (error) {
      console.error("Error dispensing prescription:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error dispensing prescription",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("prescriptionPrintContent").innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${selectedPrescription?.prescriptionId || ""}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @page { margin: 0.5cm; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 15px;
              font-size: 14px;
            }
            .prescription-header {
              text-align: center;
              border-bottom: 2px solid #01C0C8;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .hospital-name {
              font-size: 24px;
              font-weight: bold;
              color: #01C0C8;
              margin-bottom: 5px;
            }
            .hospital-address {
              font-size: 12px;
              color: #666;
            }
            .prescription-title {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              background-color: #f8f9fa;
              padding: 10px;
              margin-bottom: 20px;
              border-radius: 5px;
            }
            .patient-info {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .patient-info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .patient-info-row:last-child {
              margin-bottom: 0;
            }
            .patient-info-label {
              font-weight: 600;
              color: #333;
            }
            .diagnosis-section {
              margin-bottom: 20px;
            }
            .diagnosis-label {
              font-weight: 600;
              color: #333;
              margin-bottom: 5px;
            }
            .medicine-table {
              margin-bottom: 20px;
            }
            .medicine-table th {
              background-color: #01C0C8;
              color: white;
              text-align: center;
            }
            .medicine-table td {
              vertical-align: middle;
            }
            .notes-section {
              background-color: #fff3cd;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #ffc107;
            }
            .signature-section {
              margin-top: 40px;
              text-align: right;
            }
            .signature-line {
              border-top: 1px solid #333;
              width: 200px;
              display: inline-block;
              margin-top: 5px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 11px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getStatusBadge = (status) => {
    const badges = {
      DISPENSED: "bg-success",
      PENDING: "bg-warning text-dark",
      FULFILLED: "bg-primary",
      UNAVAILABLE: "bg-danger",
      PARTIAL: "bg-info",
    };
    return badges[status] || "bg-secondary";
  };

  return (
    <div className="tab-content">
      {/* ✅ PRESCRIPTION TAB */}
      <div className="tab-pane fade show active" id="prescriptionTab" role="tabpanel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 fw-semibold">
            <i className="fa-solid fa-file-prescription me-2"></i> View Prescriptions from Doctors
          </h5>
        </div>

        {/* 📋 Prescription Table */}
        <div className="table-responsive table-wrap">
          <table className="table table-bordered table-hover mb-0" id="prescriptionTable">
            <thead className="table-light text-center align-middle">
              <tr>
                <th>#</th>
                <th>Prescription ID</th>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetchStatus === "loading" && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}
              {fetchStatus === "failed" && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-danger">
                    {fetchError || "Failed to load prescriptions"}
                  </td>
                </tr>
              )}
              {fetchStatus === "succeeded" && prescriptions.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No prescriptions found
                  </td>
                </tr>
              )}
              {fetchStatus === "succeeded" &&
                prescriptions.map((prescription, index) => (
                  <tr key={prescription.id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">{prescription.prescriptionId}</td>
                    <td>{prescription.patientName}</td>
                    <td>{prescription.doctorName}</td>
                    <td className="text-center">{prescription.date}</td>
                    <td className="text-center">
                      <span className={`badge ${getStatusBadge(prescription.status)}`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td className="text-center no-print">
                      <button
                        className="btn btn-sm btn-info text-white me-1"
                        data-bs-toggle="modal"
                        data-bs-target="#prescriptionDetailsModal"
                        onClick={() => handleViewPrescription(prescription)}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-success me-1"
                        onClick={() => handleDispense(prescription)}
                        disabled={prescription.status === "DISPENSED"}
                        title={prescription.status === "DISPENSED" ? "Already Dispensed" : "Dispense Prescription"}
                      >
                        <i className="fa-solid fa-check-double"></i>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📋 PRESCRIPTION DETAILS MODAL */}
      <div className="modal fade" id="prescriptionDetailsModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "10px", overflow: "hidden" }}>
            {/* Modal Body with Prescription Layout */}
            <div className="modal-body p-0">
              {selectedPrescription ? (
                <div id="prescriptionPrintContent">
                  {/* Hospital Header */}
                  <div className="prescription-header" style={{ backgroundColor: "#f8f9fa", padding: "20px", margin: 0 }}>
                    <div className="hospital-name" style={{ fontSize: "28px" }}>HARISHCHANDRA HOSPITAL</div>
                    <div className="hospital-address">
                      Near City Center, Main Road, Mumbai - 400001<br />
                      Phone: +91 98765 43210 | Email: info@harishchandra.com
                    </div>
                  </div>

                  {/* Prescription Title */}
                  <div className="prescription-title" style={{ margin: "15px 20px" }}>
                    PHARMACY PRESCRIPTION
                  </div>

                  {/* Patient Info */}
                  <div className="patient-info" style={{ margin: "0 20px 15px 20px" }}>
                    <div className="patient-info-row">
                      <span><span className="patient-info-label">Prescription ID:</span> #{selectedPrescription.prescriptionId}</span>
                      <span><span className="patient-info-label">Date:</span> {selectedPrescription.date}</span>
                    </div>
                    <div className="patient-info-row">
                      <span><span className="patient-info-label">Patient Name:</span> {selectedPrescription.patientName}</span>
                      <span><span className="patient-info-label">Age:</span> {selectedPrescription.patientAge} years</span>
                    </div>
                    <div className="patient-info-row">
                      <span><span className="patient-info-label">Doctor:</span> {selectedPrescription.doctorName}</span>
                      <span><span className="patient-info-label">Status:</span>{" "}
                        <span className={`badge ${getStatusBadge(selectedPrescription.status)}`}>
                          {selectedPrescription.status}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="diagnosis-section" style={{ margin: "0 20px 15px 20px" }}>
                    <div className="diagnosis-label">Diagnosis:</div>
                    <div>{selectedPrescription.diagnosis}</div>
                  </div>

                  {/* Medicines Table */}
                  <div className="medicine-table" style={{ margin: "0 20px 15px 20px" }}>
                    <div className="diagnosis-label">Prescribed Medicines:</div>
                    <table className="table table-bordered table-sm" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: "50px", textAlign: "center", backgroundColor: "#01C0C8", color: "white" }}>#</th>
                          <th style={{ backgroundColor: "#01C0C8", color: "white" }}>Medicine Name</th>
                          <th style={{ width: "120px", backgroundColor: "#01C0C8", color: "white" }}>Duration</th>
                          <th style={{ width: "180px", backgroundColor: "#01C0C8", color: "white" }}>Frequency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPrescription.items && selectedPrescription.items.length > 0 ? (
                          selectedPrescription.items.map((item, index) => (
                            <tr key={item.id || index}>
                              <td style={{ textAlign: "center" }}>{index + 1}</td>
                              <td><strong>{item.medicineName}</strong></td>
                              <td>{item.duration || "-"}</td>
                              <td>{item.frequency || "-"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center">
                              No medicines prescribed
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Notes */}
                  {selectedPrescription.notes && (
                    <div className="notes-section" style={{ margin: "0 20px 15px 20px" }}>
                      <strong><i className="fa-solid fa-clipboard-list me-2"></i>Special Instructions:</strong>
                      <div className="mt-2">{selectedPrescription.notes}</div>
                    </div>
                  )}

                  {/* Signature */}
                  <div className="signature-section" style={{ margin: "30px 20px 20px 20px", textAlign: "right" }}>
                    <div className="signature-line" style={{ display: "inline-block", borderTop: "1px solid #333", width: "200px", marginTop: "5px" }}></div>
                    <div style={{ marginTop: "5px" }}>Doctor{'s'} Signature</div>
                  </div>

                  {/* Footer */}
                  <div className="footer" style={{ backgroundColor: "#f8f9fa", padding: "15px", textAlign: "center", fontSize: "11px", color: "#666", borderTop: "1px solid #ddd" }}>
                    This prescription is generated electronically. Please consult your doctor before taking any medicines.<br />
                    Powered by HarishChandra Hospital Management System
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No prescription data available</p>
                </div>
              )}
            </div>

            {/* Modal Footer with Buttons */}
            <div className="modal-footer" style={{ backgroundColor: "#f8f9fa", borderTop: "1px solid #ddd" }}>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                <i className="fa-solid fa-times me-1"></i> Close
              </button>
              <button className="btn btn-info text-white" id="printDetailsBtn" onClick={handlePrint} style={{ marginLeft: "10px" }}>
                <i className="fa-solid fa-print me-1"></i> Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 DISPENSE MEDICINE MODAL */}
      <div className={`modal fade ${dispenseModalOpen ? "show" : ""}`} id="dispenseModal" tabIndex={-1} aria-hidden={!dispenseModalOpen} style={{ display: dispenseModalOpen ? "block" : "none" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "10px" }}>
            <div className="modal-header" style={{ backgroundColor: "#01C0C8", color: "white" }}>
              <h5 className="modal-title">
                <i className="fa-solid fa-pills me-2"></i> Dispense Medicines
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={closeDispenseModal} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedPrescription && (
                <div className="mb-3 p-2 bg-light rounded">
                  <strong>Prescription ID:</strong> {selectedPrescription.prescriptionId}<br />
                  <strong>Patient:</strong> {selectedPrescription.patientName}<br />
                  <strong>Doctor:</strong> {selectedPrescription.doctorName}
                </div>
              )}
              
              <div className="mb-2 d-flex justify-content-between align-items-center">
                <strong>Dispense Items:</strong>
                <button className="btn btn-sm btn-primary" onClick={addMedicineRow}>
                  <i className="fa-solid fa-plus me-1"></i> Add Medicine
                </button>
              </div>
              
              {dispenseItems.map((item, index) => (
                <div key={index} className="row mb-2 align-items-center">
                  <div className="col-6 position-relative">
                    <label className="form-label small mb-1">Medicine Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search medicine..."
                      value={item.medicineName}
                      onChange={(e) => handleMedicineSearch(index, e.target.value)}
                      autoComplete="off"
                    />
                    {activeMedicineIndex === index && item.searchResults && item.searchResults.length > 0 && (
                      <ul className="list-group position-absolute w-100 mt-1" style={{ zIndex: 1000, maxHeight: "150px", overflowY: "auto" }}>
                        {item.searchResults.map((med) => (
                          <li
                            key={med.id}
                            className="list-group-item list-group-item-action py-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => selectMedicine(index, med)}
                          >
                            {med.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="col-4">
                    <label className="form-label small mb-1">Quantity</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(index, e.target.value)}
                    />
                  </div>
                  <div className="col-2">
                    <button
                      className="btn btn-sm btn-outline-danger mt-3"
                      onClick={() => removeMedicineRow(index)}
                      disabled={dispenseItems.length === 1}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeDispenseModal}>
                <i className="fa-solid fa-times me-1"></i> Cancel
              </button>
              <button className="btn btn-success" onClick={handleSubmitDispense} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check me-1"></i> Submit Dispense
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {dispenseModalOpen && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default Prescription;
