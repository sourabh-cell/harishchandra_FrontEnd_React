import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  selectMedicines,
  selectFetchMedicinesStatus,
  selectFetchMedicinesError,
  selectAddMedicineStatus,
  selectAddMedicineError,
  selectUpdateMedicineStatus,
  selectUpdateMedicineError,
  selectDeleteMedicineStatus,
} from "../../features/medicineSlice";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const Medicine1 = () => {
  const dispatch = useDispatch();
  const medicines = useSelector(selectMedicines);
  const fetchStatus = useSelector(selectFetchMedicinesStatus);
  const fetchError = useSelector(selectFetchMedicinesError);
  const addStatus = useSelector(selectAddMedicineStatus);
  const addError = useSelector(selectAddMedicineError);
  const updateStatus = useSelector(selectUpdateMedicineStatus);
  const updateError = useSelector(selectUpdateMedicineError);
  const deleteStatus = useSelector(selectDeleteMedicineStatus);

  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [medicineData, setMedicineData] = useState({
    medicineName: "",
    medicineCategory: "",
    medicineType: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [medicineNameQuery, setMedicineNameQuery] = useState("");
  const [medicineNameSuggestions, setMedicineNameSuggestions] = useState([]);

  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchAllMedicines());
    }
  }, [fetchStatus, dispatch]);

  useEffect(() => {
    setFilteredMedicines(medicines);
  }, [medicines]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMedicines(medicines);
    } else {
      const filtered = medicines.filter(
        (medicine) =>
          medicine.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.medicineCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.medicineType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered);
    }
  }, [searchTerm, medicines]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setMedicineData({ ...medicineData, [id]: value });

    // Handle medicine name suggestions
    if (id === 'medicineName') {
      setMedicineNameQuery(value);

      if (!value) {
        setMedicineNameSuggestions([]);
        return;
      }

      const lowerQuery = value.toLowerCase();
      const filtered = medicines.filter((med) => {
        const medName = (med.medicineName || "").toLowerCase();
        return medName.includes(lowerQuery);
      });

      setMedicineNameSuggestions(filtered.slice(0, 8));
    }
  };

  // Handle medicine name selection from suggestions
  const handleSelectMedicineName = (medicine) => {
    setMedicineData({
      ...medicineData,
      medicineName: medicine.medicineName,
      medicineCategory: medicine.medicineCategory,
      medicineType: medicine.medicineType
    });
    setMedicineNameQuery(medicine.medicineName);
    setMedicineNameSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting medicine data:", medicineData);
    
    try {
      if (editingMedicine) {
        // Update existing medicine
        await dispatch(updateMedicine({ 
          medicineId: editingMedicine.medicineId, 
          medicine: medicineData 
        })).unwrap();
        
        await Swal.fire({
          title: "Success!",
          text: "Medicine updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        // Add new medicine
        await dispatch(addMedicine(medicineData)).unwrap();
        
        await Swal.fire({
          title: "Success!",
          text: "Medicine saved successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      }

      setMedicineData({ medicineName: "", medicineCategory: "", medicineType: "" });
      setShowForm(false);
      setEditingMedicine(null);
      dispatch(fetchAllMedicines());
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save medicine";
      await Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleAddDrug = () => {
    setShowForm(true);
    setEditingMedicine(null);
    setMedicineData({ medicineName: "", medicineCategory: "", medicineType: "" });
    setMedicineNameQuery("");
    setMedicineNameSuggestions([]);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMedicine(null);
    setMedicineData({ medicineName: "", medicineCategory: "", medicineType: "" });
    setMedicineNameQuery("");
    setMedicineNameSuggestions([]);
  };

  const handleEdit = (medicine) => {
    setShowForm(true);
    setEditingMedicine(medicine);
    setMedicineData({
      medicineName: medicine.medicineName,
      medicineCategory: medicine.medicineCategory,
      medicineType: medicine.medicineType
    });
    setMedicineNameQuery(medicine.medicineName);
    setMedicineNameSuggestions([]);
  };

  const handleDelete = async (medicine) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${medicine.medicineName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteMedicine(medicine.medicineId)).unwrap();
        await Swal.fire({
          title: "Deleted!",
          text: "Medicine has been deleted.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (err) {
        await Swal.fire({
          title: "Error!",
          text: err?.message || "Failed to delete medicine",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const isLoading = addStatus === "loading" || updateStatus === "loading";

  return (
    <div className="medicine1-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          <i className="fa-solid fa-pills me-2"></i>Medicine 
        </h5>
        {!showForm && (
          <button
            type="button"
            className="btn btn-primary"
            style={{ backgroundColor: "#01C0C8", border: 0 }}
            onClick={handleAddDrug}
          >
            <i className="fa-solid fa-plus me-1"></i> Add Drug
          </button>
        )}
      </div>
      
      {fetchStatus === "loading" && (
        <div className="text-center py-4">
          <span className="spinner-border spinner-border-sm me-2"></span>
          Loading medicines...
        </div>
      )}
      
      {fetchError && (
        <div className="alert alert-danger py-2">
          Error: {fetchError}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-4 position-relative">
              <label className="form-label">Name</label>
              <input
                type="text"
                id="medicineName"
                className="form-control"
                placeholder="Search or enter medicine name"
                value={medicineNameQuery}
                onChange={handleChange}
                required
              />
              {medicineNameSuggestions.length > 0 && (
                <ul
                  className="list-group position-absolute w-100"
                  style={{
                    zIndex: 1000,
                    maxHeight: 200,
                    overflowY: 'auto',
                    marginTop: '2px'
                  }}
                >
                  {medicineNameSuggestions.map((med) => (
                    <li
                      key={med.medicineId}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSelectMedicineName(med)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="fw-semibold">{med.medicineName}</div>
                      <div className="small text-muted">
                        {med.medicineCategory} | {med.medicineType}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select
                id="medicineCategory"
                className="form-select"
                value={medicineData.medicineCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="ANTIBIOTIC">Antibiotic</option>
                <option value="ANALGESIC">Analgesic</option>
                <option value="ANTIPYRETIC">Antipyretic</option>
                <option value="SUPPLEMENT">Supplement</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Type</label>
              <select
                id="medicineType"
                className="form-select"
                value={medicineData.medicineType}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="TABLET">Tablet</option>
                <option value="SYRUP">Syrup</option>
                <option value="INJECTION">Injection</option>
                <option value="OINTMENT">Ointment</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="btn btn-primary me-2"
              style={{ backgroundColor: "#01C0C8", border: 0 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  {editingMedicine ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk me-1"></i> {editingMedicine ? "Update Medicine" : "Save Medicine"}
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              <i className="fa-solid fa-times me-1"></i> Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mb-3">
            <div className="input-group" style={{ maxWidth: "300px" }}>
              <span className="input-group-text" style={{ backgroundColor: "#01C0C8", border: 0, color: "white" }}>
                <i className="fa-solid fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover" style={{ borderColor: "#dee2e6" }}>
              <thead style={{ backgroundColor: "#01C0C8", color: "white" }}>
                <tr>
                  <th style={{ border: "1px solid #dee2e6" }}>ID</th>
                  <th style={{ border: "1px solid #dee2e6" }}>Name</th>
                  <th style={{ border: "1px solid #dee2e6" }}>Category</th>
                  <th style={{ border: "1px solid #dee2e6" }}>Type</th>
                  <th style={{ border: "1px solid #dee2e6", width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map((medicine) => (
                    <tr key={medicine.medicineId}>
                      <td style={{ border: "1px solid #dee2e6" }}>{medicine.medicineId}</td>
                      <td style={{ border: "1px solid #dee2e6" }}>{medicine.medicineName}</td>
                      <td style={{ border: "1px solid #dee2e6" }}>{medicine.medicineCategory}</td>
                      <td style={{ border: "1px solid #dee2e6" }}>{medicine.medicineType}</td>
                      <td style={{ border: "1px solid #dee2e6" }}>
                        <button
                          className="btn btn-sm btn-primary me-1"
                          style={{ backgroundColor: "#01C0C8", border: 0, padding: "4px 8px" }}
                          onClick={() => handleEdit(medicine)}
                          title="Edit"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          style={{ padding: "4px 8px" }}
                          onClick={() => handleDelete(medicine)}
                          title="Delete"
                          disabled={deleteStatus === "loading"}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      {searchTerm ? "No medicines found matching your search." : "No medicines found. Click 'Add Drug' to add a new medicine."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Medicine1;
