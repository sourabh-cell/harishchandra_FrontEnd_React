import React from "react";
import img from "/assets/images/dashboard/radiology.png";

const LaboratoristDashboard = () => {
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
              <i className="fas fa-home me-2" />
            Welcome Laboratorist
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
                   <h5 className="fw-normal">{greeting}.</h5>
                  <h2 className="fw-bold">Pathology &amp; Radiology</h2>
                </div>
                <div className="card-container">
                  <div className="card-hero">
                    <div className="icon-box new-patient">
                      <i className="fas fa-x-ray" />
                    </div>
                    <div>
                      <p className="mb-0 fs-4 fw-bold">24</p>
                      <span className="small">X-Ray Scans</span>
                    </div>
                  </div>
                  <div className="card-hero">
                    <div className="icon-box surgeries">
                      <i className="fas fa-brain" />
                    </div>
                    <div>
                      <p className="mb-0 fs-4 fw-bold">15</p>
                      <span className="small">MRI Scans</span>
                    </div>
                  </div>
                  <div className="card-hero">
                    <div className="icon-box discharge">
                      <i className="fas fa-lungs" />
                    </div>
                    <div>
                      <p className="mb-0 fs-4 fw-bold">18</p>
                      <span className="small">CT Scans</span>
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
                              <i className="fas fa-x-ray" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">24</h4>
                              <p className="mb-0">Total X-Rays</p>
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
                              <i className="fas fa-brain" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">98</h4>
                              <p className="mb-0">Total MRI</p>
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
                              <i className="fas fa-lungs" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">135</h4>
                              <p className="mb-0">Total CT Scans</p>
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
                              <i className="fa-solid fa-flag" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">42</h4>
                              <p className="mb-0">Reports</p>
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
                              <i className="fas fa-x-ray" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">24</h4>
                              <p className="mb-0">Total X-Rays</p>
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
                              <i className="fas fa-brain" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">98</h4>
                              <p className="mb-0">Total MRI</p>
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
                              <i className="fas fa-lungs" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">135</h4>
                              <p className="mb-0">Total CT Scans</p>
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
                              <i className="fa-solid fa-flag" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">42</h4>
                              <p className="mb-0">Reports</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row g-3 mt-0">
                      {/* Latest Notices */}
                      <div className="col-lg-6 col-md-12 col-sm-12">
                        <div className="analytics-card">
                          {/* Header */}
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 fw-bold">LATEST NOTICES</h6>
                            <div className="notice-header-tools">
                              <span className="badge bg-danger">3 UNREAD</span>
                              <a href="#" className="text-decoration-none">
                                View All »
                              </a>
                            </div>
                          </div>
                          <hr />
                          {/* Notice Item */}
                         <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
  <div className="d-flex align-items-center">
    <span className="text-primary me-2">
      <i className="fas fa-xray" /> {/* Radiology icon */}
    </span>
    <span className="fw-semibold">Radiology</span>
  </div>
  <small className="text-muted">30m ago</small>
</div>

<div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
  <div className="d-flex align-items-center">
    <span className="text-danger me-2">
      <i className="fas fa-vial" /> {/* Pathology icon */}
    </span>
    <span className="fw-semibold">Pathology</span>
  </div>
  <small className="text-muted">10m ago</small>
</div>

                          <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
                            <div className="d-flex align-items-center">
                              <span className="text-warning me-2">
                                <i className="fas fa-cog" />
                              </span>
                              <span className="fw-semibold">
                                Shift Change Notification
                              </span>
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
                     {/* Hospital Earnings */}
<div className="col-lg-6 col-md-12 col-sm-12">
  <div className="analytics-card hospital-earnings">
    {/* Header */}
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h6 className="mb-0 fw-bold">Hospital Earnings</h6>
      <div>
        <a href="#" className="ms-2 text-decoration-none">
          View Report »
        </a>
      </div>
    </div>
    <hr />

    {/* Content */}
    <div className="row g-3">
      {/* Online Consultation */}
      <div className="col-sm-6 col-12">
        <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
          <h5>
            ₹4900 <small className="text-success">20% ↑</small>
          </h5>
          <p className="mb-0">Online Consultation</p>
        </div>
      </div>

      {/* Overall Purchases */}
      <div className="col-sm-6 col-12">
        <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
          <h5>
            ₹750 <small className="text-danger">26% ↓</small>
          </h5>
          <p className="mb-0">Overall Purchases</p>
        </div>
      </div>

      {/* Pending Invoices */}
      <div className="col-sm-6 col-12">
        <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
          <h5>
            ₹560 <small className="text-success">28% ↑</small>
          </h5>
          <p className="mb-0">Pending Invoices</p>
        </div>
      </div>

      {/* Monthly Billing */}
      <div className="col-sm-6 col-12">
        <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
          <h5>
            ₹390 <small className="text-success">30% ↑</small>
          </h5>
          <p className="mb-0">Monthly Billing</p>
        </div>
      </div>

      {/* 🟦 Radiology Earnings */}
      <div className="col-sm-6 col-12">
        <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
          <h5>
            ₹8200 <small className="text-success">18% ↑</small>
          </h5>
          <p className="mb-0">Radiology</p>
        </div>
      </div>

      {/* 🟥 Pathology Earnings */}
      <div className="col-sm-6 col-12">
        <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
          <h5>
            ₹6400 <small className="text-success">22% ↑</small>
          </h5>
          <p className="mb-0">Pathology</p>
        </div>
      </div>
    </div>

    <br />
    <br />
  </div>
</div>

                    </div>
                    {/* ####################################################################### */}
                  
                 
                  
                
                
             
            
          </div>
        
     
    </>
  );
};

export default LaboratoristDashboard;
