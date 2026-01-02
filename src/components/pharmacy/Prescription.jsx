import React from "react";

function Prescription() {
  const themeColor = "#01C0C8";

  return (
    <div className="tab-content">
      {/* ✅ PRESCRIPTION TAB */}
      <div className="tab-pane fade show active" id="prescriptionTab" role="tabpanel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 fw-semibold">
            <i className="fa-solid fa-file-prescription me-2"></i> View Prescriptions from Doctors
          </h5>
          <button
            className="btn btn-outline-primary btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#prescriptionModal"
            style={{ borderColor: themeColor, color: themeColor }}
          >
            <i className="fa-solid fa-plus me-1"></i> Add Prescription
          </button>
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
            <tbody></tbody>
          </table>
        </div>
      </div>

      {/* 🧾 ADD / EDIT PRESCRIPTION MODAL */}
      <div className="modal fade" id="prescriptionModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content border-0 shadow-lg">
            <form id="prescriptionForm">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: themeColor }}
              >
                <h5 className="modal-title">
                  <i className="fa-solid fa-notes-medical me-2"></i> Add Prescription
                </h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Prescription ID</label>
                    <input
                      type="text"
                      id="prescId"
                      className="form-control"
                      placeholder="PR001"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Patient Name</label>
                    <input
                      type="text"
                      id="prescPatient"
                      className="form-control"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Doctor Name</label>
                    <input
                      type="text"
                      id="prescDoctor"
                      className="form-control"
                      placeholder="Dr. Smith"
                      required
                    />
                  </div>

                  {/* 💊 Medicine List */}
                  <div className="col-12">
                    <label className="form-label">Medicines</label>
                    <div id="medicineList">
                      <div className="row g-2 medicine-row">
                        <div className="col-md-5">
                          <input
                            type="text"
                            className="form-control med-name"
                            placeholder="Medicine Name"
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="number"
                            className="form-control med-qty"
                            placeholder="Qty"
                            min={1}
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control med-strength"
                            placeholder="Strength (e.g., 500mg)"
                          />
                        </div>
                        <div className="col-md-1 d-flex align-items-center">
                          <button type="button" className="btn btn-danger btn-sm remove-med">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="addMedicineBtn"
                      className="btn btn-outline-primary btn-sm mt-2"
                      style={{ borderColor: themeColor, color: themeColor }}
                    >
                      <i className="fa-solid fa-plus me-1"></i> Add Medicine
                    </button>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Date</label>
                    <input type="date" id="prescDate" className="form-control" required />
                  </div>
                </div>
              </div>

              <div className="modal-footer justify-content-center">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ backgroundColor: themeColor, color: "#fff", border: 0 }}
                >
                  <i className="fa-solid fa-save me-1"></i> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 📋 PRESCRIPTION DETAILS MODAL */}
      <div className="modal fade" id="prescriptionDetailsModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div
              className="modal-header text-white"
              style={{ backgroundColor: themeColor }}
            >
              <h5 className="modal-title fw-semibold">
                <i className="fa-solid fa-file-prescription me-2"></i> Prescription Details
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
            </div>

            <div className="modal-body">
              <div id="prescriptionDetailsContent" />
            </div>

            <div className="modal-footer justify-content-center flex-wrap gap-2">
              <button className="btn btn-success" id="dispenseBtn">
                <i className="fa-solid fa-pills me-1"></i> Dispense
              </button>
              <button className="btn btn-warning text-dark" id="partialBtn">
                <i className="fa-solid fa-hourglass-half me-1"></i> Partial
              </button>
              <button className="btn btn-primary" id="fulfillBtn">
                <i className="fa-solid fa-circle-check me-1"></i> Fulfilled
              </button>
              <button className="btn btn-danger" id="unavailableBtn">
                <i className="fa-solid fa-circle-exclamation me-1"></i> Unavailable
              </button>
              <button className="btn btn-info text-white" id="printDetailsBtn">
                <i className="fa-solid fa-print me-1"></i> Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Prescription;
