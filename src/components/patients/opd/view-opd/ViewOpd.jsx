import React, { useState } from "react";

const ViewOpd = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; // 👉 आप जितनी rows दिखाना चाहते हैं बदल सकते हैं
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const [patients, setPatients] = useState([
    {
      id: "EMP001",
      first: "John",
      last: "Doe",
      status: "Ongoing",
      phone: "+1-234-567-8903",
      date: "2023-10-01",
    },
    {
      id: "EMP002",
      first: "Jane",
      last: "Smith",
      status: "Completed",
      phone: "+1-234-567-8901",
      date: "2023-10-02",
    },
    {
      id: "EMP003",
      first: "Steve",
      last: "Williams",
      status: "Referred",
      phone: "+1-555-222-7890",
      date: "2023-10-03",
    },
    {
      id: "EMP004",
      first: "David",
      last: "Miller",
      status: "Ongoing",
      phone: "+1-555-999-4444",
      date: "2023-10-05",
    },
    {
      id: "EMP005",
      first: "Sophia",
      last: "Anderson",
      status: "Completed",
      phone: "+1-666-852-6666",
      date: "2023-10-06",
    },
    {
      id: "EMP006",
      first: "Chris",
      last: "Brown",
      status: "Referred",
      phone: "+1-777-321-4321",
      date: "2023-10-07",
    },
  ]);

  // 🔍 Search Filter
  const filtered = patients.filter((p) => {
    const text =
      `${p.id} ${p.first} ${p.last} ${p.status} ${p.phone} ${p.date}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // 🟢 Status Color
  function getStatusColor(status) {
    switch (status) {
      case "Ongoing":
        return "red";
      case "Completed":
        return "green";
      case "Referred":
        return "orange";
      default:
        return "black";
    }
  }

  // 🟢 Update Status
  const updateStatus = (id, newStatus) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };
  // 🟢 View Aadhar
  const [selectedAadhar, setSelectedAadhar] = useState(null);
  const handleViewAadhar = (patient) => {
    setSelectedAadhar(patient?.aadhar || null);
  };

  // -----------------------------
  // 📌 PAGINATION LOGIC
  // -----------------------------
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filtered.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  // Search बदलते ही पेज 1 पर जाए
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className="container p-0 m-0">
      {/* Header */}
      <div className="card-border">
        <div className="card-header d-flex justify-content-center align-items-center bg-primary">
          <div className="text-center d-flex align-items-center">
            <i className="fa-solid fa-toolbox me-2 text-white"></i>
            <span className="text-white">OPD Patient List</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3" style={{ width: "40%" }}>
        <label className="fw-bold mb-1">Search</label>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search patient..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="container-fluid">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>SL NO</th>
              <th>Patient ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Status</th>
              <th>Phone No</th>
              <th>Visit Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentRows.map((p, index) => (
              <tr key={p.id}>
                <td>{indexOfFirst + index + 1}</td>
                <td>{p.id}</td>
                <td>{p.first}</td>
                <td>{p.last}</td>

                <td>
                  <select
                    className="form-select form-select-sm"
                    style={{ color: getStatusColor(p.status) }}
                    value={p.status}
                    onChange={(e) => updateStatus(p.id, e.target.value)}
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Referred">Referred</option>
                  </select>
                </td>

                <td>{p.phone}</td>
                <td>{p.date}</td>
                <td className="d-flex justify-content-center align-items-center">
                  <button
                    className="btn1 bg-primary btn-sm text-white"
                    data-tooltip="View"
                    data-bs-toggle="modal"
                    data-bs-target="#viewModal"
                    onClick={() => setSelected(p)}
                  >
                    <i className="bi bi-eye"></i>
                  </button>

                  <button
                    className="btn1 bg-warning btn-sm text-white mx-2 edit-btn-hover"
                    data-tooltip="Edit"
                    data-bs-toggle="modal"
                    data-bs-target="#viewModal"
                    onClick={() => setSelected(p)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn1 bg-dark btn-sm me-1"
                    data-tooltip="Id Proof"
                    data-bs-toggle="modal"
                    data-bs-target="#aadharModal"
                    onClick={() => handleViewAadhar(p)}
                    style={{ backgroundColor: "#6c757d", border: "none" }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#5a6268")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#6c757d")
                    }
                  >
                    <i className="fa fa-id-card"></i>
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No matching data found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 🔵 PAGINATION UI */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-end my-4">
            <nav>
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Previous
                  </button>
                </li>

                {[...Array(totalPages)].map((_, i) => (
                  <li
                    className={`page-item ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                    key={i}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
      {/* Modal (unchanged) */}
      <div
        className="modal fade"
        id="viewModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ backgroundColor: "#01C0C8" }}
            >
              <h5 className="modal-title">Patient Details</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              {selected && (
                <>
                  <p>
                    <strong>ID:</strong> {selected.id}
                  </p>
                  <p>
                    <strong>First Name:</strong> {selected.first}
                  </p>
                  <p>
                    <strong>Last Name:</strong> {selected.last}
                  </p>
                  <p>
                    <strong>Status:</strong> {selected.status}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selected.phone}
                  </p>
                  <p>
                    <strong>Date:</strong> {selected.date}
                  </p>
                </>
              )}
            </div>

            <div className="modal-footer justify-content-center">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Aadhar Modal */}
      <div className="modal fade border-0" id="aadharModal" tabIndex="-1">
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ backgroundColor: "#01C0C8" }}
            >
              <h5 className="modal-title">Aadhar Card</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body text-center">
              {selectedAadhar ? (
                <img
                  src={selectedAadhar}
                  alt="Aadhar"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <p className="text-muted">No Aadhar Card Uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOpd;
