import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAssets, deleteAsset } from "../../../features/assetsSlice";
import Swal from "sweetalert2";
import { NavLink } from "react-router-dom";

const AssetList = () => {
  const dispatch = useDispatch();

  // Get assets from Redux store
  const {
    allAssets: assets,
    allAssetsStatus: status,
    allAssetsError: error,
  } = useSelector((state) => state.assets);

  // Fetch assets on component mount
  useEffect(() => {
    dispatch(fetchAllAssets());
  }, [dispatch]);

  // Delete handler
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteAsset(id)).then((response) => {
          if (response.type === "assets/deleteAsset/fulfilled") {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Asset has been deleted successfully.",
              confirmButtonColor: "#01C0C8",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: response.payload || "Failed to delete asset",
              confirmButtonColor: "#d33",
            });
          }
        });
      }
    });
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="container my-4">
        <div className="card-border">
          <div className="card-header d-flex justify-content-center align-items-center text-center bg-primary">
            <i
              className="fa-solid fa-toolbox me-2"
              style={{ color: "#ffffff" }}
            ></i>
            <span className="text" style={{ color: "#ffffff" }}>
              Assets in Hospital
            </span>
          </div>
        </div>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading assets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <div className="container my-4">
        <div className="card-border">
          <div className="card-header d-flex justify-content-center align-items-center text-center bg-primary">
            <i
              className="fa-solid fa-toolbox me-2"
              style={{ color: "#ffffff" }}
            ></i>
            <span className="text" style={{ color: "#ffffff" }}>
              Assets in Hospital
            </span>
          </div>
        </div>
        <div className="alert alert-danger mt-3" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Error loading assets: {error || "Something went wrong"}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => dispatch(fetchAllAssets())}
        >
          <i className="fas fa-redo me-1"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container p-0 m-0">
      {/* Header */}
      <div className="card-border">
        <div className="card-header d-flex justify-content-center align-items-center text-center bg-primary">
          <i
            className="fa-solid fa-toolbox me-2"
            style={{ color: "#ffffff" }}
          ></i>
          <span className="text" style={{ color: "#ffffff" }}>
            Assets in Hospital
          </span>
        </div>
      </div>

      <div className="container">
        {/* Back Button */}
        <div className="text-end mb-3">
          <NavLink
            to="/dashboard/add-asset"
            className="btn  text-dark bg-secondary"
          >
            ← Back to Form
          </NavLink>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-secondary">
              <tr>
                <th>Sr No</th>
                <th>Asset ID</th>
                <th>Serial Number</th>
                <th>Model</th>
                <th>Vendor</th>
                <th>Purchase Date</th>
                <th>Warranty Date</th>
                <th>Department/Branch</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {assets && assets.length > 0 ? (
                assets.map((asset, index) => (
                  <tr key={asset.id}>
                    <td>{index + 1}</td>
                    <td>{asset.assetId}</td>
                    <td>{asset.serialNumber}</td>
                    <td>{asset.model}</td>
                    <td>{asset.vendor}</td>
                    <td>{asset.purchaseDate}</td>
                    <td>{asset.warrantyDate}</td>
                    <td>{asset.departmentBranch}</td>
                    <td>
                      <span
                        className={`badge ${
                          asset.status === "ACTIVE"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td>{asset.remarksNotes || "-"}</td>
                    <td className="text-center">
                      <NavLink
                        to={`/dashboard/update-asset/${asset.id}`}
                        className="btn btn-sm btn-primary text-white text-decoration-none me-2"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </NavLink>

                      <button
                        className="btn btn-sm btn-danger"
                        title="Delete"
                        onClick={() => handleDelete(asset.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center text-muted">
                    No assets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline style adjustments for mobile */}
      <style>{`
        @media (max-width: 576px) {
          .card-header .text {
            font-size: 1rem;
          }
          .btn-outline-secondary {
            font-size: 0.8rem;
            padding: 4px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AssetList;
