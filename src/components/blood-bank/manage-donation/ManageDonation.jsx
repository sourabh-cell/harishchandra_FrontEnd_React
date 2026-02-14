import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllDonations } from "../../../features/donationSlice";
import "./ManageDonation.css";

export default function ManageDonation() {
  const dispatch = useDispatch();
  const { items: allDonations, loading, error } = useSelector((state) => state.donation || {});
  
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewDonation, setViewDonation] = useState(null);
  const viewModalRef = useRef(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    dispatch(fetchAllDonations());
    initBootstrapModal();
    return () => {
      try {
        viewModalRef.current?.hide?.();
      } catch (e) {}
    };
  }, [dispatch]);

  useEffect(() => {
    if (allDonations && allDonations.length > 0) {
      setFilteredDonations(allDonations);
      setTotalPages(Math.ceil(allDonations.length / PAGE_SIZE));
    } else {
      setFilteredDonations([]);
      setTotalPages(0);
    }
  }, [allDonations]);

  useEffect(() => {
    applyFilters();
  }, [searchText, bloodGroupFilter, statusFilter, allDonations]);

  function initBootstrapModal() {
    const viewEl = document.getElementById("viewDonationModal");
    if (typeof window !== "undefined" && window.bootstrap && window.bootstrap.Modal) {
      try {
        if (viewEl) viewModalRef.current = new window.bootstrap.Modal(viewEl);
      } catch (err) {
        console.warn("Bootstrap Modal initialization failed:", err);
      }
    }
  }

  function showModalById(id) {
    try {
      const el = document.getElementById(id);
      if (!el) return;
      if (viewModalRef.current && viewModalRef.current.show && el.id === "viewDonationModal") {
        viewModalRef.current.show();
        return;
      }
      el.classList.add("show");
      el.style.display = "block";
      el.removeAttribute("aria-hidden");
      el.setAttribute("aria-modal", "true");
      document.body.classList.add("modal-open");
      let backdrop = document.getElementById("__donation_modal_backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "__donation_modal_backdrop";
        backdrop.className = "modal-backdrop fade show";
        document.body.appendChild(backdrop);
      }
    } catch (e) {
      console.warn("showModalById failed:", e);
    }
  }

  function hideModalById(id) {
    try {
      const el = document.getElementById(id);
      if (!el) return;
      if (viewModalRef.current && viewModalRef.current.hide && el.id === "viewDonationModal") {
        viewModalRef.current.hide();
        return;
      }
      el.classList.remove("show");
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
      el.removeAttribute("aria-modal");
      document.body.classList.remove("modal-open");
      const backdrop = document.getElementById("__donation_modal_backdrop");
      if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    } catch (e) {
      console.warn("hideModalById failed:", e);
    }
  }

  function applyFilters() {
    if (!allDonations || !Array.isArray(allDonations)) {
      setFilteredDonations([]);
      return;
    }

    const search = (searchText || "").toLowerCase();
    const bloodGroup = bloodGroupFilter;
    const status = statusFilter;

    const filtered = allDonations.filter((donation) => {
      const matchesSearch =
        !search ||
        (donation.donationId && donation.donationId.toLowerCase().includes(search)) ||
        (donation.donorId && donation.donorId.toLowerCase().includes(search)) ||
        (donation.donorName && donation.donorName.toLowerCase().includes(search)) ||
        (donation.donorPhone && donation.donorPhone.toLowerCase().includes(search));

      const donationBG = (donation.bloodGroup || "").toString().trim().toUpperCase();
      const donationStatus = (donation.status || "").toString().trim();
      const matchesBloodGroup =
        !bloodGroup ||
        donationBG === (bloodGroup || "").toString().trim().toUpperCase();
      const matchesStatus =
        !status || donationStatus === (status || "").toString().trim();

      return matchesSearch && matchesBloodGroup && matchesStatus;
    });

    setFilteredDonations(filtered);
    setCurrentPage(0);
    setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
  }

  function clearAllFilters() {
    setSearchText("");
    setBloodGroupFilter("");
    setStatusFilter("");
  }

  function getPaginatedDonations() {
    const donations = filteredDonations;
    const startIndex = currentPage * PAGE_SIZE;
    return donations.slice(startIndex, startIndex + PAGE_SIZE);
  }

  function updateDonationCount() {
    const currentDonations = filteredDonations;
    const showing = Math.min(currentDonations.length - currentPage * PAGE_SIZE, PAGE_SIZE);
    return {
      showing: currentDonations.length === 0 ? 0 : showing,
      total: currentDonations.length,
    };
  }

  function goToPage(page) {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  }

  function viewDonationById(donation) {
    setViewDonation(donation);
    showModalById("viewDonationModal");
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const escapeHtml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return "";
    return unsafe
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      STORED: "bg-success",
      USED: "bg-primary",
      EXPIRED: "bg-danger",
      PENDING: "bg-warning",
    };
    return statusClass[status] || "bg-secondary";
  };

  const paginatedDonations = getPaginatedDonations();
  const counts = updateDonationCount();

  return (
    <div className="container-fluid mt-4">
      <style>{`
        :root {
          --primary-color: #01c0c8;
          --success-color: #198754;
          --secondary-color: #6c757d;
          --warning-color: #ffc107;
        }
        body {
          background-color: #f8f9fa;
          font-family: "Segoe UI", sans-serif;
          font-size: 0.9rem;
        }
        .container-fluid {
          padding-left: 50px;
          padding-right: 50px;
        }
        .header-bar {
          background-color: var(--primary-color);
          color: #fff;
          padding: 8px 16px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }
        .filter-section {
          background: #fff;
          border-radius: 6px;
          padding: 10px 15px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .table-container {
          background: #fff;
          border-radius: 6px;
          padding: 12px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        }
        table th {
          background-color: var(--primary-color);
          color: #fff;
          font-size: 0.85rem;
          padding: 6px;
        }
        table td {
          padding: 6px;
          vertical-align: middle;
        }
        .form-label {
          margin-bottom: 2px;
          font-size: 0.85rem;
        }
        .form-control, .form-select {
          padding: 4px 8px;
          font-size: 0.85rem;
          height: 32px;
        }
        .btn {
          padding: 4px 8px;
          font-size: 0.85rem;
          border-radius: 4px;
        }
        .action-btn {
          margin: 1px;
          font-size: 0.8rem;
        }
        .count-badge {
          background: var(--primary-color);
          color: #fff;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
        }
        .status-stored { color: var(--success-color); font-weight: 600; }
        .status-used { color: var(--primary-color); font-weight: 600; }
        .status-expired { color: var(--secondary-color); font-weight: 600; }
        .status-pending { color: var(--warning-color); font-weight: 600; }
        .pagination-container { margin-top: 10px; }
        .modal-body, .modal-footer { font-size: 0.9rem; }
        .modal-header { padding: 8px 12px; }
        @media (max-width: 768px) {
          body { font-size: 0.8rem; }
          .table-responsive { font-size: 0.8rem; }
          .header-bar h4 { font-size: 1rem; }
        }
      `}</style>

      {/* Loading spinner */}
      <div
        id="loadingSpinner"
        style={{ display: loading ? "flex" : "none" }}
        className="loading-spinner"
      >
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>

      <div className="header-bar form-header mb-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="fa-solid fa-droplet fa-lg text-white me-2"></i>
          <h4 className="mb-0">Manage Donations</h4>
        </div>
        <button
          className="btn btn-light btn-sm"
          id="refreshBtn"
          onClick={() => dispatch(fetchAllDonations())}
        >
          <i className="fas fa-sync-alt me-1"></i> Refresh
        </button>
      </div>

      <div className="filter-section">
        <div className="row g-3">
          <div className="col-md-4">
            <label htmlFor="searchInput" className="form-label">
              Search Donations
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                id="searchInput"
                placeholder="Search by ID, donor name, phone..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                id="clearSearch"
                onClick={() => setSearchText("")}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="col-md-3">
            <label htmlFor="bloodGroupFilter" className="form-label">
              Blood Group
            </label>
            <select
              className="form-select"
              id="bloodGroupFilter"
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="col-md-3">
            <label htmlFor="statusFilter" className="form-label">
              Status
            </label>
            <select
              className="form-select"
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="STORED">Stored</option>
              <option value="USED">Used</option>
              <option value="EXPIRED">Expired</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div className="col-md-2 d-flex align-items-end">
            <button
              className="btn btn-outline-secondary w-100"
              id="clearFilters"
              onClick={() => clearAllFilters()}
            >
              <i className="fas fa-filter-circle-xmark"></i> Clear
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center align-items-center mb-3 mt-4">
        <div>
          <span className="me-3">
            Showing{" "}
            <span id="showingCount" className="count-badge">
              {counts.showing}
            </span>{" "}
            of{" "}
            <span id="totalCount" className="count-badge">
              {counts.total}
            </span>{" "}
            donations
          </span>
        </div>
      </div>

      <div className="table-container p-3">
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle mb-0">
            <thead className="table-dark justify-content-center">
              <tr>
                <th>Donation ID</th>
                <th>Donor ID</th>
                <th>Donor Name</th>
                <th>Phone</th>
                <th>Blood Group</th>
                <th>Donation Date</th>
                <th>Expiry Date</th>
                <th>Units</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="donationTableBody">
              {paginatedDonations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-muted py-4">
                    <i className="fa-solid fa-inbox fa-2x mb-3 d-block"></i>
                    No donations found.
                  </td>
                </tr>
              ) : (
                paginatedDonations.map((donation) => (
                  <tr key={donation.id || donation.donationId}>
                    <td>
                      <strong className="text-primary">
                        {escapeHtml(donation.donationId || "N/A")}
                      </strong>
                    </td>
                    <td>{escapeHtml(donation.donorId || "N/A")}</td>
                    <td>{escapeHtml(donation.donorName || "N/A")}</td>
                    <td>{escapeHtml(donation.donorPhone || "N/A")}</td>
                    <td className="text-center">
                      <span className="badge bg-danger">
                        {donation.bloodGroup || "N/A"}
                      </span>
                    </td>
                    <td>{formatDate(donation.donationDate)}</td>
                    <td>{formatDate(donation.expiryDate)}</td>
                    <td className="text-center">{donation.unitsCollected || 0}</td>
                    <td className="text-center">
                      <span className={`badge ${getStatusBadge(donation.status)}`}>
                        {donation.status || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          type="button"
                          className="btn btn-outline-primary view-btn"
                          data-id={donation.donationId}
                          title="View Details"
                          onClick={() => viewDonationById(donation)}
                        >
                          <i className="fa-solid fa-eye"></i> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <nav>
            <ul className="pagination" id="pagination">
              {totalPages <= 1 ? null : (
                <>
                  <li
                    className={`page-item ${
                      currentPage === 0 ? "disabled" : ""
                    }`}
                  >
                    <a
                      className="page-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(currentPage - 1);
                      }}
                      aria-label="Previous"
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>

                  {(() => {
                    const maxVisiblePages = 5;
                    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
                    if (endPage - startPage < maxVisiblePages - 1) {
                      startPage = Math.max(0, endPage - maxVisiblePages + 1);
                    }
                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) pages.push(i);
                    return pages.map((i) => (
                      <li
                        className={`page-item ${
                          currentPage === i ? "active" : ""
                        }`}
                        key={i}
                      >
                        <a
                          className="page-link"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            goToPage(i);
                          }}
                        >
                          {i + 1}
                        </a>
                      </li>
                    ));
                  })()}

                  <li
                    className={`page-item ${
                      currentPage === totalPages - 1 ? "disabled" : ""
                    }`}
                  >
                    <a
                      className="page-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(currentPage + 1);
                      }}
                      aria-label="Next"
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* View Donation Modal */}
      <div
        className="modal fade"
        id="viewDonationModal"
        tabIndex={-1}
        aria-labelledby="viewDonationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ background: "#01C0C8" }}
            >
              <h5 className="modal-title" id="viewDonationModalLabel">
                Donation Details
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => hideModalById("viewDonationModal")}
              ></button>
            </div>
            <div className="modal-body">
              <div id="donationDetails">
                {viewDonation ? (
                  <>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Donation ID
                          </label>
                          <p className="fw-bold text-primary">
                            {escapeHtml(viewDonation.donationId || "N/A")}
                          </p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Donor ID
                          </label>
                          <p>{escapeHtml(viewDonation.donorId || "N/A")}</p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Donor Name
                          </label>
                          <p>{escapeHtml(viewDonation.donorName || "N/A")}</p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Phone
                          </label>
                          <p>{escapeHtml(viewDonation.donorPhone || "N/A")}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Blood Group
                          </label>
                          <p>
                            <span className="badge bg-danger">
                              {viewDonation.bloodGroup || "N/A"}
                            </span>
                          </p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Units Collected
                          </label>
                          <p>{viewDonation.unitsCollected || 0}</p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Status
                          </label>
                          <p>
                            <span className={`badge ${getStatusBadge(viewDonation.status)}`}>
                              {viewDonation.status || "N/A"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Donation Date
                          </label>
                          <p>{formatDate(viewDonation.donationDate)}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Expiry Date
                          </label>
                          <p>{formatDate(viewDonation.expiryDate)}</p>
                        </div>
                      </div>
                    </div>
                    {viewDonation.notes ? (
                      <div className="row">
                        <div className="col-12">
                          <div className="mb-3">
                            <label className="form-label text-muted">
                              Notes
                            </label>
                            <p className="border p-2 rounded bg-light">
                              {escapeHtml(viewDonation.notes)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p>No donation selected.</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                style={{ background: "#01C0C8", color: "white" }}
                data-bs-dismiss="modal"
                onClick={() => hideModalById("viewDonationModal")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
