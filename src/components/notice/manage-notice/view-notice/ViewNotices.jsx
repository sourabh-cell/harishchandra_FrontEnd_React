import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotices,
  deleteNotice,
  selectNotices,
  selectNoticesFetchStatus,
  selectNoticesFetchError,
} from "../../../../features/noticeSlice";
import Swal from "sweetalert2";
import { NavLink } from "react-router-dom";
import axios from "axios";

const ViewNotices = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const dispatch = useDispatch();
  const notices = useSelector(selectNotices);
  const fetchStatus = useSelector(selectNoticesFetchStatus);
  const fetchError = useSelector(selectNoticesFetchError);
  const [viewModal, setViewModal] = useState(false);
  const [viewAttachment, setViewAttachment] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    if (fetchStatus === "idle") dispatch(fetchNotices());
  }, [dispatch, fetchStatus]);

  const handleDelete = (id) => {
    if (!id) return;
    Swal.fire({
      title: "Delete notice?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      dispatch(deleteNotice(id))
        .unwrap()
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Deleted",
            timer: 1200,
            showConfirmButton: false,
          });
          // refresh list to ensure consistency
          dispatch(fetchNotices());
        })
        .catch((err) => {
          console.error("Delete failed:", err);
          Swal.fire({
            icon: "error",
            title: "Delete failed",
            text: err?.message || "Could not delete notice",
          });
        });
    });
  };

  const handleViewAttachment = async (attachmentUrl, noticeId) => {
    // open modal immediately even if attachmentUrl is missing; effect will
    // decide how to fetch: data URI, absolute URL, or download by notice id
    setFilePreviewUrl(null);
    setDownloadUrl(null);
    setViewAttachment({ att: attachmentUrl, id: noticeId });
    setViewModal(true);
  };

  // When modal opens with a selected attachment, load the file (supports data: URIs,
  // absolute URLs and relative paths which we prefix with API_BASE_URL).
  useEffect(() => {
    let cancelled = false;
    let createdObjectUrl = null;

    const loadFile = async () => {
      if (!viewModal || !viewAttachment) return;
      setLoadingFile(true);
      setFilePreviewUrl(null);
      try {
        const { att, id } = viewAttachment || {};

        if (att && /^data:/i.test(att)) {
          // data URI: fetch it via fetch() and convert to blob
          const res = await fetch(att);
          const blob = await res.blob();
          createdObjectUrl = window.URL.createObjectURL(blob);
          if (!cancelled) {
            setFilePreviewUrl(createdObjectUrl);
            setDownloadUrl(createdObjectUrl);
          }
        } else if (att) {
          // Att is provided and not a data URI: use absolute URL or download endpoint with att
          const url = /^https?:\/\//i.test(att)
            ? att
            : `${API_BASE_URL}/attachment/download/${att}`;
          const response = await axios.get(url, { responseType: "blob" });
          createdObjectUrl = window.URL.createObjectURL(response.data);
          if (!cancelled) {
            setFilePreviewUrl(createdObjectUrl);
            setDownloadUrl(url);
          }
        } else if (id) {
          // No attachment path provided, but we have a notice id - call download by id
          const url = `${API_BASE_URL}/attachment/download/${id}`;
          const response = await axios.get(url, { responseType: "blob" });
          createdObjectUrl = window.URL.createObjectURL(response.data);
          if (!cancelled) {
            setFilePreviewUrl(createdObjectUrl);
            setDownloadUrl(url);
          }
        } else {
          // nothing to load
          if (!cancelled) {
            Swal.fire({
              icon: "info",
              title: "No attachment",
              text: "No attachment is available for this notice.",
            });
            setViewModal(false);
          }
        }
      } catch (error) {
        console.error("Error fetching file:", error);
        if (!cancelled) {
          Swal.fire({
            icon: "error",
            title: "Failed to fetch file",
            text: error?.message || "Error loading attachment",
          });
          setViewModal(false);
        }
      } finally {
        if (!cancelled) setLoadingFile(false);
      }
    };

    loadFile();

    return () => {
      cancelled = true;
      if (createdObjectUrl) {
        try {
          window.URL.revokeObjectURL(createdObjectUrl);
        } catch {
          // ignore
        }
      }
    };
  }, [viewModal, viewAttachment]);

  // cleanup any created preview URL when filePreviewUrl changes/unmounts
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        try {
          window.URL.revokeObjectURL(filePreviewUrl);
        } catch {
          // ignore
        }
      }
    };
  }, [filePreviewUrl]);

  return (
    <div className="full-width-card card shadow-sm border-0">
      {/* Header */}
      <div
        className=" text-white text-center py-3"
        style={{
          backgroundColor: "#01C0C8",
          borderTopLeftRadius: "0.50rem",
          borderTopRightRadius: "0.50rem",
        }}
      >
        <h4 className="mb-0">
          <i className="bi bi-megaphone-fill me-2"></i>Notice List
        </h4>
      </div>

      <div className="card-body">
        {/* Alert Messages */}
        <div
          className="alert alert-success text-center"
          role="alert"
          style={{ display: "none" }}
        >
          Success message here.
        </div>
        <div
          className="alert alert-danger text-center"
          role="alert"
          style={{ display: "none" }}
        >
          Error message here.
        </div>

        {/* Table */}
        {fetchStatus === "loading" && (
          <div className="text-center small text-muted mb-2">
            Loading notices...
          </div>
        )}
        {fetchStatus === "failed" && (
          <div className="text-center small text-danger mb-2">
            {fetchError || "Failed to load notices"}
          </div>
        )}
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle text-center mb-0">
            <thead style={{ backgroundColor: "#E0F7FA" }}>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Description</th>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Attachment</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(notices) && notices.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted small">
                    No notices found
                  </td>
                </tr>
              )}

              {Array.isArray(notices) &&
                notices.map((n) => {
                  const title = n.noticeTitle || n.title || "-";
                  const desc = n.noticeDescription || n.description || "";
                  const start =
                    n.noticeStartDate || n.startDate || n.start || "";
                  const end = n.noticeEndDate || n.endDate || n.end || "";
                  // try several attachment fields
                  const attachmentUrl =
                    n.attachmentUrl ||
                    n.fileUrl ||
                    n.attachment ||
                    n.attachment_path ||
                    null;

                  // format for datetime-local input if possible
                  const toInputValue = (s) => {
                    if (!s) return "";
                    const d = new Date(s);
                    if (isNaN(d)) return String(s);
                    const iso = d.toISOString();
                    return iso.slice(0, 16);
                  };

                  return (
                    <tr key={n.id || n.noticeId || Math.random()}>
                      <td className="fw-semibold">{title}</td>
                      <td>
                        <div
                          className="small text-muted"
                          dangerouslySetInnerHTML={{ __html: desc }}
                        />
                      </td>
                      <td>
                        <input
                          type="datetime-local"
                          className="form-control form-control-sm text-center"
                          value={toInputValue(start)}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="datetime-local"
                          className="form-control form-control-sm text-center"
                          value={toInputValue(end)}
                          readOnly
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: "#01C0C8" }}
                          onClick={() =>
                            handleViewAttachment(
                              attachmentUrl,
                              n.id || n.noticeId || n.notice_id
                            )
                          }
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm text-white px-3"
                            style={{ backgroundColor: "#6f42c1" }}
                            onClick={() => {
                              // View notice details in modal
                              const audienceIds = n.targetAudienceIds || n.audience || n.targetAudience || "";
                              const audienceArr = Array.isArray(audienceIds) 
                                ? audienceIds 
                                : String(audienceIds).split(",").map(s => s.trim()).filter(Boolean);
                              
                              const audienceLabels = audienceArr.map(id => {
                                const numId = Number(id);
                                const roles = { 3: "DOCTOR", 4: "HEADNURSE", 5: "PHARMACIST", 6: "ACCOUNTANT", 7: "HR", 8: "LABORATORIST", 9: "INSURANCE", 10: "RECEPTIONIST" };
                                return roles[numId] || id;
                              }).join(", ");

                              Swal.fire({
                                title: `<div style="color: #01C0C8;"><i class='bi bi-megaphone-fill me-2'></i>${title}</div>`,
                                html: `
                                  <div style="text-align: left; background: linear-gradient(135deg, #e3f7f8 0%, #f8f9fa 100%); padding: 20px; border-radius: 12px; border: 1px solid #01C0C8;">
                                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                      <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-calendar-check me-2'></i>Start Date</p>
                                      <p style="margin-left: 24px; margin-bottom: 12px;">${start ? new Date(start).toLocaleString() : 'N/A'}</p>
                                      <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-calendar-x me-2'></i>End Date</p>
                                      <p style="margin-left: 24px; margin-bottom: 12px;">${end ? new Date(end).toLocaleString() : 'N/A'}</p>
                                      <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-people me-2'></i>Target Audience</p>
                                      <p style="margin-left: 24px;">${audienceLabels || 'None'}</p>
                                    </div>
                                    <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                      <p style="margin-bottom: 8px; color: #01C0C8; font-weight: 600;"><i class='bi bi-file-text me-2'></i>Description</p>
                                      <div style="margin-left: 24px; max-height: 150px; overflow-y: auto;">${desc || 'N/A'}</div>
                                    </div>
                                  </div>
                                `,
                                width: '550px',
                                confirmButtonText: 'Close',
                                confirmButtonColor: '#01C0C8'
                              });
                            }}
                          >
                            <i className="bi bi-eye"></i> View
                          </button>
                          <NavLink
                            to={`/dashboard/edit-notice/${n.id || n.noticeId}`}
                            className="btn btn-sm text-white px-3"
                            style={{ backgroundColor: "#01C0C8" }}
                          >
                            Edit
                          </NavLink>
                          <button
                            className="btn btn-danger btn-sm px-3"
                            onClick={() => handleDelete(n.id || n.noticeId)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal for download confirmation */}
      {viewModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block", zIndex: 2000 }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">View Attachment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setViewModal(false);
                      setFilePreviewUrl(null);
                      setDownloadUrl(null);
                    }}
                  ></button>
                </div>

                <div className="modal-body text-center">
                  {loadingFile ? (
                    <div className="text-muted small">Loading file...</div>
                  ) : filePreviewUrl ? (
                    <>
                      {/* Auto preview PDF / image */}
                      <iframe
                        src={filePreviewUrl}
                        title="preview"
                        width="100%"
                        height="400px"
                      ></iframe>

                      {/* Download button */}
                      <a
                        href={downloadUrl || filePreviewUrl}
                        download
                        className="btn btn-success mt-3"
                      >
                        Download File
                      </a>
                    </>
                  ) : (
                    <p>No preview available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* backdrop so modal shows above other elements */}
          <div className="modal-backdrop fade show" style={{ zIndex: 1995 }} />
        </>
      )}
    </div>
  );
};

export default ViewNotices;
