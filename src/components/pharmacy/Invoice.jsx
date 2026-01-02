import React from "react";

function Invoice() {
  const themeColor = "#01C0C8";

  return (
    <div className="tab-content">
      <div className="tab-pane fade show active" id="invoiceTab" role="tabpanel">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 fw-semibold">
            <i className="fa-solid fa-file-invoice-dollar me-2"></i> Invoices & Billing
          </h5>
          <button
            className="btn btn-outline-primary btn-sm"
            style={{ borderColor: themeColor, color: themeColor }}
            data-bs-toggle="modal"
            data-bs-target="#invoiceModal"
          >
            <i className="fa-solid fa-plus me-1"></i> New Invoice
          </button>
        </div>

        {/* Scrollable Table Container */}
        <div className="table-responsive table-wrap" style={{ maxHeight: 400, overflow: "auto" }}>
          <table className="table table-bordered table-hover mb-0">
            <thead
              className="text-center align-middle"
              style={{ backgroundColor: themeColor, color: "#fff" }}
            >
              <tr>
                <th>#</th>
                <th>Invoice ID</th>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Date</th>
                <th>Subtotal (₹)</th>
                <th>Discount (%)</th>
                <th>GST (%)</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody id="invoiceTableBody"></tbody>
          </table>
        </div>

        {/* 🧾 New Invoice Modal */}
        <div className="modal fade" id="invoiceModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <form id="invoiceForm">
                <div
                  className="modal-header"
                  style={{ backgroundColor: themeColor, color: "#fff" }}
                >
                  <h5 className="modal-title fw-semibold">
                    <i className="fa-solid fa-receipt me-2"></i> Generate Pharmacy Bill
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    data-bs-dismiss="modal"
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Invoice ID</label>
                      <input
                        type="text"
                        id="invoiceId"
                        className="form-control"
                        placeholder="e.g. INV001"
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Patient ID</label>
                      <input
                        type="text"
                        id="patientId"
                        className="form-control"
                        placeholder="e.g. PT1001"
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Patient Name</label>
                      <input
                        type="text"
                        id="patientName"
                        className="form-control"
                        placeholder="e.g. Ramesh Kumar"
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Date</label>
                      <input type="date" id="invoiceDate" className="form-control" required />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Subtotal (₹)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          id="subtotal"
                          className="form-control"
                          placeholder="0"
                          readOnly
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          data-bs-toggle="modal"
                          data-bs-target="#calcModal"
                        >
                          <i className="fa-solid fa-calculator"></i>
                        </button>
                      </div>
                    </div>

                    <div className="col-md-2">
                      <label className="form-label">Discount (%)</label>
                      <input
                        type="number"
                        id="discount"
                        className="form-control"
                        defaultValue={0}
                        min={0}
                        max={100}
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label">GST (%)</label>
                      <input
                        type="number"
                        id="gst"
                        className="form-control"
                        defaultValue={18}
                        min={0}
                        max={28}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">GST No.</label>
                      <input
                        type="text"
                        id="gstNo"
                        className="form-control"
                        placeholder="e.g. 27ABCDE1234F1Z5"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Final Total (₹)</label>
                      <input
                        type="text"
                        id="finalTotal"
                        className="form-control fw-bold text-success"
                        readOnly
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Status</label>
                      <select
                        id="invoiceStatus"
                        className="form-select"
                        defaultValue="Paid"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        id="invoiceNotes"
                        className="form-control"
                        rows={2}
                        placeholder="Remarks or billing details..."
                      ></textarea>
                    </div>

                    {/* Medicine Table */}
                    <div className="col-12 mt-3">
                      <h6>
                        <i className="fa-solid fa-pills me-2"></i> Medicines
                      </h6>
                      <table className="table table-bordered" id="medicineTable">
                        <thead
                          style={{ backgroundColor: themeColor, color: "#fff" }}
                        >
                          <tr>
                            <th>Name</th>
                            <th>Qty</th>
                            <th>Price (₹)</th>
                            <th>Total (₹)</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody></tbody>
                      </table>
                      <div className="d-flex gap-2">
                        <input
                          type="text"
                          id="medName"
                          className="form-control"
                          placeholder="Medicine Name"
                        />
                        <input
                          type="number"
                          id="medQty"
                          className="form-control"
                          placeholder="Qty"
                        />
                        <input
                          type="number"
                          id="medPrice"
                          className="form-control"
                          placeholder="Price"
                        />
                        <button
                          type="button"
                          className="btn"
                          style={{ backgroundColor: themeColor, color: "#fff" }}
                        >
                          <i className="fa-solid fa-plus"></i> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer justify-content-center">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    style={{ backgroundColor: themeColor, color: "#fff" }}
                  >
                    <i className="fa-solid fa-file-invoice-dollar me-1"></i> Generate Bill
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 🧮 Calculator Modal */}
        <div className="modal fade" id="calcModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div
                className="modal-header"
                style={{ backgroundColor: themeColor, color: "#fff" }}
              >
                <h6 className="modal-title">
                  <i className="fa-solid fa-calculator me-2"></i> Quick Calculator
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  id="calcDisplay"
                  className="form-control mb-3 text-end fs-5"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* View Invoice Modal */}
        <div className="modal fade" id="viewInvoiceModal" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div
                className="modal-header"
                style={{ backgroundColor: themeColor, color: "#fff" }}
              >
                <h5 className="modal-title">
                  <i className="fa-solid fa-eye me-2"></i> Invoice Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body" id="viewInvoiceBody"></div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: themeColor, color: "#fff" }}
                >
                  <i className="fa-solid fa-print me-1"></i> Print
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: themeColor, color: "#fff" }}
                >
                  <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoice;
