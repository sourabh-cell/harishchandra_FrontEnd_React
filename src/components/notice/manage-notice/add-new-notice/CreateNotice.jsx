import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { addNotice, fetchNotices } from "../../../../features/noticeSlice";

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

export default function CreateNotice() {
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

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
    const form = e.target;
    const title = form.noticeTitle?.value?.trim() || "";
    const description = form.noticeDescription?.value || "";
    const startDate = form.noticeStartDate?.value || "";
    const endDate = form.noticeEndDate?.value || "";

    // Use selected audiences from state
    const audienceIds = selectedAudiences.join(",");

    const fd = new FormData();
    fd.append("noticeTitle", title);
    fd.append("noticeDescription", description);
    fd.append("noticeStartDate", startDate);
    fd.append("noticeEndDate", endDate);
    fd.append("targetAudienceIds", audienceIds);

    const fileInput = form.querySelector("#attachment");
    if (fileInput && fileInput.files && fileInput.files[0]) {
      fd.append("attachment", fileInput.files[0]);
    }

    dispatch(addNotice(fd))
      .unwrap()
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Notice saved successfully",
          timer: 1400,
          showConfirmButton: false,
        });
        form.reset();
        setFilePreview(null);
        setFileName("");
        setSelectedAudiences([]);
        // refresh list so other views show the new notice without page reload
        dispatch(fetchNotices());
      })
      .catch((err) => {
        console.error("Failed to save notice:", err);
        const msg =
          err?.message || JSON.stringify(err) || "Failed to save notice";
        Swal.fire({ icon: "error", title: "Error", text: msg });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle audience selection
  const toggleAudience = (id) => {
    setSelectedAudiences((prev) =>
      prev.includes(id)
        ? prev.filter((aud) => aud !== id)
        : [...prev, id]
    );
  };

  // Select all audiences / Toggle all
  const selectAllAudiences = () => {
    if (selectedAudiences.length === TARGET_AUDIENCE_OPTIONS.length) {
      // If all selected, deselect all
      setSelectedAudiences([]);
    } else {
      // Otherwise select all
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
        (opt) => opt.id === selectedAudiences[0]
      );
      return option ? option.role : "Select Target Audience";
    }
    return `${selectedAudiences.length} audiences selected`;
  };

  return (
    <div className="full-width-card card shadow border-0">
      {/* Header */}
      <div
        className="card-header text-white text-center py-3"
        style={{ backgroundColor: "#01C0C8" }}
      >
        <h4 className="mb-0">
          <i className="bi bi-megaphone-fill me-2"></i>
          Create New Notice
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
                            checked={selectedAudiences.includes(id)}
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
                      (opt) => opt.id === id
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

            {/* Preview Section */}
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

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn text-white px-4"
              style={{ backgroundColor: "#6f42c1" }}
              onClick={() => {
                // Get form values
                const form = document.querySelector('form');
                const title = form?.noticeTitle?.value || '';
                const description = form?.noticeDescription?.value || '';
                const startDate = form?.noticeStartDate?.value || '';
                const endDate = form?.noticeEndDate?.value || '';
                
                // View notice details
                Swal.fire({
                  title: `<div style="color: #01C0C8;"><i class='bi bi-megaphone-fill me-2'></i>${title || 'Untitled Notice'}</div>`,
                  html: `
                    <div style="text-align: left; background: linear-gradient(135deg, #e3f7f8 0%, #f8f9fa 100%); padding: 20px; border-radius: 12px; border: 1px solid #01C0C8;">
                      <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-calendar-check me-2'></i>Start Date</p>
                        <p style="margin-left: 24px; margin-bottom: 12px;">${startDate ? new Date(startDate).toLocaleString() : 'N/A'}</p>
                        <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-calendar-x me-2'></i>End Date</p>
                        <p style="margin-left: 24px; margin-bottom: 12px;">${endDate ? new Date(endDate).toLocaleString() : 'N/A'}</p>
                        <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-people me-2'></i>Target Audience</p>
                        <p style="margin-left: 24px;">${selectedAudiences.length > 0 ? selectedAudiences.map(id => {
                          const option = TARGET_AUDIENCE_OPTIONS.find(opt => opt.id === Number(id));
                          return option ? option.role : '';
                        }).filter(Boolean).join(', ') : 'None'}</p>
                      </div>
                      <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-file-text me-2'></i>Description</p>
                        <div style="margin-left: 24px; max-height: 150px; overflow-y: auto;">${description || 'N/A'}</div>
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
