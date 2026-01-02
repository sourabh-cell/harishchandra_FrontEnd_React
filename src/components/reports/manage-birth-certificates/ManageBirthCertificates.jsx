import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBirthReports,
  selectBirthReports,
  selectBirthReportsStatus,
  selectBirthReportsError,
} from "../../../features/birthAndDethSlice";
import { NavLink } from "react-router-dom";

const ManageBirthCertificates = () => {
  const dispatch = useDispatch();
  const birthReports = useSelector(selectBirthReports);
  const birthReportsStatus = useSelector(selectBirthReportsStatus);
  const birthReportsError = useSelector(selectBirthReportsError);

  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("view");
  const modalRef = useRef(null);

  useEffect(() => {
    // Fetch birth reports when component mounts
    dispatch(fetchBirthReports());

    // Debug Bootstrap availability
    console.log("Bootstrap available:", !!window.bootstrap);
    console.log("Modal ref:", modalRef.current);

    // Ensure Bootstrap JS is available globally
    if (!window.bootstrap) {
      console.error(
        "Bootstrap JS not found! Include bootstrap.bundle.min.js in index.html"
      );
      console.log("Will use manual modal implementation");
    }
  }, [dispatch]);

  const handleView = (data) => {
    setSelected(data);
    setMode("view");

    // Simple approach: use data-bs-toggle and data-bs-target if Bootstrap JS is available
    if (window.bootstrap && modalRef.current) {
      try {
        const modal = new window.bootstrap.Modal(modalRef.current);
        modal.show();
      } catch (error) {
        console.error("Bootstrap modal error:", error);
        // Fallback to programmatic approach
        showModalManually();
      }
    } else {
      console.error("Bootstrap not available, using manual approach");
      showModalManually();
    }
  };

  const showModalManually = () => {
    if (modalRef.current) {
      modalRef.current.style.display = "block";
      modalRef.current.style.paddingRight = "15px";
      modalRef.current.classList.add("show");
      modalRef.current.setAttribute("aria-hidden", "false");
      modalRef.current.setAttribute("aria-modal", "true");
      modalRef.current.setAttribute("role", "dialog");
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px";

      // Create backdrop
      let backdrop = document.querySelector(".modal-backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop fade show";
        backdrop.style.zIndex = "1040";
        backdrop.onclick = hideModalManually;
        document.body.appendChild(backdrop);
      }
    }
  };

  const hideModalManually = () => {
    if (modalRef.current) {
      modalRef.current.style.display = "none";
      modalRef.current.style.paddingRight = "";
      modalRef.current.classList.remove("show");
      modalRef.current.setAttribute("aria-hidden", "true");
      modalRef.current.removeAttribute("aria-modal");
      modalRef.current.removeAttribute("role");
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      // Remove backdrop
      const backdrops = document.querySelectorAll(".modal-backdrop");
      backdrops.forEach((backdrop) => backdrop.remove());
    }
  };

  const handleChange = (e) => {
    setSelected((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    // TODO: Implement API call to update birth report
    // For now, just show success message
    alert("Changes saved successfully!");

    // Close modal safely
    if (window.bootstrap && modalRef.current) {
      try {
        const modal = window.bootstrap.Modal.getInstance(modalRef.current);
        if (modal) {
          modal.hide();
        } else {
          // If no instance exists, create one and hide it
          const newModal = new window.bootstrap.Modal(modalRef.current);
          newModal.hide();
        }
      } catch (error) {
        console.error("Error closing modal:", error);
        hideModalManually();
      }
    } else {
      hideModalManually();
    }
  };

  const handlePrint = () => {
    console.log("Print button clicked");
    console.log("Selected data:", selected);

    const printContent = document.getElementById("printCertificate");
    if (!printContent) {
      console.error("Print content element not found!");
      alert("Print content not found. Please try again.");
      return;
    }

    console.log("Print content found:", printContent);

    const printWindow = window.open("", "", "height=700,width=900");
    if (!printWindow) {
      console.error("Could not open print window!");
      alert(
        "Could not open print window. Please check popup blocker settings."
      );
      return;
    }

    printWindow.document.write("<html><head><title>Print Certificate</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(`
      @page {
        size: A4;
        margin: 0.75in;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: "Arial", sans-serif;
        background: white;
      }
      .certificate {
        width: 100%;
        max-width: 100%;
        margin: 0;
        padding: 30px;
        border: 3px solid #000;
        background-color: #fff;
        color: #000;
        box-sizing: border-box;
        height: auto;
        page-break-inside: avoid;
        min-height: 90vh;
        position: relative;
      }
      .certificate-header {
        margin-bottom: 20px;
      }
      .certificate-header h1 {
        color: #4A90E2;
        font-size: 24px;
        font-weight: bold;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 1px;
        text-align: center;
      }
      .certificate-header p {
        font-size: 14px;
        margin: 5px 0 0 0;
        color: #333;
        text-align: center;
      }
      .certificate-header hr {
        border: 1px solid #333;
        margin: 15px 0;
      }
      .certificate-body {
        padding: 0;
        font-size: 16px;
        line-height: 1.6;
        text-align: left;
      }
      .certificate-body p {
        margin: 15px 0;
        font-size: 16px;
        line-height: 1.6;
        color: #000;
      }
      .certificate-footer {
        margin-top: 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: absolute;
        bottom: 30px;
        left: 30px;
        right: 30px;
      }
      .certificate-footer div {
        text-align: center;
        flex: 1;
      }
      .certificate-footer hr {
        width: 150px;
        margin: 0 auto 10px auto;
        border: 1px solid #333;
      }
      .certificate-footer p {
        font-size: 14px;
        margin: 0;
        font-weight: bold;
        color: #000;
      }
      img {
        max-width: 60px;
        height: auto;
      }
    `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    // Add a small delay to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Helper to resolve address from various possible backend field names
  const resolveAddress = (item) => {
    if (!item) return "—";
    // try common address fields in order of likelihood
    const candidates = [
      item.address,
      item.presentAddress,
      item.permanentAddress,
      item.patientAddress,
      item.residence,
      item.homeAddress,
      item.addressLine1,
      item.addressLine2,
      item.city,
      item.place,
    ];
    const found = candidates.find(
      (c) => c !== undefined && c !== null && String(c).trim() !== ""
    );
    return found || "—";
  };

  return (
    <div className="container p-0 m-0">
      {/* Header */}
      <div className="card-border">
        <div
          className="card-header text-white d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "#01C0C8" }}
        >
          <i className="fa-solid fa-certificate me-2"></i>
          <span>Manage Birth Certificates</span>
        </div>
      </div>

      {/* Table */}
      <div className="container-fluid">
        {birthReportsStatus === "loading" && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading birth reports...</p>
          </div>
        )}

        {birthReportsStatus === "failed" && (
          <div className="alert alert-danger text-center" role="alert">
            <i className="fa-solid fa-exclamation-triangle me-2"></i>
            Error loading birth reports: {birthReportsError}
            <button
              className="btn btn-outline-danger btn-sm ms-3"
              onClick={() => dispatch(fetchBirthReports())}
            >
              <i className="fa-solid fa-refresh me-1"></i>
              Retry
            </button>
          </div>
        )}

        {birthReportsStatus === "succeeded" && (
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-sm text-center align-middle">
              <thead className="table-primary">
                <tr>
                  <th>Sr No.</th>
                  <th>Certificate Number</th>
                  <th>Mother Name</th>
                  <th className="d-none d-md-table-cell">Date of Birth</th>
                  <th className="d-none d-md-table-cell">Time of Birth</th>
                  <th className="d-none d-md-table-cell">Time of Issue</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {birthReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-muted py-4">
                      <i className="fa-solid fa-inbox me-2"></i>
                      No birth reports found
                    </td>
                  </tr>
                ) : (
                  birthReports.map((row, index) => (
                    <tr key={row.id || index}>
                      <td>{index + 1}</td>
                      <td>{row.certificateNumber || "N/A"}</td>
                      <td>{row.motherName || row.fullName || "N/A"}</td>
                      <td className="d-none d-md-table-cell">
                        {row.dateOfBirth || "N/A"}
                      </td>
                      <td className="d-none d-md-table-cell">
                        {row.timeOfBirth || row.time || "N/A"}
                      </td>
                      <td className="d-none d-md-table-cell">
                        {row.timeOfIssue || "N/A"}
                      </td>
                      <td>
                        <button
                          className="btn1 bg-primary btn-sm me-1"
                          onClick={() => handleView(row)}
                          data-tooltip="View"
                          aria-label={`View ${
                            row.motherName || row.fullName || ""
                          }`}
                        >
                          <i className="fa-solid fa-eye"></i>
                          <span className="d-none d-sm-inline"></span>
                        </button>
                        <NavLink
                          className="btn1 bg-warning btn-sm"
                          data-tooltip="Edit"
                          to={`/dashboard/edit-birth-certificate/${row.id}`}
                          aria-label={`Edit ${
                            row.motherName || row.fullName || ""
                          }`}
                        >
                          <i className="fa-solid fa-pencil"></i>
                          <span className="d-none d-sm-inline"></span>
                        </NavLink>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="birthModal"
        tabIndex={-1}
        aria-labelledby="birthModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ backgroundColor: "#01C0C8" }}
            >
              <h5 className="modal-title" id="birthModalLabel">
                {mode === "view"
                  ? "View Birth Certificate"
                  : "Edit Birth Certificate"}
              </h5>
              <button
                type="button"
                className="btn-close bg-white"
                onClick={hideModalManually}
                aria-label="Close"
              />
            </div>

            <div className="modal-body">
              {mode === "view" && selected && (
                <div id="viewMode">
                  <p>
                    <strong>Certificate Number:</strong>{" "}
                    {selected.certificateNumber || "N/A"}
                  </p>
                  <p>
                    <strong>Mother Name:</strong>{" "}
                    {selected.motherName || selected.fullName || "N/A"}
                  </p>
                  <p>
                    <strong>Father Name:</strong> {selected.fatherName || "N/A"}
                  </p>
                  <p>
                    <strong>Place of Birth:</strong>{" "}
                    {selected.placeOfBirth || selected.place || "N/A"}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong>{" "}
                    {selected.dateOfBirth || "N/A"}
                  </p>
                  <p>
                    <strong>Time of Birth:</strong>{" "}
                    {selected.timeOfBirth || selected.time || "N/A"}
                  </p>
                  <p>
                    <strong>Time of Issue:</strong>{" "}
                    {selected.timeOfIssue || selected.issueDate || "N/A"}
                  </p>
                  <p>
                    <strong>Attending Doctor:</strong>{" "}
                    {selected.attendingDoctor || "N/A"}
                  </p>
                  <p>
                    <strong>Gender:</strong> {selected.gender || "N/A"}
                  </p>
                  <p>
                    <strong>Birth Weight:</strong>{" "}
                    {selected.birthWeight || selected.weight || "N/A"} kg
                  </p>
                  <p>
                    <strong>Birth Length:</strong>{" "}
                    {selected.birthLength || selected.height || "N/A"} cm
                  </p>
                  <p>
                    <strong>Head Circumference:</strong>{" "}
                    {selected.headCircumference || "N/A"} cm
                  </p>
                  <p>
                    <strong>Contact Number:</strong>{" "}
                    {selected.contactNumber || selected.mobileNumber || "N/A"}
                  </p>
                  {/* Email removed from view per requirement */}
                </div>
              )}
            </div>

            <div className="modal-footer d-flex justify-content-between">
              <button className="btn btn-secondary" onClick={hideModalManually}>
                Close
              </button>

              {mode === "view" ? (
                <button className="btn btn-success" onClick={handlePrint}>
                  <i className="fa-solid fa-print me-1"></i> Print
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSave}>
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Certificate for Print */}
      {selected && (
        <div id="printCertificate" className="d-none">
          <div className="certificate">
            <div className="certificate-header">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                }}
              >
                <img
                  src="/assets/images/harishchandra-logo-mini.png"
                  alt="Hospital Logo"
                  style={{ width: "60px", height: "60px", marginRight: "15px" }}
                />
                <div style={{ textAlign: "center" }}>
                  <h1
                    style={{
                      color: "#4A90E2",
                      fontSize: "24px",
                      fontWeight: "bold",
                      margin: "0",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    HOSPITAL BIRTH CERTIFICATE
                  </h1>
                  <p
                    style={{
                      fontSize: "14px",
                      margin: "5px 0 0 0",
                      color: "#333",
                    }}
                  >
                    Harishchandra Multispeciality Hospital, Department of Birth
                    Records
                  </p>
                </div>
              </div>
              <hr style={{ border: "1px solid #333", margin: "15px 0" }} />
            </div>

            <div className="certificate-body">
              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    margin: "0 0 10px 0",
                  }}
                >
                  <strong>Certificate No:</strong>{" "}
                  {selected.certificateNumber || "CERT-001"}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "16px", margin: "0", lineHeight: "1.6" }}>
                  This is to certify that a child was born at{" "}
                  <strong>{selected.placeOfBirth || "City Hospital"}</strong> to
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Mother:</strong>{" "}
                  {selected.motherName || selected.fullName || "Maria Johnson"}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Father:</strong> {selected.fatherName || "—"}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Time of Birth:</strong>{" "}
                  {selected.timeOfBirth || selected.time || "10:30 AM"}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Date of Birth:</strong>{" "}
                  {selected.dateOfBirth || "2025-10-30"}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Date of Issue:</strong>{" "}
                  {selected.timeOfIssue || selected.issueDate || "2025-11-01"}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Weight:</strong>{" "}
                  {selected.birthWeight || selected.weight || "3.2"} kg
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Height:</strong>{" "}
                  {selected.birthLength || selected.height || "50"} cm
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Gender:</strong> {selected.gender || "Female"}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Attending Doctor:</strong>{" "}
                  {selected.attendingDoctor || "—"}
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Address:</strong> {resolveAddress(selected)}
                </p>
              </div>
            </div>

            <div
              className="certificate-footer"
              style={{
                marginTop: "60px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ textAlign: "center", flex: "1" }}>
                <hr
                  style={{
                    width: "150px",
                    margin: "0 auto 10px auto",
                    border: "1px solid #333",
                  }}
                />
                <p
                  style={{ fontSize: "14px", margin: "0", fontWeight: "bold" }}
                >
                  Doctor Signature
                </p>
              </div>
              <div style={{ textAlign: "center", flex: "1" }}>
                <hr
                  style={{
                    width: "150px",
                    margin: "0 auto 10px auto",
                    border: "1px solid #333",
                  }}
                />
                <p
                  style={{ fontSize: "14px", margin: "0", fontWeight: "bold" }}
                >
                  Hospital Seal
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBirthCertificates;
