// import React, { useState,useState } from "react";
// import "./ManageEmployee.css";

// const ManageEmployee = () => {
//   const [activeTab, setActiveTab] = useState("doctors");

//   // Handle tab change
//   const handleTabChange = (tabName) => {
//     setActiveTab(tabName);
//     // You can add API calls here when needed
//     console.log(`Switched to ${tabName} tab`);
//   };

//   return (
//     <div className="container my-4 p-0">
//       {/* Header */}
//       <div className="card-border">
//         <div className="card-header d-flex justify-content-center align-items-center bg-primary">
//           <div className="text-center d-flex align-items-center">
//             <i className="fa-solid fa-users-rays me-2 text-white"></i>
//             <span className="text-white fs-5 fw-semibold">
//               Manage Employees
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Tabs Section */}
//       <div className="container-fluid">
//         <ul
//           className="nav nav-tabs nav-fill w-100"
//           id="employeeTabs"
//           role="tablist"
//         >
//           {[
//             "Doctors",
//             "Nurses",
//             "Receptionists",
//             "Accountants",
//             "Pharmacist",
//             "Laboratorist",
//             "Insurance",
//             "HR",
//           ].map((tab, index) => (
//             <li className="nav-item" key={index}>
//               <button
//                 className={`nav-link ${
//                   activeTab === tab.toLowerCase() ? "active" : ""
//                 }`}
//                 data-bs-toggle="tab"
//                 data-bs-target={`#${tab.toLowerCase()}`}
//                 type="button"
//                 onClick={() => handleTabChange(tab.toLowerCase())}
//               >
//                 {tab}
//               </button>
//             </li>
//           ))}
//         </ul>

//         <div className="tab-content mt-3">
//           {/* TAB 1: Doctors */}
//           <div
//             className="tab-pane fade show active"
//             id="doctors"
//             role="tabpanel"
//           >
//             <table className="table table-bordered table-striped align-middle">
//               <thead className="table-dark">
//                 <tr>
//                   <th>#</th>
//                   <th>Photo</th>
//                   <th>Name</th>
//                   <th>Specialization</th>
//                   <th>Qualification</th>
//                   <th>Status</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {/* Doctor 1 */}
//                 <tr>
//                   <td>1</td>
//                   <td>
//                     <img
//                       src="./image/doctor1.jpg"
//                       className="image"
//                       alt="Doctor"
//                     />
//                   </td>
//                   <td>Dr. Rajendra Prasad</td>
//                   <td>Cardiology</td>
//                   <td>MBBS, MD</td>
//                   <td>Active</td>
//                   <td>
//                     <button
//                       className="btn btn-info btn-sm me-1"
//                       data-bs-toggle="modal"
//                       data-bs-target="#doctor1Modal"
//                     >
//                       <i className="fa fa-eye"></i> View
//                     </button>
//                     <button className="btn btn-warning btn-sm me-1">
//                       <i className="fa fa-pen me-1"></i> Update
//                     </button>
//                     <button className="btn btn-secondary btn-sm">
//                       <i className="fa fa-id-card me-1"></i> ID Proof
//                     </button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>

//             {/* Doctor 1 Modal */}
//             <div className="modal fade" id="doctor1Modal" tabIndex="-1">
//               <div className="modal-dialog modal-lg">
//                 <div className="modal-content">
//                   <div className="modal-header bg-primary text-white">
//                     <h5 className="modal-title">Doctor Details</h5>
//                     <button
//                       type="button"
//                       className="btn-close btn-close-white"
//                       data-bs-dismiss="modal"
//                     ></button>
//                   </div>
//                   <div className="modal-body">
//                     <div className="row">
//                       <div className="col-md-6">
//                         <img
//                           className="set-image"
//                           src="./image/doctor1.jpg"
//                           alt="Doctor Photo"
//                         />
//                       </div>
//                       <div className="col-md-6">
//                         <h5>Dr. Rajendra Prasad</h5>
//                         <p>
//                           <strong>Specialization:</strong> Cardiology
//                         </p>
//                         <p>
//                           <strong>Qualification:</strong> MBBS, MD
//                         </p>
//                         <p>
//                           <strong>Experience:</strong> 12 Years
//                         </p>
//                         <p>
//                           <strong>License Number:</strong> KIPL4786
//                         </p>
//                         <p>
//                           <strong>Blood Group:</strong> A+
//                         </p>
//                         <p>
//                           <strong>Date of Birth:</strong> 01 Jan 1969
//                         </p>
//                         <p>
//                           <strong>Age:</strong> 54 Years
//                         </p>
//                         <p>
//                           <strong>Gender:</strong> Male
//                         </p>
//                         <p>
//                           <strong>Date Joined:</strong> 01 Jan 2010
//                         </p>
//                         <p>
//                           <strong>Contact:</strong> +91 9876543210
//                         </p>
//                         <p>
//                           <strong>Email:</strong> dr.rajendra@example.com
//                         </p>
//                         <p>
//                           <strong>Address:</strong> 123 Medical St, City,
//                           Country
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* You can similarly add the JSX for Nurses, Receptionists, Accountants, etc. */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManageEmployee;

//=========================########################//

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployeesByRole,
  updateEmployeeStatus,
} from "../../../features/employeeSlice";
import "./ManageEmployee.css";

function ManageEmployee() {
  const [activeTab, setActiveTab] = useState("doctors");
  // employees are now managed by redux (stored by roleId)
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAadhar, setSelectedAadhar] = useState(null);

  const roleIds = {
    doctors: 3,
    nurses: 4,
    receptionists: 10,
    accountants: 6,
    pharmacist: 5,
    laboratorist: 8,
    insurance: 9,
    hr: 7,
  };

  const columnConfig = {
    doctors: [
      { key: "profilePic", label: "Photo" },
      { key: "fullName", label: "Name" },
      { key: "specialization", label: "Specialization" },
      { key: "qualification", label: "Qualification" },
      { key: "experience", label: "Experience" },
    ],
    laboratorist: [
      { key: "profilePic", label: "Photo" },
      { key: "fullName", label: "Name" },
      { key: "category", label: "Category" },
      { key: "qualification", label: "Qualification" },
      { key: "experience", label: "Experience" },
    ],
    default: [
      { key: "profilePic", label: "Photo" },
      { key: "fullName", label: "Name" },
      { key: "qualification", label: "Qualification" },
      { key: "experience", label: "Experience" },
    ],
  };

  const selectedColumns = columnConfig[activeTab] || columnConfig.default;

  const dispatch = useDispatch();

  // compute current roleId for activeTab and select employees from store
  const currentRoleId = roleIds[activeTab];
  const employees = useSelector(
    (state) => state.employee.employeesByRole?.[currentRoleId] ?? []
  );

  useEffect(() => {
    if (currentRoleId) {
      dispatch(fetchEmployeesByRole(currentRoleId));
    }
  }, [currentRoleId, dispatch]);

  const handleView = (employee) => setSelectedEmployee(employee);
  const handleViewAadhar = (employee) => setSelectedAadhar(employee.idProofPic);

  // new status change handler using redux
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await dispatch(
        updateEmployeeStatus({ userId, status: newStatus })
      ).unwrap();
    } catch (err) {
      console.error("Failed to update status:", err);
      // Optionally show toast / revert UI by re-dispatching fetch
      dispatch(fetchEmployeesByRole(currentRoleId));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="container p-0 m-0">
        <div className="card-border">
          <div className="card-header d-flex justify-content-center align-items-center bg-primary">
            <div className="text-center d-flex align-items-center">
              <i className="fa-solid fa-users-rays me-2 text-white"></i>
              <span className="text-white fs-5 fw-semibold">
                Manage Employees
              </span>
            </div>
          </div>
        </div>

        <div className="container-fluid">
          {/* Tabs */}
          <ul
            className="nav nav-tabs nav-fill w-100"
            id="employeeTabs"
            role="tablist"
          >
            {Object.keys(roleIds).map((tab) => (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </li>
            ))}
          </ul>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center">
              <thead className="table-primary">
                <tr>
                  <th>Sr.No</th>
                  {selectedColumns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {employees.length > 0 ? (
                  employees.map((emp, index) => (
                    <tr key={emp.userId}>
                      <td>{index + 1}</td>

                      {selectedColumns.map((col) => {
                        if (col.key === "profilePic") {
                          return (
                            <td key={col.key}>
                              <img
                                src={emp.profilePic || "/default-user.png"}
                                alt="Profile"
                                width="45"
                                height="45"
                                style={{
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                            </td>
                          );
                        }

                        if (col.key === "fullName") {
                          return (
                            <td key={col.key}>
                              {emp.firstName} {emp.lastName}
                            </td>
                          );
                        }

                        return <td key={col.key}>{emp[col.key] || "-"}</td>;
                      })}

                      <td>
                        <select
                          className={`form-select form-select-sm status-badge status-${emp.status}`}
                          value={emp.status}
                          onChange={(e) =>
                            handleStatusChange(emp.userId, e.target.value)
                          }
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="ON_LEAVE">ON_LEAVE</option>
                          <option value="RESIGNED">RESIGNED</option>
                        </select>
                      </td>

                      <td>
                        <button
                          className="btn btn-info btn-sm me-1"
                          data-bs-toggle="modal"
                          data-bs-target="#employeeModal"
                          onClick={() => handleView(emp)}
                        >
                          <i className="fa fa-eye"></i>
                        </button>

                        <button
                          className="btn btn-secondary btn-sm me-1"
                          data-bs-toggle="modal"
                          data-bs-target="#aadharModal"
                          onClick={() => handleViewAadhar(emp)}
                        >
                          <i className="fa fa-id-card"></i>
                        </button>

                        <button className="btn btn-warning btn-sm">
                          <i className="fa fa-pen"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={selectedColumns.length + 3}
                      className="text-muted"
                    >
                      No Employees Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Employee Modal */}
            <div className="modal fade" id="employeeModal" tabIndex="-1">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">Employee Details</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>

                  <div className="modal-body">
                    {selectedEmployee && (
                      <div className="row">
                        <div className="col-md-5 d-flex justify-content-center align-items-start">
                          <img
                            src={
                              selectedEmployee.profilePic || "/default-user.png"
                            }
                            alt="Profile"
                            style={{
                              width: "200px",
                              height: "200px",
                              borderRadius: "10px",
                              objectFit: "cover",
                            }}
                          />
                        </div>

                        <div className="col-md-7">
                          <h4>
                            <strong>Name:</strong> {selectedEmployee.firstName}{" "}
                            {selectedEmployee.lastName}
                          </h4>
                          <p>
                            <strong>Qualification:</strong>{" "}
                            {selectedEmployee.qualification || "-"}
                          </p>
                          <p>
                            <strong>Experience:</strong>{" "}
                            {selectedEmployee.experience || "-"}
                          </p>
                          <p>
                            <strong>Blood Group:</strong>{" "}
                            {selectedEmployee.bloodGroup || "-"}
                          </p>
                          <p>
                            <strong>DOB:</strong> {selectedEmployee.dob || "-"}
                          </p>
                          <p>
                            <strong>Age:</strong> {selectedEmployee.age || "-"}
                          </p>
                          <p>
                            <strong>Gender:</strong>{" "}
                            {selectedEmployee.gender || "-"}
                          </p>
                          <p>
                            <strong>Date Joined:</strong>{" "}
                            {selectedEmployee.joiningDate || "-"}
                          </p>
                          <p>
                            <strong>Contact:</strong>{" "}
                            {selectedEmployee.mobileNo || "-"}
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            {selectedEmployee.email || "-"}
                          </p>
                          <p>
                            <strong>Address:</strong>{" "}
                            {selectedEmployee.address1 || "-"},{" "}
                            {selectedEmployee.city}, {selectedEmployee.district}
                            , {selectedEmployee.country}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Aadhar Modal */}
            <div className="modal fade" id="aadharModal" tabIndex="-1">
              <div className="modal-dialog modal-md modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header bg-dark text-white">
                    <h5 className="modal-title">Aadhar Card</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>

                  <div className="modal-body text-center">
                    {selectedAadhar ? (
                      <img
                        src={selectedAadhar}
                        alt="Aadhar"
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <p className="text-muted">No Aadhar Card Uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageEmployee;
