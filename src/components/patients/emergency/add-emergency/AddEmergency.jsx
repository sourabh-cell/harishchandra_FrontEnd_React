import React, { useState } from "react";

const AddEmergency = () => {
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentId, setDepartmentId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState(null);
  const [doctorId, setDoctorId] = useState("");

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
      <div className="card-border">
        <div className="card-header d-flex align-items-center">
          <i className="fa-solid fa-procedures me-2"></i>
          <h3 className="m-0">Patient Emergency Room</h3>
        </div>

        <div className="container-fluid">
          <form id="erPatientForm">
            {/* Search Bar */}
            <div className="row my-4">
              <div className="col-md-6">
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
            {/* Patient Name */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  First Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="form-control"
                  placeholder="Enter First Name"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Last Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="form-control"
                  placeholder="Enter Last Name"
                />
              </div>
            </div>

            {/* DOB + Age */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Date of Birth <span style={{ color: "red" }}>*</span>
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

            {/* Gender + Email */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Gender <span style={{ color: "red" }}>*</span>
                </label>
                <select id="gender" className="form-select">
                  <option value="">-- Select Gender --</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Enter Email"
                />
              </div>
            </div>

            {/* Contact + Emergency Contact */}
            <div className="row">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Contact Number <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  className="form-control"
                  placeholder="Enter Contact Number"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Emergency Contact <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="tel"
                  id="emergencyContact"
                  className="form-control"
                  placeholder="Enter Emergency Contact"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="border rounded p-3 my-4">
              <h5 className="fw-bold mb-3">Address Details</h5>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="addressLine1">
                    Address Line 1 <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    className="form-control"
                    placeholder="Enter Address Line 1"
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="addressLine2">Address Line 2</label>
                  <input
                    type="text"
                    id="addressLine2"
                    className="form-control"
                    placeholder="Enter Address Line 2"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label htmlFor="state">
                    State <span style={{ color: "red" }}>*</span>
                  </label>
                  <select id="state" className="form-select">
                    <option value="">Select State</option>
                    {/* Add state options */}
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="district">District</label>
                  <select id="district" className="form-select" disabled>
                    <option value="">Select District</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="city">
                    City <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    className="form-control"
                    placeholder="Enter City"
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^A-Za-z ]/g,
                        ""
                      );
                    }}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="country">Country</label>
                  <select id="country" className="form-select" disabled>
                    <option>India</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="pincode">Pincode</label>
                  <input type="text" id="pincode" className="form-control" />
                </div>
              </div>
            </div>

            {/* Blood Group + ID Proof Type */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Blood Group <span style={{ color: "red" }}>*</span>
                </label>
                <select id="bloodGroup" className="form-select">
                  <option value="">-- Select Blood Group --</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  ID Proof Type <span style={{ color: "red" }}>*</span>
                </label>
                <select id="idProofType" className="form-select">
                  <option value="">-- Select ID Proof --</option>
                  <option>Aadhar</option>
                  <option>PAN</option>
                  <option>Driving License</option>
                  <option>Passport</option>
                </select>
              </div>
            </div>

            {/* Upload ID Proof + Marital Status */}
            <div className="row my-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Upload ID Proof <span style={{ color: "red" }}>*</span>
                </label>
                <input type="file" id="idProofFile" className="form-control" />
              </div>
              {/* Arrival Date + Time */}
              <div className="row my-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Arrival Date <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="date"
                    id="arrivalDate"
                    className="form-control"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Arrival Time <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="time"
                    id="arrivalTime"
                    className="form-control"
                  />
                </div>
              </div>

              {/* Triage Level + Symptoms */}
              <div className="row my-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Triage Level <span style={{ color: "red" }}>*</span>
                  </label>
                  <select id="triageLevel" className="form-select">
                    <option value="">-- Select Triage Level --</option>
                    <option>Resuscitation</option>
                    <option>Emergency</option>
                    <option>Urgent</option>
                    <option>Semi-urgent</option>
                    <option>Non-urgent</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Symptoms <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="symptoms"
                    className="form-control"
                    placeholder="Enter Symptoms"
                  />
                </div>
              </div>

              {/* Reason + Treatment */}
              <div className="row my-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Reason for Admission <span style={{ color: "red" }}>*</span>
                  </label>
                  <textarea
                    id="reason"
                    className="form-control"
                    placeholder="Enter Reason"
                  ></textarea>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Treatment Given <span style={{ color: "red" }}>*</span>
                  </label>
                  <textarea
                    id="treatment"
                    className="form-control"
                    placeholder="Enter Treatment"
                  ></textarea>
                </div>
              </div>

              {/* Referred to IPD */}
              <div className="row my-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Referred to IPD <span style={{ color: "red" }}>*</span>
                  </label>
                  <select id="referredIpd" className="form-select">
                    <option value="">-- Select --</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-footer d-flex justify-content-center">
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

export default AddEmergency;
