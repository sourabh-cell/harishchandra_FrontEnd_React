import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getToken } from "../../../../utils/authToken";
import {
  fetchRadiologies,
  selectRadiologies,
  selectRadiologiesStatus,
  selectRadiologiesError,
} from "../../../../features/radiologySlice";
import { NavLink } from "react-router-dom";

const LS_KEY = "hms_radiology_reports";

const RadiologyReportList = () => {
  const dispatch = useDispatch();
  const radiologies = useSelector(selectRadiologies);
  const radiologiesStatus = useSelector(selectRadiologiesStatus);
  const radiologiesError = useSelector(selectRadiologiesError);

  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [editReportData, setEditReportData] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);

  const viewModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const scanModalRef = useRef(null);

  // Fetch radiology reports from backend on mount
  useEffect(() => {
    dispatch(fetchRadiologies());
  }, [dispatch]);

  // Update local reports state when radiologies from Redux change
  useEffect(() => {
    console.log("radiologiesStatus:", radiologiesStatus);
    console.log("radiologies raw:", radiologies);
    console.log("radiologies is array?", Array.isArray(radiologies));

    if (radiologiesStatus === "succeeded") {
      // Handle both array and nested data structures
      let reportsData = radiologies;

      // Check if data is nested (common backend pattern)
      if (!Array.isArray(radiologies) && radiologies?.data) {
        reportsData = radiologies.data;
      }

      if (!Array.isArray(reportsData)) {
        console.error("Reports data is not an array:", reportsData);
        setReports([]);
        return;
      }

      console.log("Processing reports data:", reportsData);

      // Map backend data structure to component's expected structure
      const mappedReports = reportsData.map((r) => {
        console.log("Mapping report:", r);
        return {
          // Keep all original data first
          ...r,
          // Then override with mapped UI fields
          id: r.id,
          patient: r.patientName || "",
          age: r.patientAge || "",
          gender: r.patientGender || "",
          phone: r.patientContact || "",
          doctor: r.doctorName || "",
          // Derive date/time: prefer backend `reportDate` and `imagingTime`, fall back to createdAt
          date: (() => {
            const rd =
              r.reportDate || r.reportdate || r.date || r.createdAt || "";
            if (!rd) return "";
            if (typeof rd === "string" && rd.includes("T"))
              return rd.split("T")[0];
            if (typeof rd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rd))
              return rd;
            try {
              return new Date(rd).toISOString().split("T")[0];
            } catch (e) {
              return "";
            }
          })(),
          // keep raw reportDate available too
          reportDate:
            r.reportDate ||
            r.reportdate ||
            r.date ||
            (r.createdAt ? new Date(r.createdAt).toISOString() : ""),
          time: (() => {
            const it = r.imagingTime || r.imagingtime || r.time || "";
            if (it && typeof it === "string") return it;
            const rd =
              r.reportDate || r.reportdate || r.date || r.createdAt || "";
            if (typeof rd === "string" && rd.includes("T"))
              return new Date(rd).toLocaleTimeString();
            return r.createdAt
              ? new Date(r.createdAt).toLocaleTimeString()
              : "";
          })(),
          status: r.reportStatus || "Pending",
          test: r.scanDetails?.[0]?.scanName || "N/A",
          report: r.finalSummary || "",
          scanDetails: r.scanDetails || [],
          files:
            r.scanDetails?.flatMap((scan) =>
              scan.scanFile ? [scan.scanFile] : []
            ) || [],
        };
      });

      console.log("Final mapped reports:", mappedReports);
      setReports(mappedReports);
    }
  }, [radiologies, radiologiesStatus]);

  const statusBadge = (status) => {
    const statusUpper = String(status || "").toUpperCase();
    if (statusUpper === "COMPLETED")
      return <span className="badge text-bg-success">Completed</span>;
    if (statusUpper === "DELIVERED")
      return <span className="badge text-bg-secondary">Delivered</span>;
    if (statusUpper === "PENDING")
      return <span className="badge text-bg-warning">Pending</span>;
    return <span className="badge text-bg-warning">{status || "Pending"}</span>;
  };

  const filteredReports = reports
    .filter((r) => {
      if (!statusFilter) return true;
      const rStatus = String(r.status || r.reportStatus || "").toUpperCase();
      const filterStatus = String(statusFilter).toUpperCase();
      return rStatus === filterStatus;
    })
    .filter((r) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const patient = String(r.patient || r.patientName || "").toLowerCase();
      const phone = String(r.phone || r.patientContact || "");
      const test = String(r.test || "").toLowerCase();
      return (
        patient.includes(query) || phone.includes(query) || test.includes(query)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt || 0) -
        new Date(a.date || a.createdAt || 0)
    );
  console.log("Filtered reports:", filteredReports);
  const openEditModal = (report) => {
    setEditReportData({ ...report, status: report?.status || "Pending" });
    setShowEdit(true);
  };

  const openViewModal = (report) => {
    setSelectedReport(report);
    new window.bootstrap.Modal(viewModalRef.current).show();
  };

  const openViewImageScanModal = (scanData) => {
    console.log("=== openViewImageScanModal called ===");
    console.log("Raw scanData:", scanData);

    // Normalize scan data to array of file URLs
    let files = [];

    // SVG placeholder as data URI
    const placeholderSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%2301C0C8' width='800' height='600'/%3E%3Ctext x='50%25' y='45%25' font-family='Arial, sans-serif' font-size='32' fill='white' text-anchor='middle' dominant-baseline='middle'%3ESample X-Ray Scan%3C/text%3E%3Ctext x='50%25' y='55%25' font-family='Arial, sans-serif' font-size='18' fill='white' text-anchor='middle' dominant-baseline='middle'%3ENo scan data available%3C/text%3E%3C/svg%3E`;

    if (!scanData) {
      // Add dummy image when no scan data
      files = [
        {
          url: placeholderSVG,
          name: "sample-scan.jpg",
        },
      ];
    } else if (typeof scanData === "string") {
      files = [{ url: scanData, name: scanData.split("/").pop() }];
    } else if (Array.isArray(scanData)) {
      files = scanData.map((s) => {
        if (typeof s === "string") return { url: s, name: s.split("/").pop() };
        // Handle backend scanDetails structure
        if (s.scanFile) {
          const scanFile =
            typeof s.scanFile === "string"
              ? s.scanFile
              : s.scanFile.url || s.scanFile.path;
          return {
            url: scanFile || placeholderSVG,
            name:
              s.scanName ||
              s.name ||
              (scanFile ? scanFile.split("/").pop() : "scan-image.jpg"),
          };
        }
        return {
          url: s.url || s.fileUrl || s.path || placeholderSVG,
          name:
            s.name ||
            s.fileName ||
            s.scanName ||
            (s.url || s.fileUrl || s.path || "scan-image.jpg").split("/").pop(),
        };
      });
    } else if (typeof scanData === "object") {
      if (scanData.url || scanData.fileUrl || scanData.file) {
        files = [
          {
            url: scanData.url || scanData.fileUrl || scanData.file,
            name:
              scanData.name ||
              scanData.fileName ||
              (scanData.url || scanData.fileUrl || scanData.file || "")
                .split("/")
                .pop(),
          },
        ];
      } else if (Array.isArray(scanData.files)) {
        files = scanData.files.map((f) => {
          if (typeof f === "string")
            return { url: f, name: f.split("/").pop() };
          return {
            url: f.url || f.fileUrl || f.path,
            name:
              f.name ||
              f.fileName ||
              (f.url || f.fileUrl || f.path || "").split("/").pop(),
          };
        });
      }
    }

    // SVG placeholder as data URI
    const placeholderSVG2 = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%2301C0C8' width='800' height='600'/%3E%3Ctext x='50%25' y='45%25' font-family='Arial, sans-serif' font-size='32' fill='white' text-anchor='middle' dominant-baseline='middle'%3ESample X-Ray Scan%3C/text%3E%3Ctext x='50%25' y='55%25' font-family='Arial, sans-serif' font-size='18' fill='white' text-anchor='middle' dominant-baseline='middle'%3ENo scan data available%3C/text%3E%3C/svg%3E`;

    // If files array is still empty after processing, add dummy image
    if (files.length === 0) {
      files = [
        {
          url: placeholderSVG2,
          name: "sample-scan.jpg",
        },
      ];
    }

    console.log("Processed files array:", files);
    setSelectedScan(files);
    new window.bootstrap.Modal(scanModalRef.current).show();
  };

  const downloadFile = async (fileUrl, filename) => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(fileUrl, { headers });
      if (!res.ok) throw new Error("Failed to fetch file");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || fileUrl.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file");
    }
  };

  const gatherFilesFromReport = (report) => {
    if (!report) return [];
    const files = [];

    // Handle files array
    if (Array.isArray(report.files) && report.files.length) {
      report.files.forEach((f) => {
        if (typeof f === "string")
          files.push({ url: f, name: f.split("/").pop() });
        else
          files.push({
            url: f.url || f.path || f.fileUrl,
            name:
              f.name ||
              f.filename ||
              f.fileName ||
              (f.url || f.path || f.fileUrl || "").split("/").pop(),
          });
      });
      return files;
    }

    // Handle scanDetails array from backend
    if (Array.isArray(report.scanDetails)) {
      report.scanDetails.forEach((s, idx) => {
        // Handle direct scanFile property
        if (s.scanFile) {
          const scanFile =
            typeof s.scanFile === "string"
              ? s.scanFile
              : s.scanFile.url || s.scanFile.path;
          if (scanFile) {
            files.push({
              url: scanFile,
              name: s.scanName || `scan_${idx + 1}`,
            });
          }
        }
        // Handle fileUrl property
        if (s.fileUrl) {
          files.push({
            url: s.fileUrl,
            name: s.fileName || s.scanName || `scan_${idx + 1}`,
          });
        }
        // Handle nested files array
        if (s.files && Array.isArray(s.files)) {
          s.files.forEach((f) => {
            if (typeof f === "string")
              files.push({ url: f, name: f.split("/").pop() });
            else
              files.push({
                url: f.url || f.path || f.fileUrl,
                name: f.name || f.filename || f.fileName,
              });
          });
        }
      });
    }
    return files;
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    new window.bootstrap.Modal(deleteModalRef.current).show();
  };

  const handleDelete = () => {
    // TODO: Implement backend delete endpoint
    alert("Delete functionality requires backend API endpoint");
    window.bootstrap.Modal.getInstance(deleteModalRef.current).hide();
  };

  const saveReport = (e) => {
    e.preventDefault();

    if (!editReportData.patient || !editReportData.patient.trim()) {
      alert("Enter patient name");
      return;
    }

    if (editReportData.age && Number(editReportData.age) < 0) {
      alert("Age must be 0 or more");
      return;
    }

    // TODO: Implement backend update endpoint
    alert("Edit functionality requires backend API endpoint");
    setShowEdit(false);
  };

  const printReport = () => {
    if (!selectedReport) return;

    const printWindow = window.open("", "_blank", "width=900,height=650");

    if (!printWindow) {
      alert("Please allow popups to print the report");
      return;
    }

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Radiology Report - ${selectedReport.patient}</title>

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
      color: #01c0c8;
    }

    .dept {
      font-size: 14px;
      color: #444;
      margin-top: -5px;
    }

    .section-title {
      font-size: 18px;
      font-weight: bold;
      border-left: 4px solid #01c0c8;
      padding-left: 10px;
      margin: 25px 0 10px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 160px auto;
      row-gap: 6px;
      font-size: 14px;
    }

    .info-label {
      font-weight: bold;
    }

    pre {
      margin-top: 10px;
      padding: 12px;
      background: #f5f5f5;
      border: 1px solid #ccc;
      border-radius: 6px;
      white-space: pre-wrap;
      font-size: 14px;
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
      <div class="dept">Department of Radiology</div>
    </div>

    <div class="section-title">Patient Information</div>

    <div class="info-grid">
      <div class="info-label">Name:</div> <div>${
        selectedReport.patient || "N/A"
      }</div>
      <div class="info-label">Age:</div> <div>${
        selectedReport.age || "N/A"
      }</div>
      <div class="info-label">Gender:</div> <div>${
        selectedReport.gender || "N/A"
      }</div>
      <div class="info-label">Phone:</div> <div>${
        selectedReport.phone || "N/A"
      }</div>
      <div class="info-label">Ref. Doctor:</div> <div>${
        selectedReport.doctor || "N/A"
      }</div>
    </div>

    <div class="section-title">Scan Details</div>

    <div class="info-grid">
      <div class="info-label">Scan Date:</div> <div>${
        selectedReport.date || "N/A"
      }</div>
      <div class="info-label">Scan Time:</div> <div>${
        selectedReport.time || "N/A"
      }</div>
      <div class="info-label">Scan Type:</div> <div>${
        selectedReport.test || "N/A"
      }</div>
      <div class="info-label">Status:</div> <div>${
        selectedReport.status || "Pending"
      }</div>
    </div>

    <div class="section-title">Radiology Findings</div>

    <pre>${selectedReport.report || "No findings recorded"}</pre>

  </div>

</body>
</html>
`;

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 400);
    };
  };

  return (
    <>
      <div className="full-width-card card shadow-sm">
        <div
          className="card-header text-white fw-semibold fs-5 text-center"
          style={{ background: "#01C0C8" }}
        >
          <i className="fa-solid fa-x-ray me-2"></i> Radiology Report List
        </div>

        <div className="card-body">
          {radiologiesStatus === "loading" && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading radiology reports...</p>
            </div>
          )}

          {radiologiesStatus === "failed" && (
            <div className="alert alert-danger" role="alert">
              <i className="fa-solid fa-exclamation-triangle me-2"></i>
              Error loading reports:{" "}
              {typeof radiologiesError === "object"
                ? radiologiesError?.message || JSON.stringify(radiologiesError)
                : radiologiesError}
            </div>
          )}

          {radiologiesStatus === "succeeded" && (
            <>
              <div className="row g-2 mb-3 align-items-center">
                <div className="col-md-4 col-sm-8">
                  <input
                    type="search"
                    className="form-control form-control-sm"
                    placeholder="Search patient, phone, scan type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="col-md-3 col-sm-4">
                  <select
                    className="form-select form-select-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div className="col-md-5 col-sm-12 text-end">
                  <span
                    className="fw-semibold"
                    style={{ fontSize: "17px", color: "#01A3A4" }}
                  >
                    Total: {filteredReports.length}
                  </span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered table-sm align-middle">
                  <thead className="table-light">
                    <tr className="text-center">
                      <th>Patient</th>
                      <th>Age</th>
                      <th>Phone</th>
                      <th>Ref. Doctor</th>
                      <th>Date</th>
                      <th>Scan Type</th>
                      <th>View Scan</th>
                      <th>Status</th>
                      <th style={{ minWidth: 130 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length === 0 && (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center text-muted small"
                        >
                          No reports found
                        </td>
                      </tr>
                    )}
                    {filteredReports.map((r) => (
                      <tr key={r.id} className="small text-center">
                        <td>{r.patient || r.patientName || "N/A"}</td>
                        <td>{r.age || r.patientAge || "N/A"}</td>
                        <td>{r.phone || r.patientContact || "N/A"}</td>
                        <td>{r.doctor || r.doctorName || "N/A"}</td>

                        <td>
                          {r.date ||
                            (r.createdAt
                              ? new Date(r.createdAt).toLocaleDateString()
                              : "N/A")}
                        </td>

                        <td>
                          {r.test || r.scanDetails?.[0]?.scanName || "N/A"}
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => {
                              // Pass scanDetails or files from the report
                              const scanData =
                                r.scanDetails || r.files || r.scan;
                              openViewImageScanModal(scanData);
                            }}
                          >
                            View Scan
                          </button>
                        </td>
                        <td>{statusBadge(r.status)}</td>
                        <td>
                          <div className="action-buttons d-inline-flex gap-2">
                            <button
                              className="btn1 bg-primary me-1 btn-sm"
                              onClick={() => openViewModal(r)}
                              data-tooltip="View"
                            >
                              <i className="fa-regular fa-eye"></i>
                            </button>
                            <NavLink
                              to={`/dashboard/edit-radiology-report/${r.id}`}
                              className="btn1 bg-warning me-1 btn-sm"
                              onClick={() => openEditModal(r)}
                              data-tooltip="Edit"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </NavLink>
                            <button
                              className="btn1 bg-danger btn-sm"
                              data-tooltip="Delete"
                              onClick={() => openDeleteModal(r.id)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Modal */}
      <div className="modal fade" ref={viewModalRef} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header" style={{ background: "#01C0C8" }}>
              <h5 className="modal-title">Radiology Report Details</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            {/* ⬇ ONLY THIS PART SHOULD BE PRINTED */}
            <div id="printableArea">
              {selectedReport && (
                <div className="modal-body small">
                  <p>
                    <strong>Patient:</strong> {selectedReport.patient}
                  </p>
                  <p>
                    <strong>Age:</strong> {selectedReport.age}
                  </p>
                  <p>
                    <strong>Gender:</strong> {selectedReport.gender}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedReport.phone}
                  </p>
                  <p>
                    <strong>Ref. Doctor:</strong> {selectedReport.doctor}
                  </p>
                  <p>
                    <strong>Report Date:</strong> {selectedReport.date}
                  </p>
                  <p>
                    <strong>Scan Time:</strong> {selectedReport.time}
                  </p>
                  <p>
                    <strong>Scan Type:</strong> {selectedReport.test}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {statusBadge(selectedReport.status)}
                  </p>
                  <hr />
                  <strong>Findings:</strong>
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {selectedReport.report}
                  </pre>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                data-bs-dismiss="modal"
              >
                Close
              </button>

              <button
                className="btn btn-sm text-white"
                style={{ background: "#01C0C8" }}
                onClick={printReport}
              >
                <i className="fa-solid fa-print me-1"></i> Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" ref={deleteModalRef} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Delete Report?</h5>
            </div>
            <div className="modal-body small">
              Are you sure you want to delete this radiology report?
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Viewer Modal */}
      <div className="modal fade" ref={scanModalRef} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header" style={{ background: "#01C0C8" }}>
              <h5 className="modal-title text-white">Scan Images</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div
              className="modal-body text-center"
              style={{
                minHeight: "400px",
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >
              {selectedScan && selectedScan.length > 0 ? (
                <div className="row g-3">
                  {selectedScan.map((file, idx) => {
                    console.log(`File ${idx}:`, file);
                    console.log(`  - URL: ${file.url}`);
                    console.log(`  - Name: ${file.name}`);

                    // Fix base64 image data - add data URI prefix if missing
                    let imageUrl = file.url;
                    if (
                      imageUrl &&
                      !imageUrl.startsWith("data:") &&
                      !imageUrl.startsWith("http")
                    ) {
                      // It's base64 data without prefix, add it
                      imageUrl = `data:image/jpeg;base64,${imageUrl}`;
                      console.log(`  - Fixed URL with data URI prefix`);
                    }

                    // Check if it's an image - be more lenient
                    const hasImageExtension =
                      /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(
                        file.name || file.url || ""
                      );
                    const isDataUri = imageUrl && imageUrl.startsWith("data:");
                    const shouldDisplayAsImage =
                      hasImageExtension || isDataUri || true; // Always try to display as image first

                    console.log(`  - hasImageExtension: ${hasImageExtension}`);
                    console.log(`  - isDataUri: ${isDataUri}`);
                    console.log(
                      `  - shouldDisplayAsImage: ${shouldDisplayAsImage}`
                    );

                    return (
                      <div key={idx} className="col-12">
                        <div>
                          <img
                            src={imageUrl}
                            alt={file.name || "Scan image"}
                            className="img-fluid rounded shadow-sm"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "500px",
                              objectFit: "contain",
                              display: "block",
                              margin: "0 auto",
                              border: "1px solid #dee2e6",
                            }}
                            onLoad={() => {
                              console.log(
                                "✓ Image loaded successfully:",
                                file.name
                              );
                            }}
                            onError={(e) => {
                              console.error(
                                "✗ Failed to load image:",
                                file.name
                              );
                              e.target.style.display = "none";
                              const fallbackDiv = e.target.nextSibling;
                              if (fallbackDiv)
                                fallbackDiv.style.display = "block";
                            }}
                          />
                          <div
                            style={{ display: "none" }}
                            className="alert alert-info mt-2"
                          >
                            <i className="fa-solid fa-file me-2"></i>
                            {file.name}
                            <br />
                            <small className="text-muted">
                              URL: {imageUrl.substring(0, 100)}...
                            </small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="alert alert-warning">
                  No scan images available
                </div>
              )}
            </div>
            <div className="modal-footer justify-content-center">
              {selectedScan && selectedScan.length > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    selectedScan.forEach((file, idx) => {
                      // Fix base64 data if needed
                      let imageUrl = file.url;
                      if (
                        imageUrl &&
                        !imageUrl.startsWith("data:") &&
                        !imageUrl.startsWith("http")
                      ) {
                        imageUrl = `data:image/jpeg;base64,${imageUrl}`;
                      }

                      // For data URIs, create blob and download
                      if (imageUrl && imageUrl.startsWith("data:")) {
                        try {
                          // Convert data URI to blob
                          const arr = imageUrl.split(",");
                          const mime = arr[0].match(/:(.*?);/)[1];
                          const bstr = atob(arr[1]);
                          let n = bstr.length;
                          const u8arr = new Uint8Array(n);
                          while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                          }
                          const blob = new Blob([u8arr], { type: mime });
                          const url = window.URL.createObjectURL(blob);

                          // Download
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = file.name || `scan_${idx + 1}.jpg`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error(
                            "Failed to download base64 image:",
                            err
                          );
                          alert(`Failed to download ${file.name}`);
                        }
                      } else {
                        // For regular URLs, use the existing downloadFile function
                        downloadFile(imageUrl, file.name);
                      }
                    });
                  }}
                >
                  <i className="fa-solid fa-download me-2"></i>
                  Download {selectedScan.length > 1 ? "All" : ""}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showEdit && (
        <div
          className="modal fade show d-block"
          style={{ background: "#00000070" }}
        >
          <div className="modal-dialog modal-lg">
            <form className="modal-content" onSubmit={saveReport}>
              <div
                className="modal-header text-white"
                style={{ background: "linear-gradient(90deg,#00b4b4,#018a8a)" }}
              >
                <h5 className="modal-title">
                  {editReportData.id ? "Edit" : "Add"} Radiology Report
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEdit(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Patient Name</label>
                    <input
                      className="form-control form-control-sm"
                      value={editReportData.patient || ""}
                      onChange={(e) =>
                        setEditReportData({
                          ...editReportData,
                          patient: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={editReportData.age || ""}
                      onChange={(e) =>
                        setEditReportData({
                          ...editReportData,
                          age: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-control form-control-sm"
                      value={editReportData.gender || ""}
                      onChange={(e) =>
                        setEditReportData({
                          ...editReportData,
                          gender: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control form-control-sm"
                      value={editReportData.phone || ""}
                      onChange={(e) =>
                        setEditReportData({
                          ...editReportData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Referred Doctor</label>
                    <input
                      className="form-control form-control-sm"
                      value={editReportData.doctor || ""}
                      onChange={(e) =>
                        setEditReportData({
                          ...editReportData,
                          doctor: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Report Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={editReportData.date || ""}
                      onChange={(e) =>
                        setEditReportData({
                          ...editReportData,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Scan Time</label>
                    <input
                      className="form-control form-control-sm"
                      value={editReportData.time || ""}
                      onChange={(e) =>
                        setEditReportData({
                          ...editReportData,
                          time: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Scan Type</label>
                    <input
                      className="form-control form-control-sm"
                      value={editReportData.test || ""}
                      onChange={(e) =>
                        setEditReportData({
                          ...editReportData,
                          test: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select form-select-sm"
                      value={editReportData.status || ""}
                      onChange={(e) =>
                        setEditReportData({
                          ...editReportData,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Report Findings</label>
                    <textarea
                      rows={5}
                      className="form-control form-control-sm"
                      value={editReportData.report || ""}
                      onChange={(e) =>
                        setEditReportData({
                          ...editReportData,
                          report: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm text-white"
                  style={{ background: "#01C0C8" }}
                  type="submit"
                >
                  <i className="bi bi-save me-1" /> Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RadiologyReportList;
