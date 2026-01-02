import React from "react";

function Order() {
  const themeColor = "#01C0C8";

  return (
    <>
      <div>
        {/* ✅ ORDER TAB */}
        <div className="tab-pane fade show active" id="orderTab" role="tabpanel">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-semibold">
              <i className="fa-solid fa-pills me-2"></i> Medicine Orders
            </h5>
            <button
              className="btn btn-outline-primary btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#orderModal"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              <i className="fa-solid fa-plus me-1"></i> New Order
            </button>
          </div>

          {/* Sub-tabs */}
          <ul className="nav nav-pills mb-3" id="orderSubTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active"
                id="internal-tab"
                data-bs-toggle="pill"
                data-bs-target="#internalOrders"
                type="button"
                role="tab"
              >
                <i className="fa-solid fa-hospital-user me-1"></i> Internal Requisitions
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="external-tab"
                data-bs-toggle="pill"
                data-bs-target="#externalOrders"
                type="button"
                role="tab"
              >
                <i className="fa-solid fa-truck-medical me-1"></i> External Supplier Orders
              </button>
            </li>
          </ul>

          <div className="tab-content">
            {/* 🏥 Internal Requisitions */}
            <div className="tab-pane fade show active" id="internalOrders" role="tabpanel">
              <div className="table-responsive">
                <table className="table table-bordered table-hover mb-0" id="internalTable">
                  <thead className="table-light text-center align-middle">
                    <tr>
                      <th>#</th>
                      <th>Requisition ID</th>
                      <th>Department</th>
                      <th>Date</th>
                      <th>Requested By</th>
                      <th>Total Items</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>REQ-2025-011</td>
                      <td>Emergency</td>
                      <td>2025-11-05</td>
                      <td>Dr. Sharma</td>
                      <td>12</td>
                      <td>
                        <span className="badge bg-warning text-dark status-badge">
                          Requested
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-success me-2 approve-btn">
                          <i className="fa-solid fa-check me-1"></i> Approve
                        </button>
                        <button className="btn btn-sm btn-outline-secondary view-btn">
                          <i className="fa-regular fa-eye me-1"></i> View
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 🚚 External Supplier Orders */}
            <div className="tab-pane fade" id="externalOrders" role="tabpanel">
              <div className="table-responsive">
                <table className="table table-bordered table-hover mb-0" id="externalTable">
                  <thead className="table-light text-center align-middle">
                    <tr>
                      <th>#</th>
                      <th>Order ID</th>
                      <th>Supplier</th>
                      <th>Date</th>
                      <th>Total Items</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>ORD-2025-050</td>
                      <td>Medline Pharma</td>
                      <td>2025-11-04</td>
                      <td>32</td>
                      <td>
                        <span className="badge bg-warning text-dark status-badge">
                          Requested
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-success me-2 approve-btn">
                          <i className="fa-solid fa-check me-1"></i> Approve
                        </button>
                        <button className="btn btn-sm btn-outline-secondary view-btn">
                          <i className="fa-regular fa-eye me-1"></i> View
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 🆕 Create Order Modal */}
        <div
          className="modal fade"
          id="orderModal"
          tabIndex={-1}
          aria-labelledby="orderModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: themeColor }}
              >
                <h5 className="modal-title" id="orderModalLabel">
                  <i className="fa-solid fa-cart-plus me-2"></i> Create New Order
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                />
              </div>
              <div className="modal-body">
                <form id="newOrderForm">
                  <div className="mb-3">
                    <label className="form-label">Order Type</label>
                    <select className="form-select" id="orderType" required>
                      <option value="">Select Type</option>
                      <option value="internal">Internal Requisition</option>
                      <option value="external">External Supplier</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Department / Supplier Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="departmentSupplier"
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Medicine</label>
                    <input
                      type="text"
                      className="form-control"
                      id="medicine"
                      placeholder="Enter medicine name"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Requested By</label>
                    <input
                      type="text"
                      className="form-control"
                      id="requestedBy"
                      placeholder="Enter requester name"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Total Items</label>
                    <input
                      type="number"
                      className="form-control"
                      id="totalValue"
                      placeholder="e.g. 10"
                      required
                    />
                  </div>
                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn"
                      style={{ backgroundColor: themeColor, color: "#fff" }}
                    >
                      <i className="fa-solid fa-plus me-1"></i> Add Order
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 View Order Modal */}
        <div className="modal fade" id="viewOrderModal" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: themeColor }}
              >
                <h5 className="modal-title">
                  <i className="fa-regular fa-eye me-2"></i> Order Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                />
              </div>
              <div className="modal-body" id="viewOrderBody" />
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: themeColor, color: "#fff" }}
                  id="editOrderBtn"
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
    </>
  );
}

export default Order;
