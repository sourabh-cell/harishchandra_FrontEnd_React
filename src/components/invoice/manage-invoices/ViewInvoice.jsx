import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";


const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [invoiceNo, setInvoiceNo] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get invoice data from navigation state or localStorage
    const invoiceData = location.state?.invoice || JSON.parse(localStorage.getItem("hospitalInvoice") || "null");
    
    if (!invoiceData) {
      alert("Invoice data not found!");
      navigate("/dashboard/invoice/manage-invoices");
      return;
    }

    setData(invoiceData);
    setInvoiceNo(invoiceData.id || Math.floor(Math.random() * 10000));
    setInvoiceDate(invoiceData.admissionDate ? new Date(invoiceData.admissionDate).toLocaleDateString() : new Date().toLocaleDateString());

    // Calculate totals from API response structure
    let sub = 0;
    
    // Doctors
    if (invoiceData.doctors && Array.isArray(invoiceData.doctors)) {
      invoiceData.doctors.forEach((doc) => (sub += doc.fee || 0));
    }
    
    // Pathology Tests
    if (invoiceData.pathologyTests && Array.isArray(invoiceData.pathologyTests)) {
      invoiceData.pathologyTests.forEach((test) => (sub += test.price || 0));
    }
    
    // Radiology Tests
    if (invoiceData.radiologyTests && Array.isArray(invoiceData.radiologyTests)) {
      invoiceData.radiologyTests.forEach((test) => (sub += test.price || 0));
    }
    
    // Medicines
    if (invoiceData.medicines && Array.isArray(invoiceData.medicines)) {
      invoiceData.medicines.forEach((med) => {
        const qty = med.qty || 0;
        const price = med.pricePerUnit || 0;
        sub += qty * price;
      });
    }
    
    // Rooms/Beds
    if (invoiceData.rooms && Array.isArray(invoiceData.rooms)) {
      invoiceData.rooms.forEach((room) => {
        const days = room.days || 0;
        const price = room.pricePerDay || 0;
        sub += days * price;
      });
    }

    // Use totalAmount from API if available, otherwise calculate
    if (invoiceData.totalAmount) {
      setTotal(invoiceData.totalAmount);
      setSubtotal(sub);
      // Calculate tax and discount if needed, or set to 0
      setTax(0);
      setDiscount(0);
    } else {
      const t = sub * 0.05;
      const d = sub * 0.1;
      setSubtotal(sub);
      setTax(t);
      setDiscount(d);
      setTotal(sub + t - d);
    }
    
    setLoading(false);
  }, [id, location.state, navigate]);

  const printInvoice = () => {
    window.print();
  };

  const goBack = () => {
    navigate("/dashboard/invoice/manage-invoices");
  };

  if (loading) {
    return (
      <div className="container my-3">
        <div className="card shadow">
          <div className="card-body text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Collect all items for rendering
  const allItems = [];
  let itemIndex = 1;

  // Doctors
  if (data.doctors && Array.isArray(data.doctors)) {
    data.doctors.forEach((doc) => {
      allItems.push({
        index: itemIndex++,
        name: `Doctor: ${doc.doctorName || doc.name}`,
        qty: 1,
        price: doc.fee || 0
      });
    });
  }

  // Pathology Tests
  if (data.pathologyTests && Array.isArray(data.pathologyTests)) {
    data.pathologyTests.forEach((test) => {
      allItems.push({
        index: itemIndex++,
        name: `Pathology Test: ${test.testName || test.name}`,
        qty: test.quantity || 1,
        price: test.price || 0
      });
    });
  }

  // Radiology Tests
  if (data.radiologyTests && Array.isArray(data.radiologyTests)) {
    data.radiologyTests.forEach((test) => {
      allItems.push({
        index: itemIndex++,
        name: `Radiology Test: ${test.testName || test.name}`,
        qty: test.quantity || 1,
        price: test.price || 0
      });
    });
  }

  // Medicines
  if (data.medicines && Array.isArray(data.medicines)) {
    data.medicines.forEach((med) => {
      allItems.push({
        index: itemIndex++,
        name: `Medicine: ${med.medicineName || med.name}`,
        qty: med.qty || 0,
        price: med.pricePerUnit || med.price || 0
      });
    });
  }

  // Rooms
  if (data.rooms && Array.isArray(data.rooms)) {
    data.rooms.forEach((room) => {
      allItems.push({
        index: itemIndex++,
        name: `Room: ${room.roomName || room.type}`,
        qty: room.days || 0,
        price: room.pricePerDay || room.price || 0
      });
    });
  }

  // Fallback for old data structure
  if (data.tests && Array.isArray(data.tests)) {
    data.tests.forEach((test) => {
      allItems.push({
        index: itemIndex++,
        name: `Test: ${test.testName || test.name}`,
        qty: 1,
        price: test.price || 0
      });
    });
  }

  if (data.beds && Array.isArray(data.beds)) {
    data.beds.forEach((bed) => {
      allItems.push({
        index: itemIndex++,
        name: `Room: ${bed.type}`,
        qty: bed.days || 0,
        price: bed.price || 0
      });
    });
  }

  return (
    <div className="container my-3">
      {/* Print-only Hospital Name Header */}
      <div id="printHeader" style={{ display: "none" }}>
        Harishchandramedicity
      </div>

      <div className="card shadow-lg border-0 rounded-4" id="invoiceCard">
        {/* Header */}
        <div
          className="card-header text-white text-center fw-bold fs-4 py-3"
          style={{ backgroundColor: "#01C0C8" }}
        >
          <i className="fa-solid fa-hospital me-2"></i> Harishchandra Multi Speciality Hospital
        </div>

        <div className="card-body px-3 py-3">
          {/* Invoice Info */}
          <div className="text-center mb-3">
            <p className="mb-1">
              <strong>Invoice No:</strong> INV-<span id="invoiceNo">{invoiceNo}</span>
            </p>
            <p className="mb-0">
              <strong>Date:</strong> <span id="invoiceDate">{invoiceDate}</span>
            </p>
          </div>

          {/* Patient Details */}
          <h5 className="fw-semibold mt-3">
            <i className="fa-solid fa-user me-2 text-primary"></i>Patient Details
          </h5>
          <div id="patientDetails" className="mb-3">
            <p>
              <strong>Name:</strong> {data.patientName || data.name || "N/A"}
            </p>
            <p>
              <strong>Patient ID:</strong> {data.hospitalPatientId || data.patientId || "N/A"}
            </p>
            <p>
              <strong>Age:</strong> {data.patientAge || data.age || "N/A"}
            </p>
            <p>
              <strong>Contact:</strong> {data.patientContact || data.contact || "N/A"}
            </p>
            <p>
              <strong>Admission Date:</strong> {data.admissionDate || data.admission || "N/A"}
            </p>
            <p>
              <strong>Discharge Date:</strong> {data.dischargeDate || data.discharge || "N/A"}
            </p>
          </div>

          {/* Services & Medicines */}
          <h5 className="fw-semibold mt-2">
            <i className="fa-solid fa-stethoscope me-2 text-danger"></i>Services & Medicines
          </h5>
          <div className="table-responsive">
            <table className="table table-bordered text-center align-middle mb-3">
              <thead className="table-info">
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price (₹)</th>
                  <th>Total (₹)</th>
                </tr>
              </thead>
              <tbody id="invoiceItems">
                {allItems.map((item) => {
                  const itemTotal = item.qty * item.price;
                  return (
                    <tr key={item.index}>
                      <td>{item.index}</td>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td>₹{item.price.toFixed(2)}</td>
                      <td>₹{itemTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Payment Info and Summary */}
          <div className="row mt-2">
            <div className="col-md-6">
              <h5 className="fw-semibold">
                <i className="fa-solid fa-credit-card me-2 text-success"></i>Payment Info
              </h5>
              <p className="mb-1">
                <strong>Method:</strong> <span id="payMethod">{data.paymentMethod || data.method || "N/A"}</span>
              </p>
              <p className="mb-1">
                <strong>Status:</strong> <span id="payStatus">{data.paymentStatus || data.status || "N/A"}</span>
              </p>
            </div>
            <div className="col-md-6 text-end">
              <h5 className="fw-semibold">
                <i className="fa-solid fa-file-invoice-dollar me-2 text-warning"></i>Summary
              </h5>
              <p className="mb-1">
                <strong>Subtotal:</strong> ₹<span id="subtotal">{subtotal.toFixed(2)}</span>
              </p>
              {tax > 0 && (
                <p className="mb-1">
                  <strong>Tax (5%):</strong> ₹<span id="tax">{tax.toFixed(2)}</span>
                </p>
              )}
              {discount > 0 && (
                <p className="mb-1">
                  <strong>Discount (10%):</strong> ₹<span id="discount">{discount.toFixed(2)}</span>
                </p>
              )}
              <h4 className="fw-bold text-success mt-2">
                <strong>Total:</strong> ₹<span id="total">{total.toFixed(2)}</span>
              </h4>
            </div>
          </div>

          {/* Buttons */}
          <div className="text-center mt-3 no-print">
            <button
              className="btn px-4 py-2 fw-semibold"
              style={{ backgroundColor: "#01C0C8", color: "white" }}
              onClick={printInvoice}
            >
              <i className="fa-solid fa-print me-2"></i>Print Invoice
            </button>

            <button className="btn btn-secondary px-4 py-2 fw-semibold ms-2" onClick={goBack}>
              <i className="fa-solid fa-arrow-left me-2"></i>Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoice;
