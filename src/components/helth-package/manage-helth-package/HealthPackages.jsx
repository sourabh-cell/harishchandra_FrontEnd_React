import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHealthPackages,
  deleteHealthPackage,
} from "../../../features/healthPackageSlice";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./HealthPackages.css";
import { NavLink } from "react-router-dom";

const HealthPackages = () => {
  const dispatch = useDispatch();
  const {
    packages: healthPackages,
    status,
    error,
  } = useSelector((state) => state.healthPackages);

  // Fetch health packages from backend on component mount (with error handling)
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // unwrap to throw if rejected
        await dispatch(fetchHealthPackages()).unwrap();
      } catch (err) {
        // Log error; many browser/runtime errors (extensions) surface as
        // "message port closed" in console — still surface the real error
        console.error("Failed to load health packages:", err);
      }
    };

    if (mounted) load();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  // Debug: log packages and status when loading finishes
  useEffect(() => {
    if (status !== "loading") {
      console.debug("healthPackages state:", { status, error, healthPackages });
    }
  }, [status, error, healthPackages]);

  // Handle delete (uses SweetAlert2 preConfirm to show loader and inline errors)
  const handleDelete = (id, name) => {
    Swal.fire({
      title: "Are you sure?",
      html: `Do you want to delete "<strong>${
        name || id
      }</strong>"? This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      focusCancel: true,
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return dispatch(deleteHealthPackage(id))
          .unwrap()
          .then((res) => res)
          .catch((err) => {
            const message =
              err?.message ||
              err?.error ||
              JSON.stringify(err) ||
              "Failed to delete health package";
            Swal.showValidationMessage(message);
            throw err;
          });
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Health package has been deleted successfully.",
          icon: "success",
        });
      }
    });
  };

  const loading = status === "loading";

  // Ensure healthPackages is always an array
  const packagesList = Array.isArray(healthPackages) ? healthPackages : [];

  return (
    <div className="container-fluid p-0 m-0">
      {/* Header */}
      <div className="card-border w-100">
        <div className="card-header d-flex justify-content-center align-items-center px-0">
          <div className="text-center d-flex align-items-center">
            <i
              className="fa-solid fa-notes-medical me-2"
              style={{ color: "#ffffff" }}
            ></i>
            <span className="text" style={{ color: "#ffffff" }}>
              Health Packages
            </span>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="container-fluid px-0">
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading health packages...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger my-3" role="alert">
            <i className="fa-solid fa-exclamation-triangle me-2"></i>
            Error: {error}
          </div>
        ) : packagesList.length === 0 ? (
          <div className="alert alert-info my-3" role="alert">
            <i className="fa-solid fa-info-circle me-2"></i>
            No health packages available.
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 m-2">
            {packagesList.map((pkg, index) => (
              <div className="col" key={pkg.id}>
                <div className="card  shadow-sm">
                  <div className="card-body">
                    <div className="card-title d-flex justify-content-between align-items-center">
                      <span className="name fw-semibold">{pkg.name}</span>
                      <img
                        className="image"
                        src={pkg.image}
                        alt={pkg.name}
                        style={{ width: "40px", height: "40px" }}
                      />
                    </div>

                    <h6 className="card-subtitle mb-2 text-muted">
                      Code: {pkg.code}
                    </h6>

                    {/* Accordion */}
                    <div className="accordion mb-3" id={`accordion-${index}`}>
                      <div className="accordion-item">
                        <h2
                          className="accordion-header"
                          id={`heading-${index}`}
                        >
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse-${index}`}
                            aria-expanded="false"
                            aria-controls={`collapse-${index}`}
                          >
                            Description
                          </button>
                        </h2>
                        <div
                          id={`collapse-${index}`}
                          className="accordion-collapse collapse"
                          aria-labelledby={`heading-${index}`}
                          data-bs-parent={`#accordion-${index}`}
                        >
                          <div className="accordion-body">
                            {pkg.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="card-text fw-semibold">Price: {pkg.price}</p>
                    <NavLink
                      className="button btn-primary me-2"
                      style={{ textDecoration: "none" }}
                      data-tooltip="Edit"
                      to={`/dashboard/update-health-package/${pkg.id}`}
                    >
                      <i className="fa-solid fa-pen-to-square me-1"></i>Edit
                    </NavLink>
                    <button
                      className="button btn-danger"
                      style={{ backgroundColor: "#db2100" }}
                      onClick={() => handleDelete(pkg.id, pkg.name)}
                    >
                      <i className="fa-solid fa-trash-can"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthPackages;
