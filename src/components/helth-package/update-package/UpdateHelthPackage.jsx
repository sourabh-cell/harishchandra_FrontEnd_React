import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchHealthPackages,
  updateHealthPackage,
} from "../../../features/healthPackageSlice";

const UpdateHelthPackage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { packages: healthPackages, status } = useSelector(
    (state) => state.healthPackages
  );

  const [fileName, setFileName] = useState("No image chosen");
  const [file, setFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    price: "",
  });

  // Load package data into form
  useEffect(() => {
    const load = async () => {
      // If packages not present, fetch them
      if (!Array.isArray(healthPackages) || healthPackages.length === 0) {
        try {
          await dispatch(fetchHealthPackages()).unwrap();
        } catch (err) {
          console.error("Failed to fetch packages for update:", err);
        }
      }

      const pkg = (healthPackages || []).find(
        (p) => String(p.id) === String(id)
      );
      if (pkg) {
        setForm({
          code: pkg.code || "",
          name: pkg.name || "",
          description: pkg.description || "",
          price: pkg.price ?? "",
        });

        // Set existing image if available
        if (pkg.image || pkg.imageUrl || pkg.icon || pkg.iconUrl) {
          const imageUrl = pkg.image || pkg.imageUrl || pkg.icon || pkg.iconUrl;
          setExistingImageUrl(imageUrl);
          setFileName(imageUrl.split("/").pop() || "Existing icon");
        }
      }
    };

    if (id) load();
  }, [id, healthPackages, dispatch]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f || null);
    setFileName(f ? f.name : "No icon chosen");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.code.trim() || !form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Code and Name are required",
        confirmButtonColor: "#ffc107",
      });
      return;
    }

    try {
      // Always use FormData for consistency with backend
      const fd = new FormData();
      fd.append("code", form.code.trim());
      fd.append("name", form.name.trim());
      fd.append("description", form.description?.trim() || "");
      fd.append("price", form.price === "" ? "" : String(form.price));

      // Only append image if a new file is selected
      if (file) {
        fd.append("image", file);
      }

      await dispatch(updateHealthPackage({ id, packageData: fd })).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Health package updated successfully",
        confirmButtonColor: "#01C0C8",
      });

      navigate("/dashboard/manage-health-packages");
    } catch (err) {
      console.error("Update failed:", err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err || "Failed to update health package",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="container my-4 p-0 m-0">
      {/* Header */}
      <div className="card-border">
        <div className="card-header d-flex justify-content-center align-items-center">
          <div className="text-center d-flex align-items-center">
            <i
              className="fa-solid fa-notes-medical me-2"
              style={{ color: "#ffffff" }}
            ></i>
            <span className="text" style={{ color: "#ffffff" }}>
              Update Health Package
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form className="mx-4 my-4" onSubmit={handleSubmit}>
        <div className="row mb-4">
          <div className="form-group col-md-6">
            <label htmlFor="packageCode">Health Package Code</label>
            <input
              type="text"
              className="form-control"
              id="packageCode"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Enter code"
              required
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="packageName">Health Package Name</label>
            <input
              type="text"
              className="form-control"
              id="packageName"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter name"
              required
            />
          </div>
        </div>

        <div className="row mb-4">
          <div className="form-group col-md-12">
            <label htmlFor="packageDescription">
              Health Package Description
            </label>
            <input
              type="text"
              className="form-control"
              id="packageDescription"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter description"
              required
            />
          </div>
        </div>

        <div className="row mb-4">
          <div className="form-group col-md-6">
            <label htmlFor="packagePrice">Health Package Price</label>
            <input
              type="number"
              className="form-control"
              id="packagePrice"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Enter price"
              required
            />
          </div>

          <div className="form-group col-md-6 mt-2">
            <div className="file-upload-wrapper d-flex flex-column">
              <label className="mb-1">Choose Icon</label>
              <input
                type="file"
                className="form-control"
                id="iconInput"
                onChange={handleFileChange}
                accept="image/*"
              />
              <div className="mt-2">
                {file ? (
                  <span className="text-muted">{fileName}</span>
                ) : existingImageUrl ? (
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={existingImageUrl}
                      alt="Package icon"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid #dee2e6",
                      }}
                    />
                  </div>
                ) : (
                  <span className="text-muted">{fileName}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center">
          <button
            type="submit"
            className="btn btn-primary px-4"
            style={{ backgroundColor: "#01c0c8", border: "none" }}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                {/* <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span> */}
                Updating...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateHelthPackage;
