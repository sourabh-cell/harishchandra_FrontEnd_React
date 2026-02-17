import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  selectNotices,
  fetchNotices,
  updateNotice,
} from "../../../../features/noticeSlice";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Target audience options
const TARGET_AUDIENCE_OPTIONS = [
  { id: 3, role: "DOCTOR" },
  { id: 4, role: "HEADNURSE" },
  { id: 5, role: "PHARMACIST" },
  { id: 6, role: "ACCOUNTANT" },
  { id: 7, role: "HR" },
  { id: 8, role: "LABORATORIST" },
  { id: 9, role: "INSURANCE" },
  { id: 10, role: "RECEPTIONIST" },
];

export default function EditNotice() {
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const notices = useSelector(selectNotices);

  // form state
  const [title, setTitle] = useState("");
  const [startDateVal, setStartDateVal] = useState("");
  const [endDateVal, setEndDateVal] = useState("");
  const [descriptionVal, setDescriptionVal] = useState("");
  const [selectedAudiences, setSelectedAudiences] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview({ type: "image", src: event.target.result });
        setFileName(file.name || "");
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
      setFileName(file.name);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle audience selection
  const toggleAudience = (id) => {
    const numId = Number(id);
    setSelectedAudiences((prev) =>
      prev.includes(numId)
        ? prev.filter((aud) => aud !== numId)
        : [...prev, numId]
    );
  };

  // Select all audiences / Toggle all
  const selectAllAudiences = () => {
    if (selectedAudiences.length === TARGET_AUDIENCE_OPTIONS.length) {
      setSelectedAudiences([]);
    } else {
      const allIds = TARGET_AUDIENCE_OPTIONS.map((opt) => opt.id);
      setSelectedAudiences(allIds);
    }
  };

  // Handle click outside dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get selected audience labels
  const getSelectedLabels = () => {
    if (selectedAudiences.length === 0) return "Select Target Audience";
    if (selectedAudiences.length === TARGET_AUDIENCE_OPTIONS.length) return "All Selected";
    if (selectedAudiences.length === 1) {
      const option = TARGET_AUDIENCE_OPTIONS.find(
        (opt) => opt.id === Number(selectedAudiences[0])
      );
      return option ? option.role : "Select Target Audience";
    }
    return `${selectedAudiences.length} audiences selected`;
  };

  // load notice when notices list changes or id available
  useEffect(() => {
    if (!id) return;
    // if notices not loaded, fetch
    if (!Array.isArray(notices) || notices.length === 0) {
      dispatch(fetchNotices());
      return;
    }

    const n = notices.find(
      (x) => String(x.id) === String(id) || String(x.noticeId) === String(id)
    );
    if (!n) return;

    setTitle(n.noticeTitle || n.title || "");
    const makeInput = (s) => {
      if (!s) return "";
      const d = new Date(s);
      if (isNaN(d)) return String(s);
      return d.toISOString().slice(0, 16);
    };
    setStartDateVal(makeInput(n.noticeStartDate || n.startDate || n.start));
    setEndDateVal(makeInput(n.noticeEndDate || n.endDate || n.end));
    setDescriptionVal(n.noticeDescription || n.description || "");
    // audience: server may store as comma string or array
    const aud = n.targetAudienceIds || n.audience || n.targetAudience || "";
    const arr = Array.isArray(aud)
      ? aud.map((x) => Number(x))
      : String(aud)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((x) => Number(x));
    setSelectedAudiences(arr);

    // attachment preview if present
    const att =
      n.attachmentUrl || n.fileUrl || n.attachment || n.attachment_path || null;
    if (att && typeof att === "string") {
      // ensure full URL for preview: if att is relative, prefix with API_BASE_URL
      let src = att;
      try {
        const isAbsolute = /^(https?:)?\/\//i.test(att);
        if (!isAbsolute) {
          // handle leading slash
          if (API_BASE_URL.endsWith("/") && att.startsWith("/"))
            src = API_BASE_URL.slice(0, -1) + att;
          else if (!API_BASE_URL.endsWith("/") && !att.startsWith("/"))
            src = API_BASE_URL + "/" + att;
          else src = API_BASE_URL + att;
        }
      } catch {
        src = att;
      }
      setFilePreview({ type: "image", src });
      // try to set fileName from URL
      try {
        const parts = src.split("/");
        setFileName(parts[parts.length - 1] || "");
      } catch {
        setFileName("");
      }
    }
  }, [id, notices, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate target audience selection
    if (selectedAudiences.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please select at least one target audience",
      });
      return;
    }

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("noticeTitle", title);
    fd.append("noticeDescription", descriptionVal);
    fd.append("noticeStartDate", startDateVal);
    fd.append("noticeEndDate", endDateVal);
    const audienceIds = selectedAudiences.join(",");
    fd.append("targetAudienceIds", audienceIds);

    const fileInput = e.target.querySelector("#attachment");
    if (fileInput && fileInput.files && fileInput.files[0]) {
      fd.append("attachment", fileInput.files[0]);
    }

    dispatch(updateNotice({ id, payload: fd }))
      .unwrap()
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Notice updated successfully",
          timer: 1400,
          showConfirmButton: false,
        });
        // refresh list
        dispatch(fetchNotices());
        navigate(-1);
      })
      .catch((err) => {
        console.error("Failed to update notice:", err);
        const msg =
          err?.message || JSON.stringify(err) || "Failed to update notice";
        Swal.fire({ icon: "error", title: "Error", text: msg });
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="full-width-card card shadow border-0">
      {/* Header */}
      <div
        className="card-header text-white text-center py-3"
        style={{ backgroundColor: "#01C0C8" }}
      >
        <h4 className="mb-0">
          <i className="bi bi-pencil-square me-2"></i>
          Edit Notice
        </h4>
      </div>

      {/* Body */}
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="title" className="form-label fw-semibold">
                Notice Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="noticeTitle"
                className="form-control"
                placeholder="Enter notice title"
                required
                disabled={isSubmitting}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="startDate" className="form-label fw-semibold">
                Start Date <span className="text-danger">*</span>
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="noticeStartDate"
                className="form-control"
                required
                disabled={isSubmitting}
                value={startDateVal}
                onChange={(e) => setStartDateVal(e.target.value)}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="endDate" className="form-label fw-semibold">
                End Date <span className="text-danger">*</span>
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="noticeEndDate"
                className="form-control"
                required
                disabled={isSubmitting}
                value={endDateVal}
                onChange={(e) => setEndDateVal(e.target.value)}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Target Audience <span className="text-danger">*</span>
              </label>

              <div className="dropdown" ref={dropdownRef}>
                <button
                  className="btn w-100 text-start d-flex justify-content-between align-items-center"
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    border: "1px solid #6f42c1",
                    color: selectedAudiences.length > 0 ? "#6f42c1" : "#6c757d",
                    backgroundColor:
                      selectedAudiences.length > 0 ? "#f3e5f5" : "#fff",
                  }}
                >
                  <span>{getSelectedLabels()}</span>
                  <i
                    className={`bi bi-chevron-${dropdownOpen ? "up" : "down"}`}
                    style={{ color: "#6f42c1" }}
                  ></i>
                </button>

                {dropdownOpen && (
                  <div
                    className="dropdown-menu show w-100 mt-1"
                    style={{ maxHeight: "280px", overflowY: "auto", border: "1px solid #6f42c1" }}
                  >
                    {/* All option */}
                    <div className="px-2 py-1">
                      <label
                        className="d-flex align-items-center gap-2 py-1 px-2 rounded cursor-pointer hover-bg-light"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input m-0"
                          checked={selectedAudiences.length === TARGET_AUDIENCE_OPTIONS.length}
                          onChange={selectAllAudiences}
                          style={{ accentColor: "#6f42c1" }}
                        />
                        <span className="ms-2 fw-bold" style={{ color: "#6f42c1" }}>
                          All
                        </span>
                      </label>
                    </div>

                    <div className="border-bottom mx-2 my-1"></div>

                    {TARGET_AUDIENCE_OPTIONS.map(({ id, role }) => (
                      <div key={id} className="px-2 py-1">
                        <label
                          className="d-flex align-items-center gap-2 py-1 px-2 rounded cursor-pointer hover-bg-light"
                          style={{ cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input m-0"
                            checked={selectedAudiences.includes(Number(id))}
                            onChange={() => toggleAudience(id)}
                            style={{ accentColor: "#6f42c1" }}
                          />
                          <span className="ms-2">{role}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected badges display */}
              {selectedAudiences.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-1">
                  {selectedAudiences.map((id) => {
                    const option = TARGET_AUDIENCE_OPTIONS.find(
                      (opt) => opt.id === Number(id)
                    );
                    return (
                      <span
                        key={id}
                        className="badge d-flex align-items-center gap-1"
                        style={{ backgroundColor: "#6f42c1", color: "white" }}
                      >
                        {option?.role}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-1"
                          style={{ fontSize: "0.5rem" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAudience(id);
                          }}
                        ></button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label fw-semibold">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="description"
              name="noticeDescription"
              className="form-control"
              rows="6"
              placeholder="Enter notice details here..."
              required
              disabled={isSubmitting}
              value={descriptionVal}
              onChange={(e) => setDescriptionVal(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="attachment" className="form-label fw-semibold">
              Attachment
            </label>
            <input
              type="file"
              id="attachment"
              className="form-control"
              accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />

            {/* Preview */}
            {(filePreview || fileName) && (
              <div className="mt-3">
                <p className="text-muted mb-2">
                  <strong>File Preview:</strong>
                </p>
                {filePreview && filePreview.type === "image" ? (
                  <img
                    src={filePreview.src}
                    alt="Preview"
                    className="img-thumbnail"
                    style={{ maxWidth: "300px", maxHeight: "200px" }}
                  />
                ) : (
                  <div className="p-2 bg-light rounded">
                    <i className="bi bi-file-earmark-text"></i> {fileName}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn text-white px-4"
              style={{ backgroundColor: "#6f42c1" }}
              onClick={() => {
                // View notice details
                Swal.fire({
                  title: `<div style="color: #01C0C8;"><i class='bi bi-megaphone-fill me-2'></i>${title}</div>`,
                  html: `
                    <div style="text-align: left; background: linear-gradient(135deg, #e3f7f8 0%, #f8f9fa 100%); padding: 20px; border-radius: 12px; border: 1px solid #01C0C8;">
                      <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-calendar-check me-2'></i>Start Date</p>
                        <p style="margin-left: 24px; margin-bottom: 12px;">${startDateVal ? new Date(startDateVal).toLocaleString() : 'N/A'}</p>
                        <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-calendar-x me-2'></i>End Date</p>
                        <p style="margin-left: 24px; margin-bottom: 12px;">${endDateVal ? new Date(endDateVal).toLocaleString() : 'N/A'}</p>
                        <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-people me-2'></i>Target Audience</p>
                        <p style="margin-left: 24px;">${selectedAudiences.length > 0 ? selectedAudiences.map(id => {
                          const option = TARGET_AUDIENCE_OPTIONS.find(opt => opt.id === Number(id));
                          return option ? option.role : '';
                        }).filter(Boolean).join(', ') : 'None'}</p>
                      </div>
                      <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-file-text me-2'></i>Description</p>
                        <div style="margin-left: 24px; max-height: 150px; overflow-y: auto;">${descriptionVal || 'N/A'}</div>
                      </div>
                    </div>
                  `,
                  width: '550px',
                  confirmButtonText: 'Close',
                  confirmButtonColor: '#01C0C8'
                });
              }}
            >
              <i className="bi bi-eye me-2"></i>View
            </button>
            <button
              type="submit"
              className="btn text-white px-4"
              style={{ backgroundColor: "#01C0C8" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i>Save Notice
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              <i className="bi bi-arrow-left me-2"></i>Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
