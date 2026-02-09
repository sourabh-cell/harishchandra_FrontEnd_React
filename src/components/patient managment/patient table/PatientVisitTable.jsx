import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  fetchAllPatientVisits,
  updatePatientVisit,
  clearError,
  selectVisits,
  selectLoading,
  selectError,
  selectSuccess,
} from "../../../features/patientVisitTableSlice";
import {
  selectDepartments,
  fetchDepartments,
} from "../../../features/commanSlice";
import {
  selectPatients,
  fetchPatients,
} from "../../../features/patientAutoSuggestionSlice";
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function PatientVisitTable() {
  let srNo = 1; ///For Indexing

  const dispatch = useDispatch();
  const visits = useSelector(selectVisits);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  const storeDepartments = useSelector(selectDepartments);
  const patients = useSelector(selectPatients);

  const [viewData, setViewData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientQuery, setPatientQuery] = useState("");
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Fetch patient visits, departments, and patients on mount
  useEffect(() => {
    dispatch(fetchAllPatientVisits());
    dispatch(fetchDepartments());
    dispatch(fetchPatients());
  }, [dispatch]);

  // Sync departments from store
  useEffect(() => {
    setDepartments(Array.isArray(storeDepartments) ? storeDepartments : []);
  }, [storeDepartments]);

  // Fetch doctors when department changes in edit mode
  useEffect(() => {
    if (editData && editData.departmentId) {
      fetchDoctorsByDepartment(editData.departmentId);
    }
  }, [editData?.departmentId]);

  // Fetch doctors by department
  const fetchDoctorsByDepartment = async (departmentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/${departmentId}`);
      setDoctors(response.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setDoctors([]);
    }
  };

  // Show error if any
  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Show success message
  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Patient visit updated successfully",
      });
    }
  }, [success]);

  // Handle update success separately
  useEffect(() => {
    if (updateSuccess) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Patient visit updated successfully",
      });
      setUpdateSuccess(false);
    }
  }, [updateSuccess]);

  // Handle patient search
  const handlePatientSearch = (e) => {
    const query = e.target.value;
    setPatientQuery(query);

    if (!query) {
      setPatientSuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = (patients || []).filter((p) => {
      const fullName = (p.patientName || "").toLowerCase();
      const hospitalId = String(p.patientHospitalId || "").toLowerCase();
      return fullName.includes(lowerQuery) || hospitalId.includes(lowerQuery);
    });

    setPatientSuggestions(filtered.slice(0, 8));
  };

  // Handle patient selection
  const handleSelectPatient = (patient) => {
    setEditData({
      ...editData,
      patientId: patient.patientId || patient.id,
      patientName: patient.patientName,
      patientHospitalId: patient.patientHospitalId,
    });
    setPatientQuery(`${patient.patientName} (${patient.patientHospitalId})`);
    setPatientSuggestions([]);
  };

  // Handle edit data change
  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });

    // Fetch doctors when department changes
    if (field === "departmentId") {
      setDoctors([]);
      if (value) {
        fetchDoctorsByDepartment(value);
      }
    }
  };

  // Open update modal
  const handleOpenUpdateModal = (visit) => {
    if (visit.status === "COMPLETED") {
      Swal.fire({
        icon: "error",
        title: "Cannot Update",
        text: "Once Visit is Completed Cannot be Updated",
      });
      return;
    }

    setEditData({ ...visit });
    setPatientQuery(visit.patientName ? `${visit.patientName} (${visit.patientHospitalId})` : "");
    setDoctors([]);
    setPatientSuggestions([]);

    // Fetch doctors for current department
    if (visit.departmentId) {
      fetchDoctorsByDepartment(visit.departmentId);
    }

    // Open modal manually
    const modal = new bootstrap.Modal(document.getElementById("updateModal"));
    modal.show();
  };

  // Save update
  const handleUpdate = async () => {
    if (editData) {
      const updatePayload = {
        patientId: editData.patientId ? Number(editData.patientId) : null,
        status: editData.status,
        departmentId: editData.departmentId ? Number(editData.departmentId) : null,
        doctorId: editData.doctorId ? Number(editData.doctorId) : null,
        visitDate: editData.visitDate,
        symptoms: editData.symptoms,
        reason: editData.reason,
      };

      try {
        const result = await dispatch(
          updatePatientVisit({ visitId: editData.id, updateData: updatePayload })
        );
        console.log("Update result:", result);
        if (updatePatientVisit.fulfilled.match(result)) {
          setUpdateSuccess(true);
          // Close modal
          document.querySelector("#updateModal .btn-close").click();
          // Refresh data
          dispatch(fetchAllPatientVisits());
        } else {
          throw result.payload || "Failed to update";
        }
      } catch (err) {
        console.error("Update error:", err);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: err || "Failed to update patient visit",
        });
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-info text-white text-center fs-4 fw-semibold py-3">
          Patient Visit List
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered text-center align-middle">
                <thead className="table-info">
                  <tr>
                    <th>Sr.No</th>
                    <th>PatientHospital ID</th>
                    <th>Visit Type</th>
                    <th>Status</th>
                    <th>Patient Name</th>
                    <th>Doctor Name</th>
                    <th>Visit Date</th>
                    <th>Symptoms</th>
                    <th>Reason</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {visits && visits.length > 0 ? (
                    visits.map((visit) => (
                      <tr key={visit.id}>
                        <td>{srNo++}</td>
                        <td>{visit.patientHospitalId}</td>
                        <td>{visit.visitType}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              visit.status === "ACTIVE"
                                ? "success"
                                : visit.status === "COMPLETED"
                                ? "primary"
                                : visit.status === "CANCELLED"
                                ? "danger"
                                : "warning"
                            }`}
                          >
                            {visit.status}
                          </span>
                        </td>
                        <td>{visit.patientName || "-"}</td>
                        <td>{visit.doctorName || "-"}</td>
                        <td>{visit.visitDate}</td>
                        <td>{visit.symptoms}</td>
                        <td>{visit.reason}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-1"
                            data-bs-toggle="modal"
                            data-bs-target="#viewModal"
                            onClick={() => setViewData(visit)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleOpenUpdateModal(visit)}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        No patient visits found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
      <div className="modal fade" id="viewModal">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5 className="modal-title">View Patient Visit</h5>
              <button
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            {viewData && (
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="fw-semibold">PatientHospital ID</label>
                    <input
                      className="form-control"
                      value={viewData.patientHospitalId || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Patient Name</label>
                    <input
                      className="form-control"
                      value={viewData.patientName || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Visit Type</label>
                    <input
                      className="form-control"
                      value={viewData.visitType || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Status</label>
                    <input
                      className="form-control"
                      value={viewData.status || ""}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="fw-semibold">Visit Date</label>
                    <input
                      className="form-control"
                      value={viewData.visitDate || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Symptoms</label>
                    <input
                      className="form-control"
                      value={viewData.symptoms || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Reason</label>
                    <input
                      className="form-control"
                      value={viewData.reason || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Referred By Doctor</label>
                    <input
                      className="form-control"
                      value={viewData.referredByDoctorId || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Referred To Doctor</label>
                    <input
                      className="form-control"
                      value={viewData.referredToDoctorId || "N/A"}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= UPDATE MODAL ================= */}
      <div className="modal fade" id="updateModal">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ background: "#01c0c8" }}
            >
              <h5 className="modal-title">Update Patient Visit</h5>
              <button
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            {editData && (
              <div className="modal-body">
                <div className="row g-3">
                  {/* Patient Name with Auto-suggestion */}
                  <div className="col-md-6 position-relative">
                    <label className="fw-semibold">Patient Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={patientQuery}
                      onChange={handlePatientSearch}
                      placeholder="Search patient by name or hospital ID"
                      autoComplete="off"
                    />
                    {patientSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {patientSuggestions.map((patient) => (
                          <li
                            key={patient.patientId || patient.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSelectPatient(patient)}
                            style={{ cursor: "pointer" }}
                          >
                            {patient.patientName} ({patient.patientHospitalId})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">PatientHospitalId</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editData.patientHospitalId || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Department</label>
                    <select
                      className="form-select"
                      value={editData.departmentId || ""}
                      onChange={(e) =>
                        handleEditChange("departmentId", e.target.value)
                      }
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.department_name || dept.name || `Department ${dept.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Doctor</label>
                    <select
                      className="form-select"
                      value={editData.doctorId || ""}
                      onChange={(e) =>
                        handleEditChange("doctorId", e.target.value)
                      }
                      disabled={!editData.departmentId}
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.doctorName || doc.name || `Doctor ${doc.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Visit Type</label>
                    <select
                      className="form-select"
                      value={editData.visitType || ""}
                      onChange={(e) => handleEditChange("visitType", e.target.value)}
                    >
                      <option value="OPD">OPD</option>
                      <option value="IPD">IPD</option>
                      <option value="ER">ER</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={editData.status || ""}
                      onChange={(e) => handleEditChange("status", e.target.value)}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Visit Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editData.visitDate || ""}
                      onChange={(e) => handleEditChange("visitDate", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Symptoms</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editData.symptoms || ""}
                      onChange={(e) => handleEditChange("symptoms", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold">Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editData.reason || ""}
                      onChange={(e) => handleEditChange("reason", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-success"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientVisitTable;
