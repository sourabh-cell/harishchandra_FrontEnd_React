import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDonorNameAndId } from "../../../features/donorSlice";
import { addDonation } from "../../../features/donationSlice";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const AddNewDonation = () => {
  const dispatch = useDispatch();
  const { donorNameIdList } = useSelector((state) => state.donor);
  const { loading, success, error } = useSelector((state) => state.donation);
  const [donorSuggestions, setDonorSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    donorName: "",
    donorId: "",
    bloodGroup: "",
    donationDate: "",
    unitCollected: 1,
    notes: "",
  });
  const wrapperRef = useRef(null);

  useEffect(() => {
    dispatch(fetchDonorNameAndId());
  }, [dispatch]);

  useEffect(() => {
    if (donorNameIdList && donorNameIdList.length > 0) {
      setDonorSuggestions(donorNameIdList);
    }
  }, [donorNameIdList]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    if (success) {
      // Reset form after successful submission
      setFormData({
        donorName: "",
        donorId: "",
        bloodGroup: "",
        donationDate: "",
        unitCollected: 1,
        notes: "",
      });
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Donation added successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
    }
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Failed to add donation",
      });
    }
  }, [success, error]);

  const handleDonorNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, donorName: value, donorId: "", bloodGroup: "" }));
    
    if (value.trim().length > 0 && donorNameIdList && donorNameIdList.length > 0) {
      const filtered = donorNameIdList.filter((donor) =>
        donor.donorName && donor.donorName.toLowerCase().includes(value.toLowerCase())
      );
      setDonorSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setDonorSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectDonor = (donor) => {
    setFormData((prev) => ({
      ...prev,
      donorName: donor.donorName,
      donorId: donor.donorId,
      bloodGroup: donor.bloodGroup,
    }));
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.donorId) {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: "Please select a donor from the suggestions",
      });
      return;
    }
    if (!formData.donationDate) {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: "Please select a donation date",
      });
      return;
    }
    if (!formData.bloodGroup) {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: "Please select a blood group",
      });
      return;
    }

    // Prepare payload
    const payload = {
      donorId: formData.donorId,
      donationDate: formData.donationDate,
      unitsCollected: formData.unitCollected,
      notes: formData.notes,
    };

    dispatch(addDonation(payload));
  };

  return (
    <div className="card full-width-card shadow">
      {/* Header */}
      <div className="card-header d-flex align-items-center">
        <h3 className="mb-0 text-white d-flex align-items-center">
          <i className="fa-solid fa-hand-holding-droplet fa-lg text-white me-2"></i>
          Add New Donation
        </h3>
      </div>

      {/* Form Body */}
      <div className="card-body">
        <form id="addDonationForm" noValidate onSubmit={handleSubmit}>
          {/* Donor Name with Auto-suggestion */}
          <div className="mb-3 position-relative" ref={wrapperRef}>
            <label htmlFor="donorName" className="form-label">
              Donor Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="donorName"
              name="donorName"
              placeholder="Enter or select donor name"
              required
              autoComplete="off"
              value={formData.donorName}
              onChange={handleDonorNameChange}
              onFocus={() => {
                if (formData.donorName.trim().length > 0 && donorNameIdList && donorNameIdList.length > 0) {
                  const filtered = donorNameIdList.filter((donor) =>
                    donor.donorName && donor.donorName.toLowerCase().includes(formData.donorName.toLowerCase())
                  );
                  setDonorSuggestions(filtered);
                  setShowSuggestions(filtered.length > 0);
                }
              }}
            />
            {showSuggestions && donorSuggestions.length > 0 && (
              <ul
                className="list-group position-absolute w-100"
                style={{
                  zIndex: 1000,
                  maxHeight: "200px",
                  overflowY: "auto",
                  top: "100%",
                }}
              >
                {donorSuggestions.map((donor, index) => (
                  <li
                    key={index}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSelectDonor(donor)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="fw-semibold">{donor.donorName}</div>
                    <small className="text-muted">
                      ID: {donor.donorId} | Blood Group: {donor.bloodGroup}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Donor ID */}
          <div className="mb-3">
            <label htmlFor="donorId" className="form-label">
              Donor ID <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="donorId"
              name="donorId"
              placeholder="Donor ID will appear here"
              required
              readOnly
              value={formData.donorId}
              onChange={handleInputChange}
            />
          </div>

          {/* Blood Group */}
          <div className="mb-3">
            <label htmlFor="bloodGroup" className="form-label">
              Blood Group <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="bloodGroup"
              name="bloodGroup"
              required
              value={formData.bloodGroup}
              onChange={handleInputChange}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="O-">O-</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="A-">A-</option>
              <option value="O+">O+</option>
              <option value="AB-">AB-</option>
              <option value="B-">B-</option>
            </select>
          </div>

          {/* Donation Date */}
          <div className="mb-3">
            <label htmlFor="donationDate" className="form-label">
              Donation Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              id="donationDate"
              name="donationDate"
              required
              min={new Date().toISOString().split("T")[0]}
              value={formData.donationDate}
              onChange={handleInputChange}
            />
          </div>

          {/* Unit Collected (Static 1 Unit) */}
          <div className="mb-3">
            <label htmlFor="unitCollected" className="form-label">
              Unit Collected
            </label>
            <input
              type="number"
              className="form-control"
              id="unitCollected"
              name="unitCollected"
              value={formData.unitCollected}
              readOnly
              disabled
            />
          </div>

          {/* Notes */}
          <div className="mb-3">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              className="form-control"
              id="notes"
              name="notes"
              rows="3"
              placeholder="Enter any additional notes"
              value={formData.notes}
              onChange={handleInputChange}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="d-flex justify-content-center align-items-center">
            <button type="submit" className="btn btn-primary px-4" disabled={loading}>
              {loading ? "Adding..." : "Add Donation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewDonation;
