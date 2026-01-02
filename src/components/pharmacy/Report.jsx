import React, { useEffect } from "react";

const Report = () => {
  useEffect(() => {
    const selector = document.getElementById("reportSelector");
    const sections = document.querySelectorAll(".report-section");

    // Show selected report section
    selector?.addEventListener("change", (e) => {
      sections.forEach((s) => s.classList.add("d-none"));
      const selected = document.getElementById(e.target.value);
      if (selected) selected.classList.remove("d-none");
    });
  }, []);

  const themeColor = "#01C0C8";

  return (
    <div className="tab-pane fade show" id="reportTab" role="tabpanel">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-semibold">
          <i
            className="fa-solid fa-chart-column me-2"
            style={{ color: themeColor }}
          ></i>
          Pharmacy Reports
        </h5>
        <select id="reportSelector" className="form-select w-auto">
          <option selected disabled>
            Select Report Type
          </option>
          <option value="stockReports">Stock Reports</option>
          <option value="dispensedMedicines">Dispensed Medicines</option>
          <option value="returnedMedicines">Returned Medicines</option>
          <option value="financialSummary">Financial Summary</option>
        </select>
      </div>

      <div className="full-width-card card border-0 shadow-sm">
        <div className="card-body">
          {/* 📦 Stock Reports */}
          <div id="stockReports" className="report-section d-none">
            <h6 className="fw-semibold mb-3" style={{ color: themeColor }}>
              <i className="fa-solid fa-boxes-stacked me-2"></i> Stock Reports
            </h6>
            <p className="text-muted small mb-2">
              View current stock levels, low stock alerts, and expired items.
            </p>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Medicine Name</th>
                    <th>Batch No</th>
                    <th>Qty in Stock</th>
                    <th>Expiry Date</th>
                    <th>Supplier</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Paracetamol 500mg</td>
                    <td>B1234</td>
                    <td>45</td>
                    <td>2026-02-15</td>
                    <td>HealthCare Distributors</td>
                    <td>
                      <span className="badge bg-success">
                        <i className="fa-solid fa-circle-check me-1"></i> In
                        Stock
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Amoxicillin 250mg</td>
                    <td>A1109</td>
                    <td>8</td>
                    <td>2025-12-30</td>
                    <td>Medline Pharma</td>
                    <td>
                      <span className="badge bg-danger">
                        <i className="fa-solid fa-triangle-exclamation me-1"></i>{" "}
                        Low Stock
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 💊 Dispensed Medicines */}
          <div id="dispensedMedicines" className="report-section d-none">
            <h6 className="fw-semibold mb-3" style={{ color: themeColor }}>
              <i className="fa-solid fa-pills me-2"></i> Dispensed Medicines
            </h6>
            <p className="text-muted small mb-2">
              Daily and monthly dispensing data of medicines.
            </p>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Medicine Name</th>
                    <th>Quantity</th>
                    <th>Doctor</th>
                    <th>Patient</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>2025-11-08</td>
                    <td>Cetrizine 10mg</td>
                    <td>20</td>
                    <td>Dr. Mehta</td>
                    <td>Ravi Kumar</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 🔁 Returned Medicines */}
          <div id="returnedMedicines" className="report-section d-none">
            <h6 className="fw-semibold mb-3" style={{ color: themeColor }}>
              <i className="fa-solid fa-rotate-left me-2"></i> Returned
              Medicines
            </h6>
            <p className="text-muted small mb-2">
              Track returned medicines with reasons and refund status.
            </p>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Medicine Name</th>
                    <th>Qty Returned</th>
                    <th>Reason</th>
                    <th>Refund Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>2025-11-02</td>
                    <td>Vitamin D3</td>
                    <td>10</td>
                    <td>Expired</td>
                    <td>
                      <span className="badge bg-success">
                        <i className="fa-solid fa-money-bill-transfer me-1"></i>{" "}
                        Refunded
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 💰 Financial Summary */}
          <div id="financialSummary" className="report-section d-none">
            <h6 className="fw-semibold mb-3" style={{ color: themeColor }}>
              <i className="fa-solid fa-coins me-2"></i> Financial Summary
            </h6>
            <p className="text-muted small mb-2">
              Revenue and expense overview from pharmacy billing.
            </p>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Date Range</th>
                    <th>Total Sales (₹)</th>
                    <th>Total Returns (₹)</th>
                    <th>Net Revenue (₹)</th>
                    <th>Profit Margin (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Nov 2025</td>
                    <td>₹1,25,000</td>
                    <td>₹5,200</td>
                    <td>₹1,19,800</td>
                    <td>18%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
