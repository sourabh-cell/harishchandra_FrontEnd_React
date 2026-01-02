import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchDepartmentById,
  updateDepartment,
  resetUpdateDepartment,
  resetCurrentDepartment,
} from "../../features/departmentSlice";

const UpdateDepartment = () => {
  const { id } = useParams(); // Get department ID from URL
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const {
    currentDepartment,
    currentDepartmentStatus,
    currentDepartmentError,
    updateDepartmentStatus,
    updateDepartmentError,
  } = useSelector((state) => state.departments);

  // Local state for form
  const [department, setDepartment] = useState({
    id: "",
    department_name: "",
    department_head: "",
    description: "",
  });

  // Fetch department data on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchDepartmentById(id));
    }

    // Cleanup on unmount
    return () => {
      dispatch(resetCurrentDepartment());
      dispatch(resetUpdateDepartment());
    };
  }, [id, dispatch]);

  // Populate form when department data is fetched
  useEffect(() => {
    if (currentDepartment) {
      setDepartment({
        id: currentDepartment.id || "",
        department_name: currentDepartment.department_name || "",
        department_head: currentDepartment.department_head || "",
        description: currentDepartment.description || "",
      });
    }
  }, [currentDepartment]);

  // Handle update success
  useEffect(() => {
    if (updateDepartmentStatus === "succeeded") {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Department updated successfully!",
        confirmButtonColor: "#01C0C8",
      }).then(() => {
        dispatch(resetUpdateDepartment());
        navigate("/dashboard/manage-department"); // Navigate back to manage page
      });
    }
  }, [updateDepartmentStatus, dispatch, navigate]);

  // Handle update error
  useEffect(() => {
    if (updateDepartmentStatus === "failed" && updateDepartmentError) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: updateDepartmentError,
        confirmButtonColor: "#d33",
      });
      dispatch(resetUpdateDepartment());
    }
  }, [updateDepartmentStatus, updateDepartmentError, dispatch]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment({ ...department, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (
      !department.department_name.trim() ||
      !department.department_head.trim()
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
    const departmentData = {
      department_name: department.department_name.trim(),
      department_head: department.department_head.trim(),
      description: department.description.trim() || "",
    };

    // console.log("Updating department with ID:", id, "Data:", departmentData);
    dispatch(updateDepartment({ id, departmentData }));
  };

  // Show loading state while fetching department data
  if (currentDepartmentStatus === "loading") {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading department data...</p>
      </div>
    );
  }

  // Show error if failed to fetch department
  if (currentDepartmentStatus === "failed" && currentDepartmentError) {
    return (
      <div className="alert alert-danger mx-auto" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {currentDepartmentError}
      </div>
    );
  }

  return (
    <div
      className="card mx-auto shadow-lg"
      style={{
        borderTopLeftRadius: "7px",
        borderTopRightRadius: "7px",
        borderBottomLeftRadius: "0px",
        borderBottomRightRadius: "0px",
        overflow: "hidden", // Prevents content from leaking outside rounded corners
      }}
    >
      {/* Header */}
      <div
        className="text-white text-center py-3"
        style={{ backgroundColor: "#01C0C8" }}
      >
        <h4 className="mb-0">
          <i className="fas fa-pen-to-square me-2"></i> Update Department
        </h4>
      </div>

      {/* Form Body */}
      <div className="card-body bg-white py-4 px-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Department ID */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Department ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="id"
                value={department.id}
                className="form-control"
                readOnly
                required
              />
            </div>

            {/* Department Name */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Department Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="department_name"
                value={department.department_name}
                onChange={(e) => {
                  const onlyText = e.target.value.replace(/[^A-Za-z ]/g, "");
                  handleChange({
                    target: { name: "department_name", value: onlyText },
                  });
                }}
                className="form-control"
                placeholder="Enter department name"
                required
              />
            </div>

            {/* Department Head */}
            <div className="col-12">
              <label className="form-label fw-semibold">
                Department Head <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="department_head"
                value={department.department_head}
                onChange={(e) => {
                  const filteredValue = e.target.value.replace(
                    /[^A-Za-z ]/g,
                    ""
                  );
                  handleChange({
                    target: {
                      name: "department_head",
                      value: filteredValue,
                    },
                  });
                }}
                className="form-control"
                placeholder="Enter department head"
                required
              />
            </div>

            {/* Description */}
            <div className="col-12">
              <label className="form-label fw-semibold">Description</label>
              <textarea
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
              className="btn text-white px-5"
              style={{ backgroundColor: "#01C0C8" }}
              disabled={updateDepartmentStatus === "loading"}
            >
              {updateDepartmentStatus === "loading" ? (
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
                  <i className="fas fa-save me-1"></i> Update
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary px-4 ms-2"
              onClick={() => navigate("/dashboard/manage-department")}
              disabled={updateDepartmentStatus === "loading"}
            >
              <i className="fas fa-arrow-left me-1"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDepartment;
