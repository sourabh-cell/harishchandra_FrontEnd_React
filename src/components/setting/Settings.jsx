import React, { useState } from "react";

export default function Settings() {
  const [formData, setFormData] = useState({
    applicationTitle: "",
    faviconFile: null,
    logoFile: null,
  });

  const [faviconPreview, setFaviconPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });

      const reader = new FileReader();
      reader.onload = () => {
        if (name === "faviconFile") setFaviconPreview(reader.result);
        if (name === "logoFile") setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Settings saved successfully (demo)");
    console.log("Form Data:", formData);
  };

  return (
    <div
      className="full-width-card card shadow-lg border-0 mx-auto"
      style={{ maxWidth: "900px", borderRadius: "12px" }}
    >
      {/* Header */}
      <div className="card-header bg-info text-white text-center py-3 rounded-top">
        <h4 className="mb-0">
          <i className="fa-solid fa-gears me-2"></i>Settings
        </h4>
      </div>

      {/* Form */}
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {/* Application Title */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Application Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="applicationTitle"
              className="form-control"
              placeholder="Demo Hospital Limited"
              value={formData.applicationTitle}
              onChange={handleChange}
              required
            />
          </div>

          {/* Favicon */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Favicon</label>
            <div className="d-flex align-items-center gap-3">
              <input
                type="file"
                name="faviconFile"
                className="form-control"
                onChange={handleChange}
              />
              <img
                src={faviconPreview || "https://via.placeholder.com/35"}
                alt="Favicon"
                className="border rounded bg-light"
                style={{
                  width: "35px",
                  height: "35px",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          {/* Logo */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Logo</label>
            <div className="d-flex align-items-center gap-3">
              <input
                type="file"
                name="logoFile"
                className="form-control"
                onChange={handleChange}
              />
              <img
                src={logoPreview || "https://via.placeholder.com/140x50"}
                alt="Logo"
                className="border rounded bg-light"
                style={{
                  width: "140px",
                  height: "50px",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center mt-4">
            <button
              type="submit"
              className="btn text-white px-4"
              style={{ backgroundColor: "#0dcaf0" }} // same color as bg-info
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
