import React from "react";
import img from "/assets/images/dashboard/Receptionist.png";
const ReceptionistDashboard = () => {
 
 
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
             Welcome Receptionist
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
                  <h2 className="fw-bold">Receptionist</h2>
                </div>
                <div className="card-container">
                  <div className="card-hero">
                    <div className="icon-box new-patient">
                      <i className="fas fa-bed text-white" />
                    </div>
                    <div>
                      <p className="mb-0 fw-bold text-white">8</p>
                      <span className="small">Appointment Today</span>
                    </div>
                  </div>
                  <div className="card-hero">
                    <div className="icon-box surgeries">
                      <i className="fas fa-user-check text-white" />
                    </div>
                    <div>
                      <p className="mb-0 fs-4 fw-bold text-white">21</p>
                      <span className="small">Patients Checked In</span>
                    </div>
                  </div>
                  <div className="card-hero">
                    <div className="icon-box discharge">
                      <i className="fas fa-rupee-sign text-white" />
                    </div>
                    <div>
                      <p className="mb-0 fs-4 fw-bold">18</p>
                      <span className="small">Pending Paymentss</span>
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
                      {/* Total X-Rays */}
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
                              <i className="fas fa-calendar-check fa-lg me-3" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">24</h4>
                              <p className="mb-0">Appointments</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Total MRI */}
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
                              <i className="fas fa-walking fa-lg me-3" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">98</h4>
                              <p className="mb-0">Walk-in Patients</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Total CT Scans */}
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
                              <i className="fas fa-procedures fa-lg me-3" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">135</h4>
                              <p className="mb-0">Pending Bills</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Reports */}
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
                              <i className="fas fa-user-md fa-lg me-3" />
                            </div>
                            <div>
                              <h4 className="mb-0 fw-bold">42</h4>
                              <p className="mb-0">Doctors</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Notices and Overview */}
                    <div className="row g-3 mt-3">
                      {/* Notices */}
                      <div className="col-lg-6 d-flex">
  <div className="bg-white rounded-3 shadow-sm p-3 flex-fill">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h6 className="fw-bold mb-0">LATEST NOTICES</h6>
      <div className="d-flex align-items-center gap-2">
        <span className="badge bg-danger">4 UNREAD</span>
        <a href="#" className="text-decoration-none text-primary fw-semibold">
          View All »
        </a>
      </div>
    </div>

    <hr className="my-2" />

    <div className="list-group list-group-flush">
      
      <div className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-user-clock text-primary me-2" />
          VIP Patient Arrival – Prepare Priority Desk
        </div>
        <small className="text-muted">20m ago</small>
      </div>

      <div className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-calendar-check text-success me-2" />
          OPD Token System Updated for Today
        </div>
        <small className="text-muted">1h ago</small>
      </div>

      <div className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-user-nurse text-warning me-2" />
          New Duty Roster for Reception Team Released
        </div>
        <small className="text-muted">2h ago</small>
      </div>

      <div className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-bell text-danger me-2" />
          Emergency Ward Overload – Redirect Patients
        </div>
        <small className="text-muted">3h ago</small>
      </div>

      <div className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-tools text-secondary me-2" />
          Reception Printer Maintenance Scheduled
        </div>
        <small className="text-muted">Yesterday</small>
      </div>
      
    </div>
  </div>
</div>

                      {/* Overview */}
                      <div className="col-lg-6 d-flex">
                        <div className="bg-white rounded-3 shadow-sm p-3 flex-fill">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="fw-bold mb-0">
                              RECEPTIONIST OVERVIEW
                            </h6>
                            <a
                              href="#"
                              className="text-decoration-none text-primary fw-semibold"
                            >
                              View Details »
                            </a>
                          </div>
                          <hr className="my-2" />
                          <div className="row g-3">
                            <div className="col-sm-6">
                              <div className="border rounded-3 p-3 text-center h-100">
                                <h5>
                                  45{" "}
                                  <small className="text-success">+12%</small>
                                </h5>
                                <p className="mb-0 small">
                                  Today's Appointments
                                </p>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="border rounded-3 p-3 text-center h-100">
                                <h5>
                                  18 <small className="text-success">+8%</small>
                                </h5>
                                <p className="mb-0 small">
                                  New Patient Registrations
                                </p>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="border rounded-3 p-3 text-center h-100">
                                <h5>
                                  5 <small className="text-danger">-5%</small>
                                </h5>
                                <p className="mb-0 small">
                                  Canceled Appointments
                                </p>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="border rounded-3 p-3 text-center h-100">
                                <h5>
                                  ₹12,300{" "}
                                  <small className="text-success">+15%</small>
                                </h5>
                                <p className="mb-0 small">Payments Collected</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                 
                  {/* content-wrapper ends */}
                  {/* partial:partials/_footer.html */}
                
                  {/* partial */}
                
                {/* main-panel ends */}
              
           
          </div>
       
      
    </>
  );
};

export default ReceptionistDashboard;
