import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  fetchPathologies,
  selectPathologies,
  selectPathologiesStatus,
  selectPathologiesError,
  deletePathology,
  selectStatusUpdateStatus,
  updatePathologyStatus,
} from "../../../../features/pathologySlice";

export default function PathologyReportList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const data = useSelector(selectPathologies) || [];
  const status = useSelector(selectPathologiesStatus);
  const error = useSelector(selectPathologiesError);
  const deleteStatus = useSelector(selectStatusUpdateStatus);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch pathologies on mount
  useEffect(() => {
    dispatch(fetchPathologies());
  }, [dispatch]);

  // Filter data
  const filtered = data
    .filter((r) => (filter ? r.reportStatus === filter : true))
    .filter((r) =>
      search
        ? r.patientName.toLowerCase().includes(search.toLowerCase()) ||
          r.patientContact.includes(search) ||
          r.sampleType.toLowerCase().includes(search.toLowerCase()) ||
          r.testResults.some(test => test.testName.toLowerCase().includes(search.toLowerCase()))
        : true
    )
    .sort((a, b) => new Date(b.collectedOn) - new Date(a.collectedOn));

  // Badge
  const statusBadge = (s) => {
    if (s === "COMPLETED")
      return <span className="badge text-bg-success">Completed</span>;
    if (s === "DELIVERED")
      return <span className="badge text-bg-secondary">Delivered</span>;
    return <span className="badge text-bg-warning">Pending</span>;
  };

  // Delete report
  const confirmDelete = () => {
    if (deleteId) {
      dispatch(deletePathology(deleteId));
      setShowDelete(false);
      setDeleteId(null);
    }
  };

  // Change status
  const handleStatusChange = (reportId, newStatus) => {
    dispatch(updatePathologyStatus({ reportId, status: newStatus }));
  };


  // PRINT REPORT
  const printReport = () => {
    if (!selectedReport) return;

    const printWindow = window.open("", "_blank", "width=900,height=650");

    if (!printWindow) {
      alert("Enable pop-ups to print");
      return;
    }

    const testResultsHtml = selectedReport.testResults.map(test =>
      `<tr><td>${test.testName}</td><td>${test.resultValue} ${test.units}</td><td>${test.referenceRange}</td></tr>`
    ).join('');

    const printContent = `
      <html>
      <head>
      <title>Pathology Report</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
     <style>
    body {
      background: #fff;
      padding: 20px;
      font-family: Arial, sans-serif;
      color: #000;
    }

    .report-box {
      border: 2px solid #000;
      padding: 25px;
      width: 100%;
      max-width: 100%;
      margin: auto;
      background: white;
    }

    .header-area {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .header-area img {
      height: 70px;
      margin-bottom: 10px;
    }

    .hospital-name {
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #01C0C8;
    }

    .dept {
      font-size: 14px;
      color: #444;
      margin-top: -5px;
    }

    .section-title {
      font-size: 18px;
      font-weight: bold;
      border-left: 4px solid #01C0C8;
      padding-left: 10px;
      margin: 25px 0 10px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #f2f2f2;
    }

    @media print {
      body {
        padding: 0;
      }
      .report-box {
        border: none;
        padding: 0;
      }
    }
  </style>
</head>

<body>

  <div class="report-box">

    <div class="header-area">
      <img src="/assets/images/harishchandra-logo-mini.png" alt="Hospital Logo">
      <div class="hospital-name">
        Harishchandra Multispeciality Hospital
      </div>
      <div class="dept">Department of Pathology</div>
    </div>
     <h3>Pathology Report</h3>
    <div class="section-title">Patient Information</div>

        <p><b>Patient:</b> ${selectedReport.patientName}</p>
        <p><b>Age:</b> ${selectedReport.patientAge}</p>
        <p><b>Gender:</b> ${selectedReport.patientGender}</p>
        <p><b>Email:</b> ${selectedReport.patientEmail}</p>
        <p><b>Phone:</b> ${selectedReport.patientContact}</p>
        <p><b>Hospital Patient ID:</b> ${selectedReport.hospitalPatientId}</p>
        <p><b>Doctor:</b> ${selectedReport.doctorName}</p>
        <p><b>Lab Technician:</b> ${selectedReport.labTechnicianName}</p>

    <div class="section-title">Sample Details</div>

        <p><b>Date:</b> ${selectedReport.collectedOn}</p>
        <p><b>Time:</b> ${selectedReport.collectionTime}</p>
        <p><b>Sample Type:</b> ${selectedReport.sampleType}</p>
        <p><b>Remarks:</b> ${selectedReport.remarks}</p>
        <p><b>Total Cost:</b> ₹${selectedReport.totalCost}</p>

    <div class="section-title">Test Results</div>
    <table>
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Result</th>
          <th>Reference Range</th>
        </tr>
      </thead>
      <tbody>
        ${testResultsHtml}
      </tbody>
    </table>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    };
  };

  return (
    <>
      {/* ---------------- TABLE ---------------- */}
      <div className="card shadow-sm">
        <div
          className="card-header text-white"
          style={{ background: "#01C0C8" }}
        >
          Pathology Report List
        </div>

        <div className="card-body">
          {/* Search + Filters */}
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Search patient, phone, test..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All Status</option>
              
                <option value="COMPLETED">Completed</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>

            <div className="col-md-5 text-end">
              <b>Total: {filtered.length}</b>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead className="table-light text-center">
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Phone</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Sample Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center small text-muted">
                      No reports found
                    </td>
                  </tr>
                )}

                {filtered.map((r) => (
                  <tr className="small text-center" key={r.id}>
                    <td>{r.patientName}</td>
                    <td>{r.patientAge}</td>
                    <td>{r.patientContact}</td>
                    <td>{r.doctorName}</td>
                    <td>{r.collectedOn}</td>
                    <td>{r.sampleType}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={r.reportStatus || "COMPLETED"}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      >
                        <option value="COMPLETED">Completed</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        <button
                          className="btn1 bg-primary me-1 view-btn"
                          data-tooltip="View"
                          onClick={() => {
                            setSelectedReport(r);
                            setShowView(true);
                          }}
                        >
                          <i className="bi bi-eye"></i>
                        </button>

                        <button
                          className="btn1 bg-warning me-1"
                          data-tooltip="Edit"
                          onClick={() => navigate(`/dashboard/edit-pathology-report/${r.id}`)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className="btn1 bg-danger btn-sm"
                          data-tooltip="Delete"
                          onClick={() => {
                            setDeleteId(r.id);
                            setShowDelete(true);
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---------------- VIEW MODAL ---------------- */}
      {showView && selectedReport && (
        <div
          className="modal fade show d-block"
          style={{ background: "#00000080" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ background: "#01C0C8" }}
              >
                <h5>Pathology Report Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowView(false)}
                ></button>
              </div>

              <div className="modal-body small">
                <div className="row">
                  <div className="col-md-6">
                    <p><b>Patient:</b> {selectedReport.patientName}</p>
                    <p><b>Age:</b> {selectedReport.patientAge}</p>
                    <p><b>Gender:</b> {selectedReport.patientGender}</p>
                    <p><b>Email:</b> {selectedReport.patientEmail}</p>
                    <p><b>Phone:</b> {selectedReport.patientContact}</p>
                    <p><b>Hospital Patient ID:</b> {selectedReport.hospitalPatientId}</p>
                  </div>
                  <div className="col-md-6">
                    <p><b>Doctor:</b> {selectedReport.doctorName}</p>
                    <p><b>Lab Technician:</b> {selectedReport.labTechnicianName}</p>
                    <p><b>Date:</b> {selectedReport.collectedOn}</p>
                    <p><b>Time:</b> {selectedReport.collectionTime}</p>
                    <p><b>Sample Type:</b> {selectedReport.sampleType}</p>
                    <p><b>Status:</b> {statusBadge(selectedReport.reportStatus)}</p>
                  </div>
                </div>
                <p><b>Remarks:</b> {selectedReport.remarks}</p>
                <p><b>Total Cost:</b> ₹{selectedReport.totalCost}</p>

                <hr />
                <b>Test Results:</b>
                <table className="table table-sm mt-2">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Result</th>
                      <th>Units</th>
                      <th>Reference Range</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.testResults.map((test, idx) => (
                      <tr key={idx}>
                        <td>{test.testName}</td>
                        <td>{test.resultValue}</td>
                        <td>{test.units}</td>
                        <td>{test.referenceRange}</td>
                        <td>₹{test.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowView(false)}
                >
                  Close
                </button>

                <button
                  className="btn btn-sm text-white"
                  style={{ background: "#01C0C8" }}
                  onClick={printReport}
                >
                  <i className="bi bi-printer me-1"></i> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DELETE MODAL ---------------- */}
      {showDelete && (
        <div
          className="modal fade show d-block"
          style={{ background: "#00000070" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Delete Report?</h5>
              </div>
              <div className="modal-body small">
                Are you sure you want to delete this report?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowDelete(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
