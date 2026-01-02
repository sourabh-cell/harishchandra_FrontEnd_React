import React, { useEffect, useState } from "react";

const LS_KEY = "hms_path_reports";

function uid() {
  return "id_" + Math.random().toString(36).slice(2, 9);
}

export default function PathologyReportList() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    id: "",
    patient: "",
    age: "",
    phone: "",
    doctor: "",
    date: "",
    time: "",
    test: "",
    report: "",
    status: "Pending",
  });

  // Load from localStorage
  function loadData() {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  }

  // Save to localStorage
  function saveData(list) {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  }

  // Seed if empty
  useEffect(() => {
    const existing = loadData();
    if (existing.length === 0) {
      const sample = [
        {
          id: uid(),
          patient: "Rahul Kumar",
          age: 30,
          phone: "9876543210",
          doctor: "Dr. Mehta",
          date: "2025-02-15",
          time: "10:30 AM",
          status: "Pending",
          test: "Blood Count",
          report: "HB Normal\nWBC Normal",
        },
        {
          id: uid(),
          patient: "Sneha Sharma",
          age: 26,
          phone: "9123456780",
          doctor: "Dr. Kothari",
          date: "2025-02-10",
          time: "09:45 AM",
          status: "Completed",
          test: "LFT",
          report: "ALT Slight High",
        },
      ];
      saveData(sample);
      setData(sample);
    } else {
      setData(existing);
    }
  }, []);

  // Filter data
  const filtered = data
    .filter((r) => (filter ? r.status === filter : true))
    .filter((r) =>
      search
        ? r.patient.toLowerCase().includes(search.toLowerCase()) ||
          r.phone.includes(search) ||
          r.test.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Badge
  const statusBadge = (s) => {
    if (s === "Completed")
      return <span className="badge text-bg-success">Completed</span>;
    if (s === "Delivered")
      return <span className="badge text-bg-secondary">Delivered</span>;
    return <span className="badge text-bg-warning">Pending</span>;
  };

  // Save report
  const saveReport = (e) => {
    e.preventDefault();

    if (!form.patient.trim()) return alert("Enter patient name");
    if (form.age && Number(form.age) < 0) return alert("Age must be 0 or more");

    const updated = loadData();
    const obj = { ...form, id: form.id || uid() };

    const idx = updated.findIndex((x) => x.id === obj.id);
    if (idx >= 0) updated[idx] = obj;
    else updated.push(obj);

    saveData(updated);
    setData(updated);
    setShowEdit(false);
  };

  // Delete report
  const confirmDelete = () => {
    const updated = loadData().filter((x) => x.id !== deleteId);
    saveData(updated);
    setData(updated);
    setShowDelete(false);
  };

  // PRINT REPORT
  const printReport = () => {
    if (!selectedReport) return;

    const printWindow = window.open("", "_blank", "width=900,height=650");

    if (!printWindow) {
      alert("Enable pop-ups to print");
      return;
    }

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
      <div class="dept">Department of Pathology</div>
    </div>
     <h3>Pathology Report</h3>
    <div class="section-title">Patient Information</div>

        
        <p><b>Patient:</b> ${selectedReport.patient}</p>
        <p><b>Age:</b> ${selectedReport.age}</p>
        <p><b>Phone:</b> ${selectedReport.phone}</p>
        <p><b>Doctor:</b> ${selectedReport.doctor}</p>
        
    <div class="section-title">Scan Details</div>

    <div class="dept">
        <p><b>Date:</b> ${selectedReport.date}</p>
        <p><b>Time:</b> ${selectedReport.time}</p>
        <p><b>Test:</b> ${selectedReport.test}</p>
        </div>
        <hr>
        <b>Findings:</b>
        <pre>${selectedReport.report}</pre>
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
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
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
                  <th>Test</th>
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
                    <td>{r.patient}</td>
                    <td>{r.age}</td>
                    <td>{r.phone}</td>
                    <td>{r.doctor}</td>
                    <td>{r.date}</td>
                    <td>{r.test}</td>
                    <td>{statusBadge(r.status)}</td>
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
                          className="btn1 bg-warning me-1 btn-sm"
                          data-tooltip="Edit"
                          onClick={() => {
                            setForm(r);
                            setShowEdit(true);
                          }}
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
                <p>
                  <b>Patient:</b> {selectedReport.patient}
                </p>
                <p>
                  <b>Age:</b> {selectedReport.age}
                </p>
                <p>
                  <b>Phone:</b> {selectedReport.phone}
                </p>
                <p>
                  <b>Doctor:</b> {selectedReport.doctor}
                </p>
                <p>
                  <b>Date:</b> {selectedReport.date}
                </p>
                <p>
                  <b>Time:</b> {selectedReport.time}
                </p>
                <p>
                  <b>Test:</b> {selectedReport.test}
                </p>

                <p>
                  <b>Status:</b> {statusBadge(selectedReport.status)}
                </p>

                <hr />
                <b>Findings:</b>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {selectedReport.report}
                </pre>
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
