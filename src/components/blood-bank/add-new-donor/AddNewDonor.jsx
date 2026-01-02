import React, { useState, useEffect } from "react";
let Swal;
// try to require/import sweetalert2; if not available (dev env), load from CDN
try {
  // eslint-disable-next-line global-require
  Swal = require("sweetalert2");
} catch (e) {
  // dynamic loader for browser runtime
  const loadSwalFromCdn = () => {
    if (typeof window === "undefined") return;
    if (window.Swal) {
      Swal = window.Swal;
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js";
    script.onload = () => {
      Swal = window.Swal;
    };
    document.body.appendChild(script);
  };
  loadSwalFromCdn();
}
import { useDispatch, useSelector } from "react-redux";
import { addDonor, clearState } from "../../../features/donorSlice";

export default function AddNewDonor() {
  const [formData, setFormData] = useState({
    donorName: "",
    donorId: "Auto-generated",
    age: "",
    gender: "",
    phone: "",
    email: "",
    lastDonationDate: "",
    bloodGroup: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useDispatch();
  const donorState = useSelector((s) => s.donor || {});

  // show alerts
  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: "success",
        title: "Donor added",
        text: "Donor has been added successfully.",
        timer: 2500,
        showConfirmButton: false,
      });
    }
  }, [success]);

  useEffect(() => {
    if (errorMsg) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });
    }
  }, [errorMsg]);

  // Auto-set date on load
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, lastDonationDate: today }));
  }, []);

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanedValue = value;

    if (name === "phone") cleanedValue = value.replace(/\D/g, "");

    setFormData({
      ...formData,
      [name]: cleanedValue,
    });
  };

  // Validation
  const validate = () => {
    let newErrors = {};

    if (!formData.donorName.trim()) newErrors.donorName = "Enter donor name";
    if (!formData.age || formData.age < 18 || formData.age > 65)
      newErrors.age = "Age must be 18–65";
    if (!formData.gender) newErrors.gender = "Select gender";
    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Enter valid 10-digit number";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter valid email";
    if (!formData.lastDonationDate) newErrors.lastDonationDate = "Select date";
    if (new Date(formData.lastDonationDate) > new Date())
      newErrors.lastDonationDate = "Future date not allowed";
    if (!formData.bloodGroup) newErrors.bloodGroup = "Select blood group";
    if (!formData.address.trim()) newErrors.address = "Enter address";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMsg("");

    if (!validate()) {
      setErrorMsg("Please fix validation errors");
      return;
    }

    // use redux thunk to submit
    setLoading(true);
    try {
      const payload = {
        donorName: formData.donorName,
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        lastDonationDate: formData.lastDonationDate,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
      };

      const resultAction = await dispatch(addDonor(payload));
      if (addDonor.fulfilled.match(resultAction)) {
        setSuccess(true);
        // reset form
        setFormData({
          donorName: "",
          donorId: "Auto-generated",
          age: "",
          gender: "",
          phone: "",
          email: "",
          lastDonationDate: new Date().toISOString().split("T")[0],
          bloodGroup: "",
          address: "",
        });
        setErrors({});
      } else {
        // rejected
        const payload = resultAction.payload || resultAction.error;
        setErrorMsg(payload?.message || "Failed to submit");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setFormData({
      donorName: "",
      donorId: "Auto-generated",
      age: "",
      gender: "",
      phone: "",
      email: "",
      lastDonationDate: new Date().toISOString().split("T")[0],
      bloodGroup: "",
      address: "",
    });
    setErrors({});
    setSuccess(false);
    setErrorMsg("");
    // clear redux slice status
    dispatch(clearState());
  };

  return (
    <>
      {/* Success/Error handled via SweetAlert2 */}
      {/* Trigger alerts when state changes */}

      <div className="full-width-card card shadow">
        <div
          className="card-header text-white fs-5 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "#01C0C8", gap: "8px" }}
        >
          <i className="fa-solid fa-droplet   "></i>
          <span className="fw-semibold">Add New Donor</span>
        </div>

        <form className="p-4" onSubmit={handleSubmit} onReset={handleReset}>
          {/* Donor Name */}
          <div className="mb-3">
            <label htmlFor="donorName" className="form-label">
              Donor Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.donorName ? "is-invalid" : ""}`}
              id="donorName"
              name="donorName"
              value={formData.donorName}
              onChange={handleChange}
            />
            <div className="invalid-feedback">{errors.donorName}</div>
          </div>

          {/* Donor ID */}
          <div className="mb-3">
            <label htmlFor="donorId" className="form-label">
              Donor ID
            </label>
            <input
              type="text"
              className="form-control"
              id="donorId"
              disabled
              value="Auto-generated"
            />
            <div className="form-text">
              Donor ID will be auto-generated by the system (Format:
              DON2412150001).
            </div>
          </div>

          {/* Age + Gender */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="age" className="form-label">
                Age <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${errors.age ? "is-invalid" : ""}`}
                id="age"
                min={0}
                name="age"
                value={formData.age}
                onChange={handleChange}
              />
              <div className="invalid-feedback">{errors.age}</div>
            </div>

            <div className="col-md-6">
              <label htmlFor="gender" className="form-label">
                Gender <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${errors.gender ? "is-invalid" : ""}`}
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <div className="invalid-feedback">{errors.gender}</div>
            </div>
          </div>

          {/* Phone + Email */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="phone" className="form-label">
                Phone No <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                maxLength="10"
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <div className="invalid-feedback">{errors.phone}</div>
            </div>

            <div className="col-md-6">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <div className="invalid-feedback">{errors.email}</div>
            </div>
          </div>

          {/* Last Donation Date + Blood Group */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="lastDonationDate" className="form-label">
                Last Donation Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className={`form-control ${
                  errors.lastDonationDate ? "is-invalid" : ""
                }`}
                id="lastDonationDate"
                name="lastDonationDate"
                value={formData.lastDonationDate}
                onChange={handleChange}
              />
              <div className="invalid-feedback">{errors.lastDonationDate}</div>
            </div>

            <div className="col-md-6">
              <label htmlFor="bloodGroup" className="form-label">
                Blood Group <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${
                  errors.bloodGroup ? "is-invalid" : ""
                }`}
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select Blood Group
                </option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  )
                )}
              </select>
              <div className="invalid-feedback">{errors.bloodGroup}</div>
            </div>
          </div>

          {/* Address */}
          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              Address <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.address ? "is-invalid" : ""}`}
              id="address"
              name="address"
              rows="2"
              value={formData.address}
              onChange={handleChange}
            ></textarea>
            <div className="invalid-feedback">{errors.address}</div>
          </div>

          {/* Buttons */}
          <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
            <button
              type="submit"
              className="btn text-white"
              style={{ backgroundColor: "#01C0C8" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>

            <button type="reset" className="btn btn-secondary">
              Reset
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
