import React, { useState, useEffect } from "react"; 

const Inventory = () => {
  // Sample new medicine data to pre-fill in the form
  const sampleNewMedicine = {
    drugId: "DRG001",
    drugName: "Amoxicillin 500mg",
    drugCategory: "Antibiotic",
    drugType: "Tablet",
    drugManufacturer: "Cipla Ltd",
    drugBatch: "BT2024001",
    drugQty: 500,
    drugPrice: 2.5,
    drugExpiry: "2025-12-31",
    drugBarcode: "8901234567890",
    drugNotes: "Sample medicine for testing"
  };

  // State for inventory data
  const [inventory, setInventory] = useState([]);

  // Function to pre-fill form with sample medicine data
  const preFillForm = () => {
    document.getElementById("drugId").value = sampleNewMedicine.drugId;
    document.getElementById("drugName").value = sampleNewMedicine.drugName;
    document.getElementById("drugCategory").value = sampleNewMedicine.drugCategory;
    document.getElementById("drugType").value = sampleNewMedicine.drugType;
    document.getElementById("drugManufacturer").value = sampleNewMedicine.drugManufacturer;
    document.getElementById("drugBatch").value = sampleNewMedicine.drugBatch;
    document.getElementById("drugQty").value = sampleNewMedicine.drugQty;
    document.getElementById("drugPrice").value = sampleNewMedicine.drugPrice;
    document.getElementById("drugExpiry").value = sampleNewMedicine.drugExpiry;
    document.getElementById("drugBarcode").value = sampleNewMedicine.drugBarcode;
    document.getElementById("drugNotes").value = sampleNewMedicine.drugNotes;
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const newDrug = {
      id: document.getElementById("drugId").value,
      name: document.getElementById("drugName").value,
      category: document.getElementById("drugCategory").value,
      type: document.getElementById("drugType").value,
      manufacturer: document.getElementById("drugManufacturer").value,
      batch: document.getElementById("drugBatch").value,
      qty: document.getElementById("drugQty").value,
      price: document.getElementById("drugPrice").value,
      expiry: document.getElementById("drugExpiry").value,
      barcode: document.getElementById("drugBarcode").value
    };

    setInventory([...inventory, newDrug]);
    
    // Close modal
    const modal = document.getElementById("drugModal");
    const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) {
      bootstrapModal.hide();
    } else {
      const modalInstance = new window.bootstrap.Modal(modal);
      modalInstance.hide();
    }
    
    // Reset form
    document.getElementById("drugForm").reset();
  };

  // Listen for modal show event to pre-fill data
  useEffect(() => {
    const modal = document.getElementById("drugModal");
    if (modal) {
      modal.addEventListener("show.bs.modal", () => {
        preFillForm();
      });
    }
    return () => {
      if (modal) {
        modal.removeEventListener("show.bs.modal", preFillForm);
      }
    };
  }, []);

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
              placeholder="Search by name, ID, category or type"
            />
          </div>

          <div className="col-sm-6 col-md-3">
            <select id="filterCategory" className="form-select">
              <option value="">All Categories</option>
              <option>Antibiotic</option>
              <option>Analgesic</option>
              <option>Antipyretic</option>
              <option>Supplement</option>
            </select>
          </div>

          <div className="col-sm-6 col-md-3">
            <select id="filterType" className="form-select">
              <option value="">All Types</option>
              <option>Tablet</option>
              <option>Syrup</option>
              <option>Injection</option>
              <option>Ointment</option>
              <option>Capsule</option>
            </select>
          </div>

          <div className="col-auto ms-auto">
            <small className="text-muted me-3">
              Showing <span id="count">{inventory.length}</span> items
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

        {/* Inventory Table */}
        <div className="table-responsive table-wrap print-area" id="printArea">
          <table
            className="table table-bordered table-hover mb-0 text-center"
            id="pharmaTable"
          >
            <thead className="table-light align-middle">
              <tr>
                <th>#</th>
                <th>Drug ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Manufacturer</th>
                <th>Batch</th>
                <th>Qty</th>
                <th>Unit Price (₹)</th>
                <th>Expiry</th>
                <th>Barcode</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-muted py-4">
                    No medicines in inventory. Click "Add / Update Stock" to add a new medicine.
                  </td>
                </tr>
              ) : (
                inventory.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.type}</td>
                    <td>{item.manufacturer}</td>
                    <td>{item.batch}</td>
                    <td>{item.qty}</td>
                    <td>{item.price}</td>
                    <td>{item.expiry}</td>
                    <td>{item.barcode}</td>
                    <td className="no-print">
                      <button className="btn btn-sm btn-outline-primary me-1">
                        <i className="fa-solid fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
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
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Drug ID</label>
                      <input
                        type="text"
                        id="drugId"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        id="drugName"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Category</label>
                      <select id="drugCategory" className="form-select">
                        <option>Antibiotic</option>
                        <option>Analgesic</option>
                        <option>Antipyretic</option>
                        <option>Supplement</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Type</label>
                      <select id="drugType" className="form-select">
                        <option>Tablet</option>
                        <option>Syrup</option>
                        <option>Injection</option>
                        <option>Ointment</option>
                        <option>Capsule</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Manufacturer</label>
                      <input
                        type="text"
                        id="drugManufacturer"
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Batch No.</label>
                      <input
                        type="text"
                        id="drugBatch"
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        id="drugQty"
                        className="form-control"
                        min={0}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Unit Price (₹)</label>
                      <input
                        type="number"
                        id="drugPrice"
                        className="form-control"
                        step="0.01"
                        min={0}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="date"
                        id="drugExpiry"
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Barcode (Optional)</label>
                      <div className="input-group">
                        <input
                          type="text"
                          id="drugBarcode"
                          className="form-control"
                          placeholder="Scan or enter barcode"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          id="generateBarcode"
                        >
                          <i className="fa-solid fa-barcode"></i>
                        </button>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        id="drugNotes"
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
                  >
                    <i className="fa-solid fa-floppy-disk me-1"></i> Save
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
