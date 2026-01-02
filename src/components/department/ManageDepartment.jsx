// Updated ManageDepartment.jsx with Search Bar + Pagination
// (Full working component)

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteDepartment,
  fetchAllDepartments,
} from "../../features/departmentSlice";
import { NavLink } from "react-router-dom";
import {
  selectAuthRoles,
  selectAuthPermissions,
} from "../../features/authSlice";
import Swal from "sweetalert2";

const ManageDepartment = () => {
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const authRoles = useSelector(selectAuthRoles) || [];
  const userPerms = useSelector(selectAuthPermissions) || [];

  const {
    allDepartments: departments,
    allDepartmentsStatus: status,
    allDepartmentsError: error,
  } = useSelector((state) => state.departments);

  const normalizedRoles = authRoles
    .map((r) => String(r || "").toUpperCase())
    .map((r) => r.replace(/^ROLE_/, ""))
    .map((r) => r.replace(/[^A-Z0-9]/g, ""));

  const hasRole = (allowedRoles) => {
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true;
    const allowed = allowedRoles
      .map((r) => String(r || "").toUpperCase())
      .map((r) => r.replace(/^ROLE_/, ""))
      .map((r) => r.replace(/[^A-Z0-9]/g, ""));
    return allowed.some((r) => normalizedRoles.includes(r));
  };

  const hasPermission = (requiredPerms) => {
    if (!Array.isArray(requiredPerms) || requiredPerms.length === 0)
      return true;
    return requiredPerms.some((p) => userPerms.includes(p));
  };

  useEffect(() => {
    dispatch(fetchAllDepartments());
  }, [dispatch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This department will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteDepartment(id))
          .unwrap()
          .then(() => {
            Swal.fire("Deleted!", "Department has been deleted.", "success");
          })
          .catch((error) => {
            Swal.fire("Error!", error, "error");
          });
      }
    });
  };

  const filteredData = departments.filter((dept) => {
    const s = search.toLowerCase();
    return (
      dept.department_name?.toLowerCase().includes(s) ||
      dept.department_head?.toLowerCase().includes(s) ||
      dept.description?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <div className="card full-width-card shadow">
      <div
        className="card-header text-white text-center"
        style={{ backgroundColor: "#01C0C8" }}
      >
        <h4 className="mb-0">
          <i className="fas fa-building me-2"></i> Department List
        </h4>
      </div>

      <div className="card-body">
        {/* Search Bar */}
        <div className="mb-4" style={{ width: "40%" }}>
          <label className="fw-bold">Search</label>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search ID, name, head..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Head</th>
                <th>Description</th>
                {(hasPermission(["DEPARTMENT_DELETE"]) ||
                  hasRole(["SUPER_ADMIN", "ADMIN"])) && (
                  <th className="text-center">Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.id}</td>
                  <td>{dept.department_name}</td>
                  <td>{dept.department_head}</td>
                  <td>{dept.description}</td>

                  {(hasPermission(["DEPARTMENT_UPDATE"]) ||
                    hasRole(["SUPER_ADMIN", "ADMIN"])) && (
                    <td className="text-center">
                      <NavLink
                        to={`/dashboard/update-department/${dept.id}`}
                        className="btn1 bg-primary btn-sm text-white"
                        data-tooltip="Edit"
                      >
                        <i className="fas fa-pencil"></i>
                      </NavLink>

                      <button
                        className="btn1 btn-sm bg-danger ms-2"
                        onClick={() => handleDelete(dept.id)}
                        data-tooltip="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <nav>
          <ul className="pagination justify-content-end my-2">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ManageDepartment;
