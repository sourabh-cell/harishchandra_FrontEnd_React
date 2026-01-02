import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  addRoom,
  selectAddRoomStatus,
} from "../../../features/bedManagerSlice";

const AddRoom = () => {
  const [formData, setFormData] = useState({
    roomNo: "",
    roomName: "",
    roomType: "",
    floor: "",
    status: "",
    pricePerDay: "",
    description: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  const addStatus = useSelector(selectAddRoomStatus);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // simple form validation
    const { roomNo, roomName, roomType, floor, status, pricePerDay } = formData;
    if (
      !roomNo ||
      !roomName ||
      !roomType ||
      !floor ||
      !status ||
      !pricePerDay
    ) {
      setError(true);
      setSuccess(false);
      return;
    }

    setError(false);

    // dispatch addRoom
    dispatch(
      addRoom({
        roomNo: formData.roomNo,
        floor: Number(formData.floor),
        status: formData.status,
        roomName: formData.roomName,
        roomTypeName: formData.roomType,
        description: formData.description,
        pricePerDay: Number(formData.pricePerDay),
      })
    )
      .unwrap()
      .then((res) => {
        const msg =
          res?.message ||
          (res?.data && res.data.message) ||
          "Room added successfully";
        setSuccess(true);
        setFormData({
          roomNo: "",
          roomName: "",
          roomType: "",
          floor: "",
          status: "",
          pricePerDay: "",
          description: "",
        });
        Swal.fire({
          title: msg,
          icon: "success",
          timer: 1600,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        const backendMsg =
          err?.message ||
          err?.data?.message ||
          JSON.stringify(err) ||
          "Failed to add room";
        setError(true);
        Swal.fire({ title: "Failed", text: backendMsg, icon: "error" });
      });
  };

  return (
    <div className="container-fluid  p-0 m-0">
      <div className="card-border shadow-sm border rounded">
        {/* Header */}
        <div className="card-header bg-light d-flex justify-content-center align-items-center">
          <div className="text-center d-flex align-items-center">
            <i className="fa-solid fa-file-medical me-2 "></i>
            <span className="fw-semibold fs-5">Add Room</span>
          </div>
        </div>

        {/* Success / Error Alerts */}

        {success && (
          <div
            className="alert alert-success alert-dismissible fade show"
            role="alert"
          >
            <i className="fa-solid fa-circle-check me-1"></i>
            Room added successfully!
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccess(false)}
            ></button>
          </div>
        )}

        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            <i className="fa-solid fa-triangle-exclamation me-1"></i>
            Something went wrong! Please fill all required fields.
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(false)}
            ></button>
          </div>
        )}

        {/* Form */}
        <form className="container-fluid " onSubmit={handleSubmit}>
          {/* Room No */}
          <div className="mb-3">
            <label htmlFor="roomNo" className="form-label">
              Room No <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              id="roomNo"
              name="roomNo"
              min={0}
              placeholder="Enter Room Number"
              value={formData.roomNo}
              onChange={handleChange}
              required
            />
          </div>

          {/* Room Name */}
          <div className="mb-3">
            <label htmlFor="roomName" className="form-label">
              Room Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="roomName"
              name="roomName"
              placeholder="Enter Room Name"
              value={formData.roomName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Room Type */}
          <div className="mb-3">
            <label htmlFor="roomType" className="form-label">
              Room Type <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="roomType"
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Room Type --</option>
              <option value="General_Ward">General Ward</option>
              <option value="ICU">ICU</option>
              <option value="Private_Room">Private Room</option>
              <option value="Deluxe_Room">Deluxe Room</option>
            </select>
          </div>

          {/* Floor */}
          <div className="mb-3">
            <label htmlFor="floor" className="form-label">
              Select Floor <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="floor"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Floor --</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
              <option value="4">4th Floor</option>
              <option value="5">5th Floor</option>
            </select>
          </div>

          {/* Status */}
          <div className="mb-3">
            <label htmlFor="status" className="form-label">
              Status <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            </select>
          </div>

          {/* Price Per Day */}
          <div className="mb-3">
            <label htmlFor="pricePerDay" className="form-label">
              Price Per Day <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              id="pricePerDay"
              name="pricePerDay"
              placeholder="Enter Price (₹)"
              min="0"
              value={formData.pricePerDay}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              placeholder="Enter Description (optional)"
              rows="3"
              maxLength="200"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="d-flex justify-content-center mb-3">
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={addStatus === "loading"}
            >
              {addStatus === "loading" ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoom;
