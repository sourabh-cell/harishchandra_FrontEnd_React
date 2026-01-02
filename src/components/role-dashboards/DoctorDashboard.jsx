import React from "react";
import "./Dashboard.css";
import img from "/assets/images/dashboard/Doctor.png";
const DoctorDashboard = () => {
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
           Welcome Doctor
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
                <h2 className="fw-bold">Doctor</h2>
              </div>
              <div className="card-container">
                <div className="card-hero">
                  <div className="icon-box new-patient">
                    <i className="fas fa-calendar-check fa-2x" />
                  </div>
                  <div>
                    <p className="mb-0 fs-4 fw-bold">24</p>
                    <span className="small">Appointments Today</span>
                  </div>
                </div>
                <div className="card-hero">
                  <div className="icon-box surgeries">
                    <i className="fas fa-file-medical fa-2x" />
                  </div>
                  <div>
                    <p className="mb-0 fs-4 fw-bold">15</p>
                    <span className="small">Pending Reports</span>
                  </div>
                </div>
                <div className="card-hero">
                  <div className="icon-box discharge">
                    <i className="fas fa-user-check fa-2x" />
                  </div>
                  <div>
                    <p className="mb-0 fs-4 fw-bold">18</p>
                    <span className="small">Patients Checked In</span>
                  </div>
                </div>
                <img
                  src={img}
                  style={{ height: "241px" }}
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
              {/* Appointments */}
              <div className="col-lg-3 col-md-6 col-sm-12">
                <div
                  className="analytics-card"
                  style={{
                    background: "linear-gradient(135deg, #00897b, #4db6ac)",
                    color: "white",
                    borderRadius: 12,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div className="icon-box me-3">
                      <i className="fas fa-calendar-day" />
                    </div>
                    <div>
                      <h4 className="mb-0 fw-bold">12</h4>
                      <p className="mb-0">Appointments</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Admitted */}
              <div className="col-lg-3 col-md-6 col-sm-12">
                <div
                  className="analytics-card"
                  style={{
                    background: "linear-gradient(135deg, #1976d2, #64b5f6)",
                    color: "white",
                    borderRadius: 12,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div className="icon-box me-3">
                      <i className="fas fa-procedures" />
                    </div>
                    <div>
                      <h4 className="mb-0 fw-bold">8</h4>
                      <p className="mb-0">Admitted</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Reports */}
              <div className="col-lg-3 col-md-6 col-sm-12">
                <div
                  className="analytics-card"
                  style={{
                    background: "linear-gradient(135deg, #c62828, #ef5350)",
                    color: "white",
                    borderRadius: 12,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div className="icon-box me-3">
                      <i className="fas fa-file-medical-alt" />
                    </div>
                    <div>
                      <h4 className="mb-0 fw-bold">5</h4>
                      <p className="mb-0">Reports</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Follow-Ups */}
              <div className="col-lg-3 col-md-6 col-sm-12">
                <div
                  className="analytics-card"
                  style={{
                    background: "linear-gradient(135deg, #ef6c00, #ffb74d)",
                    color: "white",
                    borderRadius: 12,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div className="icon-box me-3">
                      <i className="fas fa-notes-medical" />
                    </div>
                    <div>
                      <h4 className="mb-0 fw-bold">3</h4>
                      <p className="mb-0">Follow-Ups</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3 mt-0">
              {/* Latest Notices */}
              <div className="col-lg-6 col-md-12 col-sm-12 d-flex">
                <div
                  className="analytics-card w-100 d-flex flex-column"
                  style={{ minHeight: "100%" }}
                >
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
                  {/* Notice Items */}
                  <div className="flex-grow-1">
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
                        <span className="fw-semibold">Shift</span>
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
                  </div>
                </div>
              </div>
              {/* Doctor Stats */}
              <div className="col-lg-6 col-md-12 col-sm-12 d-flex">
                <div
                  className="analytics-card doctor-stats w-100 d-flex flex-column"
                  style={{ minHeight: "100%" }}
                >
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 fw-bold">Doctor Stats</h6>
                    <div>
                      <a href="#" className="ms-2 text-decoration-none">
                        View »
                      </a>
                    </div>
                  </div>
                  <hr />
                  {/* Content */}
                  <div className="row g-3 flex-grow-1">
                    <div className="col-sm-6 col-12">
                      <div
                        className="p-3 border h-100"
                        style={{ borderRadius: 1 }}
                      >
                        <h5>
                          12 <small className="text-success">+20%</small>
                        </h5>
                        <p className="mb-0">Appointments</p>
                      </div>
                    </div>
                    <div className="col-sm-6 col-12">
                      <div
                        className="p-3 border h-100"
                        style={{ borderRadius: 1 }}
                      >
                        <h5>
                          8 <small className="text-success">+10%</small>
                        </h5>
                        <p className="mb-0">Patients</p>
                      </div>
                    </div>
                    <div className="col-sm-6 col-12">
                      <div
                        className="p-3 border h-100"
                        style={{ borderRadius: 1 }}
                      >
                        <h5>
                          5 <small className="text-danger">-5%</small>
                        </h5>
                        <p className="mb-0">Lab Reports</p>
                      </div>
                    </div>
                    <div className="col-sm-6 col-12">
                      <div
                        className="p-3 border h-100"
                        style={{ borderRadius: 1 }}
                      >
                        <h5>
                          3 <small className="text-success">+15%</small>
                        </h5>
                        <p className="mb-0">Follow-Ups</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ####################################################################### */}
          
          {/* content-wrapper ends */}
          {/* partial:partials/_footer.html */}
        
          {/* partial */}
        </div>
        {/* main-panel ends */}
      
    </>
  );
};

export default DoctorDashboard;
