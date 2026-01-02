import React from "react";
import img from "/assets/images/dashboard/Account.png";

const AccountantDashboard = () => {
 


   // ===== Dynamic Greeting Logic =====
  const currentHour = new Date().getHours();
  let greeting = "Good Morning";

  if (currentHour >= 12 && currentHour < 16) {
    greeting = "Good Afternoon";
  } else if (currentHour >= 16) {
    greeting = "Good Evening";
  }
 
  return (
    <>
      <div className="header-toolbar d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <a
            className="text-decoration-none text-dark d-flex align-items-center"
            href="#"
          >
            <b>Welcome   Account</b>
          </a>

        </div>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-white rounded-pill me-2"
            style={{ fontSize: 16 }}
          >
            <b>
              <i className="fas fa-plus me-1" /> New Scan Request
            </b>
          </button>
        </div>
      </div>
      
        <div className="row">
          <div className="col-12">
            <div className="jumbotron-hero">
              <div>
                   {/* ===== Dynamic Greeting Here ===== */}
            <h5 className="fw-normal">{greeting}.</h5>
                <h2 className="fw-bold">Account</h2>
              </div>
              <div className="card-container">
                <div className="card-hero">
                  <div className="icon-box new-patient">
                    <i className="fas fa-wallet" />
                  </div>
                  <div>
                    <p className="mb-0 fs-4 fw-bold">98,000</p>
                    <span className="small">Total Earning </span>
                  </div>
                </div>
                <div className="card-hero">
                  <div className="icon-box surgeries">
                    <i className="fas fa-hourglass-half" />
                  </div>
                  <div>
                    <p className="mb-0 fs-4 fw-bold">5,600</p>
                    <span className="small">Pending payment</span>
                  </div>
                </div>
                <div className="card-hero">
                  <div className="icon-box discharge">
                    <i className="fas fa-credit-card" />
                  </div>
                  <div>
                    <p className="mb-0 fs-5 fw-bold">34,000</p>
                    <span className="small">Total Expense</span>
                  </div>
                </div>
                <img
                  src={img}
                  className="illustration"
                  alt="Radiology illustration"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row g-4 mt-2">
          
            
             
                {/* ############################################################## */}
                {/* Add your code here....... */}
                
                  <div className="row g-3 mt-0">
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div
                        className="analytics-card"
                        style={{
                          background:
                            "linear-gradient(135deg, #00897b, #4db6ac)",
                          color: "white",
                          borderRadius: 12,
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="icon-box me-3">
                            <i className="fas fa-wallet" />
                          </div>
                          <div>
                            <h4 className="mb-0 fw-bold">598,00</h4>
                            <p className="mb-0">Total Earning </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div
                        className="analytics-card"
                        style={{
                          background:
                            "linear-gradient(135deg, #1976d2, #64b5f6)",
                          color: "white",
                          borderRadius: 12,
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="icon-box me-3">
                            <i className="fas fa-hourglass-half" />
                          </div>
                          <div>
                            <h4 className="mb-0 fw-bold">210</h4>
                            <p className="mb-0">Panding Pyment</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div
                        className="analytics-card"
                        style={{
                          background:
                            "linear-gradient(135deg, #c62828, #ef5350)",
                          color: "white",
                          borderRadius: 12,
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="icon-box me-3">
                            <i className="fas fa-credit-card" />
                          </div>
                          <div>
                            <h4 className="mb-0 fw-bold">36</h4>
                            <p className="mb-0">Total Expense</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div
                        className="analytics-card"
                        style={{
                          background:
                            "linear-gradient(135deg, #ef6c00, #ffb74d)",
                          color: "white",
                          borderRadius: 12,
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="icon-box me-3">
                            <i className="fas fa-user-check" />
                          </div>
                          <div>
                            <h4 className="mb-0 fw-bold">52</h4>
                            <p className="mb-0">Opd Revenue</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div
                        className="analytics-card"
                        style={{
                          background:
                            "linear-gradient(135deg, #00897b, #4db6ac)",
                          color: "white",
                          borderRadius: 12,
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="icon-box me-3">
                            <i className="fas fa-file-prescription" />
                          </div>
                          <div>
                            <h4 className="mb-0 fw-bold">120</h4>
                            <p className="mb-0">Ipd Revenue</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div
                        className="analytics-card"
                        style={{
                          background:
                            "linear-gradient(135deg, #1976d2, #64b5f6)",
                          color: "white",
                          borderRadius: 12,
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="icon-box me-3">
                            <i className="fas fa-pills" />
                          </div>
                          <div>
                            <h4 className="mb-0 fw-bold">43</h4>
                            <p className="mb-0">Pharmacy Sale</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div
                        className="analytics-card"
                        style={{
                          background:
                            "linear-gradient(135deg, #c62828, #ef5350)",
                          color: "white",
                          borderRadius: 12,
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="icon-box me-3">
                            <i className="fas fa-vials" />
                          </div>
                          <div>
                            <h4 className="mb-0 fw-bold">38</h4>
                            <p className="mb-0">Lab Collections</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div
                        className="analytics-card"
                        style={{
                          background:
                            "linear-gradient(135deg, #ef6c00, #ffb74d)",
                          color: "white",
                          borderRadius: 12,
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="icon-box me-3">
                            <i className="fas fa-undo" />
                          </div>
                          <div>
                            <h4 className="mb-0 fw-bold">82</h4>
                            <p className="mb-0"> Refunds/Discount</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row g-3 mt-0">
                    <div className="row g-3 mt-0">
                      <div className="row g-3 mt-0">
                        {/* ================= Latest Notices (LEFT) ================= */}
                        <div className="col-lg-6 col-md-12 col-sm-12">
                          <div
                            className="analytics-card p-3 d-flex flex-column"
                            style={{
                              height: 388,
                              borderRadius: 12,
                              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                              background: "#fff",
                            }}
                          >
                            {/* Header */}
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="mb-0 fw-bold">Latest Notices</h6>
                              <div className="notice-header-tools">
                                <span className="badge bg-danger">
                                  3 UNREAD
                                </span>
                                <a href="#" className="text-decoration-none">
                                  View All »
                                </a>
                              </div>
                            </div>
                            <hr className="mt-1 mb-2" />
                            {/* Notice List (scrollable) */}
                          <div style={{ overflowY: "auto" }}>
  <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
    <div className="d-flex align-items-center">
      <span className="text-primary me-2">
        <i className="fas fa-file-alt" />
      </span>
      <span className="fw-semibold">HR</span>
    </div>
    <small className="text-muted">1h ago</small>
  </div>

  <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
    <div className="d-flex align-items-center">
      <span className="text-warning me-2">
        <i className="fas fa-cog" />
      </span>
      <span className="fw-semibold">Shift Change Notification</span>
    </div>
    <small className="text-muted">2h ago</small>
  </div>

  <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
    <div className="d-flex align-items-center">
      <span className="text-primary me-2">
        <i className="fas fa-network-wired" />
      </span>
      <span className="fw-semibold">Announcement</span>
    </div>
    <small className="text-muted">1h ago</small>
  </div>

  <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
    <div className="d-flex align-items-center">
      <span className="text-primary me-2">
        <i className="fas fa-file" />
      </span>
      <span className="fw-semibold">General</span>
    </div>
    <small className="text-muted">Yesterday</small>
  </div>

  <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
    <div className="d-flex align-items-center">
      <span className="text-primary me-2">
        <i className="fas fa-file" />
      </span>
      <span className="fw-semibold">General</span>
    </div>
    <small className="text-muted">Read</small>
  </div>

  {/* ✅ New Item: Accountant Hospital */}
  <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
    <div className="d-flex align-items-center">
      <span className="text-success me-2">
        <i className="fas fa-calculator" />
      </span>
      <span className="fw-semibold">Accountant Hospital</span>
    </div>
    <small className="text-muted">3h ago</small>
  </div>

  <div className="notice-item d-flex justify-content-between align-items-center py-2">
    <div className="d-flex align-items-center">
      <span className="text-warning me-2">
        <i className="fas fa-tools" />
      </span>
      <span className="fw-semibold">Maintenance</span>
    </div>
    <small className="text-muted">2 days ago</small>
  </div>
</div>

                          </div>
                        </div>
                        {/* ================= Recent Transactions Table (RIGHT) ================= */}
                       <div className="col-lg-6 col-md-12 col-sm-12">
  <div
    className="analytics-card p-3 d-flex flex-column"
    style={{
      height: 388,
      borderRadius: 12,
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
      background: "#fff",
    }}
  >
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h6 className="mb-0 fw-bold">Recent Transactions</h6>
      <a href="#" className="text-decoration-none">View All »</a>
    </div>

    <hr className="mt-1 mb-2" />

    <div style={{ overflowY: "auto" }}>
      <table className="table table-bordered table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>1</td>
            <td>OPD</td>
            <td>₹500</td>
            <td><span className="badge bg-success">Paid</span></td>
          </tr>

          <tr>
            <td>2</td>
            <td>IPD Admission</td>
            <td>₹1,400</td>
            <td><span className="badge bg-warning">Pending</span></td>
          </tr>

          <tr>
            <td>3</td>
            <td>Pharmacy Bill</td>
            <td>₹320</td>
            <td><span className="badge bg-success">Paid</span></td>
          </tr>

          <tr>
            <td>4</td>
            <td>Lab Test</td>
            <td>₹800</td>
            <td><span className="badge bg-danger">Failed</span></td>
          </tr>

          {/* ✅ New Accountant/Billing Related Rows */}
          <tr>
            <td>5</td>
            <td>Billing – Room Charges</td>
            <td>₹2,500</td>
            <td><span className="badge bg-success">Paid</span></td>
          </tr>

          <tr>
            <td>6</td>
            <td>Billing – Surgery Charge</td>
            <td>₹15,000</td>
            <td><span className="badge bg-warning">Pending</span></td>
          </tr>

          <tr>
            <td>7</td>
            <td>Billing – Emergency</td>
            <td>₹1,200</td>
            <td><span className="badge bg-success">Paid</span></td>
          </tr>

          <tr>
            <td>8</td>
            <td>Insurance Claim Processing</td>
            <td>₹18,000</td>
            <td><span className="badge bg-info">In Review</span></td>
          </tr>
        </tbody>

      </table>
    </div>
  </div>
</div>

                      </div>
                    </div>
                  </div>
                
              
            
          
        </div>
      
   </>
  );
};

export default AccountantDashboard;
