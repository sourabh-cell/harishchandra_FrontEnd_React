// import React, { useState } from "react";

// export default function ViewDoctor() {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [doctor, setDoctor] = useState(null);
//   const [isEditMode, setIsEditMode] = useState(false);

//   const [doctorList, setDoctorList] = useState([
//     {
//       id: 1,
//       photo: "https://randomuser.me/api/portraits/men/44.jpg",
//       name: "Dr. Rajendra Prasad",
//       specialization: "Cardiology",
//       qualification: "MBBS, MD",
//       experience: "12 Years",
//       license: "KIPL4786",
//       blood: "A+",
//       dob: "01 Jan 1969",
//       age: "54 Years",
//       gender: "Male",
//       joined: "01 Jan 2010",
//       phone: "+91 9876543210",
//       email: "dr.rajendra@example.com",
//       address: "123 Medical St, City, Country",
//       status: "Active",
//     },
//     {
//       id: 2,
//       photo: "https://randomuser.me/api/portraits/men/4.jpg",
//       name: "Dr. Rohit Sharma",
//       specialization: "Gynecology",
//       qualification: "MBBS, DGO",
//       experience: "10 Years",
//       license: "KIPL3597",
//       blood: "B+",
//       dob: "12 May 1975",
//       age: "48 Years",
//       gender: "Male",
//       joined: "01 Jan 2012",
//       phone: "+91 9988776655",
//       email: "dr.rohit@example.com",
//       address: "45 Medical Lane, City, Country",
//       status: "Active",
//     },
//   ]);

//   function openModal(doc, editMode = false) {
//     setDoctor({ ...doc });
//     setIsEditMode(editMode);
//     setModalOpen(true);
//   }

//   function closeModal() {
//     setModalOpen(false);
//     setDoctor(null);
//     setIsEditMode(false);
//   }

//   function saveChanges() {
//     const updated = doctorList.map((d) => (d.id === doctor.id ? doctor : d));

//     setDoctorList(updated);
//     setModalOpen(false);
//     setIsEditMode(false);
//   }

//   function handleChange(e) {
//     const { name, value } = e.target;
//     setDoctor((prev) => ({ ...prev, [name]: value }));
//   }

//   return (
//     <>
//       <div className="card-full-width shadow rounded-4">
//         <div
//           className="card-header text-white d-flex justify-content-center align-items-center"
//           style={{
//             backgroundColor: "#00b6c9",
//             height: 70,
//             fontSize: 26,
//             fontWeight: 600,
//           }}
//         >
//           <i className="fa-solid fa-users-viewfinder me-2" /> View Doctor
//         </div>

//         <div className="table-responsive p-3">
//           <table className="table table-bordered align-middle text-center">
//             <thead className="text-white" style={{ background: "#2c2c2c" }}>
//               <tr>
//                 <th>#</th>
//                 <th>Photo</th>
//                 <th>Name</th>
//                 <th>Specialization</th>
//                 <th>Qualification</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {doctorList.map((d, idx) => (
//                 <tr key={d.id}>
//                   <td>{idx + 1}</td>
//                   <td>
//                     <img
//                       src={d.photo}
//                       width={60}
//                       className="rounded"
//                       alt={d.name}
//                     />
//                   </td>
//                   <td>{d.name}</td>
//                   <td>{d.specialization}</td>
//                   <td>{d.qualification}</td>
//                   <td>{d.status}</td>

//                   <td className="d-flex justify-content-center gap-2">
//                     {/* VIEW BUTTON */}
//                     <button
//                       className="btn btn-sm text-white"
//                       style={{ backgroundColor: "#01C0C8" }}
//                       onClick={() => openModal(d, false)}
//                     >
//                       <i className="fa-solid fa-eye" /> View
//                     </button>

//                     {/* EDIT BUTTON */}
//                     <button
//                       className="btn btn-sm text-white"
//                       style={{ backgroundColor: "#01C0C8" }}
//                       onClick={() => openModal(d, true)}
//                     >
//                       <i className="fa-solid fa-pen-to-square" /> Edit
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {modalOpen && doctor && (
//         <div>
//           <div className="modal fade show d-block" tabIndex={-1} role="dialog">
//             <div className="modal-dialog modal-lg">
//               <div className="modal-content">
//                 {/* HEADER */}
//                 <div
//                   className="modal-header text-white"
//                   style={{ backgroundColor: "#00b6c9" }}
//                 >
//                   <div className="w-100 d-flex justify-content-center">
//                     <h5 className="modal-title">
//                       {isEditMode ? "Edit Doctor Details" : "Doctor Details"}
//                     </h5>
//                   </div>

//                   <button
//                     type="button"
//                     className="btn-close btn-close-white"
//                     onClick={closeModal}
//                   />
//                 </div>

//                 {/* BODY */}
//                 <div className="modal-body row">
//                   {/* PHOTO */}
//                   <div className="col-md-5 text-center">
//                     <img
//                       src={doctor.photo}
//                       className="img-fluid rounded"
//                       alt={doctor.name}
//                     />
//                   </div>

//                   <div className="col-md-7">
//                     {/* NAME */}
//                     {isEditMode ? (
//                       <input
//                         type="text"
//                         className="form-control mb-2"
//                         name="name"
//                         value={doctor.name}
//                         onChange={handleChange}
//                       />
//                     ) : (
//                       <h4>{doctor.name}</h4>
//                     )}

//                     {/* ALL FIELDS */}
//                     {[
//                       ["Specialization", "specialization"],
//                       ["Qualification", "qualification"],
//                       ["Experience", "experience"],
//                       ["License Number", "license"],
//                       ["Blood Group", "blood"],
//                       ["Date of Birth", "dob"],
//                       ["Age", "age"],
//                       ["Gender", "gender"],
//                       ["Date Joined", "joined"],
//                       ["Contact", "phone"],
//                       ["Email", "email"],
//                       ["Address", "address"],
//                     ].map(([label, key]) => (
//                       <p key={key}>
//                         <strong>{label}:</strong>{" "}
//                         {isEditMode ? (
//                           <input
//                             type="text"
//                             className="form-control"
//                             name={key}
//                             value={doctor[key]}
//                             onChange={handleChange}
//                           />
//                         ) : (
//                           <span>{doctor[key]}</span>
//                         )}
//                       </p>
//                     ))}
//                   </div>
//                 </div>

//                 {/* FOOTER BUTTONS */}
//                 <div className="modal-footer">
//                   {!isEditMode && (
//                     <button
//                       className="btn text-white"
//                       style={{ backgroundColor: "#01C0C8" }}
//                       onClick={() => setIsEditMode(true)}
//                     >
//                       <i className="fa-solid fa-pen-to-square"></i> Edit
//                     </button>
//                   )}

//                   {isEditMode && (
//                     <button
//                       className="btn text-white"
//                       style={{ backgroundColor: "#01C0C8" }}
//                       onClick={saveChanges}
//                     >
//                       Save Changes
//                     </button>
//                   )}

//                   <button
//                     className="btn text-white"
//                     style={{ backgroundColor: "#01C0C8" }}
//                     onClick={saveChanges}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="modal-backdrop fade show" onClick={closeModal} />
//         </div>
//       )}
//     </>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchAllDepartments } from "../../../features/departmentSlice";
// import { fetchDoctorsByDepartment } from "../../../features/doctorByDepartmentSlice";

// export default function ViewDoctor() {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [doctor, setDoctor] = useState(null);
//   const [selectedDept, setSelectedDept] = useState("");

//   // Empty doctor list (you will fill it from backend API later)
//   const { doctorsByDept, doctorsByDeptStatus } = useSelector(
//   (state) => state.doctorsByDepartment
// );

//   function openModal(doc) {
//     setDoctor({ ...doc });
//     setModalOpen(true);
//   }

//   function closeModal() {
//     setModalOpen(false);
//     setDoctor(null);
//   }

// const dispatch = useDispatch();

// const { allDepartments, allDepartmentsStatus } = useSelector(
//   (state) => state.departments
// );

// useEffect(() => {
//   dispatch(fetchAllDepartments());
// }, [dispatch]);

// useEffect(() => {
//   if (selectedDept) {
//     dispatch(fetchDoctorsByDepartment(selectedDept)); // this is deptId
//   }
// }, [selectedDept]);

//   return (
//     <>
//       <div className="card-full-width shadow rounded-4">
//         <div
//           className="card-header text-white d-flex justify-content-center align-items-center"
//           style={{
//             backgroundColor: "#00b6c9",
//             height: 70,
//             fontSize: 26,
//             fontWeight: 600,
//           }}
//         >
//           <i className="fa-solid fa-users-viewfinder me-2" /> View Doctor
//         </div>

//         {/* 🔽 DEPARTMENT DROPDOWN ADDED HERE */}
//         {/* <div className="p-3">
//           <label className="fw-bold">Department: </label>
//           <select
//             className="form-select w-25 d-inline ms-2"
//             value={selectedDept}
//             onChange={(e) => setSelectedDept(e.target.value)}
//           >
//             <option value="">-- Select Department --</option>
//             <option value="Cardiology">Cardiology</option>
//             <option value="Neurology">Neurology</option>
//             <option value="Gynecology">Gynecology</option>
//             <option value="Orthopedic">Orthopedic</option>
//             <option value="General Medicine">General Medicine</option>
//           </select>
//         </div> */}

//         <div className="p-3">
//   <label className="fw-bold">Department: </label>

//   <select
//     className="form-select w-25 d-inline ms-2"
//     value={selectedDept}
//     onChange={(e) => setSelectedDept(e.target.value)}
//   >
//     <option value="">-- Select Department --</option>

//     {allDepartmentsStatus === "loading" && (
//       <option>Loading...</option>
//     )}

//     {allDepartmentsStatus === "succeeded" &&
//       allDepartments.map((dept) => (
//         <option key={dept.id} value={dept.id}>
//           {dept.department_name}
//         </option>
//       ))}

//     {allDepartmentsStatus === "failed" && (
//       <option>Error loading departments</option>
//     )}
//   </select>
// </div>

//         <div className="table-responsive p-3">
//           <table className="table table-bordered align-middle text-center">
//             <thead className="text-white" style={{ background: "#2c2c2c" }}>
//               <tr>
//                 <th>#</th>
//                 <th>Photo</th>
//                 <th>Name</th>
//                 <th>Specialization</th>
//                 <th>Qualification</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>

//             <tbody>
//                     {doctorsByDeptStatus === "loading" && (
//                     <tr><td colSpan="7">Loading...</td></tr>
//                   )}

//                   {doctorsByDeptStatus === "failed" && (
//                     <tr><td colSpan="7">Error loading doctors</td></tr>
//                   )}

//                   {doctorsByDeptStatus === "succeeded" &&
//                     doctorsByDept.map((d, idx) => (
//                       <tr key={d.doctorId}>
//                         <td>{idx + 1}</td>
//                         <td><img src={d.photo} width={60} className="rounded" /></td>
//                         <td>{d.name}</td>
//                         <td>{d.specialization}</td>
//                         <td>{d.qualification}</td>
//                         <td>{d.status}</td>
//                         <td>
//                           <button className="btn btn-sm text-white"
//                             style={{ backgroundColor: "#01C0C8" }}
//                             onClick={() => openModal(d)}>
//                             <i className="fa-solid fa-eye" /> View
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   }

//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* VIEW ONLY MODAL */}
//       {modalOpen && doctor && (
//         <div>
//           <div className="modal fade show d-block" tabIndex={-1} role="dialog">
//             <div className="modal-dialog modal-lg">
//               <div className="modal-content">
//                 {/* HEADER */}
//                 <div
//                   className="modal-header text-white"
//                   style={{ backgroundColor: "#00b6c9" }}
//                 >
//                   <div className="w-100 d-flex justify-content-center">
//                     <h5 className="modal-title">Doctor Details</h5>
//                   </div>

//                   <button
//                     type="button"
//                     className="btn-close btn-close-white"
//                     onClick={closeModal}
//                   />
//                 </div>

//                 {/* BODY */}
//                 <div className="modal-body row">
//                   <div className="col-md-5 text-center">
//                     <img
//                       src={doctor.photo}
//                       className="img-fluid rounded"
//                       alt={doctor.name}
//                     />
//                   </div>

//                   <div className="col-md-7">
//                     <h4>{doctor.name}</h4>

//                     {[
//                       ["Specialization", "specialization"],
//                       ["Qualification", "qualification"],
//                       ["Experience", "experience"],
//                       ["License Number", "license"],
//                       ["Blood Group", "blood"],
//                       ["Date of Birth", "dob"],
//                       ["Age", "age"],
//                       ["Gender", "gender"],
//                       ["Date Joined", "joined"],
//                       ["Contact", "phone"],
//                       ["Email", "email"],
//                       ["Address", "address"],
//                     ].map(([label, key]) => (
//                       <p key={key}>
//                         <strong>{label}:</strong> {doctor[key]}
//                       </p>
//                     ))}
//                   </div>
//                 </div>

//                 {/* FOOTER */}
//                 <div className="modal-footer">
//                   <button
//                     className="btn text-white"
//                     style={{ backgroundColor: "#01C0C8" }}
//                     onClick={closeModal}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="modal-backdrop fade show" onClick={closeModal} />
//         </div>
//       )}
//     </>
//   );
// }

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllDepartments } from "../../../features/departmentSlice";
import { fetchDoctorsByDepartment } from "../../../features/doctorByDepartmentSlice";

export default function ViewDoctor() {
  const [modalOpen, setModalOpen] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [selectedDept, setSelectedDept] = useState("");

  const dispatch = useDispatch();

  // Departments state
  const { allDepartments, allDepartmentsStatus } = useSelector(
    (state) => state.departments
  );

  // Doctors by department state
  const { doctorsByDept, doctorsByDeptStatus, error } = useSelector(
    (state) => state.doctorsByDepartment
  );

  // Fetch all departments on mount
  useEffect(() => {
    dispatch(fetchAllDepartments());
  }, [dispatch]);

  // Fetch doctors when a department is selected
  useEffect(() => {
    if (selectedDept) {
      dispatch(fetchDoctorsByDepartment(selectedDept));
    }
  }, [selectedDept, dispatch]);

  // Modal functions
  const openModal = (doc) => {
    setDoctor({ ...doc });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDoctor(null);
  };

  return (
    <>
      <div className="container m-0 p-0">
        <div
          className="card-header text-white d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "#00b6c9",

            fontSize: 26,
            fontWeight: 600,
          }}
        >
          <i className="fa-solid fa-users-viewfinder me-2" /> View Doctor
        </div>

        {/* Department Dropdown */}
        <div className="p-3">
          <label className="fw-bold">Department: </label>
          <select
            className="form-select w-25 d-inline ms-2"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">-- Select Department --</option>

            {allDepartmentsStatus === "loading" && <option>Loading...</option>}

            {allDepartmentsStatus === "succeeded" &&
              allDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </option>
              ))}

            {allDepartmentsStatus === "failed" && (
              <option>Error loading departments</option>
            )}
          </select>
        </div>

        {/* Doctors Table */}
        <div className="table-responsive p-3">
          <table className="table table-bordered align-middle text-center">
            <thead className="text-white" style={{ background: "#2c2c2c" }}>
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Specialization</th>
                <th>Qualification</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {doctorsByDeptStatus === "loading" && (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              )}

              {doctorsByDeptStatus === "failed" && (
                <tr>
                  <td colSpan="7">Error: {error}</td>
                </tr>
              )}

              {doctorsByDeptStatus === "succeeded" &&
                doctorsByDept.length === 0 && (
                  <tr>
                    <td colSpan="7">No doctors available</td>
                  </tr>
                )}

              {doctorsByDeptStatus === "succeeded" &&
                doctorsByDept.map((d, idx) => (
                  <tr key={d.doctorId}>
                    <td>{idx + 1}</td>
                    <td>
                      <img
                        src={
                          d.profilePic
                            ? `data:image/jpeg;base64,${d.profilePic}`
                            : "/default-avatar.png"
                        }
                        width={60}
                        className="rounded"
                        alt={d.firstName}
                      />
                    </td>
                    <td>
                      {d.firstName} {d.lastName}
                    </td>
                    <td>{d.specialization}</td>
                    <td>{d.qualifications}</td>
                    <td>{d.status || "Active"}</td>
                    <td>
                      <button
                        className="btn1 btn-sm text-white"
                        style={{ backgroundColor: "#01C0C8" }}
                        onClick={() => openModal(d)}
                        data-tooltip="View"
                      >
                        <i className="fa-solid fa-eye" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctor Modal */}
      {modalOpen && doctor && (
        <div>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                {/* Header */}
                <div
                  className="modal-header text-white"
                  style={{ backgroundColor: "#00b6c9" }}
                >
                  <div className="w-100 d-flex justify-content-center">
                    <h5 className="modal-title">Doctor Details</h5>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeModal}
                  />
                </div>

                {/* Body */}
                <div className="modal-body row">
                  <div className="col-md-5 text-center">
                    <img
                      src={
                        doctor.profilePic
                          ? `data:image/jpeg;base64,${doctor.profilePic}`
                          : "/default-avatar.png"
                      }
                      className="img-fluid rounded"
                      alt={doctor.firstName}
                    />
                  </div>

                  <div className="col-md-7">
                    <h4>
                      {doctor.firstName} {doctor.lastName}
                    </h4>

                    <p>
                      <strong>Specialization:</strong> {doctor.specialization}
                    </p>
                    <p>
                      <strong>Qualification:</strong> {doctor.qualifications}
                    </p>
                    <p>
                      <strong>Experience:</strong> {doctor.experience}
                    </p>
                    <p>
                      <strong>License Number:</strong> {doctor.licenseNumber}
                    </p>
                    <p>
                      <strong>Blood Group:</strong> {doctor.bloodGroup}
                    </p>
                    <p>
                      <strong>Date of Birth:</strong> {doctor.dob}
                    </p>
                    <p>
                      <strong>Age:</strong> {doctor.age}
                    </p>
                    <p>
                      <strong>Gender:</strong> {doctor.gender}
                    </p>
                    <p>
                      <strong>Date Joined:</strong> {doctor.joiningDate}
                    </p>
                    <p>
                      <strong>Contact:</strong> {doctor.mobileNumber}
                    </p>
                    <p>
                      <strong>Email:</strong> {doctor.email}
                    </p>
                    <p>
                      <strong>Address:</strong> {doctor.addressLine1},{" "}
                      {doctor.city}, {doctor.state}, {doctor.country}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                  <button
                    className="btn text-white"
                    style={{ backgroundColor: "#01C0C8" }}
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" onClick={closeModal} />
        </div>
      )}
    </>
  );
}
