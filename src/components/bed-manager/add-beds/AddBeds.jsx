import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import "./AddBeds.css";
import {
  fetchBedsFormData,
  selectBedsFormData,
  selectBedsFormDataStatus,
  addBed,
  selectAddBedStatus,
} from "../../../features/bedManagerSlice";

const AddBeds = () => {
  const [bedNumber, setBedNumber] = useState("");
  const [roomId, setRoomId] = useState("");
  const [bedStatus, setBedStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  const bedsFormData = useSelector(selectBedsFormData) || {
    rooms: [],
    bedStatus: [],
  };
  const bedsFormDataStatus = useSelector(selectBedsFormDataStatus);
  const addBedStatus = useSelector(selectAddBedStatus);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (bedNumber.trim() === "" || roomId === "" || bedStatus === "") {
      setError(true);
      setSuccess(false);
      return;
    }

    // dispatch addBed
    dispatch(addBed({ bedNumber: bedNumber.trim(), roomId, status: bedStatus }))
      .unwrap()
      .then((res) => {
        const msg =
          res?.message ||
          (res?.data && res.data.message) ||
          "Bed added successfully";
        setSuccess(true);
        setError(false);
        // Reset form
        setBedNumber("");
        setRoomId("");
        setBedStatus("");
        Swal.fire({
          title: msg,
          icon: "success",
          timer: 1400,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        const backendMsg =
          err?.message ||
          err?.data?.message ||
          JSON.stringify(err) ||
          "Failed to add bed";
        setError(true);
        setSuccess(false);
        Swal.fire({ title: "Failed", text: backendMsg, icon: "error" });
      });
  };

  useEffect(() => {
    if (bedsFormDataStatus === "idle") dispatch(fetchBedsFormData());
  }, [dispatch, bedsFormDataStatus]);

  // Auto-hide inline success/error alerts after 3 seconds
  useEffect(() => {
    if (!success) return; // nothing to do
    const timer = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(false), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className="container-fluid p-0 m-0">
      <div className="card-border shadow-sm border rounded">
        {/* Header */}
        <div className="card-header bg-light d-flex justify-content-center align-items-center">
          <i className="fa-solid fa-file-medical fa-lg me-2 "></i>
          <h3 className="mb-0">Add Beds</h3>
        </div>

        {/* Success / Error Messages */}
        {success && (
          <div
            className="alert alert-success alert-dismissible fade show mt-3"
            role="alert"
          >
            <i className="fa-solid fa-circle-check me-1"></i>
            Bed added successfully!
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccess(false)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show mt-3"
            role="alert"
          >
            <i className="fa-solid fa-triangle-exclamation me-1"></i>
            Error adding bed! Please fill all required fields.
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(false)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Add Bed Form */}
        <div className="container-fluid ">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Bed Number */}
              <div className="col-md-12 mb-3">
                <label htmlFor="bedNumber" className="form-label fw-semibold">
                  Bed No <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  id="bedNumber"
                  name="bedNumber"
                  className="form-control"
                  placeholder="Enter Bed No"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  required
                />
                <div className="invalid-feedback">
                  Please enter a valid bed number.
                </div>
              </div>

              {/* Room Type */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="roomType" className="form-label fw-semibold">
                    Room <span className="text-danger">*</span>
                  </label>
                  <select
                    id="roomType"
                    name="roomId"
                    className="form-select"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Room --</option>
                    {bedsFormDataStatus === "loading" && (
                      <option value="">Loading rooms...</option>
                    )}
                    {bedsFormDataStatus === "succeeded" &&
                      bedsFormData.rooms.length === 0 && (
                        <option value="">No rooms available</option>
                      )}
                    {bedsFormData.rooms.map((r) => (
                      <option
                        key={r.id || r.roomNumber}
                        value={r.id ?? r.roomNumber}
                      >
                        {r.roomName || r.roomName || r.roomNumber}
                        {r.roomNumber ? ` (${r.roomNumber})` : ""}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">Please select a room.</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="bedStatus" className="form-label">
                    Status <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="bedStatus"
                    name="bedStatus"
                    value={bedStatus}
                    onChange={(e) => setBedStatus(e.target.value)}
                    required
                  >
                    <option value="">-- Select Status --</option>
                    {bedsFormDataStatus === "loading" && (
                      <option value="">Loading statuses...</option>
                    )}
                    {bedsFormDataStatus === "succeeded" &&
                      bedsFormData.bedStatus.length === 0 && (
                        <option value="">No status options</option>
                      )}
                    {bedsFormData.bedStatus.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-center mb-3">
              <button
                type="submit"
                className="btn button px-4"
                disabled={addBedStatus === "loading"}
              >
                {addBedStatus === "loading" ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBeds;
