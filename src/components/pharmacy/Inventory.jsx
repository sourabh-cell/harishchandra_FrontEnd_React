import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchInventory,
  addInventoryItem,
  deleteInventoryItem,
  updateInventoryItem,
  selectInventory,
  selectInventoryFetchStatus,
  selectInventoryFetchError,
  selectInventoryAddStatus,
  selectInventoryAddError,
  clearAddError,
  clearAddSuccess,
} from "../../features/pharmacyInventorySlice";
import {
  fetchMedicines,
  selectMedicines,
} from "../../features/commanSlice";

const Inventory = () => {
  const dispatch = useDispatch();
  const inventory = useSelector(selectInventory);
  const fetchStatus = useSelector(selectInventoryFetchStatus);
  const fetchError = useSelector(selectInventoryFetchError);
  const addStatus = useSelector(selectInventoryAddStatus);
  const addError = useSelector(selectInventoryAddError);
  const medicines = useSelector(selectMedicines);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [selectedMedicineName, setSelectedMedicineName] = useState("");
  const [medicineQuery, setMedicineQuery] = useState("");
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);

  // Fetch inventory and medicines on component mount
  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchMedicines());
  }, [dispatch]);

  // Clear errors and success on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAddError());
      dispatch(clearAddSuccess());
    };
  }, [dispatch]);

  // Handle medicine search
  const handleMedicineSearch = (e) => {
    const query = e.target.value;
    setMedicineQuery(query);
    setSelectedMedicineName(query);

    if (!query) {
      setMedicineSuggestions([]);
      setSelectedMedicineId("");
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = (Object.entries(medicines) || []).filter(([id, name]) => {
      const medicineName = (name || "").toLowerCase();
      return medicineName.includes(lowerQuery);
    });

    setMedicineSuggestions(filtered.slice(0, 8));
  };

  // Handle medicine selection from suggestions
  const handleSelectMedicine = (id, name) => {
    setSelectedMedicineId(id);
    setSelectedMedicineName(name);
    setMedicineQuery(name);
    setMedicineSuggestions([]);
  };

  // Function to clear form for new medicine entry
  const clearForm = () => {
    // Clear React state for medicine selection
    setSelectedMedicineId("");
    setSelectedMedicineName("");
    setMedicineQuery("");
    setMedicineSuggestions([]);
    
    // Clear hidden inventoryId field
    const inventoryIdField = document.getElementById("inventoryId");
    if (inventoryIdField) {
      inventoryIdField.value = "";
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const inventoryIdValue = document.getElementById("inventoryId")?.value;
    // Convert to number, handle NaN by setting to null
    const inventoryId = inventoryIdValue ? parseInt(inventoryIdValue, 10) : null;
    const newItem = {
      medicineId: selectedMedicineId,
      medicineName: selectedMedicineName,
      medicineCategory: document.getElementById("medicineCategory").value,
      medicineType: document.getElementById("medicineType").value,
      batchNumber: document.getElementById("batchNumber").value,
      manufacturer: document.getElementById("manufacturer").value,
      quantity: document.getElementById("quantity").value,
      pricePerUnit: document.getElementById("pricePerUnit").value,
      expiryDate: document.getElementById("expiryDate").value,
      note: document.getElementById("note").value,
    };

    try {
      if (inventoryId && !isNaN(inventoryId)) {
        // Update existing item
        await dispatch(updateInventoryItem({ inventoryId, item: newItem })).unwrap();
        Swal.fire({
          icon: "success",
          title: "Medicine updated successfully",
          showConfirmButton: true,
        });
      } else {
        // Add new item
        await dispatch(addInventoryItem(newItem)).unwrap();
        Swal.fire({
          icon: "success",
          title: "Medicine added successfully",
          showConfirmButton: true,
        });
      }

      // Close modal
      const modal = document.getElementById("drugModal");
      const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      } else {
        const modalInstance = new window.bootstrap.Modal(modal);
        modalInstance.hide();
      }

      // Clear form after submission
      clearForm();
    } catch (err) {
      // Handle error
      let errorMessage = "An error occurred";
      if (typeof err === "string") {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      Swal.fire({
        icon: "error",
        title: inventoryId ? "Failed to update medicine" : "Failed to add medicine",
        text: errorMessage,
        showConfirmButton: true,
      });
      dispatch(clearAddError());
    }
  };

  // Handle delete
  const handleDelete = (inventoryId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteInventoryItem(inventoryId)).unwrap();
          
          // Refresh only the inventory table
          dispatch(fetchInventory());
          
          Swal.fire({
            icon: "success",
            title: "Medicine deleted successfully",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (err) {
          let errorMessage = "An error occurred";
          if (typeof err === "string") {
            errorMessage = err;
          } else if (err?.message) {
            errorMessage = err.message;
          } else if (err?.data?.message) {
            errorMessage = err.data.message;
          } else if (err?.response?.data?.message) {
            errorMessage = err.response.data.message;
          }
          
          Swal.fire({
            icon: "error",
            title: "Failed to delete medicine",
            text: errorMessage,
          });
        }
      }
    });
  };

  // Open modal for editing
  const handleEdit = (item) => {
    // Get the inventory ID (handle different property names)
    const inventoryIdValue = item.inventoryId || item.id || item.InventoryId;
    
    // Set inventoryId in hidden field first (convert to number)
    const inventoryIdField = document.getElementById("inventoryId");
    if (inventoryIdField) {
      const idValue = inventoryIdValue ? parseInt(inventoryIdValue, 10) : "";
      inventoryIdField.value = isNaN(idValue) ? "" : idValue;
    }

    // Set medicine name and ID directly in state
    const medicineName = item.medicineName || "";
    const medicineId = item.medicineId || "";
    
    setSelectedMedicineId(medicineId);
    setSelectedMedicineName(medicineName);
    setMedicineQuery(medicineName);
    setMedicineSuggestions([]);

    // Pre-fill form with existing data using setTimeout to ensure state is updated
    setTimeout(() => {
      document.getElementById("medicineCategory").value = item.medicineCategory || "";
      document.getElementById("medicineType").value = item.medicineType || "";
      document.getElementById("batchNumber").value = item.batchNumber || "";
      document.getElementById("manufacturer").value = item.manufacturer || "";
      document.getElementById("quantity").value = item.quantity || "";
      document.getElementById("pricePerUnit").value = item.pricePerUnit || "";
      document.getElementById("expiryDate").value = item.expiryDate || "";
      document.getElementById("note").value = item.note || "";
      
      // Also set the medicine name input value
      const medicineNameInput = document.getElementById("medicineName");
      if (medicineNameInput) {
        medicineNameInput.value = medicineName;
      }
    }, 0);

    // Open modal
    const modal = new window.bootstrap.Modal(document.getElementById("drugModal"));
    modal.show();
  };

  // Listen for modal show event to clear form for new entry
  useEffect(() => {
    const modal = document.getElementById("drugModal");
    if (modal) {
      modal.addEventListener("show.bs.modal", () => {
        // Only clear form if not editing (inventoryId not set)
        const inventoryIdField = document.getElementById("inventoryId");
        if (!inventoryIdField || !inventoryIdField.value) {
          clearForm();
        }
      });
      
      modal.addEventListener("shown.bs.modal", () => {
        // Set medicine name input value directly after modal is shown
        const medicineNameInput = document.getElementById("medicineName");
        if (medicineNameInput && medicineQuery) {
          medicineNameInput.value = medicineQuery;
        }
      });
    }
    return () => {
      if (modal) {
        modal.removeEventListener("show.bs.modal", clearForm);
      }
    };
  }, []);

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medicineCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medicineType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "" || item.medicineCategory === filterCategory;
    const matchesType = filterType === "" || item.medicineType === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Loading state
  const isLoading = fetchStatus === "loading";
  const isAdding = addStatus === "loading";

  return (
    <>
      <div
        className="tab-pane fade show active"
        id="inventoryTab"
        role="tabpanel"
      >
        {/* Search & Filter Section */}
        <div className="row gx-2 gy-2 mb-3 align-items-center">
          <div className="col-sm-6 col-md-4">
            <input
              id="searchInput"
              type="search"
              className="form-control"
              placeholder="Search by category, type, batch or manufacturer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="col-sm-6 col-md-3">
            <select
              id="filterCategory"
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="ANTIBIOTIC">ANTIBIOTIC</option>
              <option value="ANALGESIC">ANALGESIC</option>
              <option value="SUPPLEMENT">SUPPLEMENT</option>
              <option value="ANTIPYRETIC">ANTIPYRETIC</option>
            </select>
          </div>

          <div className="col-sm-6 col-md-3">
            <select
              id="filterType"
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="TABLET">TABLET</option>
              <option value="SYRUP">SYRUP</option>
              <option value="INJECTION">INJECTION</option>
              <option value="OINTMENT">OINTMENT</option>
            </select>
          </div>

          <div className="col-auto ms-auto">
            <small className="text-muted me-3">
              Showing <span id="count">{filteredInventory.length}</span> items
            </small>
            <button
              className="btn btn-outline-primary btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#drugModal"
            >
              <i className="fa-solid fa-plus me-1"></i> Add / Update Stock
            </button>
          </div>
        </div>

        {/* Error Message */}
        {fetchError && (
          <div className="alert alert-danger mb-3">
            Error fetching inventory: {fetchError}
          </div>
        )}

        {/* Inventory Table */}
        <div className="table-responsive table-wrap print-area" id="printArea">
          <table
            className="table table-bordered table-hover mb-0 text-center"
            id="pharmaTable"
          >
            <thead className="table-light align-middle">
              <tr>
                <th>#</th>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Batch Number</th>
                <th>Manufacturer</th>
                <th>Quantity</th>
                <th>Price (₹)</th>
                <th>Expiry Date</th>
                <th>Note</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="py-4">
                    Loading...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-muted py-4">
                    No medicines in inventory. Click "Add / Update Stock" to add a new medicine.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item, index) => (
                  <tr key={item.inventoryId || index}>
                    <td>{index + 1}</td>
                    <td>{item.medicineName}</td>
                    <td>{item.medicineCategory}</td>
                    <td>{item.medicineType}</td>
                    <td>{item.batchNumber}</td>
                    <td>{item.manufacturer}</td>
                    <td>{item.quantity}</td>
                    <td>{item.pricePerUnit}</td>
                    <td>{item.expiryDate}</td>
                    <td>{item.note}</td>
                    <td className="no-print">
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => handleEdit(item)}
                      >
                        <i className="fa-solid fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          const id = item.inventoryId || item.id || item.InventoryId;
                          if (id) {
                            handleDelete(Number(id));
                          } else {
                            Swal.fire({
                              icon: "error",
                              title: "Invalid item",
                              text: "Cannot delete: Missing inventory ID",
                            });
                          }
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add / Update Medicine Modal */}
        <div className="modal fade" id="drugModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form id="drugForm" onSubmit={handleFormSubmit}>
                <div
                  className="modal-header"
                  style={{ backgroundColor: "#01C0C8", color: "white" }}
                >
                  <h5 className="modal-title" id="modalTitle">
                    <i className="fa-solid fa-pills me-2"></i> Add / Update Medicine Stock
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                  ></button>
                </div>

                <div className="modal-body">
                  {/* Hidden inventory ID field for editing */}
                  <input type="hidden" id="inventoryId" value="" />
                  
                  {/* Add Error Message */}
                  {addError && (
                    <div className="alert alert-danger mb-3">
                      Error: {addError}
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Medicine Name with Auto-suggestion */}
                    <div className="col-md-4 position-relative">
                      <label className="form-label">
                        Medicine Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="medicineName"
                        className="form-control"
                        placeholder="Search medicine name"
                        value={medicineQuery}
                        onChange={handleMedicineSearch}
                      />
                      {medicineSuggestions.length > 0 && (
                        <ul
                          className="list-group position-absolute w-100"
                          style={{
                            zIndex: 1000,
                            maxHeight: 200,
                            overflowY: "auto",
                          }}
                        >
                          {medicineSuggestions.map(([id, name]) => (
                            <li
                              key={id}
                              className="list-group-item list-group-item-action"
                              onClick={() => handleSelectMedicine(id, name)}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="fw-semibold">{name}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Category</label>
                      <select id="medicineCategory" className="form-select">
                        <option value="">Select Category</option>
                        <option value="ANTIBIOTIC">ANTIBIOTIC</option>
                        <option value="ANALGESIC">ANALGESIC</option>
                        <option value="SUPPLEMENT">SUPPLEMENT</option>
                        <option value="ANTIPYRETIC">ANTIPYRETIC</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Type</label>
                      <select id="medicineType" className="form-select">
                        <option value="">Select Type</option>
                        <option value="TABLET">TABLET</option>
                        <option value="SYRUP">SYRUP</option>
                        <option value="INJECTION">INJECTION</option>
                        <option value="OINTMENT">OINTMENT</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Batch Number</label>
                      <input
                        type="text"
                        id="batchNumber"
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Manufacturer</label>
                      <input
                        type="text"
                        id="manufacturer"
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        id="quantity"
                        className="form-control"
                        min={0}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Price (₹)</label>
                      <input
                        type="number"
                        id="pricePerUnit"
                        className="form-control"
                        step="0.01"
                        min={0}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="date"
                        id="expiryDate"
                        className="form-control"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Note</label>
                      <textarea
                        id="note"
                        className="form-control"
                        rows={2}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ backgroundColor: "#01C0C8", border: 0 }}
                    disabled={isAdding || !selectedMedicineId}
                  >
                    {isAdding ? (
                      <span>
                        <i className="fa-solid fa-spinner fa-spin me-1"></i>
                        Saving...
                      </span>
                    ) : (
                      <span>
                        <i className="fa-solid fa-floppy-disk me-1"></i> Save
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Inventory;
