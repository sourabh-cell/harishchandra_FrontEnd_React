import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./ManageDethCertificates.css";
import {
  fetchDeathCertificates,
  selectDeathCertificates,
  selectDeathCertificatesStatus,
} from "../../../features/birthAndDethSlice";
import { NavLink } from "react-router-dom";

const ManageDethCertificates = () => {
  const [selected, setSelected] = useState(null);
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const deathCertificates = useSelector(selectDeathCertificates) || [];
  const deathCertificatesStatus = useSelector(selectDeathCertificatesStatus);

  useEffect(() => {
    console.log(
      "ManageDethCertificates - bootstrap available:",
      !!window.bootstrap
    );
  }, []);

  useEffect(() => {
    // fetch death certificates on mount if not already loading
    if (
      deathCertificatesStatus === "idle" ||
      deathCertificatesStatus === undefined
    ) {
      dispatch(fetchDeathCertificates());
    }
  }, [dispatch, deathCertificatesStatus]);

  const showModalManually = () => {
    if (modalRef.current) {
      modalRef.current.style.display = "block";
      modalRef.current.classList.add("show");
      modalRef.current.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      let backdrop = document.querySelector(".modal-backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop fade show";
        document.body.appendChild(backdrop);
      }
    }
  };

  const hideModalManually = () => {
    if (modalRef.current) {
      modalRef.current.style.display = "none";
      modalRef.current.classList.remove("show");
      modalRef.current.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.querySelectorAll(".modal-backdrop").forEach((b) => b.remove());
    }
  };

  const handleView = (row) => {
    setSelected(row);
    if (window.bootstrap && modalRef.current) {
      try {
        const modal = new window.bootstrap.Modal(modalRef.current);
        modal.show();
        return;
      } catch (err) {
        console.error("bootstrap modal error", err);
      }
    }
    showModalManually();
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

    // populate fields in the hidden template from the selected record
    if (!selected) {
      alert("No record selected to print.");
      return;
    }

    const setText = (id, value) => {
      const el = printContent.querySelector(`#${id}`);
      if (el) el.textContent = value ?? "-";
    };

    // Death-certificate specific fields (use common aliases)
    setText(
      "certNumber",
      selected.certificateNumber || selected.certificate_no || "-"
    );
    setText(
      "deceasedName",
      selected.deceasedName ||
        selected.fullName ||
        selected.name ||
        selected.patientName ||
        "-"
    );
    setText(
      "certAge",
      selected.ageAtDeath ?? selected.age ?? selected.years ?? "-"
    );
    setText(
      "certPlace",
      selected.placeOfDeath || selected.place || selected.location || "-"
    );
    setText(
      "certTime",
      selected.timeOfDeath || selected.time || selected.time_of_death || "-"
    );
    setText(
      "certDOD",
      selected.dateOfDeath || selected.dod || selected.date || "-"
    );
    setText(
      "certDate",
      selected.issueDate || selected.issue_date || selected.timeOfIssue || "-"
    );
    setText("certGender", selected.gender || "-");
    setText(
      "certCause",
      selected.causeOfDeath || selected.cause || selected.cause_of_death || "-"
    );
    setText(
      "certDoctor",
      selected.attendingDoctor || selected.doctor || selected.doctorName || "-"
    );
    setText(
      "certAddress",
      selected.address || selected.place || selected.city || "-"
    );

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
      /* Page setup */
      @page { size: A4; margin: 0.75in; }

      body { margin: 0; padding: 0; background: #fff; }

      /* Use a serif font like the sample */
      .certificate { font-family: 'Times New Roman', Times, serif; color: #111; width:100%; max-width:720px; margin:0 auto; padding:28px; border:3px solid #000; box-sizing:border-box; background:#fff; position:relative; min-height:950px }

      /* Header: logo on left and centered title */
      .certificate-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap }
      .certificate-header img { width:56px; height:56px; object-fit:contain }
      .certificate-header .title-wrap { flex:1; text-align:center }
      .certificate-header h2 { margin:0; font-size:22px; color:#0b6ea1; letter-spacing:1px }
      .certificate-header p { margin:4px 0 0 0; font-size:12px; color:#333; text-align:center }
      .certificate-header hr { border:0; border-top:2px solid #000; margin:12px 0; width:100% }

  .certificate-body { margin-top:10px }
  .certificate-body p { margin:10px 0; font-size:15px; line-height:1.6 }
  /* Align labels like the sample: labels fixed width, values flow */
  .certificate-body strong.label { display:inline-block; width:170px; font-weight:700 }
  /* person name should be inline so punctuation sits immediately after it */
  .certificate-body strong.person-name { display:inline; width:auto; font-weight:700 }
  /* place inside the sentence should also be inline to avoid wrapping to next line */
  .certificate-body strong.inline-value { display:inline; width:auto; font-weight:700 }

      /* Special style for the opening sentence */
      .opening { margin-top:6px }

      /* Footer signature area */
      .certificate-footer { display:flex; justify-content:space-between; margin-top:60px }
      .signature-line { width:220px; text-align:center }
      .signature-line hr { border:0; border-top:1px solid #000; margin-bottom:8px }
      .signature-line p { margin:0; font-size:13px; font-weight:700 }

      @media print { body{margin:0} .certificate{box-shadow:none} }
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

  return (
    <>
      <div className="full-width-card card shadow">
        <div className="card-header text-white justify-content-center text-center">
          <i className="fa-solid fa-cross me-2" /> Manage Death Certificates
        </div>
        <div className="card-body p-2">
          <div className="table-responsive">
            <table className="table table-striped table-bordered text-center align-middle mb-0">
              <thead className="table-primary">
                <tr>
                  <th>Sr No.</th>
                  <th>Deceased Name</th>
                  <th>Place of Death</th>
                  <th className="d-none d-md-table-cell">Time of Death</th>
                  <th>Date of Death</th>
                  <th className="d-none d-md-table-cell">Issue Date</th>
                  <th className="d-none d-md-table-cell">Gender</th>
                  <th className="d-none d-md-table-cell">Age</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="deathTableBody">
                {deathCertificates && deathCertificates.length > 0 ? (
                  deathCertificates.map((row, idx) => {
                    const name =
                      row.fullName || row.deceasedName || row.name || "-";
                    const place = row.placeOfDeath || row.place || "-";
                    const time = row.timeOfDeath || row.time || "-";
                    const date =
                      row.dateOfDeath || row.date || row.issueDate || "-";
                    const issueDate = row.issueDate || row.issue_date || "-";
                    const gender = row.gender || row.sex || "-";
                    const age = row.ageAtDeath ?? row.age ?? row.years ?? "-";

                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{name}</td>
                        <td>{place}</td>
                        <td className="d-none d-md-table-cell">{time}</td>
                        <td>{date}</td>
                        <td className="d-none d-md-table-cell">{issueDate}</td>
                        <td className="d-none d-md-table-cell">{gender}</td>
                        <td className="d-none d-md-table-cell">{age}</td>
                        <td>
                          <button
                            className="btn1 bg-primary me-1 view-btn"
                            aria-label="View"
                            data-tooltip="View"
                            onClick={() => handleView(row)}
                          >
                            <i className="fa-solid fa-eye"></i>
                            <span className="d-none d-sm-inline"></span>
                          </button>
                          <NavLink
                            className="btn1 bg-warning btn-sm"
                            aria-label="Edit"
                            data-tooltip="Edit"
                            to={`/dashboard/edit-death-certificate/${row.id}`}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                            <span className="d-none d-sm-inline"></span>
                          </NavLink>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9}>No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="deathModal"
        tabIndex={-1}
        aria-labelledby="deathModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ backgroundColor: "#01C0C8" }}
            >
              <h5 className="modal-title" id="deathModalLabel">
                View Death Certificate
              </h5>
              <button
                type="button"
                className="btn-close bg-white"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={hideModalManually}
              />
            </div>
            <div className="modal-body">
              {/* View Mode (reactive) */}
              {selected && (
                <div id="viewMode">
                  <p>
                    <strong>Certificate Number:</strong>{" "}
                    {selected.certificateNumber || "-"}
                  </p>
                  <p>
                    <strong>Deceased Name:</strong>{" "}
                    {selected.deceasedName || selected.name || "-"}
                  </p>
                  <p>
                    <strong>Place of Death:</strong>{" "}
                    {selected.placeOfDeath || selected.place || "-"}
                  </p>
                  <p>
                    <strong>Attending Doctor:</strong>{" "}
                    {selected.attendingDoctor || "-"}
                  </p>
                  <p>
                    <strong>Time of Death:</strong>{" "}
                    {selected.timeOfDeath || selected.time || "-"}
                  </p>
                  <p>
                    <strong>Date of Death:</strong>{" "}
                    {selected.dateOfDeath || "-"}
                  </p>
                  <p>
                    <strong>Issue Date:</strong> {selected.issueDate || "-"}
                  </p>
                  <p>
                    <strong>Age:</strong> {selected.age ?? "-"}
                  </p>
                  <p>
                    <strong>Gender:</strong> {selected.gender || "-"}
                  </p>
                  <p>
                    <strong>Cause of Death:</strong>{" "}
                    {selected.causeOfDeath || selected.cause || "-"}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {selected.address || selected.place || "-"}
                  </p>
                </div>
              )}
              {/* Edit Mode */}
              <form id="deathForm" className="d-none">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Certificate Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="certificateNumber"
                      disabled
                      defaultValue="AUTO-GENERATED"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Deceased Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="deceasedName"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Place of Death</label>
                    <input
                      type="text"
                      className="form-control"
                      id="placeOfDeath"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Attending Doctor</label>
                    <input
                      type="text"
                      className="form-control"
                      id="attendingDoctor"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">Time of Death</label>
                    <input
                      type="text"
                      className="form-control"
                      id="timeOfDeath"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Date of Death</label>
                    <input
                      type="date"
                      className="form-control"
                      id="dateOfDeath"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Issue Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="issueDate"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-control" id="age" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Gender</label>
                    <select className="form-select" id="gender">
                      <option value>Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Cause of Death</label>
                    <input
                      type="text"
                      className="form-control"
                      id="causeOfDeath"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      id="address"
                      rows={2}
                      defaultValue={""}
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer d-flex justify-content-between">
              <button
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={hideModalManually}
              >
                Close
              </button>
              {selected ? (
                <button className="btn btn-success" onClick={handlePrint}>
                  <i className="fa-solid fa-print me-1" />
                  Print
                </button>
              ) : (
                <button className="btn btn-success d-none" disabled>
                  <i className="fa-solid fa-print me-1" />
                  Print
                </button>
              )}
              <button className="button d-none" id="saveBtn">
                <i className="fa-solid fa-pen me-1" />
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Hidden Certificate Template (structured like the provided birth-certificate image)
          NOTE: kept all span IDs unchanged so existing JS mappings continue to work */}
      <div id="printCertificate" className="d-none">
        <div className="certificate">
          <div
            className="certificate-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            <img
              src="/assets/images/harishchandra-logo-mini.png"
              alt="logo"
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
                HOSPITAL DEATH CERTIFICATE
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  margin: "5px 0 0 0",
                  color: "#333",
                }}
              >
                Harishchandra Multispeciality Hospital, Department of Death
                Records
              </p>
            </div>
            <hr />
          </div>

          <div className="certificate-body">
            <p>
              <strong className="label">Certificate No:</strong>{" "}
              <span id="certNumber"></span>
            </p>
            <p>
              This is to certify that{" "}
              <strong className="person-name">
                <span id="deceasedName"></span>
              </strong>
              , aged <span id="certAge"></span> years, passed away at{" "}
              <strong className="inline-value">
                <span id="certPlace"></span>
              </strong>
              .
            </p>

            <p>
              <strong className="label">Time of Death:</strong>{" "}
              <span id="certTime"></span>
            </p>
            <p>
              <strong className="label">Date of Death:</strong>{" "}
              <span id="certDOD"></span>
            </p>
            <p>
              <strong className="label">Date of Issue:</strong>{" "}
              <span id="certDate"></span>
            </p>
            <p>
              <strong className="label">Gender:</strong>{" "}
              <span id="certGender"></span>
            </p>
            <p>
              <strong className="label">Cause of Death:</strong>{" "}
              <span id="certCause"></span>
            </p>
            <p>
              <strong className="label">Attending Doctor:</strong>{" "}
              <span id="certDoctor"></span>
            </p>
            <p>
              <strong className="label">Address:</strong>{" "}
              <span id="certAddress"></span>
            </p>
          </div>

          <div className="certificate-footer">
            <div className="signature-line">
              <hr />
              <p>Doctor Signature</p>
            </div>
            <div className="signature-line">
              <hr />
              <p>Hospital Seal</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageDethCertificates;
