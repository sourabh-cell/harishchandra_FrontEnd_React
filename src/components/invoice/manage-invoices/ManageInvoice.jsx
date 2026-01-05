import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllInvoices, selectAllInvoices, selectFetchAllStatus } from "../../../features/InvoiceSlice";

const ManageInvoice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const invoices = useSelector(selectAllInvoices);
  const fetchStatus = useSelector(selectFetchAllStatus);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllInvoices());
  }, [dispatch]);

  const handleView = (invoice) => {
    navigate(`/dashboard/invoice/view-invoice/${invoice.id}`, { state: { invoice } });
  };

  const filteredInvoices = Array.isArray(invoices) ? invoices.filter(
    (invoice) =>
      invoice.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.hospitalPatientId?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.patientId?.toString().includes(search)
  ) : [];

  if (fetchStatus === "loading") {
    return (
      <div className="card shadow mb-4">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (fetchStatus === "failed") {
    return (
      <div className="card shadow mb-4">
        <div className="card-body text-center">
          <div className="alert alert-danger" role="alert">
            Failed to load invoices. Please try again.
          </div>
          <button className="btn btn-primary" onClick={() => dispatch(fetchAllInvoices())}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow mb-4">
      <div className="card-header text-center text-white" style={{ backgroundColor: "#01C0C8" }}>
        <h3 className="mb-0">
          <i className="fa-solid fa-file-invoice me-2"></i>Manage Invoices
        </h3>
      </div>
      <div className="card-body">
        <input
          type="text"
          id="searchInput"
          className="form-control mb-3"
          placeholder="Search by Patient Name, Hospital ID, or Patient ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No invoices found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Invoice ID</th>
                  <th>Patient Name</th>
                  <th>Hospital ID</th>
                  <th>Age</th>
                  <th>Contact</th>
                  <th>Admission Date</th>
                  <th>Discharge Date</th>
                  <th>Total Amount</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, i) => (
                  <tr key={invoice.id || i}>
                    <td>{i + 1}</td>
                    <td>{invoice.id}</td>
                    <td>{invoice.patientName || "N/A"}</td>
                    <td>{invoice.hospitalPatientId || "N/A"}</td>
                    <td>{invoice.patientAge || "N/A"}</td>
                    <td>{invoice.patientContact || "N/A"}</td>
                    <td>{invoice.admissionDate || "N/A"}</td>
                    <td>{invoice.dischargeDate || "N/A"}</td>
                    <td>₹{invoice.totalAmount?.toFixed(2) || "0.00"}</td>
                    <td>
                      <span className={`badge ${invoice.paymentMethod === "CASH" ? "bg-success" : invoice.paymentMethod === "ONLINE" ? "bg-info" : "bg-secondary"}`}>
                        {invoice.paymentMethod || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${invoice.paymentStatus === "PAID" ? "bg-success" : invoice.paymentStatus === "PENDING" ? "bg-warning" : "bg-danger"}`}>
                        {invoice.paymentStatus || "N/A"}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-info btn-sm view-btn" 
                        onClick={() => handleView(invoice)}
                        title="View Invoice"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageInvoice;
