import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders, selectAllOrders, selectAllOrdersFetchStatus, selectAllOrdersFetchError } from "../../features/pharmacyOrderSlice";
import { fetchAllMedicines, selectMedicines } from "../../features/medicineSlice";
import { fetchPharmacistNameIds, selectPharmacistNameIds } from "../../features/commanSlice";

function Order() {
  const dispatch = useDispatch();
  const orders = useSelector(selectAllOrders);
  const fetchStatus = useSelector(selectAllOrdersFetchStatus);
  const fetchError = useSelector(selectAllOrdersFetchError);
  const medicinesList = useSelector(selectMedicines);
  const pharmacistList = useSelector(selectPharmacistNameIds);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [medicines, setMedicines] = useState([{ medicineName: "", quantity: 1 }]);
  const [medicineSearchQueries, setMedicineSearchQueries] = useState([]);
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [requestedByQuery, setRequestedByQuery] = useState("");
  const [requestedBySuggestions, setRequestedBySuggestions] = useState([]);
  const themeColor = "#01C0C8";

  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(fetchAllMedicines());
    dispatch(fetchPharmacistNameIds());
  }, [dispatch]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const addMedicineField = () => {
    setMedicines([...medicines, { medicineName: "", quantity: 1 }]);
  };

  const removeMedicineField = (index) => {
    if (medicines.length > 1) {
      const newMedicines = medicines.filter((_, i) => i !== index);
      setMedicines(newMedicines);
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setMedicines(newMedicines);

    // Handle medicine search
    if (field === 'medicineName') {
      setMedicineSearchQueries(prev => {
        const updated = [...prev];
        updated[index] = value;
        return updated;
      });

      if (!value) {
        setMedicineSuggestions(prev => {
          const updated = [...prev];
          updated[index] = [];
          return updated;
        });
        return;
      }

      const lowerQuery = value.toLowerCase();
      const filtered = (medicinesList || []).filter((med) => {
        const medName = (med.medicineName || med.name || med).toLowerCase();
        return medName.includes(lowerQuery);
      });

      setMedicineSuggestions(prev => {
        const updated = [...prev];
        updated[index] = filtered.slice(0, 8);
        return updated;
      });
    }
  };

  // Handle medicine selection from suggestions
  const handleSelectMedicine = (index, medicine) => {
    const medName = medicine.medicineName || medicine.name || medicine;
    const newMedicines = [...medicines];
    newMedicines[index] = { ...newMedicines[index], medicineName: medName };
    setMedicines(newMedicines);
    
    setMedicineSearchQueries(prev => {
      const updated = [...prev];
      updated[index] = medName;
      return updated;
    });

    setMedicineSuggestions(prev => {
      const updated = [...prev];
      updated[index] = [];
      return updated;
    });
  };

  // Handle requested by pharmacist search
  const handleRequestedBySearch = (e) => {
    const query = e.target.value;
    setRequestedByQuery(query);

    console.log("Pharmacist list:", pharmacistList);
    console.log("Search query:", query);

    if (!query) {
      setRequestedBySuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = (pharmacistList || []).filter((pharm) => {
      // Handle different field names
      const pharmName = (pharm.name || pharm.pharmacistName || pharm.firstName || "").toLowerCase();
      return pharmName.includes(lowerQuery);
    });

    console.log("Filtered pharmacists:", filtered);
    setRequestedBySuggestions(filtered.slice(0, 8));
  };

  // Handle requested by pharmacist selection
  const handleSelectRequestedBy = (pharmacist) => {
    // Handle different field names
    const pharmName = pharmacist.name || pharmacist.pharmacistName || pharmacist.firstName || "";
    setRequestedByQuery(pharmName);
    setRequestedBySuggestions([]);
    console.log("Selected pharmacist:", pharmacist);
  };

  const handleEditOrder = () => {
    // Close view modal and open edit (create) modal
    const viewModal = document.getElementById('viewOrderModal');
    if (viewModal) {
      const bsViewModal = bootstrap.Modal.getInstance(viewModal);
      if (bsViewModal) {
        bsViewModal.hide();
      }
    }
    // Open create modal after a small delay
    setTimeout(() => {
      const orderModal = document.getElementById('orderModal');
      if (orderModal) {
        const bsOrderModal = new bootstrap.Modal(orderModal);
        bsOrderModal.show();
      }
    }, 300);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: "bg-secondary",
      REQUESTED: "bg-warning text-dark",
      APPROVED: "bg-info text-dark",
      SHIPPED: "bg-primary",
      DELIVERED: "bg-success",
      CANCELLED: "bg-danger"
    };
    return statusColors[status] || "bg-secondary";
  };

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
          {/* Removed - only one order type now */}

          <div className="tab-content">
            {/* All Orders */}
            <div className="tab-pane fade show active" id="externalOrders" role="tabpanel">
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
                    {fetchStatus === "loading" && (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {fetchStatus === "failed" && (
                      <tr>
                        <td colSpan="7" className="text-center text-danger py-4">
                          {fetchError || "Failed to load orders"}
                        </td>
                      </tr>
                    )}
                    {fetchStatus === "succeeded" && orders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No orders found
                        </td>
                      </tr>
                    )}
                    {fetchStatus === "succeeded" && orders.map((order, index) => (
                      <tr key={order.id}>
                        <td>{index + 1}</td>
                        <td>{order.requisitionNumber}</td>
                        <td>{order.supplierName}</td>
                        <td>{order.orderDate}</td>
                        <td>{order.items?.length || 0}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(order.status)} status-badge`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleViewOrder(order)}
                            data-bs-toggle="modal"
                            data-bs-target="#viewOrderModal"
                          >
                            <i className="fa-solid fa-clipboard-check me-1"></i> Received
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleViewOrder(order)}
                            data-bs-toggle="modal"
                            data-bs-target="#viewOrderModal"
                          >
                            <i className="fa-regular fa-eye me-1"></i> View
                          </button>
                        </td>
                      </tr>
                    ))}
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
                    <label className="form-label">Supplier Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="departmentSupplier"
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">Medicines</label>
                    {medicines.map((medicine, index) => (
                      <div key={index} className="mb-2">
                        <div className="d-flex gap-2">
                          <div className="position-relative flex-grow-1">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search medicine name"
                              value={medicineSearchQueries[index] || medicine.medicineName}
                              onChange={(e) => handleMedicineChange(index, 'medicineName', e.target.value)}
                              required
                            />
                            {medicineSuggestions[index]?.length > 0 && (
                              <ul
                                className="list-group position-absolute w-100"
                                style={{
                                  zIndex: 1000,
                                  maxHeight: 200,
                                  overflowY: 'auto',
                                  marginTop: '2px'
                                }}
                              >
                                {medicineSuggestions[index].map((med) => (
                                  <li
                                    key={med.medicineId || med.id}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => handleSelectMedicine(index, med)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="fw-semibold">{med.medicineName || med.name || med}</div>
                                    {med.strength && (
                                      <div className="small text-muted">{med.strength}</div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Qty"
                            style={{ width: "100px" }}
                            min="1"
                            value={medicine.quantity}
                            onChange={(e) => handleMedicineChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            required
                          />
                          {medicines.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => removeMedicineField(index)}
                            >
                              <i className="fa-solid fa-times"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm mt-2"
                      onClick={addMedicineField}
                    >
                      <i className="fa-solid fa-plus me-1"></i> Add Medicine
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Requested By</label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control"
                        id="requestedBy"
                        placeholder="Search pharmacist name"
                        value={requestedByQuery}
                        onChange={handleRequestedBySearch}
                        required
                      />
                      {requestedBySuggestions.length > 0 && (
                        <ul
                          className="list-group position-absolute w-100"
                          style={{
                            zIndex: 1000,
                            maxHeight: 200,
                            overflowY: 'auto',
                            marginTop: '2px'
                          }}
                        >
                          {requestedBySuggestions.map((pharm) => (
                            <li
                              key={pharm.id || pharm.pharmacistId}
                              className="list-group-item list-group-item-action"
                              onClick={() => handleSelectRequestedBy(pharm)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="fw-semibold">{pharm.name || pharm.pharmacistName || pharm.firstName}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      id="notes"
                      placeholder="Additional notes"
                      rows="2"
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
                      <i className="fa-solid fa-plus me-1"></i> Create Order
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
              <div className="modal-body">
                {selectedOrder && (
                  <div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Order ID:</strong> {selectedOrder.requisitionNumber}
                      </div>
                      <div className="col-6">
                        <strong>Order Date:</strong> {selectedOrder.orderDate}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <strong>Supplier:</strong> {selectedOrder.supplierName}
                      </div>
                      <div className="col-6">
                        <strong>Status:</strong>{" "}
                        <span className={`badge ${getStatusBadge(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>
                    {selectedOrder.notes && (
                      <div className="mb-3">
                        <strong>Notes:</strong> {selectedOrder.notes}
                      </div>
                    )}
                    <div className="mb-3">
                      <strong>Pharmacist:</strong> {selectedOrder.pharmacistName}
                    </div>
                    <hr />
                    <h6>Order Items:</h6>
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th className="text-center">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={index}>
                            <td>{item.medicineName}</td>
                            <td className="text-center">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: themeColor, color: "#fff" }}
                  id="editOrderBtn"
                  onClick={handleEditOrder}
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
