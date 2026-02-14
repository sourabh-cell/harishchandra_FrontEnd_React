import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import tinymce from "tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/plugins/advlist";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/code";
import "tinymce/plugins/table";
import "tinymce/plugins/wordcount";

function CreateNotice() {

  useEffect(() => {
    tinymce.init({
      selector: "#description",
      height: 300,
      menubar: false,
      plugins: [
        "advlist", 
        "lists", 
        "link", 
        "image", 
        "code", 
        "table", 
        "wordcount"
      ],
      toolbar:
        "undo redo | bold italic forecolor backcolor | alignleft aligncenter alignright | bullist numlist | removeformat | code",
      content_style:
        "body { font-family:Poppins,sans-serif; font-size:14px }",
      branding: false,
      promotion: false,
    });

    return () => {
      tinymce.remove("#description");
    };
  }, []);

  const previewNewFile = () => {
    const fileInput = document.getElementById("attachment");
    const previewContainer = document.getElementById("newFilePreview");
    const img = document.getElementById("newImagePreview");
    const info = document.getElementById("newFileInfo");
    const fileName = document.getElementById("newFileName");

    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      previewContainer.classList.remove("d-none");

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
          img.classList.remove("d-none");
          info.classList.add("d-none");
        };
        reader.readAsDataURL(file);
      } else {
        img.classList.add("d-none");
        info.classList.remove("d-none");
        fileName.textContent = file.name;
      }
    }
  };

  return (
    <div className="bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow border-0">

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
                <form method="post" encType="multipart/form-data">

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
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="target" className="form-label fw-semibold">
                        Target Audience <span className="text-danger">*</span>
                      </label>
                      <select id="target" className="form-select" required>
                        <option value="">Select Audience</option>
                        <option>All Staff</option>
                        <option>Teachers</option>
                        <option>Students</option>
                      </select>
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
                      onChange={previewNewFile}
                    />

                    {/* Preview Section */}
                    <div id="newFilePreview" className="mt-3 d-none">
                      <p className="text-muted mb-2">
                        <strong>File Preview:</strong>
                      </p>
                      <img
                        id="newImagePreview"
                        src="#"
                        alt="Preview"
                        className="img-thumbnail d-none"
                        style={{ maxWidth: "300px", maxHeight: "200px" }}
                      />
                      <div
                        id="newFileInfo"
                        className="d-none p-2 bg-light rounded"
                      >
                        <i className="bi bi-file-earmark-text"></i>{" "}
                        <span id="newFileName"></span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn text-white px-4"
                      style={{ backgroundColor: "#01C0C8" }}
                    >
                      <i className="bi bi-save me-2"></i>
                      Save Notice
                    </button>

                    <a
                      href="notice-list.html"
                      className="btn btn-secondary px-4"
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Cancel
                    </a>
                  </div>

                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateNotice;
