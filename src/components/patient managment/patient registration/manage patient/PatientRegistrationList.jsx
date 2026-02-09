import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients, deletePatientVisit, selectPatients, selectLoading, selectError, selectSuccess } from "../../../../features/patientRegistrationListSlice";

export default function PatientRegistrationList() {
  const dispatch = useDispatch();
  const patients = useSelector(selectPatients);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  
  const [editIndex, setEditIndex] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    console.log("=== Component Mounted ===");
    dispatch(fetchPatients());
  }, [dispatch]);

  // Log state changes for debugging
  useEffect(() => {
    console.log("=== State Changed ===");
    console.log("patients:", patients);
    console.log("patients length:", patients?.length);
    console.log("loading:", loading);
    console.log("error:", error);
    console.log("success:", success);
    setDebugInfo(`Patients: ${patients?.length || 0}, Loading: ${loading}, Error: ${error?.message || error}, Success: ${success}`);
  }, [patients, loading, error, success]);

  const handleRefresh = () => {
    console.log("=== Manual Refresh ===");
    dispatch(fetchPatients());
  };

  const handleDeletePatient = (id) => {
    if (window.confirm("Delete this patient?")) {
      dispatch(deletePatientVisit(id));
    }
  };

  const handleViewPatient = (patient) => {
    setEditIndex(patient.id);
    
    document.getElementById("viewFirstName").value = patient.firstName || "";
    document.getElementById("viewLastName").value = patient.lastName || "";
    document.getElementById("viewGender").value = patient.gender || "";
    document.getElementById("viewDob").value = patient.dob || "";
    document.getElementById("viewAge").value = patient.age || "";
    document.getElementById("viewContact").value = patient.contactInfo || "";
    document.getElementById("viewBloodGroup").value = patient.bloodGroup || "";
    document.getElementById("viewCity").value = patient.addressDto?.city || "";
    document.getElementById("viewOccupation").value = patient.occupation || "";
    document.getElementById("viewEmail").value = patient.email || "";
    document.getElementById("viewEmergencyContact").value = patient.emergencyContact || "";
    document.getElementById("viewAddress").value = patient.addressDto?.addressLine1 || "";
    document.getElementById("viewPincode").value = patient.addressDto?.pincode || "";
    document.getElementById("viewState").value = patient.addressDto?.state || "";
    document.getElementById("viewIdProofType").value = patient.idProofType || "";
    document.getElementById("viewIdProofNumber").value = patient.idProofNumber || "";
    document.getElementById("viewMaritalStatus").value = patient.maritalStatus || "";
    document.getElementById("viewNote").value = patient.note || "";

    const modalEl = document.getElementById("viewModal");
    if (modalEl) {
      const modal = new window.bootstrap.Modal(modalEl);
      modal.show();
    } else {
      console.error("View modal element not found");
    }
  };

  const handleEditPatient = (patient) => {
    setEditIndex(patient.id);
    
    document.getElementById("firstName").value = patient.firstName || "";
    document.getElementById("lastName").value = patient.lastName || "";
    document.getElementById("gender").value = patient.gender || "";
    document.getElementById("dob").value = patient.dob || "";
    document.getElementById("age").value = patient.age || "";
    document.getElementById("contact").value = patient.contactInfo || "";
    document.getElementById("bloodGroup").value = patient.bloodGroup || "";
    document.getElementById("city").value = patient.addressDto?.city || "";
    document.getElementById("occupation").value = patient.occupation || "";

    clearErrors();

    const modal = new window.bootstrap.Modal(
      document.getElementById("editModal")
    );
    modal.show();
  };

  const clearErrors = () => {
    document.getElementById("firstNameError").textContent = "";
    document.getElementById("lastNameError").textContent = "";
    document.getElementById("contactError").textContent = "";
  };

  const updatePatient = () => {
    clearErrors();
    let valid = true;

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const contact = document.getElementById("contact").value.trim();

    const nameRegex = /^[A-Za-z ]+$/;
    const contactRegex = /^[0-9]{10}$/;

    if (!nameRegex.test(firstName)) {
      document.getElementById("firstNameError").textContent =
        "Only alphabets allowed";
      valid = false;
    }

    if (!nameRegex.test(lastName)) {
      document.getElementById("lastNameError").textContent =
        "Only alphabets allowed";
      valid = false;
    }

    if (!contactRegex.test(contact)) {
      document.getElementById("contactError").textContent =
        "Contact must be 10 digits";
      valid = false;
    }

    if (!valid) return;

    const modalEl = document.getElementById("editModal");
    const modal = window.bootstrap.Modal.getInstance(modalEl);
    modal.hide();
  };

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

      {/* Debug Info */}
      

      <div className="card shadow-lg rounded-4">
        <div
          className="card-header text-white text-center fs-4 fw-semibold d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#01C0C8" }}
        >
          <span>Patient Registration List</span>
          <button className="btn btn-light btn-sm" onClick={handleRefresh}>
            Refresh
          </button>
        </div>

        <div className="table-responsive p-3">
          {loading && (
            <div className="text-center py-3">
              <div className="spinner-border text-primary"></div>
              <span className="ms-2">Loading patients...</span>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger">
              <strong>Error:</strong> {error.message || error}
              <br />
              <small>Check browser console for more details</small>
            </div>
          )}

          <table className="table table-bordered table-striped text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Hospital ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>Age</th>
                <th>Contact</th>
                <th>Blood Group</th>
                <th>City</th>
                <th>Occupation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="patientTableBody">
              {patients && patients.length === 0 && !loading ? (
                <tr>
                  <td colSpan="11" className="text-muted py-4">
                    No patient records found
                  </td>
                </tr>
              ) : patients && patients.length > 0 ? (
                patients.map((p, index) => (
                  <tr key={p.id || index}>
                    <td>{index + 1}</td>
                    <td>{p.patientHospitalId || "-"}</td>
                    <td>{p.firstName} {p.lastName}</td>
                    <td>{p.gender}</td>
                    <td>{p.dob}</td>
                    <td>{p.age}</td>
                    <td>{p.contactInfo}</td>
                    <td>{p.bloodGroup}</td>
                    <td>{p.addressDto?.city || "-"}</td>
                    <td>{p.occupation}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info text-white me-1"
                        onClick={() => handleViewPatient(p)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm text-white me-1"
                        style={{ backgroundColor: "#01C0C8" }}
                        onClick={() => handleEditPatient(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleDeletePatient(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-muted py-4">
                    {loading ? "Loading..." : "No data"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      <div className="modal fade" id="editModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ backgroundColor: "#01C0C8" }}
            >
              <h5 className="modal-title">Edit Patient</h5>
              <button
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <input type="hidden" id="editIndex" />

              <div className="row g-3">
                {[
                  ["First Name", "firstName"],
                  ["Last Name", "lastName"],
                  ["Gender", "gender"],
                  ["DOB", "dob", "date"],
                  ["Age", "age", "number"],
                  ["Contact", "contact"],
                  ["Blood Group", "bloodGroup"],
                  ["City", "city"],
                  ["Occupation", "occupation"],
                ].map(([label, id, type = "text"]) => (
                  <div className="col-md-6" key={id}>
                    <label>{label}</label>
                    <input type={type} id={id} className="form-control" />
                    <small className="text-danger" id={`${id}Error`}></small>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn text-white"
                style={{ backgroundColor: "#01C0C8" }}
                onClick={updatePatient}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      <div className="modal fade" id="viewModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ backgroundColor: "#01C0C8" }}
            >
              <h5 className="modal-title">Patient Details</h5>
              <button
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label>First Name</label>
                  <input type="text" id="viewFirstName" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>Last Name</label>
                  <input type="text" id="viewLastName" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>Email</label>
                  <input type="text" id="viewEmail" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>Gender</label>
                  <input type="text" id="viewGender" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>DOB</label>
                  <input type="text" id="viewDob" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>Age</label>
                  <input type="text" id="viewAge" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>Contact</label>
                  <input type="text" id="viewContact" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>Emergency Contact</label>
                  <input type="text" id="viewEmergencyContact" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>Blood Group</label>
                  <input type="text" id="viewBloodGroup" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>City</label>
                  <input type="text" id="viewCity" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>Occupation</label>
                  <input type="text" id="viewOccupation" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>ID Proof Type</label>
                  <input type="text" id="viewIdProofType" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>ID Proof Number</label>
                  <input type="text" id="viewIdProofNumber" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>Marital Status</label>
                  <input type="text" id="viewMaritalStatus" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>Pincode</label>
                  <input type="text" id="viewPincode" className="form-control" readOnly />
                </div>
                <div className="col-md-6">
                  <label>State</label>
                  <input type="text" id="viewState" className="form-control" readOnly />
                </div>
                <div className="col-md-12">
                  <label>Address</label>
                  <textarea id="viewAddress" className="form-control" readOnly rows="2"></textarea>
                </div>
                <div className="col-md-12">
                  <label>Note</label>
                  <textarea id="viewNote" className="form-control" readOnly rows="2"></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
