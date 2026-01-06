import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addDepartment,
  resetAddDepartment,
} from "../../features/departmentSlice";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const AddDepartment = () => {
  const dispatch = useDispatch(); 

  // Get state from Redux store
  const { addDepartmentStatus: status } = useSelector(
    (state) => state.departments
  );

  // State for form data
  const [department, setDepartment] = useState({
    department_name: "",
    department_head: "",
    description: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment({ ...department, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !department.department_name.trim() ||
      !department.department_head.trim()
    ) {
      await Swal.fire({
        title: "Validation Error!",
        text: "Please fill in all required fields",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    console.log("Department Created:", department);

    // Dispatch the addDepartment thunk
    const resultAction = await dispatch(addDepartment(department));

    if (addDepartment.fulfilled.match(resultAction)) {
      // Success - show success message and reset form
      await Swal.fire({
        title: "Success!",
        text: "Department added successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Reset form
      setDepartment({
        department_name: "",
        department_head: "",
        description: "",
      });
    } else {
      // ✅ Detect duplicate entry error (backend message)
      const errorMessage =
        resultAction.payload?.message || resultAction.payload || "";

      if (
        typeof errorMessage === "string" &&
        errorMessage.toLowerCase().includes("duplicate")
      ) {
        await Swal.fire({
          title: "Duplicate Entry!",
          text: "This department already exists. Please enter a unique name.",
          icon: "warning",
          confirmButtonText: "OK",
        });
      } else {
        await Swal.fire({
          title: "Error!",
          text: errorMessage || "Failed to add department",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  // Reset add department state on component mount
  useEffect(() => {
    return () => {
      dispatch(resetAddDepartment());
    };
  }, [dispatch]);

  return (
    <div
      className="card full-width-card mx-auto shadow"
      style={{
        // subtle rounding only on the top edges
        borderTopLeftRadius: "0.5rem",
        borderTopRightRadius: "0.5rem",
        borderBottomLeftRadius: "0",
        borderBottomRightRadius: "0",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="text-white text-center py-3"
        style={{
          backgroundColor: "#01C0C8",
          borderTopLeftRadius: "0.5rem",
          borderTopRightRadius: "0.5rem",
        }}
      >
        <h4 className="mb-0">
          <i className="fas fa-building me-2"></i> Add Department
        </h4>
      </div>

      {/* Body */}
      <div className="card-body bg-white">
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Department Name */}
            <div className="col-md-6">
              <label
                htmlFor="department_name"
                className="form-label fw-semibold"
              >
                Department Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="department_name"
                name="department_name"
                value={department.department_name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter department name"
                onKeyDown={(e) => {
                  if (/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                required
              />
            </div>

            {/* Department Head */}
            <div className="col-md-6">
              <label
                htmlFor="department_head"
                className="form-label fw-semibold"
              >
                Department Head <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="department_head"
                name="department_head"
                value={department.department_head}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter department head"
                onKeyDown={(e) => {
                  if (/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                required
              />
            </div>

            {/* Description */}
            <div className="col-12">
              <label htmlFor="description" className="form-label fw-semibold">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={department.description}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Enter description"
              ></textarea>
            </div>
          </div>

          {/* Buttons */}
          <div className="text-center mt-4">
            <button
              type="submit"
              className="button text-white px-3"
              style={{ backgroundColor: "#01C0C8" }}
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-1"></i> Save Department
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
