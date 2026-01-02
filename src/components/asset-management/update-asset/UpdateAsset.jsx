import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchAssetById,
  updateAsset,
  resetUpdateAsset,
  resetCurrentAsset,
} from "../../../features/assetsSlice";

const UpdateAsset = () => {
  const { id } = useParams(); // Get asset ID from URL
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const {
    currentAsset,
    currentAssetStatus,
    currentAssetError,
    updateAssetStatus,
    updateAssetError,
  } = useSelector((state) => state.assets);

  // Local state for form
  const [formData, setFormData] = useState({
    assetId: "",
    serialNumber: "",
    model: "",
    vendor: "",
    purchaseDate: "",
    warrantyDate: "",
    departmentBranch: "",
    amcCmcDetails: "",
    remarksNotes: "",
    status: "",
  });

  // Fetch asset data on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchAssetById(id));
    }

    // Cleanup on unmount
    return () => {
      dispatch(resetCurrentAsset());
      dispatch(resetUpdateAsset());
    };
  }, [id, dispatch]);

  // Populate form when asset data is fetched
  useEffect(() => {
    console.log("=== UPDATE ASSET: currentAsset changed ===");
    console.log("currentAsset:", currentAsset);
    console.log("currentAssetStatus:", currentAssetStatus);

    if (currentAsset) {
      console.log("Populating form with asset data:", currentAsset);
      setFormData({
        assetId: currentAsset.assetId || "",
        serialNumber: currentAsset.serialNumber || "",
        model: currentAsset.model || "",
        vendor: currentAsset.vendor || "",
        purchaseDate: currentAsset.purchaseDate || "",
        warrantyDate: currentAsset.warrantyDate || "",
        departmentBranch: currentAsset.departmentBranch || "",
        amcCmcDetails: currentAsset.amcCmcDetails || "",
        remarksNotes: currentAsset.remarksNotes || "",
        status: currentAsset.status || "",
      });
      console.log("Form data set successfully");
    }
  }, [currentAsset, currentAssetStatus]);

  // Handle update success
  useEffect(() => {
    if (updateAssetStatus === "succeeded") {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Asset updated successfully!",
        confirmButtonColor: "#01C0C8",
      }).then(() => {
        dispatch(resetUpdateAsset());
        navigate("/dashboard/asset-list"); // Navigate back to list
      });
    }
  }, [updateAssetStatus, dispatch, navigate]);

  // Handle update error
  useEffect(() => {
    if (updateAssetStatus === "failed" && updateAssetError) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: updateAssetError,
        confirmButtonColor: "#d33",
      });
      dispatch(resetUpdateAsset());
    }
  }, [updateAssetStatus, updateAssetError, dispatch]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.assetId.trim() ||
      !formData.serialNumber.trim() ||
      !formData.model.trim() ||
      !formData.vendor.trim() ||
      !formData.purchaseDate ||
      !formData.warrantyDate ||
      !formData.status
    ) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in all required fields.",
        confirmButtonColor: "#ffc107",
      });
      return;
    }

    // Prepare data for update
    const assetData = {
      assetId: formData.assetId.trim(),
      serialNumber: formData.serialNumber.trim(),
      model: formData.model.trim(),
      vendor: formData.vendor.trim(),
      purchaseDate: formData.purchaseDate,
      warrantyDate: formData.warrantyDate,
      departmentBranch: formData.departmentBranch.trim(),
      amcCmcDetails: formData.amcCmcDetails.trim(),
      remarksNotes: formData.remarksNotes.trim(),
      status: formData.status,
    };

    console.log("Updating asset with ID:", id, "Data:", assetData);
    dispatch(updateAsset({ id, assetData }));
  };

  // Show loading state while fetching asset data
  if (currentAssetStatus === "loading") {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading asset data...</p>
      </div>
    );
  }

  // Show error if failed to fetch asset
  if (currentAssetStatus === "failed" && currentAssetError) {
    return (
      <div className="alert alert-danger mx-auto" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {currentAssetError}
      </div>
    );
  }

  return (
    <div className="container p-0 m-0">
      {/* Header */}
      <div className="card-border">
        <div className="card-header d-flex justify-content-center align-items-center bg-primary">
          <div className="text-center d-flex align-items-center">
            <i
              className="fa-solid fa-toolbox me-2"
              style={{ color: "#ffffff" }}
            ></i>
            <span className="text" style={{ color: "#ffffff" }}>
              Update Asset
            </span>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="card shadow-sm p-4 mt-3">
        <h4 className="mb-3">Update Asset Details</h4>

        <form id="assetForm" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="assetId" className="form-label">
                Asset ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="assetId"
                name="assetId"
                value={formData.assetId}
                onChange={handleChange}
                placeholder="e.g., AST-001"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="serialNumber" className="form-label">
                Serial Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="e.g., SN-563920"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="model" className="form-label">
                Model <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., Dell Latitude 5520"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="vendor" className="form-label">
                Vendor <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="vendor"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                placeholder="e.g., Dell Technologies Pvt Ltd"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="purchaseDate" className="form-label">
                Purchase Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="warrantyDate" className="form-label">
                Warranty Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="warrantyDate"
                name="warrantyDate"
                value={formData.warrantyDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="departmentBranch" className="form-label">
                Department/Branch
              </label>
              <input
                type="text"
                className="form-control"
                id="departmentBranch"
                name="departmentBranch"
                value={formData.departmentBranch}
                onChange={handleChange}
                placeholder="e.g., IT Department - Main Building"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="status" className="form-label">
                Status <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Status --</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Under Maintenance</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>

            <div className="col-12 mb-3">
              <label htmlFor="amcCmcDetails" className="form-label">
                AMC/CMC Details
              </label>
              <input
                type="text"
                className="form-control"
                id="amcCmcDetails"
                name="amcCmcDetails"
                value={formData.amcCmcDetails}
                onChange={handleChange}
                placeholder="e.g., AMC valid till 2027 (Includes onsite support)"
              />
            </div>

            <div className="col-12 mb-3">
              <label htmlFor="remarksNotes" className="form-label">
                Remarks/Notes
              </label>
              <textarea
                className="form-control"
                id="remarksNotes"
                name="remarksNotes"
                value={formData.remarksNotes}
                onChange={handleChange}
                rows="3"
                placeholder="Enter any additional notes or remarks"
              ></textarea>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-2 mt-3">
            <button
              type="submit"
              className="btn btn-success"
              style={{ backgroundColor: "#01C0C8", border: "none" }}
              disabled={updateAssetStatus === "loading"}
            >
              {updateAssetStatus === "loading" ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save me-1"></i> Update Asset
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/dashboard/asset-list")}
              disabled={updateAssetStatus === "loading"}
            >
              <i className="fa-solid fa-arrow-left me-1"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAsset;
