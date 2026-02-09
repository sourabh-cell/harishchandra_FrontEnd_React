import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPatient, clearPatientRegistrationState, selectPatientRegistration } from "../../../../features/patientRegistrationSlice";

export default function PatientRegistration() {
  const dispatch = useDispatch();
  const { status, error, message } = useSelector(selectPatientRegistration);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    age: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    district: "",
    city: "",
    country: "India",
    pincode: "",
    gender: "",
    occupation: "",
    bloodGroup: "",
    contactInfo: "",
    emergencyContact: "",
    idProofFile: null,
    idProofType: "",
    idProofNumber: "",
    maritalStatus: "",
    note: "",
  });

  const [errors, setErrors] = useState({});

  // Check if editing existing patient
  useEffect(() => {
    const editPatientData = localStorage.getItem("editPatient");
    if (editPatientData) {
      const patient = JSON.parse(editPatientData);
      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        email: patient.email || "",
        dob: patient.dob || "",
        age: patient.age || "",
        addressLine1: patient.addressDto?.addressLine1 || patient.address || "",
        addressLine2: patient.addressDto?.addressLine2 || patient.addressLine2 || "",
        state: patient.addressDto?.state || patient.state || "",
        district: patient.addressDto?.district || patient.district || "",
        city: patient.addressDto?.city || patient.city || "",
        country: patient.addressDto?.country || patient.country || "India",
        pincode: patient.addressDto?.pincode || patient.pincode || "",
        gender: patient.gender || "",
        occupation: patient.occupation || "",
        bloodGroup: patient.bloodGroup || "",
        contactInfo: patient.contactInfo || patient.contact || "",
        emergencyContact: patient.emergencyContact || "",
        idProofFile: null,
        idProofType: patient.idProofType || "",
        idProofNumber: patient.idProofNumber || "",
        maritalStatus: patient.maritalStatus || "",
        note: patient.note || "",
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearPatientRegistrationState());
    };
  }, [dispatch]);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Map id to state key
    const idToStateKey = {
      FirstName: "firstName",
      lastName: "lastName",
      email: "email",
      dob: "dob",
      age: "age",
      address: "addressLine1",
      addressLine2: "addressLine2",
      state: "state",
      district: "district",
      city: "city",
      pincode: "pincode",
      gender: "gender",
      occupation: "occupation",
      bloodGroup: "bloodGroup",
      contact: "contactInfo",
      emergencyContact: "emergencyContact",
      idProofNumber: "idProofNumber",
      maritalStatus: "maritalStatus",
      note: "note",
    };
    
    const stateKey = idToStateKey[id] || id;
    
    // Validation for specific fields
    if (id === "FirstName" || id === "lastName") {
      // Only letters
      setFormData((prev) => ({ ...prev, [stateKey]: value.replace(/[^a-zA-Z\s]/g, "") }));
    } else if (id === "contact" || id === "emergencyContact") {
      // Only numbers, max 10
      setFormData((prev) => ({ ...prev, [stateKey]: value.replace(/\D/g, "").slice(0, 10) }));
    } else if (id === "age") {
      setFormData((prev) => ({ ...prev, [stateKey]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [stateKey]: value }));
    }
  };

  // DOB change handler with age calculation
  const handleDobChange = (e) => {
    const dob = e.target.value;
    setFormData((prev) => ({ ...prev, dob }));

    if (!dob) {
      setFormData((prev) => ({ ...prev, age: "" }));
      return;
    }

    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      years--;
    }

    setFormData((prev) => ({ ...prev, age: years >= 0 ? years : "" }));
  };

  // Set max date for DOB
  const today = new Date().toISOString().split("T")[0];

  // Blood group mapping
  const bloodGroupMap = {
    "A+": "A_POSITIVE",
    "A-": "A_NEGATIVE",
    "B+": "B_POSITIVE",
    "B-": "B_NEGATIVE",
    "AB+": "AB_POSITIVE",
    "AB-": "AB_NEGATIVE",
    "O+": "O_POSITIVE",
    "O-": "O_NEGATIVE",
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.lastName) newErrors.lastName = "Last Name is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.addressLine1) newErrors.addressLine1 = "Address is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.district) newErrors.district = "District is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.pincode) newErrors.pincode = "Pincode is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.occupation) newErrors.occupation = "Occupation is required";
    if (!formData.bloodGroup) newErrors.bloodGroup = "Blood Group is required";
    if (!formData.contactInfo) newErrors.contactInfo = "Contact is required";
    if (formData.contactInfo && formData.contactInfo.length !== 10) newErrors.contactInfo = "Contact must be 10 digits";
    if (!formData.emergencyContact) newErrors.emergencyContact = "Emergency Contact is required";
    if (formData.emergencyContact && formData.emergencyContact.length !== 10) newErrors.emergencyContact = "Emergency Contact must be 10 digits";
    if (!formData.idProofNumber) newErrors.idProofNumber = "ID Proof Number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Transform data to match backend API structure
    const patientData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      dob: formData.dob,
      age: parseInt(formData.age) || 0,
      gender: formData.gender?.toUpperCase(),
      occupation: formData.occupation,
      bloodGroup: bloodGroupMap[formData.bloodGroup] || formData.bloodGroup,
      contactInfo: formData.contactInfo,
      emergencyContact: formData.emergencyContact,
      idProofType: formData.idProofType || "AADHAAR_CARD",
      idProofNumber: formData.idProofNumber,
      maritalStatus: formData.maritalStatus?.toUpperCase(),
      note: formData.note,
      idProofFile: formData.idProofFile,
      addressDto: {
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
      },
    };

    console.log("=== File Upload Debug ===");
    console.log("File in formData:", formData.idProofFile);
    console.log("File name:", formData.idProofFile?.name);
    console.log("File type:", formData.idProofFile?.type);
    console.log("File size:", formData.idProofFile?.size);
    console.log("File is File instance:", formData.idProofFile instanceof File);
    console.log("=========================");
    dispatch(createPatient(patientData));
  };

  // Handle success
  useEffect(() => {
    if (status === "succeeded") {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: message || "Patient registered successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      dispatch(clearPatientRegistrationState());
      // Clear localStorage if editing
      localStorage.removeItem("editPatient");
      // Reset form
      handleReset();
    }
  }, [status, message, dispatch]);

  // Handle error
  useEffect(() => {
    if (status === "failed" && error) {
      alert(error?.message || "Failed to register patient");
    }
  }, [status, error]);

  // Reset form
  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      dob: "",
      age: "",
      addressLine1: "",
      addressLine2: "",
      state: "",
      district: "",
      city: "",
      country: "India",
      pincode: "",
      gender: "",
      occupation: "",
      bloodGroup: "",
      contactInfo: "",
      emergencyContact: "",
      idProofFile: null,
      idProofType: "",
      idProofNumber: "",
      maritalStatus: "",
      note: "",
    });
    setErrors({});
  };

  return (
    <>
      <div className="card shadow-lg rounded-4 overflow-hidden">
        {/* Header */}
        <div
          className="d-flex justify-content-center align-items-center gap-2 py-3 position-relative"
          style={{ backgroundColor: "#01C0C8", color: "white" }}
        >
          <i className="fa-solid fa-hospital-user" style={{ fontSize: "25px" }}></i>
          <h3 className="mb-0 fw-semibold">Patient Registration</h3>
        </div>

        <div className="card-body">
          <form id="erPatientForm" noValidate onSubmit={handleSubmit}>
            {/* Name */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">First Name *</label>
                <input
                  type="text"
                  id="FirstName"
                  className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>
            </div>

            {/* Email / DOB / Age */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Date of Birth *</label>
                <input
                  type="date"
                  id="dob"
                  className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                  max={today}
                  value={formData.dob}
                  onChange={handleDobChange}
                  required
                />
                {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Age</label>
                <input
                  type="text"
                  id="age"
                  className="form-control bg-light"
                  readOnly
                  value={formData.age}
                />
              </div>
            </div>

            {/* Address */}
            <div className="border rounded-3 p-3 mb-3">
              <h5 className="fw-semibold mb-3">Address Details</h5>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Address Line 1 *</label>
                  <input
                    type="text"
                    id="address"
                    className={`form-control ${errors.addressLine1 ? "is-invalid" : ""}`}
                    value={formData.addressLine1}
                    onChange={handleChange}
                    required
                  />
                  {errors.addressLine1 && <div className="invalid-feedback">{errors.addressLine1}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    id="addressLine2"
                    className="form-control"
                    value={formData.addressLine2}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    id="state"
                    className={`form-control ${errors.state ? "is-invalid" : ""}`}
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                  {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">District *</label>
                  <input
                    type="text"
                    id="district"
                    className={`form-control ${errors.district ? "is-invalid" : ""}`}
                    value={formData.district}
                    onChange={handleChange}
                    required
                  />
                  {errors.district && <div className="invalid-feedback">{errors.district}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    id="city"
                    className={`form-control ${errors.city ? "is-invalid" : ""}`}
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Country *</label>
                  <select id="country" className="form-select" value={formData.country} onChange={handleChange} disabled>
                    <option value="India">India</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Pincode *</label>
                  <input
                    type="text"
                    id="pincode"
                    className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                  {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
                </div>
              </div>
            </div>

            {/* Gender / Occupation */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Gender *</label>
                <select
                  id="gender"
                  className={`form-select ${errors.gender ? "is-invalid" : ""}`}
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Occupation *</label>
                <input
                  type="text"
                  id="occupation"
                  className={`form-control ${errors.occupation ? "is-invalid" : ""}`}
                  value={formData.occupation}
                  onChange={handleChange}
                  required
                />
                {errors.occupation && <div className="invalid-feedback">{errors.occupation}</div>}
              </div>
            </div>

            {/* Blood / Contact */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Blood Group *</label>
                <select
                  id="bloodGroup"
                  className={`form-select ${errors.bloodGroup ? "is-invalid" : ""}`}
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                {errors.bloodGroup && <div className="invalid-feedback">{errors.bloodGroup}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Contact *</label>
                <input
                  type="text"
                  id="contact"
                  className={`form-control ${errors.contactInfo ? "is-invalid" : ""}`}
                  maxLength="10"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  required
                />
                {errors.contactInfo && <div className="invalid-feedback">{errors.contactInfo}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Emergency Contact *</label>
                <input
                  type="text"
                  id="emergencyContact"
                  className={`form-control ${errors.emergencyContact ? "is-invalid" : ""}`}
                  maxLength="10"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  required
                />
                {errors.emergencyContact && <div className="invalid-feedback">{errors.emergencyContact}</div>}
              </div>
            </div>

            {/* ID Proof */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Upload ID Proof</label>
                <input
                  type="file"
                  id="idProofFile"
                  className="form-control"
                  onChange={(e) => setFormData((prev) => ({ ...prev, idProofFile: e.target.files[0] }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">ID Proof Number *</label>
                <input
                  type="text"
                  id="idProofNumber"
                  className={`form-control ${errors.idProofNumber ? "is-invalid" : ""}`}
                  value={formData.idProofNumber}
                  onChange={handleChange}
                  required
                />
                {errors.idProofNumber && <div className="invalid-feedback">{errors.idProofNumber}</div>}
              </div>
            </div>

            {/* Marital / Note */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Marital Status</label>
                <select
                  id="maritalStatus"
                  className="form-select"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Note</label>
                <textarea
                  id="note"
                  className="form-control"
                  value={formData.note}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-center gap-3">
              <button type="button" className="btn btn-secondary px-4 py-2 rounded-3" onClick={handleReset}>
                Reset
              </button>
              <button
                type="submit"
                className="btn px-4 py-2 rounded-3 text-white"
                style={{ backgroundColor: "#01C0C8" }}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
