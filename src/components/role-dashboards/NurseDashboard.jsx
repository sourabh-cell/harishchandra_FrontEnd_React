import React from "react";
import "./Dashboard.css";
import img from "/assets/images/dashboard/Headnurse.png";
const NurseDashboard = () => {
  
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
              <b>Welcome Head Nurse</b>
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
                  <h2 className="fw-bold">Head Nurse</h2>
                </div>
                <div className="card-container">
                  <div className="card-hero">
                    <div className="icon-box new-patient">
                      <i className="fas fa-user-nurse" />
                    </div>
                    <div>
                      <p className="mb-0 fs-4 fw-bold">15</p>
                      <span className="small">Head Nurse</span>
                    </div>
                  </div>
                  <div className="card-hero">
                    <div className="icon-box surgeries">
                      <i className="fas fa-user-check" />
                    </div>
                    <div>
                      <p className="mb-0 fs-4 fw-bold">8</p>
                      <span className="small">On Duty</span>
                    </div>
                  </div>
                  <div className="card-hero">
                    <div className="icon-box discharge">
                      <i className="fas fa-user-friends" />
                    </div>
                    <div>
                      <p className="mb-0 fs-5 fw-bold">12</p>
                      <span className="small">Available Nurses</span>
                    </div>
                  </div>
                  <img
                    src={img}
                    style={{ height: "200px", width: "300px" }}
                    className="illustration"
                    alt="Radiology illustration"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Analytics Cards */}
          <div className="row g-3 mt-0">
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div
                className="analytics-card"
                style={{
                  background: "linear-gradient(135deg, #00897b, #4db6ac)",
                  color: "white",
                }}
              >
                <div className="d-flex align-items-center">
                  <div className="icon-box me-3">
                    <i className="fas fa-tasks" />
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">120</h4>
                    <p className="mb-0">Pending Tasks</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div
                className="analytics-card"
                style={{
                  background: "linear-gradient(135deg, #1976d2, #64b5f6)",
                  color: "white",
                }}
              >
                <div className="d-flex align-items-center">
                  <div className="icon-box me-3">
                    <i className="fas fa-business-time" />
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">21</h4>
                    <p className="mb-0">Shifts Today</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div
                className="analytics-card"
                style={{
                  background: "linear-gradient(135deg, #c62828, #ef5350)",
                  color: "white",
                }}
              >
                <div className="d-flex align-items-center">
                  <div className="icon-box me-3">
                    <i className="fas fa-bed-pulse" />
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">21</h4>
                    <p className="mb-0">Leaves Today</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div
                className="analytics-card"
                style={{
                  background: "linear-gradient(135deg, #ef6c00, #ffb74d)",
                  color: "white",
                }}
              >
                <div className="d-flex align-items-center">
                  <div className="icon-box me-3">
                    <i className="fas fa-user-plus" />
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">21</h4>
                    <p className="mb-0">New Admissions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* SIDE BY SIDE SECTION */}
          <div className="row g-4 mt-3">
            {/* LATEST NOTICES (Left) */}
            <div className="col-lg-6 col-md-12">
  <div
    className="analytics-card p-3"
    style={{ height: 315, overflowY: "auto" }}
  >
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

    {/* HR Notice */}
    <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
      <div className="d-flex align-items-center">
        <span className="text-primary me-2">
          <i className="fas fa-file-alt" />
        </span>
        <span className="fw-semibold">HR</span>
      </div>
      <small className="text-muted">1h ago</small>
    </div>

    {/* Head Nurse Notice — NEW */}
    <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
      <div className="d-flex align-items-center">
        <span className="text-success me-2">
          <i className="fas fa-user-nurse" />
        </span>
        <span className="fw-semibold">Head Nurse Update</span>
      </div>
      <small className="text-muted">Just now</small>
    </div>

    {/* Shift Change */}
    <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
      <div className="d-flex align-items-center">
        <span className="text-warning me-2">
          <i className="fas fa-cog" />
        </span>
        <span className="fw-semibold">Shift Change Notification</span>
      </div>
      <small className="text-muted">2h ago</small>
    </div>

    {/* Announcement */}
    <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
      <div className="d-flex align-items-center">
        <span className="text-primary me-2">
          <i className="fas fa-network-wired" />
        </span>
        <span className="fw-semibold">Announcement</span>
      </div>
      <small className="text-muted">1h ago</small>
    </div>

    {/* General */}
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

            {/* PATIENT ASSIGNMENT (Right) */}
            <div className="col-lg-6 col-md-12">
              <div
                className="analytics-card p-3"
                style={{ height: 315, overflowY: "auto" }}
              >
                <h6 className="fw-bold mb-3">Patient Assignment</h6>
                <div
                  className="table-responsive"
                  style={{ maxHeight: 240, overflowY: "auto" }}
                >
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Patient</th>
                        <th>Assigned Doctor</th>
                        <th>Ward</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Radhika Singh</td>
                        <td>Dr.Priya Sharma</td>
                        <td>Ward 1</td>
                        <td>
                          <span className="badge bg-warning">Critical</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Kavya Mehta</td>
                        <td>Dr.Sneha Reddy</td>
                        <td>Ward 2</td>
                        <td>
                          <span className="badge bg-success">Stable</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Aarohi Joshi</td>
                        <td>Dr.Ananya Patel</td>
                        <td>Ward 3</td>
                        <td>
                          <span className="badge bg-info">Observation</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
       
        
      
    </>
  );
};

export default NurseDashboard;
