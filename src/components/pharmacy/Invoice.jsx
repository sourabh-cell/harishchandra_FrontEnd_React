import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPharmacyInvoices,
  selectPharmacyInvoices,
  selectPharmacyInvoicesStatus,
  selectPharmacyInvoicesError,
} from "../../features/pharmacyInvoiceSlice";

function Invoice() {
  const dispatch = useDispatch();
  const invoices = useSelector(selectPharmacyInvoices);
  const fetchStatus = useSelector(selectPharmacyInvoicesStatus);
  const fetchError = useSelector(selectPharmacyInvoicesError);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const themeColor = "#01C0C8";

  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchPharmacyInvoices());
    }
  }, [fetchStatus, dispatch]);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("invoicePrintContent").innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${selectedInvoice?.invoiceId || ""}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @page { margin: 0.5cm; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 15px;
              font-size: 14px;
            }
            .invoice-header {
              text-align: center;
              border-bottom: 2px solid #01C0C8;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .hospital-name {
              font-size: 24px;
              font-weight: bold;
              color: #01C0C8;
              margin-bottom: 5px;
            }
            .hospital-address {
              font-size: 12px;
              color: #666;
            }
            .invoice-info {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .invoice-info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .invoice-info-row:last-child {
              margin-bottom: 0;
            }
            .invoice-info-label {
              font-weight: 600;
              color: #333;
            }
            .items-table th {
              background-color: #01C0C8;
              color: white;
              text-align: center;
            }
            .items-table td {
              vertical-align: middle;
            }
            .total-row {
              background-color: #e8f5e9;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 11px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="tab-content">
      <div className="tab-pane fade show active" id="invoiceTab" role="tabpanel">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 fw-semibold">
            <i className="fa-solid fa-file-invoice-dollar me-2"></i> Pharmacy Invoices
          </h5>
        </div>

        {/* Scrollable Table Container */}
        <div className="table-responsive table-wrap" style={{ maxHeight: 500, overflow: "auto" }}>
          <table className="table table-bordered table-hover mb-0">
            <thead
              className="text-center align-middle"
              style={{ backgroundColor: themeColor, color: "#fff", position: "sticky", top: 0, zIndex: 1 }}
            >
              <tr>
                <th>#</th>
                <th>Invoice ID</th>
                <th>Customer Name</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Discount</th>
                <th>Payable Amount</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetchStatus === "loading" && (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}
              {fetchStatus === "failed" && (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-danger">
                    {fetchError || "Failed to load invoices"}
                  </td>
                </tr>
              )}
              {fetchStatus === "succeeded" && invoices.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No invoices found
                  </td>
                </tr>
              )}
              {fetchStatus === "succeeded" &&
                invoices.map((invoice, index) => (
                  <tr key={invoice.id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">{invoice.invoiceId}</td>
                    <td>{invoice.customerName}</td>
                    <td>{invoice.doctorName}</td>
                    <td className="text-center">{invoice.invoiceDate}</td>
                    <td className="text-end">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="text-end">{formatCurrency(invoice.discount)}</td>
                    <td className="text-end fw-bold">{formatCurrency(invoice.payableAmount)}</td>
                    <td className="text-center no-print">
                      <button
                        className="btn btn-sm btn-info text-white"
                        data-bs-toggle="modal"
                        data-bs-target="#viewInvoiceModal"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* View Invoice Modal */}
        <div className="modal fade" id="viewInvoiceModal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div
                className="modal-header"
                style={{ backgroundColor: themeColor, color: "#fff" }}
              >
                <h5 className="modal-title">
                  <i className="fa-solid fa-file-invoice me-2"></i> Invoice Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-0">
                {selectedInvoice ? (
                  <div id="invoicePrintContent">
                    {/* Invoice Header */}
                    <div className="invoice-header" style={{ backgroundColor: "#f8f9fa", padding: "20px", margin: 0 }}>
                      <div className="hospital-name">HARISHCHANDRA HOSPITAL</div>
                      <div className="hospital-address">
                        Near City Center, Main Road, Mumbai - 400001<br />
                        Phone: +91 98765 43210 | Email: info@harishchandra.com
                      </div>
                    </div>

                    {/* Invoice Title */}
                    <div style={{ textAlign: "center", margin: "15px 20px" }}>
                      <h4 style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "5px", color: themeColor }}>
                        PHARMACY INVOICE
                      </h4>
                    </div>

                    {/* Invoice Info */}
                    <div className="invoice-info" style={{ margin: "0 20px 15px 20px" }}>
                      <div className="invoice-info-row">
                        <span><span className="invoice-info-label">Invoice ID:</span> {selectedInvoice.invoiceId}</span>
                        <span><span className="invoice-info-label">Date:</span> {selectedInvoice.invoiceDate}</span>
                      </div>
                      <div className="invoice-info-row">
                        <span><span className="invoice-info-label">Customer:</span> {selectedInvoice.customerName}</span>
                        <span><span className="invoice-info-label">Doctor:</span> {selectedInvoice.doctorName}</span>
                      </div>
                      <div className="invoice-info-row">
                        <span className="invoice-info-label">Address:</span> {selectedInvoice.customerAddress}
                      </div>
                    </div>

                    {/* Items Table */}
                    <div style={{ margin: "0 20px 15px 20px" }}>
                      <table className="table table-bordered table-sm items-table" style={{ marginBottom: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ width: "50px", textAlign: "center" }}>#</th>
                            <th>Medicine Name</th>
                            <th style={{ width: "80px", textAlign: "center" }}>Qty</th>
                            <th style={{ width: "120px", textAlign: "right" }}>Unit Price</th>
                            <th style={{ width: "120px", textAlign: "right" }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                            selectedInvoice.items.map((item, index) => (
                              <tr key={index}>
                                <td style={{ textAlign: "center" }}>{index + 1}</td>
                                <td>{item.itemName}</td>
                                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                                <td style={{ textAlign: "right" }}>{formatCurrency(item.unitPrice)}</td>
                                <td style={{ textAlign: "right" }}>{formatCurrency(item.amount)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center">
                                No items
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="4" className="text-end fw-bold">Total Amount</td>
                            <td className="text-end fw-bold">{formatCurrency(selectedInvoice.totalAmount)}</td>
                          </tr>
                          <tr>
                            <td colSpan="4" className="text-end">Discount</td>
                            <td className="text-end">{formatCurrency(selectedInvoice.discount)}</td>
                          </tr>
                          <tr className="total-row">
                            <td colSpan="4" className="text-end fw-bold">Payable Amount</td>
                            <td className="text-end fw-bold">{formatCurrency(selectedInvoice.payableAmount)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Footer */}
                    <div className="footer" style={{ backgroundColor: "#f8f9fa", padding: "15px", textAlign: "center", fontSize: "11px", color: "#666", borderTop: "1px solid #ddd" }}>
                      Thank you for choosing HarishChandra Hospital<br />
                      Powered by HarishChandra Hospital Management System
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">No invoice data available</p>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ backgroundColor: "#f8f9fa", borderTop: "1px solid #ddd" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: themeColor, color: "#fff" }}
                  onClick={handlePrint}
                >
                  <i className="fa-solid fa-print me-1"></i> Print
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
