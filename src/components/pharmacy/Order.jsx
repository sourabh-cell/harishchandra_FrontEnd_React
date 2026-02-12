import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchAllOrders, 
  selectAllOrders, 
  selectAllOrdersFetchStatus, 
  selectAllOrdersFetchError,
  createOrder,
  selectOrderCreateStatus,
  selectOrderCreateError,
  updateOrder,
  selectOrderUpdateStatus,
  selectOrderUpdateError,
  updateOrderStatus,
  processReceivedOrder
} from "../../features/pharmacyOrderSlice";
import { fetchAllMedicines, selectMedicines } from "../../features/medicineSlice";
import { fetchPharmacistNameIds, selectPharmacistNameIds } from "../../features/commanSlice";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

function Order() {
  const dispatch = useDispatch();
  const orders = useSelector(selectAllOrders);
  const fetchStatus = useSelector(selectAllOrdersFetchStatus);
  const fetchError = useSelector(selectAllOrdersFetchError);
  const createStatus = useSelector(selectOrderCreateStatus);
  const createError = useSelector(selectOrderCreateError);
  const medicinesList = useSelector(selectMedicines);
  const pharmacistList = useSelector(selectPharmacistNameIds);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [medicines, setMedicines] = useState([{ medicineName: "", quantity: 1 }]);
  const [medicineSearchQueries, setMedicineSearchQueries] = useState([]);
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [requestedByQuery, setRequestedByQuery] = useState("");
  const [requestedBySuggestions, setRequestedBySuggestions] = useState([]);
  const [selectedPharmacistId, setSelectedPharmacistId] = useState(null);
  const [receivedItems, setReceivedItems] = useState([]);
  const [supplierName, setSupplierName] = useState("");
  const [notes, setNotes] = useState("");
  const themeColor = "#01C0C8";

  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(fetchAllMedicines());
    dispatch(fetchPharmacistNameIds());
  }, [dispatch]);

  // Reset form when modal is closed
  useEffect(() => {
    const orderModal = document.getElementById('orderModal');
    if (orderModal) {
      orderModal.addEventListener('hidden.bs.modal', () => {
        resetForm();
      });
    }
    return () => {
      if (orderModal) {
        orderModal.removeEventListener('hidden.bs.modal', resetForm);
      }
    };
  }, []);

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
    const medId = medicine.medicineId || medicine.id;
    const newMedicines = [...medicines];
    newMedicines[index] = { ...newMedicines[index], medicineName: medName, medicineId: medId };
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
    setSelectedPharmacistId(pharmacist.id || pharmacist.pharmacistId);
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
    
    // Set editing mode
    setIsEditing(true);
    
    // Pre-fill form with selected order data
    if (selectedOrder) {
      // Set supplier name
      setSupplierName(selectedOrder.supplierName || "");
      
      // Set notes
      setNotes(selectedOrder.notes || "");
      
      // Set requested by pharmacist
      setRequestedByQuery(selectedOrder.pharmacistName || "");
      setSelectedPharmacistId(selectedOrder.pharmacistId || null);
      
      // Set medicines
      if (selectedOrder.items && selectedOrder.items.length > 0) {
        const orderMedicines = selectedOrder.items.map(item => ({
          medicineName: item.medicineName || "",
          medicineId: item.medicineId || item.id,
          quantity: item.quantity || 1
        }));
        setMedicines(orderMedicines);
        
        // Also set medicine search queries for display
        const queries = selectedOrder.items.map(item => item.medicineName || "");
        setMedicineSearchQueries(queries);
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

  const handleStatusClick = (order) => {
    Swal.fire({
      title: "Confirm Status Change",
      text: `Do you want to request this order?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: themeColor,
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, request it!",
      cancelButtonText: "Cancel"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(updateOrderStatus({ orderId: order.id, status: "REQUESTED" })).unwrap();
          
          Swal.fire({
            icon: "success",
            title: "Status Updated",
            text: "Order status has been updated to REQUESTED",
            timer: 3000,
            showConfirmButton: false
          });
          
          // Refresh orders
          dispatch(fetchAllOrders());
        } catch (error) {
          console.error("Error updating status:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error?.message || "Failed to update order status"
          });
        }
      }
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    // Get form values from state
    const supplierNameValue = supplierName;
    const notesValue = notes;
    
    // Validate
    if (!supplierNameValue) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter supplier name"
      });
      return;
    }
    
    if (!requestedByQuery) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please select a pharmacist"
      });
      return;
    }
    
    const validMedicines = medicines.filter(med => med.medicineName && med.quantity > 0 && med.medicineId);
    
    if (validMedicines.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please select medicines from the suggestions list"
      });
      return;
    }
    
    // Build payload - use selectedPharmacistId if available, otherwise find by name
    let pharmacistId = selectedPharmacistId;
    if (!pharmacistId) {
      const foundPharmacist = pharmacistList.find(p => 
        (p.name || p.pharmacistName || p.firstName) === requestedByQuery
      );
      pharmacistId = foundPharmacist?.id || 1;
    }
    
    const payload = {
      supplierName: supplierNameValue,
      notes: notesValue || "",
      pharmacistId: pharmacistId,
      items: validMedicines.map(med => ({
        medicineId: med.medicineId,
        medicineName: med.medicineName,
        quantity: med.quantity
      }))
    };
    
    console.log(isEditing ? "Updating order:" : "Creating order:", payload);
    
    try {
      if (isEditing && selectedOrder) {
        // Update existing order
        await dispatch(updateOrder({ orderId: selectedOrder.id, orderData: payload })).unwrap();
        
        Swal.fire({
          icon: "success",
          title: "Order Updated",
          text: "Pharmacy order updated successfully!",
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        // Create new order
        await dispatch(createOrder(payload)).unwrap();
        
        Swal.fire({
          icon: "success",
          title: "Order Created",
          text: "Pharmacy order created successfully!",
          timer: 3000,
          showConfirmButton: false
        });
      }
      
      // Close modal
      const modal = document.getElementById('orderModal');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        } else {
          modal.classList.remove('show');
          modal.style.display = 'none';
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
        }
      }
      
      // Reset form
      resetForm();
      
      // Refresh orders
      dispatch(fetchAllOrders());
    } catch (error) {
      console.error(isEditing ? "Error updating order:" : "Error creating order:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || (isEditing ? "Failed to update order" : "Failed to create order")
      });
    }
  };

  const resetForm = () => {
    setMedicines([{ medicineName: "", quantity: 1 }]);
    setRequestedByQuery("");
    setMedicineSearchQueries([]);
    setMedicineSuggestions([]);
    setRequestedBySuggestions([]);
    setSelectedPharmacistId(null);
    setIsEditing(false);
    setSelectedOrder(null);
    setSupplierName("");
    setNotes("");
  };

  const handleNewOrderClick = () => {
    resetForm();
  };

  const handleReceivedOrder = (order) => {
    setSelectedOrder(order);
    
    // Initialize received items with order items
    const initialReceivedItems = (order.items || []).map(item => ({
      medicineName: item.medicineName || "",
      medicineId: item.medicineId || item.id,
      orderedQuantity: item.quantity || 0,
      receivedQuantity: item.quantity || 0,
      batchNo: "",
      expireDate: "",
      manufactureDate: "",
      manufacturer: "",
      pricePerUnit: ""
    }));
    
    setReceivedItems(initialReceivedItems);
    
    // Open received modal
    setTimeout(() => {
      const receivedModal = document.getElementById('receivedModal');
      if (receivedModal) {
        const bsReceivedModal = new bootstrap.Modal(receivedModal);
        bsReceivedModal.show();
      }
    }, 100);
  };

  const handleReceivedItemChange = (index, field, value) => {
    const updated = [...receivedItems];
    updated[index] = { ...updated[index], [field]: value };
    setReceivedItems(updated);
  };

  const handleSubmitReceived = async (e) => {
    e.preventDefault();
    
    // Get received date
    const receivedDate = document.getElementById('receivedDate').value;
    
    // Validate received items
    const hasInvalidItems = receivedItems.some(item => 
      !item.batchNo || !item.expireDate || !item.receivedQuantity
    );
    
    if (hasInvalidItems) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in all required fields for each medicine"
      });
      return;
    }
    
    // Build payload - backend expects array directly
    const payload = receivedItems.map(item => ({
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      batchNumber: item.batchNo,
      expiryDate: item.expireDate,
      manufactureDate: item.manufactureDate || null,
      manufacturer: item.manufacturer || "",
      pricePerUnit: parseFloat(item.pricePerUnit) || 0,
      receivedQuantity: parseInt(item.receivedQuantity) || 0,
      receivedDate: receivedDate
    }));
    
    console.log("Submitting received items:", payload);
    
    try {
      await dispatch(processReceivedOrder({ orderId: selectedOrder.id, receivedData: payload })).unwrap();
      
      Swal.fire({
        icon: "success",
        title: "Items Received",
        text: "Medicine items have been received successfully!",
        timer: 3000,
        showConfirmButton: false
      });
      
      // Close modal
      const modal = document.getElementById('receivedModal');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        } else {
          modal.classList.remove('show');
          modal.style.display = 'none';
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
        }
      }
      
      // Refresh orders
      dispatch(fetchAllOrders());
    } catch (error) {
      console.error("Error submitting received items:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to submit received items"
      });
    }
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
              onClick={handleNewOrderClick}
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
                          <span 
                            className={`badge ${getStatusBadge(order.status)} status-badge`}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleStatusClick(order)}
                            title="Click to change status"
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleReceivedOrder(order)}
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
                  <i className={`fa-solid ${isEditing ? 'fa-pen-to-square' : 'fa-cart-plus'} me-2`}></i>
                  {isEditing ? 'Update Order' : 'Create New Order'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                />
              </div>
              <div className="modal-body">
                <form id="newOrderForm" onSubmit={handleSubmitOrder}>
                  <div className="mb-3">
                    <label className="form-label">Supplier Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="departmentSupplier"
                      placeholder="Enter name"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
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
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
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
                      <i className={`fa-solid ${isEditing ? 'fa-check' : 'fa-plus'} me-1`}></i>
                      {isEditing ? 'Update Order' : 'Create Order'}
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

        {/* 📦 Received Order Modal */}
        <div className="modal fade" id="receivedModal" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: themeColor }}
              >
                <h5 className="modal-title">
                  <i className="fa-solid fa-clipboard-check me-2"></i> Receive Medicine Items
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
                        <strong>Received Date:</strong>
                        <input
                          type="date"
                          className="form-control mt-1"
                          id="receivedDate"
                          defaultValue={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <hr />
                    <form id="receivedForm" onSubmit={handleSubmitReceived}>
                      {receivedItems.map((item, index) => (
                        <div key={index} className="card mb-3">
                          <div className="card-body">
                            <h6 className="card-title mb-3">
                              <i className="fa-solid fa-pills me-2"></i>
                              {item.medicineName}
                              <span className="badge bg-info text-dark ms-2">
                                Ordered: {item.orderedQuantity}
                              </span>
                            </h6>
                            <div className="row">
                              <div className="col-md-3 mb-2">
                                <label className="form-label">Batch No *</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={item.batchNo}
                                  onChange={(e) => handleReceivedItemChange(index, 'batchNo', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="col-md-3 mb-2">
                                <label className="form-label">Expire Date *</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={item.expireDate}
                                  onChange={(e) => handleReceivedItemChange(index, 'expireDate', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="col-md-3 mb-2">
                                <label className="form-label">Manufacture Date</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={item.manufactureDate}
                                  onChange={(e) => handleReceivedItemChange(index, 'manufactureDate', e.target.value)}
                                />
                              </div>
                              <div className="col-md-3 mb-2">
                                <label className="form-label">Manufacturer</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={item.manufacturer}
                                  onChange={(e) => handleReceivedItemChange(index, 'manufacturer', e.target.value)}
                                  placeholder="Enter manufacturer"
                                />
                              </div>
                              <div className="col-md-3 mb-2">
                                <label className="form-label">Price Per Unit</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={item.pricePerUnit}
                                  onChange={(e) => handleReceivedItemChange(index, 'pricePerUnit', e.target.value)}
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="col-md-3 mb-2">
                                <label className="form-label">Received Quantity *</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={item.receivedQuantity}
                                  onChange={(e) => handleReceivedItemChange(index, 'receivedQuantity', e.target.value)}
                                  min="1"
                                  max={item.orderedQuantity}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-end mt-3">
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
                          <i className="fa-solid fa-check me-1"></i> Submit Received Items
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Order;
