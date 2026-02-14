import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllDonors } from "../../../features/donorSlice";
import Swal from "sweetalert2";

// This single-file React component is a direct JSX conversion of the provided
// HTML/CSS/JS donor management page. I fixed runtime errors, normalized field
// names returned from the API, and converted imperative DOM code into React
// state and effects. It assumes Bootstrap 5 and Flatpickr CSS/JS are loaded on
// the page (same as original). It uses the original class names, labels and
// text so the visible wording remains unchanged.

export default function ManageDonor() {
  // --- Configuration ---
  const PAGE_SIZE = 10;

  // --- Redux state ---
  const dispatch = useDispatch();
  const { items: allDonors, loading: reduxLoading, error } = useSelector((state) => state.donor || {});

  // --- Local state ---
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Edit modal state
  const [editingDonor, setEditingDonor] = useState(null);

  // View modal state
  const [viewDonor, setViewDonor] = useState(null);

  // Refs for Bootstrap modals
  const editModalRef = useRef(null);
  const viewModalRef = useRef(null);

  // Add donor navigation (kept behavior: redirect to /add-doner.html)
  function handleAddDonorClick() {
    window.location.href = "/add-doner.html";
  }

  // Utility functions (kept same names and behavior where possible)
  const DonorUtils = {
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    formatDate(dateString) {
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
    },

    escapeHtml(unsafe) {
      if (unsafe === null || unsafe === undefined) return "";
      return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    showNotification(message, type = "success") {
      // Recreate original notification appearance with Bootstrap alerts
      const existingAlerts = document.querySelectorAll(".donor-notification");
      existingAlerts.forEach((alert) => alert.remove());

      const notification = document.createElement("div");
      notification.className = `alert alert-${type} alert-dismissible fade show donor-notification`;
      notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fa-solid ${
                  type === "success"
                    ? "fa-check-circle"
                    : "fa-exclamation-triangle"
                } me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        `;

      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 5000);
    },

    showLoading(show) {
      setLoading(show);
    },

    initDatePickers() {
      if (typeof flatpickr === "undefined") {
        // flatpickr not available; ignore
        return;
      }

      try {
        // initialize flatpickr on inputs with class .date-picker
        const dateInputs = document.querySelectorAll(".date-picker");
        dateInputs.forEach((input) => {
          flatpickr(input, {
            dateFormat: "Y-m-d",
            allowInput: true,
            static: true,
            onChange: function (selectedDates, dateStr) {
              // update corresponding state
              if (input.id === "fromDate") setFromDate(dateStr);
              if (input.id === "toDate") setToDate(dateStr);
              if (input.id === "editLastDonation") {
                // keep editingDonor in sync if present
                setEditingDonor((prev) =>
                  prev ? { ...prev, lastDonationDate: dateStr } : prev
                );
              }
            },
          });
        });
      } catch (error) {
        console.warn("Failed to initialize date picker:", error);
      }
    },
  };

  // --- API service (kept names) ---
  const DonorAPI = {
    async request(endpoint, options = {}) {
      const url = `${import.meta.env.VITE_API_BASE_URL}/v1/blood-donors${endpoint}`;
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      };

      if (options.body) {
        config.body = JSON.stringify(options.body);
      }

      try {
        const response = await fetch(url, config);

        if (!response.ok) {
          // try to parse error JSON
          let errText = `HTTP error! status: ${response.status}`;
          try {
            const body = await response.json();
            errText = body.message || JSON.stringify(body);
          } catch (e) {
            // ignore
          }
          throw new Error(errText);
        }

        if (response.status === 204) {
          return { success: true };
        }

        return await response.json();
      } catch (error) {
        console.error("API Request failed:", error);
        throw error;
      }
    },

    async getAllDonors() {
      return await this.request("");
    },

    async getDonorById(id) {
      return await this.request(`/${id}`);
    },

    async updateDonor(id, donorData) {
      return await this.request(`/${id}`, {
        method: "PUT",
        body: donorData,
      });
    },

    async deactivateDonor(id) {
      // Try common endpoint patterns to avoid 404s on different backend implementations
      const attempts = [
        { url: `/${id}/deactivate`, options: { method: "PATCH" } },
        { url: `/deactivate/${id}`, options: { method: "PATCH" } },
        {
          url: `/${id}/status`,
          options: { method: "PATCH", body: { isActive: false } },
        },
        {
          url: `/${id}`,
          options: { method: "PATCH", body: { isActive: false } },
        },
      ];
      for (const a of attempts) {
        try {
          const res = await this.request(a.url, a.options);
          return res;
        } catch (err) {
          // if 404 try next, otherwise rethrow
          if (err.message && err.message.includes("404")) continue;
          throw err;
        }
      }
      throw new Error("Deactivate endpoint not found");
    },

    async activateDonor(id) {
      const attempts = [
        { url: `/${id}/activate`, options: { method: "PATCH" } },
        { url: `/activate/${id}`, options: { method: "PATCH" } },
        {
          url: `/${id}/status`,
          options: { method: "PATCH", body: { isActive: true } },
        },
        {
          url: `/${id}`,
          options: { method: "PATCH", body: { isActive: true } },
        },
      ];
      for (const a of attempts) {
        try {
          const res = await this.request(a.url, a.options);
          return res;
        } catch (err) {
          if (err.message && err.message.includes("404")) continue;
          throw err;
        }
      }
      throw new Error("Activate endpoint not found");
    },

    async addDonor(donorData) {
      return await this.request("", {
        method: "POST",
        body: donorData,
      });
    },

    async searchDonors(query) {
      return await this.request(`/search?q=${encodeURIComponent(query)}`);
    },

    async getActiveDonors() {
      return await this.request("/active");
    },

    async getDonorsByBloodGroup(bloodGroup) {
      return await this.request(`/blood-group/${bloodGroup}`);
    },

    async checkPhoneExists(phone) {
      return await this.request(
        `/check-phone?phone=${encodeURIComponent(phone)}`
      );
    },

    async checkEmailExists(email) {
      return await this.request(
        `/check-email?email=${encodeURIComponent(email)}`
      );
    },
  };

  // --- Data normalization ---
  // Because the original code mixed naming (donorName vs fullName, phone vs contactInfo)
  // we normalize each donor object into a canonical shape used by the UI.
  function normalizeDonor(raw) {
    return {
      // prefer explicit fields but fall back to alternatives seen in original code
      id: raw.id ?? raw._id ?? raw.ID ?? null,
      donorId: raw.donorId ?? raw.donorID ?? raw.idString ?? "",
      donorName: raw.donorName ?? raw.fullName ?? raw.name ?? "",
      age: raw.age ?? raw.Age ?? null,
      gender: raw.gender ?? raw.sex ?? "",
      phone: raw.phone ?? raw.contactInfo ?? raw.contact ?? "",
      contactInfo: raw.contactInfo ?? raw.phone ?? raw.contact ?? "",
      email: raw.email ?? "",
      bloodGroup: raw.bloodGroup ?? raw.blood_group ?? "",
      address: raw.address ?? "",
      lastDonationDate: raw.lastDonationDate ?? raw.lastDonation ?? null,
      // map audit / active fields returned by API
      createdDate: raw.createdDate ?? raw.created_at ?? raw.created ?? null,
      updatedDate: raw.updatedDate ?? raw.updated_at ?? raw.updated ?? null,
      isActive:
        typeof raw.isActive === "boolean"
          ? raw.isActive
          : raw.is_active ?? (raw.status ? raw.status === "Active" : true),
      status: raw.status ?? (raw.isActive === false ? "Inactive" : "Active"),
      medicalNotes: raw.medicalNotes ?? raw.medicalNotes ?? raw.notes ?? "",
      // keep original raw in case we need it
      _raw: raw,
    };
  }

  // Initialize datepickers and load donors once
  useEffect(() => {
    DonorUtils.initDatePickers();
    dispatch(fetchAllDonors());

    // create modal refs — guard against missing bootstrap JS (avoid TypeError)
    async function initBootstrapModals() {
      // If Bootstrap JS is loaded via CDN it exposes `window.bootstrap`.
      // Initialize modal instances only when present. Do not attempt dynamic
      // imports (app is running with CDN-provided Bootstrap per project setup).
      const editEl = document.getElementById("editDonorModal");
      const viewEl = document.getElementById("viewDonorModal");
      if (
        typeof window !== "undefined" &&
        window.bootstrap &&
        window.bootstrap.Modal
      ) {
        try {
          if (editEl) editModalRef.current = new window.bootstrap.Modal(editEl);
          if (viewEl) viewModalRef.current = new window.bootstrap.Modal(viewEl);
        } catch (err) {
          console.warn("Bootstrap Modal initialization failed:", err);
        }
      } else {
        console.warn(
          "Bootstrap JS not detected on window; modal init skipped (expected when loading via CDN)."
        );
      }
    }

    initBootstrapModals();

    // cleanup on unmount
    return () => {
      try {
        editModalRef.current?.hide?.();
        viewModalRef.current?.hide?.();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Redux state with local filteredDonors when allDonors changes
  useEffect(() => {
    if (allDonors && allDonors.length > 0) {
      setFilteredDonors(allDonors);
      setTotalPages(Math.ceil(allDonors.length / PAGE_SIZE));
    } else {
      setFilteredDonors([]);
      setTotalPages(0);
    }
  }, [allDonors]);

  // --- Safe modal helpers ---
  function showModalById(id) {
    try {
      const el = document.getElementById(id);
      if (!el) return;
      if (
        viewModalRef.current &&
        viewModalRef.current.show &&
        el.id === "viewDonorModal"
      ) {
        viewModalRef.current.show();
        return;
      }
      if (
        editModalRef.current &&
        editModalRef.current.show &&
        el.id === "editDonorModal"
      ) {
        editModalRef.current.show();
        return;
      }

      // fallback: manually toggle classes/attributes for Bootstrap modal show behavior
      el.classList.add("show");
      el.style.display = "block";
      el.removeAttribute("aria-hidden");
      el.setAttribute("aria-modal", "true");
      document.body.classList.add("modal-open");
      // backdrop
      let backdrop = document.getElementById("__donor_modal_backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "__donor_modal_backdrop";
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
      if (
        viewModalRef.current &&
        viewModalRef.current.hide &&
        el.id === "viewDonorModal"
      ) {
        viewModalRef.current.hide();
        return;
      }
      if (
        editModalRef.current &&
        editModalRef.current.hide &&
        el.id === "editDonorModal"
      ) {
        editModalRef.current.hide();
        return;
      }

      // fallback: manually hide
      el.classList.remove("show");
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
      el.removeAttribute("aria-modal");
      document.body.classList.remove("modal-open");
      const backdrop = document.getElementById("__donor_modal_backdrop");
      if (backdrop && backdrop.parentNode)
        backdrop.parentNode.removeChild(backdrop);
    } catch (e) {
      console.warn("hideModalById failed:", e);
    }
  }

  // --- Filtering logic ---
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, bloodGroupFilter, statusFilter, fromDate, toDate, allDonors]);

  function applyFilters() {
    // Guard against undefined allDonors
    if (!allDonors || !Array.isArray(allDonors)) {
      setFilteredDonors([]);
      return;
    }

    const search = (searchText || "").toLowerCase();
    const bloodGroup = bloodGroupFilter;
    const status = statusFilter;
    const from = fromDate;
    const to = toDate;

    const filtered = allDonors.filter((donor) => {
      const matchesSearch =
        !search ||
        (donor.donorId && donor.donorId.toLowerCase().includes(search)) ||
        (donor.donorName && donor.donorName.toLowerCase().includes(search)) ||
        (donor.email && donor.email.toLowerCase().includes(search)) ||
        (donor.contactInfo && donor.contactInfo.toLowerCase().includes(search));

      const donorBG = (donor.bloodGroup || "").toString().trim().toUpperCase();
      const donorStatus = (
        donor.status || (donor.isActive ? "Active" : "Inactive")
      )
        .toString()
        .trim();
      const matchesBloodGroup =
        !bloodGroup ||
        donorBG === (bloodGroup || "").toString().trim().toUpperCase();
      const matchesStatus =
        !status || donorStatus === (status || "").toString().trim();

      let matchesDate = true;
      if (from && donor.lastDonationDate) {
        try {
          matchesDate =
            matchesDate && new Date(donor.lastDonationDate) >= new Date(from);
        } catch (e) {
          matchesDate = matchesDate && false;
        }
      }
      if (to && donor.lastDonationDate) {
        try {
          matchesDate =
            matchesDate && new Date(donor.lastDonationDate) <= new Date(to);
        } catch (e) {
          matchesDate = matchesDate && false;
        }
      }

      return matchesSearch && matchesBloodGroup && matchesStatus && matchesDate;
    });

    setFilteredDonors(filtered);
    setCurrentPage(0);
    setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
  }

  function clearAllFilters() {
    setSearchText("");
    setBloodGroupFilter("");
    setStatusFilter("");
    setFromDate("");
    setToDate("");

    // clear flatpickr inputs visually if present
    const fromEl = document.getElementById("fromDate");
    const toEl = document.getElementById("toDate");
    if (fromEl) fromEl.value = "";
    if (toEl) toEl.value = "";
  }

  function getPaginatedDonors() {
    // Always use filteredDonors (it is initialized to allDonors on load)
    const donors = filteredDonors;
    const startIndex = currentPage * PAGE_SIZE;
    return donors.slice(startIndex, startIndex + PAGE_SIZE);
  }

  function updateDonorCount() {
    const currentDonors = filteredDonors;
    const showing = Math.min(
      currentDonors.length - currentPage * PAGE_SIZE,
      PAGE_SIZE
    );
    return {
      showing: currentDonors.length === 0 ? 0 : showing,
      total: currentDonors.length,
    };
  }

  function goToPage(page) {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  }

  // --- Actions: view, edit, deactivate ---
  async function viewDonorById(donorId) {
    try {
      const response = await DonorAPI.getDonorById(donorId);
      const normalized = normalizeDonor(response);
      setViewDonor(normalized);
      // safe show
      showModalById("viewDonorModal");
    } catch (error) {
      console.error("Error viewing donor:", error);
      DonorUtils.showNotification("Failed to load donor details.", "danger");
    }
  }

  async function editDonorById(donorId) {
    try {
      const response = await DonorAPI.getDonorById(donorId);
      const normalized = normalizeDonor(response);
      setEditingDonor(normalized);
      // populate any date input
      const editLastDonation = document.getElementById("editLastDonation");
      if (editLastDonation)
        editLastDonation.value = normalized.lastDonationDate ?? "";
      showModalById("editDonorModal");
    } catch (error) {
      console.error("Error loading donor for edit:", error);
      DonorUtils.showNotification(
        "Failed to load donor for editing.",
        "danger"
      );
    }
  }

  async function saveDonorEdit() {
    if (!editingDonor) return;

    // prefer numeric/internal id, fallback to donorId string
    const donorId = editingDonor.id ?? editingDonor.donorId; // keep numeric id when available, else donorId string

    // Validation (required fields for update)
    if (
      !editingDonor.donorName ||
      !editingDonor.age ||
      !editingDonor.gender ||
      !editingDonor.phone
    ) {
      DonorUtils.showNotification(
        "Please fill in donor name, age, gender and phone.",
        "warning"
      );
      return;
    }

    if (
      editingDonor.age !== null &&
      (editingDonor.age < 18 || editingDonor.age > 120)
    ) {
      DonorUtils.showNotification("Please provide a valid age.", "warning");
      return;
    }

    try {
      const payload = {
        donorName: editingDonor.donorName,
        age: editingDonor.age,
        gender: editingDonor.gender,
        // prefer contactInfo field updated by the form; fallback to phone
        phone: (
          editingDonor.contactInfo ||
          editingDonor.phone ||
          ""
        ).toString(),
        email: editingDonor.email || "",
        lastDonationDate: editingDonor.lastDonationDate || null,
        bloodGroup: editingDonor.bloodGroup || "",
        address: editingDonor.address || "",
        // include status and isActive so API can persist active/inactive
        status:
          editingDonor.status ||
          (editingDonor.isActive ? "Active" : "Inactive"),
        isActive: !(editingDonor.status === "Inactive"),
      };

      // Use the API path: /api/v1/blood-donors/{Donorid}
      const response = await DonorAPI.updateDonor(donorId, payload);

      if (response) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Donor updated successfully!",
        });
        hideModalById("editDonorModal");
        dispatch(fetchAllDonors());
      } else {
        throw new Error("Failed to update donor");
      }
    } catch (error) {
      console.error("Error updating donor:", error);
      DonorUtils.showNotification(
        "Failed to update donor. Please try again.",
        "danger"
      );
    }
  }

  async function deactivateDonorById(donorId) {
    const result = await Swal.fire({
      title: "Deactivate Donor",
      text: "Do you really want to deactivate this donor? They will no longer appear in active donor lists.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, deactivate!",
      cancelButtonText: "No, cancel!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await DonorAPI.deactivateDonor(donorId);
      // Consider any truthy response as success
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Deactivated!",
          text: "Donor deactivated successfully!",
        });
        dispatch(fetchAllDonors());
      } else {
        throw new Error("Failed to deactivate donor");
      }
    } catch (error) {
      console.error("Error deactivating donor:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to deactivate donor. Please try again.",
      });
    }
  }

  async function activateDonorById(donorId) {
    const result = await Swal.fire({
      title: "Activate Donor",
      text: "Do you want to activate this donor?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, activate!",
      cancelButtonText: "No, cancel!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await DonorAPI.activateDonor(donorId);
      // Consider any truthy response as success
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Activated!",
          text: "Donor activated successfully!",
        });
        dispatch(fetchAllDonors());
      } else {
        throw new Error("Failed to activate donor");
      }
    } catch (error) {
      console.error("Error activating donor:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to activate donor. Please try again.",
      });
    }
  }

  // --- Save new donor (simple inline form handling) ---
  // The original page redirected "Add Donor" to /add-doner.html. We keep that.

  // --- Render helpers ---
  const paginatedDonors = getPaginatedDonors();
  const counts = updateDonorCount();

  return (
    <div className="container-fluid mt-4">
      {/* Inject original CSS into component so wording and look remain identical */}
      <style>{` :root {
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
 
.form-control,
.form-select {
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
 
.status-active {
  color: var(--success-color);
  font-weight: 600;
}
 
.status-inactive {
  color: var(--secondary-color);
  font-weight: 600;
}
 
.status-pending {
  color: var(--warning-color);
  font-weight: 600;
}
 
.pagination-container {
  margin-top: 10px;
}
 
.modal-body,
.modal-footer {
  font-size: 0.9rem;
}
 
.modal-header {
  padding: 8px 12px;
}
 
.modal-body .form-control {
  font-size: 0.9rem;
  padding: 5px 8px;
  height: auto;
}
 
@media (max-width: 768px) {
  body {
    font-size: 0.8rem;
  }
 
  .table-responsive {
    font-size: 0.8rem;
  }
 
  .header-bar h4 {
    font-size: 1rem;
  }
 
  .action-btn span {
    display: none;
  }
}`}</style>

      {/* Loading spinner (keeps original id) */}
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
          <h4 className="mb-0">Manage Donar</h4>
        </div>
        <button
          className="btn btn-light btn-sm"
          id="refreshBtn"
          onClick={() => loadDonors()}
        >
          <i className="fas fa-sync-alt me-1"></i> Refresh
        </button>
      </div>

      <div className="filter-section">
        <div className="row g-3">
          <div className="col-md-3">
            <label htmlFor="searchInput" className="form-label">
              Search Donors
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                id="searchInput"
                placeholder="Search by name, ID, email..."
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

          <div className="col-md-2">
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

          <div className="col-md-2">
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="col-md-2">
            <label htmlFor="fromDate" className="form-label">
              From Date
            </label>
            <input
              type="text"
              className="form-control date-picker"
              id="fromDate"
              placeholder="YYYY-MM-DD"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label htmlFor="toDate" className="form-label">
              To Date
            </label>
            <input
              type="text"
              className="form-control date-picker"
              id="toDate"
              placeholder="YYYY-MM-DD"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="col-md-1 d-flex align-items-end">
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
        <h5 className="mb-0"></h5>
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
            donors
          </span>
         
        </div>
      </div>

      <div className="table-container p-3">
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle mb-0">
            <thead className="table-dark justify-content-center">
              <tr>
                <th className="col-1">Donor ID</th>
                <th>Name</th>
                <th className="col-1">Age</th>
                <th className="col-1">Gender</th>
                <th className="d-none d-md-table-cell">Contact</th>
                <th className="d-none d-md-table-cell">Email</th>
                <th className="col-1">BloodGroup</th>
                <th className="d-none d-lg-table-cell">Address</th>
                <th className="d-none d-sm-table-cell">Previous</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="donorTableBody">
              {paginatedDonors.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center text-muted py-4">
                    <i className="fa-solid fa-inbox fa-2x mb-3 d-block"></i>
                    No donors found.
                  </td>
                </tr>
              ) : (
                paginatedDonors.map((donor) => (
                  <tr key={donor.id || donor.donorId}>
                    <td>
                      <strong className="text-primary">
                        {DonorUtils.escapeHtml(donor.donorId || "N/A")}
                      </strong>
                    </td>
                    <td>{DonorUtils.escapeHtml(donor.donorName || "N/A")}</td>
                    <td className="text-center">{donor.age || "N/A"}</td>
                    <td className="text-center">{donor.gender || "N/A"}</td>
                    <td className="d-none d-md-table-cell">
                      {DonorUtils.escapeHtml(
                        donor.phone || donor.contactInfo || "N/A"
                      )}
                    </td>
                    <td className="d-none d-md-table-cell">
                      {DonorUtils.escapeHtml(donor.email || "N/A")}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-danger">
                        {donor.bloodGroup || "N/A"}
                      </span>
                    </td>
                    <td className="d-none d-lg-table-cell">
                      {DonorUtils.escapeHtml(donor.address || "N/A")}
                    </td>
                    <td className="d-none d-sm-table-cell">
                      {DonorUtils.formatDate(donor.lastDonationDate)}
                    </td>
                    <td className="text-center">
                      <span
                        className={`status-${(
                          donor.status || "Active"
                        ).toLowerCase()} `}
                      >
                        <i
                          className={`fa-solid ${
                            donor.isActive
                              ? "fa-check-circle"
                              : "fa-times-circle"
                          } me-1`}
                          style={{ fontSize: "0.6em" }}
                        ></i>
                        <small>
                          {donor.status ||
                            (donor.isActive ? "Active" : "Inactive")}
                        </small>
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          type="button"
                          className="btn btn-outline-primary view-btn"
                          data-id={donor.donorId}
                          title="View Details"
                          onClick={() => viewDonorById(donor.donorId)}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-warning edit-btn"
                          data-id={donor.donorId}
                          title="Edit Donor"
                          onClick={() => editDonorById(donor.donorId)}
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        {donor.isActive === false ||
                        donor.status === "Inactive" ? (
                          <button
                            type="button"
                            className="btn btn-outline-success action-btn"
                            data-id={donor.donorId}
                            title="Activate Donor"
                            onClick={() => activateDonorById(donor.id)}
                          >
                            <i className="fa-solid fa-check-circle"></i>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline-danger delete-btn"
                            data-id={donor.donorId}
                            title="Deactivate Donor"
                            onClick={() => deactivateDonorById(donor.id)}
                          >
                            <i className="fa-solid fa-ban"></i>
                          </button>
                        )}
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
                    let startPage = Math.max(
                      0,
                      currentPage - Math.floor(maxVisiblePages / 2)
                    );
                    let endPage = Math.min(
                      totalPages - 1,
                      startPage + maxVisiblePages - 1
                    );
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

      {/* View Donor Modal (keeps original ids & structure) */}
      <div
        className="modal fade"
        id="viewDonorModal"
        tabIndex={-1}
        aria-labelledby="viewDonorModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ background: "#01C0C8" }}
            >
              <h5 className="modal-title" id="viewDonorModalLabel">
                Donor Details
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => hideModalById("viewDonorModal")}
              ></button>
            </div>
            <div className="modal-body">
              <div id="donorDetails">
                {viewDonor ? (
                  <>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Donor ID
                          </label>
                          <p className="fw-bold text-primary">
                            {DonorUtils.escapeHtml(viewDonor.donorId || "N/A")}
                          </p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Full Name
                          </label>
                          <p>
                            {DonorUtils.escapeHtml(
                              viewDonor.donorName || "N/A"
                            )}
                          </p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted">Age</label>
                          <p>{viewDonor.age || "N/A"}</p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Gender
                          </label>
                          <p>{viewDonor.gender || "N/A"}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Contact Info
                          </label>
                          <p>
                            {DonorUtils.escapeHtml(
                              viewDonor.phone || viewDonor.contactInfo || "N/A"
                            )}
                          </p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted">Email</label>
                          <p>
                            {DonorUtils.escapeHtml(viewDonor.email || "N/A")}
                          </p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Blood Group
                          </label>
                          <p>
                            <span className="badge bg-danger">
                              {viewDonor.bloodGroup || "N/A"}
                            </span>
                          </p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Status
                          </label>
                          <p>
                            <span
                              className={`status-${(
                                viewDonor.status || "Active"
                              ).toLowerCase()}`}
                            >
                              {viewDonor.status || "Active"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Last Donation Date
                          </label>
                          <p>
                            {DonorUtils.formatDate(viewDonor.lastDonationDate)}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted">
                            Address
                          </label>
                          <p>
                            {DonorUtils.escapeHtml(viewDonor.address || "N/A")}
                          </p>
                        </div>
                      </div>
                    </div>
                    {viewDonor.medicalNotes ? (
                      <div className="row">
                        <div className="col-12">
                          <div className="mb-3">
                            <label className="form-label text-muted">
                              Medical Notes
                            </label>
                            <p className="border p-2 rounded bg-light">
                              {DonorUtils.escapeHtml(viewDonor.medicalNotes)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div className="row mt-3">
                      <div className="col-6">
                        <small className="text-muted">
                          Created:{" "}
                          {DonorUtils.formatDate(viewDonor.createdDate)}
                        </small>
                      </div>
                      <div className="col-6 text-end">
                        <small className="text-muted">
                          Updated:{" "}
                          {DonorUtils.formatDate(viewDonor.updatedDate)}
                        </small>
                      </div>
                    </div>
                  </>
                ) : (
                  <p>No donor selected.</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn "
                style={{ background: "#01C0C8", color: "white" }}
                data-bs-dismiss="modal"
                onClick={() => hideModalById("viewDonorModal")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Donor Modal */}
      <div
        className="modal fade"
        id="editDonorModal"
        tabIndex={-1}
        aria-labelledby="editDonorModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div
              className="modal-header  text-white"
              style={{ background: "#01C0C8" }}
            >
              <h5 className="modal-title" id="editDonorModalLabel">
                Edit Donor
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => hideModalById("editDonorModal")}
              ></button>
            </div>
            <div className="modal-body">
              <form
                id="editDonorForm"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveDonorEdit();
                }}
              >
                <input
                  type="hidden"
                  id="editDonorId"
                  value={editingDonor ? editingDonor.id : ""}
                  readOnly
                />
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="editDonorIdField" className="form-label">
                        Donor ID
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editDonorIdField"
                        required
                        readOnly
                        disabled
                        value={editingDonor ? editingDonor.donorId : ""}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editFullName" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editFullName"
                        required
                        value={editingDonor ? editingDonor.donorName : ""}
                        onChange={(e) =>
                          setEditingDonor((prev) => ({
                            ...prev,
                            donorName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editAge" className="form-label">
                        Age
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="editAge"
                        min={18}
                        max={65}
                        required
                        value={editingDonor ? editingDonor.age : ""}
                        onChange={(e) =>
                          setEditingDonor((prev) => ({
                            ...prev,
                            age: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editGender" className="form-label">
                        Gender
                      </label>
                      <select
                        className="form-select"
                        id="editGender"
                        required
                        value={editingDonor ? editingDonor.gender : ""}
                        onChange={(e) =>
                          setEditingDonor((prev) => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="editContact" className="form-label">
                        Contact Info
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editContact"
                        required
                        value={
                          editingDonor
                            ? editingDonor.contactInfo || editingDonor.phone
                            : ""
                        }
                        onChange={(e) =>
                          setEditingDonor((prev) => ({
                            ...prev,
                            contactInfo: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editEmail" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="editEmail"
                        value={editingDonor ? editingDonor.email : ""}
                        onChange={(e) =>
                          setEditingDonor((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editBloodGroup" className="form-label">
                        Blood Group
                      </label>
                      <select
                        className="form-select"
                        id="editBloodGroup"
                        required
                        value={editingDonor ? editingDonor.bloodGroup : ""}
                        onChange={(e) =>
                          setEditingDonor((prev) => ({
                            ...prev,
                            bloodGroup: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Blood Group</option>
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
                    <div className="mb-3">
                      <label htmlFor="editLastDonation" className="form-label">
                        Last Donation Date
                      </label>
                      <input
                        className="form-control date-picker"
                        id="editLastDonation"
                        type="date"
                        value={
                          editingDonor
                            ? editingDonor.lastDonationDate || ""
                            : ""
                        }
                        onChange={(e) =>
                          setEditingDonor((prev) => ({
                            ...prev,
                            lastDonationDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label htmlFor="editAddress" className="form-label">
                        Address
                      </label>
                      <textarea
                        className="form-control"
                        id="editAddress"
                        rows={2}
                        value={editingDonor ? editingDonor.address : ""}
                        onChange={(e) =>
                          setEditingDonor((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="editStatus" className="form-label">
                        Status
                      </label>
                      <select
                        className="form-select"
                        id="editStatus"
                        required
                        disabled
                        value={editingDonor ? editingDonor.status : "Active"}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="editMedicalNotes" className="form-label">
                        Medical Notes
                      </label>
                      <textarea
                        className="form-control"
                        id="editMedicalNotes"
                        rows={2}
                        value={editingDonor ? editingDonor.medicalNotes : ""}
                        onChange={(e) =>
                          setEditingDonor((prev) => ({
                            ...prev,
                            medicalNotes: e.target.value,
                          }))
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                style={{ background: "#01C0C8", color: "white" }}
                data-bs-dismiss="modal"
                onClick={() => hideModalById("editDonorModal")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn "
                style={{ background: "#01C0C8", color: "white" }}
                onClick={() => saveDonorEdit()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
