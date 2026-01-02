import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  selectNotices,
  fetchNotices,
  updateNotice,
} from "../../../../features/noticeSlice";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EditNotice() {
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const notices = useSelector(selectNotices);

  // form state
  const [title, setTitle] = useState("");
  const [startDateVal, setStartDateVal] = useState("");
  const [endDateVal, setEndDateVal] = useState("");
  const [descriptionVal, setDescriptionVal] = useState("");
  const [audienceSet, setAudienceSet] = useState(new Set());

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
      ? aud.map((x) => String(x))
      : String(aud)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((x) => String(x));
    setAudienceSet(new Set(arr));

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
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("noticeTitle", title);
    fd.append("noticeDescription", descriptionVal);
    fd.append("noticeStartDate", startDateVal);
    fd.append("noticeEndDate", endDateVal);
    const audienceIds = Array.from(audienceSet).join(",");
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

              <div className="btn-group d-flex flex-wrap gap-2">
                {[
                  { id: 3, role: "DOCTOR" },
                  { id: 4, role: "HEADNURSE" },
                  { id: 5, role: "PHARMACIST" },
                  { id: 6, role: "ACCOUNTANT" },
                  { id: 7, role: "HR" },
                  { id: 8, role: "LABORATORIST" },
                  { id: 9, role: "INSURANCE" },
                  { id: 10, role: "RECEPTIONIST" },
                ].map(({ id, role }) => (
                  <React.Fragment key={id}>
                    <input
                      type="checkbox"
                      className="btn-check"
                      id={`role-${id}`}
                      autoComplete="off"
                      disabled={isSubmitting}
                      checked={audienceSet.has(String(id))}
                      onChange={() => {
                        const s = new Set(audienceSet);
                        if (s.has(String(id))) s.delete(String(id));
                        else s.add(String(id));
                        setAudienceSet(s);
                      }}
                    />
                    <label
                      className="btn btn-outline-info"
                      htmlFor={`role-${id}`}
                    >
                      {role}
                    </label>
                  </React.Fragment>
                ))}
              </div>
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
