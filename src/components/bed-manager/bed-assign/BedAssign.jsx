import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssignData,
  postAssign,
  fetchBedsList,
} from "../../../features/bedManagerSlice";
import { fetchPatients, selectPatients } from "../../../features/commanSlice";
import Swal from "sweetalert2";

const BedAssign = () => {
  const { id: routeRoomId } = useParams();

  const [formData, setFormData] = useState({
    roomId: routeRoomId || "",
    bedNo: "",
    roomName: "",
    patientId: "",
    roomType: "Shared",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // `bedOptions` will be populated from `assignData.bedNumbers` for the selected room

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const dispatch = useDispatch();
  const assignData = useSelector(
    (s) =>
      s.bedManager?.assignData || { bedNumbers: {}, patientIds: {}, room: null }
  );
  const commanPatients = useSelector(selectPatients);

  const bedOptions = Object.entries(assignData?.bedNumbers || {}).map(
    ([key, val]) => ({ id: key, label: String(val) })
  );
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  // console.log("BedAssign: suggestions", suggestions);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // console.log("BedAssign: showSuggestions", showSuggestions);
  const inputRef = useRef(null);
  const location = useLocation();
  const editPrefill = React.useMemo(
    () => location.state || {},
    [location.state]
  );

  useEffect(() => {
    // Load assign metadata when the selected room changes
    if (formData.roomId) dispatch(fetchAssignData(formData.roomId));
  }, [dispatch, formData.roomId]);

  // Ensure central patients list is loaded for patient search suggestions
  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  // When assign metadata arrives (room info, bed numbers), prefill roomName, roomType and bedNo if in edit mode or only one bed available
  useEffect(() => {
    if (assignData?.room) {
      setFormData((prev) => {
        const newRoomName = assignData.room.roomName || prev.roomName;
        const newRoomType = assignData.room.roomType || prev.roomType;
        if (prev.roomName === newRoomName && prev.roomType === newRoomType) {
          return prev;
        }
        return { ...prev, roomName: newRoomName, roomType: newRoomType };
      });
    }
    // If coming from an edit button with bedNo provided in navigation state
    if (editPrefill?.bedNo) {
      setFormData((prev) => {
        const newBed = String(editPrefill.bedNo);
        if (prev.bedNo === newBed) return prev;
        return { ...prev, bedNo: newBed };
      });
    } else if (!formData.bedNo && bedOptions.length === 1) {
      // Auto-select the single available bed number
      setFormData((prev) => {
        const newBed = bedOptions[0].label;
        if (prev.bedNo === newBed) return prev;
        return { ...prev, bedNo: newBed };
      });
    }
  }, [assignData, bedOptions, editPrefill, formData.bedNo]);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const q = query.trim().toLowerCase();
    // Use central patients list from commanSlice for searching
    const source = Array.isArray(commanPatients) ? commanPatients : [];
    const matches = source
      .map((p) => ({
        id:
          p.patient_hospital_id || p.hospitalId || p.hospitalID || p.code || "",
        name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      }))
      .filter((p) => {
        const code = (p.id || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        return code.includes(q) || name.includes(q);
      })
      .slice(0, 10);
    setSuggestions(matches);
  }, [query, commanPatients]);

  const handleSelectSuggestion = (s) => {
    setFormData({ ...formData, patientId: s.id }); // hospitalId code
    setQuery(`${s.id} - ${s.name}`);
    setShowSuggestions(false);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    // clear selected patientId if user edits
    setFormData({ ...formData, patientId: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.bedNo || !formData.patientId) {
      setErrorMsg("Please fill all required fields.");
      setSuccessMsg("");
      return;
    }

    // Build payload expected by backend using assignData mappings
    const bedKey = bedOptions.find(
      (b) => String(b.label) === String(formData.bedNo)
    )?.id;
    // find internal patient key by matching hospitalId
    const patientEntry = Object.entries(assignData?.patientIds || {}).find(
      ([, v]) =>
        v?.hospitalId === formData.patientId ||
        v?.hospitalId === String(formData.patientId)
    );
    const patientKey = patientEntry ? patientEntry[0] : null;

    if (!bedKey) {
      setErrorMsg("Selected bed not found in room data.");
      setSuccessMsg("");
      return;
    }
    if (!patientKey) {
      setErrorMsg("Selected patient not found in room data.");
      setSuccessMsg("");
      return;
    }

    // Build new POST /assign payload as requested
    const payloadBody = {
      roomId: Number(formData.roomId) || formData.roomId,
      bedId: isNaN(Number(bedKey)) ? bedKey : Number(bedKey),
      patientHospitalId: formData.patientId,
      patientId: isNaN(Number(patientKey)) ? patientKey : Number(patientKey),
      assignedAt: new Date().toISOString(),
    };
    console.log("BedAssign: submitting payload", payloadBody);

    // dispatch postAssign thunk (POST /assign)
    dispatch(postAssign(payloadBody))
      .then((res) => {
        const status = res?.meta?.requestStatus;
        if (status === "fulfilled") {
          Swal.fire({
            icon: "success",
            title: "Assigned",
            text: "Bed assigned successfully.",
          });
          setErrorMsg("");
          // clear selection
          setFormData((prev) => ({ ...prev, bedNo: "", patientId: "" }));
          // refetch assign metadata for updated state
          dispatch(fetchAssignData(formData.roomId));
          // refresh beds list so vacant counts update across the app
          dispatch(fetchBedsList());
        } else {
          const err = res.payload || res.error || {};
          const msg =
            err?.message ||
            (Array.isArray(err)
              ? err.map((e) => e.defaultMessage || e.message).join("\n")
              : JSON.stringify(err));
          Swal.fire({
            icon: "error",
            title: "Assign Failed",
            text: msg || "Failed to assign bed.",
          });
          setErrorMsg(msg || "Failed to assign bed.");
          setSuccessMsg("");
        }
      })
      .catch((err) => {
        const text = err?.message || "Failed to assign bed.";
        Swal.fire({ icon: "error", title: "Assign Failed", text });
        setErrorMsg(text);
        setSuccessMsg("");
      });
  };

  return (
    <div className="container p-0 m-0">
      {/* Header */}
      <div className="card-header d-flex justify-content-center align-items-center bg-light">
        <i className="fa fa-bed fs-3 me-2"></i>
        <h3>Assign Beds</h3>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="text-danger fw-bold mb-3 text-center mt-3">
          <p>{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="text-success fw-bold mb-3 text-center mt-3">
          <p>{successMsg}</p>
        </div>
      )}

      {/* Form */}
      <div className="container-fluid">
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="roomId" value={formData.roomId} />

          <div className="row g-3">
            {/* Bed No */}
            <div className="col-md-6">
              <label htmlFor="bedNo" className="form-label fw-semibold">
                Bed No <span className="text-danger">*</span>
              </label>
              <select
                id="bedNo"
                name="bedNo"
                className="form-select"
                value={formData.bedNo}
                onChange={handleChange}
                required
                disabled={!bedOptions.length}
              >
                <option value="">-- Select Bed No --</option>
                {bedOptions.map((bed) => (
                  <option key={bed.id} value={bed.label}>
                    {bed.label}
                  </option>
                ))}
              </select>
              {!bedOptions.length && (
                <small className="text-muted">Loading bed numbers...</small>
              )}
            </div>

            {/* Room Name */}
            <div className="col-md-6">
              <label htmlFor="roomName" className="form-label fw-semibold">
                Room Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="roomName"
                name="roomName"
                className="form-control"
                value={assignData?.room?.roomName || formData.roomName}
                readOnly
                required
              />
            </div>

            {/* Patient ID (searchable) */}
            <div className="col-md-6 position-relative">
              <label htmlFor="patientSearch" className="form-label fw-semibold">
                Search Patient <span className="text-danger">*</span>
              </label>
              <input
                id="patientSearch"
                name="patientSearch"
                ref={inputRef}
                className="form-control"
                placeholder="Search patient by hospital ID (e.g., HM6) or name"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
                required
              />
              <input
                type="hidden"
                name="patientId"
                value={formData.patientId}
              />
              {showSuggestions && suggestions && suggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100 zindex-tooltip"
                  style={{ maxHeight: 220, overflowY: "auto" }}
                >
                  {suggestions.map((s) => (
                    <li
                      key={s.id}
                      className="list-group-item list-group-item-action"
                      onMouseDown={() => handleSelectSuggestion(s)}
                    >
                      <strong>{s.id}</strong> - <span>{s.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Room Type (read-only from assignData) */}
            <div className="col-md-6">
              <label htmlFor="roomType" className="form-label fw-semibold">
                Room Type
              </label>
              <input
                id="roomType"
                name="roomType"
                className="form-control"
                value={assignData?.room?.roomType || formData.roomType || ""}
                readOnly
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center my-3">
            <button type="submit" className="btn button px-4">
              Assign Bed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BedAssign;
