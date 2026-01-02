import React from "react";

const Inventory = () => {
  return (
    <>
      <div
        className="tab-pane fade show active"
        id="inventoryTab"
        role="tabpanel"
      >
        {/* 🔍 Search & Filter Section */}
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
              Showing <span id="count">0</span> items
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

        {/* 🧾 Inventory Table */}
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
            <tbody></tbody>
          </table>
        </div>

        {/* 📦 Add / Update Medicine Modal */}
        <div className="modal fade" id="drugModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form id="drugForm">
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
