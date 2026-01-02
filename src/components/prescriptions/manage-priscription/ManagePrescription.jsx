import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchAllPrescriptions,
  deletePrescription,
  updatePrescription,
  updatePrescriptionStatus,
  selectPrescriptions,
  selectFetchPrescriptionsStatus,
  selectFetchPrescriptionsError,
} from "../../../features/priscriptionSlice";
import { NavLink } from "react-router-dom";

export default function ManagePrescription() {
  const dispatch = useDispatch();
  const prescriptions = useSelector(selectPrescriptions) || [];
  const fetchStatus = useSelector(selectFetchPrescriptionsStatus);
  const fetchError = useSelector(selectFetchPrescriptionsError);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const [search, setSearch] = useState("");

  const openViewModal = (id) => {
    const found = prescriptions.find((p) => p.id === id);
    setSelected(found);

    const modal = new window.bootstrap.Modal(
      document.getElementById("viewModal")
    );
    modal.show();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deletePrescription(id)).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Prescription has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.message || "Failed to delete prescription.",
          icon: "error",
        });
      }
    }
  };

  const handleStatusChange = async (prescription, newStatus) => {
    const result = await Swal.fire({
      title: `Change status to ${newStatus}?`,
      text: `Are you sure you want to update the status?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#01C0C8",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(
          updatePrescriptionStatus({
            prescriptionId: prescription.id || prescription.prescriptionId,
            status: newStatus,
          })
        ).unwrap();
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: `Status changed to ${newStatus}`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Failed to update",
          text: error.message || "Could not update status",
        });
      }
    }
  };

  useEffect(() => {
    if (fetchStatus === "idle") dispatch(fetchAllPrescriptions());
  }, [dispatch, fetchStatus]);

  const filteredRows = prescriptions.filter((r) => {
    const patient = r.patientName || r.patient || r.patientFullName || "";
    const doctor = r.doctorName || r.doctor || r.doctorFullName || "";
    const searchMatch =
      patient.toLowerCase().includes(search.toLowerCase()) ||
      doctor.toLowerCase().includes(search.toLowerCase());

    return searchMatch;
  });
  // print button
  const handlePrint = () => {
    const printContent = document.getElementById("printArea");
    if (!printContent) {
      alert("Print content not found!");
      return;
    }

    const printWindow = window.open("", "", "width=900,height=700");

    // Copy all stylesheet links so printing looks the same as modal view
    const stylesheets = Array.from(document.styleSheets)
      .map((sheet) => `<link rel="stylesheet" href="${sheet.href}">`)
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Prescription Print</title>
        ${stylesheets}
 
        <style>
          /* Ensure the print area fits neatly */
          body {
            margin: 20px;
            font-family: Arial, sans-serif;
            background: white;
          }
 
          @page {
            size: A4;
            margin: 20mm;
          }
        </style>
      </head>
 
      <body>${printContent.innerHTML}</body>
    </html>
  `);

    printWindow.document.close();

    // Wait to load styles
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <>
      <div className="full-width-card card shadow border-0 rounded-3">
        <div
          className=" text-white text-center py-3 rounded-top fw-semibold"
          style={{ backgroundColor: "#01C0C8" }}
        >
          <i className="bi bi-file-medical-fill me-2"></i>
          Patient Prescription List
        </div>

        <div className="card-body">
          {/* Search + Filter */}
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Search</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search patient or doctor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            {fetchStatus === "loading" && (
              <div className="text-center my-3">Loading prescriptions...</div>
            )}
            {fetchStatus === "failed" && (
              <div className="text-center text-danger my-3">{fetchError}</div>
            )}
            <table className="table table-bordered align-middle text-center">
              <thead className="table-info">
                <tr>
                  <th>#</th>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr key={row.id || row.prescriptionId || idx}>
                    <td>{idx + 1}</td>
                    <td>{row.patientName || row.patient}</td>
                    <td>{row.doctorName || row.doctor}</td>
                    <td>{row.departmentName || row.department}</td>
                    <td>{row.prescriptionDate || row.date}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={row.status || ""}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus) {
                            handleStatusChange(row, newStatus);
                          }
                        }}
                        disabled={row.status === "TRANSFERED_TO_PHARMACY"}
                        style={{
                          width: "auto",
                          display: "inline-block",
                          fontSize: "12px",
                        }}
                      >
                        <option
                          value="PENDING"
                          disabled={row.status === "TRANSFERED_TO_PHARMACY"}
                        >
                          PENDING
                        </option>
                        <option value="TRANSFERED_TO_PHARMACY">
                          TRANSFERED TO PHARMACY
                        </option>
                      </select>
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          openViewModal(row.id || row.prescriptionId)
                        }
                        className="btn btn-primary btn-sm text-white me-1"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <NavLink
                        className="btn btn-warning btn-sm text-dark me-1 edit-btn-hover"
                        to={`/dashboard/edit-prescription/${
                          row.id || row.prescriptionId
                        }`}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </NavLink>
                      <button
                        className="btn btn-danger btn-sm edit1-btn-hover"
                        onClick={() =>
                          handleDelete(row.id || row.prescriptionId)
                        }
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <h5 className="modal-title">
                <i className="bi bi-file-earmark-medical"></i> Prescription
              </h5>
              <button
                type="button"
                className="btn-close bg-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selected && (
                <div id="printArea" className="p-3">
                  <div className="text-center mb-4">
                    <img
                      className="my-2"
                      src="/assets/images/harishchandra-logo-mini.png"
                      alt="Hospital Logo"
                      style={{
                        width: "60px",
                        height: "60px",
                        marginRight: "15px",
                      }}
                    />
                    <h4 className="fw-bold text-primary">
                      HARISHCHANDRA MULTISPECIALIST HOSPITAL
                    </h4>
                    <p className="mb-0">Shivaji Nagar, Pune – 411005</p>
                    <p className="mb-0">Phone: +91 9876543210</p>
                    <hr />
                    <h5 className="fw-bold text-primary">PRESCRIPTION</h5>
                  </div>

                  <p>
                    <strong>Patient Name:</strong> {selected.patientName}
                  </p>
                  <p>
                    <strong>Doctor:</strong> {selected.doctorName}
                  </p>
                  <p>
                    <strong>Department:</strong> {selected.departmentName}
                  </p>
                  <p>
                    <strong>Date:</strong> {selected.prescriptionDate}
                  </p>

                  <hr />

                  <p>
                    <strong>Diagnosis:</strong>
                  </p>
                  <p>{selected.diagnosis}</p>

                  <p className="mt-3">
                    <strong>Symptoms:</strong>
                  </p>
                  <p>{selected.symptoms}</p>

                  <hr />

                  <p>
                    <strong>Medicines:</strong>
                  </p>
                  <div style={{ marginLeft: "20px" }}>
                    {selected.medicines.map((m, i) => (
                      <p key={i} className="mb-1">
                        <strong>{i + 1})</strong> {m.medicineName} —{" "}
                        <em>{m.frequency}</em>, <em>{m.duration}</em>
                      </p>
                    ))}
                  </div>

                  <hr />

                  <p>
                    <strong>Additional Notes:</strong>
                  </p>
                  <p>{selected.additionalNotes}</p>

                  <br />
                  <br />

                  <div className="text-end mt-4">
                    <p className="fw-bold mb-0">{selected.doctorName}</p>
                    <small>Signature</small>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="button"
                style={{ backgroundColor: "#aaaaaa" }}
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button className="button btn-primary" onClick={handlePrint}>
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
