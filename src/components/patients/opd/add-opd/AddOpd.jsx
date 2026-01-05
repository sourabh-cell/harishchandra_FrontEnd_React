import React, { useState } from "react";
import "./AddOpd.css";

const AddOpd = () => {
  const [showRefDept, setShowRefDept] = useState(false);
  const [showRefDoc, setShowRefDoc] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentId, setDepartmentId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState(null);
  const [doctorId, setDoctorId] = useState("");

  const handleStatusChange = (e) => {
    const value = e.target.value;

    if (value === "Reference") {
      setShowRefDept(true);
      setShowRefDoc(true);
    } else {
      setShowRefDept(false);
      setShowRefDoc(false);
    }
  };

  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");

  const handleDobChange = (e) => {
    const selectedDob = e.target.value;
    setDob(selectedDob);

    if (selectedDob) {
      const today = new Date();
      const birthDate = new Date(selectedDob);

      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      // adjust if birthday hasn't occurred yet this year
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      setAge(calculatedAge);
    }
  };

  return (
    <div className="container p-0 m-0">
      <div className="border-card">
        <div
          className="card-header d-flex align-items-center"
          style={{ backgroundColor: "#01c0c8" }}
        >
          <i className="fa-solid fa-procedures me-2"></i>
          <h3 className="m-0">Patient OPD</h3>
        </div>

        <div className="container-fluid">
          <form id="erPatientForm">
            {/* Search Bar */}
            <div className="row my-4">
              <div className="col-md-6 justify-content-left">
                <label className="form-label fw-semibold">Search Patient</label>
                <input
                  type="text"
                  id="searchInput"
                  className="form-control"
                  placeholder="Search Patient..."
                />
                <ul
                  id="searchHistoryList"
                  className="list-group position-absolute"
                  style={{ display: "none", zIndex: 999 }}
                ></ul>
              </div>
            </div>
            {/* Doctor Info */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Department</label>
                <select
                  className="form-select"
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setDoctorId("");
                    setDoctors([]);
                  }}
                >
                  <option value="" disabled>
                    {loading ? "Loading departments..." : "Select Department"}
                  </option>

                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
                {error && (
                  <div className="text-danger small mt-1">
                    Failed to load: {error}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Doctor</label>
                <select
                  className="form-select"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  disabled={!departmentId || doctorsLoading}
                >
                  <option value="" disabled>
                    {!departmentId
                      ? "Select department first"
                      : doctorsLoading
                      ? "Loading doctors..."
                      : "Select Doctor"}
                  </option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                      {doc.specialization ? ` - ${doc.specialization}` : ""}
                    </option>
                  ))}
                </select>
                {doctorsError && (
                  <div className="text-danger small mt-1">
                    Failed to load doctors: {doctorsError}
                  </div>
                )}
              </div>
            </div>
            {/* First + Last Name */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  First Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
                  }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Last Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
                  }}
                />
              </div>
            </div>

            {/* Gender + Email */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Gender <span style={{ color: "red" }}>*</span>
                </label>
                <select className="form-select">
                  <option>-- Select Gender --</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input type="email" className="form-control" />
              </div>
            </div>

            {/* Occupation + Blood Group */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Occupation</label>
                <input
                  type="text"
                  className="form-control"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
                  }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Blood Group <span style={{ color: "red" }}>*</span>
                </label>
                <select className="form-select">
                  <option>-- Select Blood Group --</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (bg) => (
                      <option key={bg}>{bg}</option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* DOB + Age */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  DOB <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={dob}
                  onChange={handleDobChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Age</label>
                <input
                  type="text"
                  className="form-control"
                  readOnly
                  value={age}
                />
              </div>
            </div>

            {/* Contact + Emergency */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Contact Number <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="tel"
                  className="form-control"
                  maxLength={10}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Emergency Contact <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="tel"
                  className="form-control"
                  maxLength={10}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="border rounded p-3 my-4">
              <h5 className="fw-bold mb-3">Address Details</h5>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Address Line 1 <span style={{ color: "red" }}>*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Address Line 2
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    State <span style={{ color: "red" }}>*</span>
                  </label>
                  <select className="form-select">
                    <option>Select State</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">District</label>
                  <select className="form-select" disabled>
                    <option>Select District</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    City <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
                    }}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Country</label>
                  <select className="form-select" disabled>
                    <option>India</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Pincode</label>
                  <input type="number" className="form-control" />
                </div>
              </div>
            </div>

            {/* ID & File Upload */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  ID Proof Type <span style={{ color: "red" }}>*</span>
                </label>
                <select className="form-select">
                  <option>-- Select ID Proof --</option>
                  <option>Aadhar</option>
                  <option>PAN</option>
                  <option>Driving License</option>
                  <option>Passport</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Upload ID Proof
                </label>
                <input
                  type="file"
                  className="form-control"
                  accept=".jpg,.jpeg,.png,.pdf"
                />
              </div>
            </div>

            {/* Marital + Visit Date */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Marital Status</label>
                <select className="form-select">
                  <option>Select Status</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Visit Date <span style={{ color: "red" }}>*</span>
                </label>
                <input type="date" className="form-control" />
              </div>
            </div>

            {/* Visit Type + Status */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Visit Type</label>
                <select className="form-select">
                  <option>Select Visit Type</option>
                  <option>First Visit</option>
                  <option>Follow-up</option>
                  <option>Emergency</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Status <span style={{ color: "red" }}>*</span>
                </label>
                <select className="form-select" onChange={handleStatusChange}>
                  <option value="">-- Select Status --</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Reference">Reference</option>
                </select>
              </div>

              {showRefDept && (
                <div className="col-md-6 mt-4">
                  <label className="form-label fw-semibold">
                    Reference Department <span style={{ color: "red" }}>*</span>
                  </label>
                  <select className="form-select">
                    <option>Select Reference Department</option>
                  </select>
                </div>
              )}

              {showRefDoc && (
                <div className="col-md-6 mt-4">
                  <label className="form-label fw-semibold">
                    Reference Doctor <span style={{ color: "red" }}>*</span>
                  </label>
                  <select className="form-select">
                    <option>Select Reference Doctor</option>
                  </select>
                </div>
              )}
            </div>

            {/* Reason + Note */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Reason</label>
                <input type="text" className="form-control" />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Note</label>
                <textarea className="form-control"></textarea>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="d-flex justify-content-center">
              <button type="reset" className="button bg-secondary me-2">
                Reset
              </button>
              <button type="submit" className="button">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOpd;
