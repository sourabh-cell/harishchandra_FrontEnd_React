import React from "react";
import "./Dashboard.css";
import img from "/assets/images/dashboard/hrImage.png";

const HRDashboard = () => {
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
            <b>Welcome Human Resources</b>
          </a>
          <span className="text-muted mx-2"> </span>
        </div>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-white rounded-pill me-2"
            style={{ fontSize: 16 }}
          >
            <b>
              <i className="fas fa-plus me-1" /> Add New Employee
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

              <h2 className="fw-bold">HR</h2>
            </div>
            <div className="card-container">
              {/* Total Employees */}
              <div className="card-hero">
                <div className="icon-box new-patient">
                  <i className="fas fa-users" />
                </div>
                <div>
                  <p className="mb-0 fs-4 fw-bold">98,000</p>
                  <span className="small">Total Employees</span>
                </div>
              </div>
              {/* On Leave */}
              <div className="card-hero">
                <div className="icon-box surgeries">
                  <i className="fas fa-user-clock" />
                </div>
                <div>
                  <p className="mb-0 fs-4 fw-bold">5,600</p>
                  <span className="small">On Leave</span>
                </div>
              </div>
              {/* New Joiners */}
              <div className="card-hero">
                <div className="icon-box discharge">
                  <i className="fas fa-user-shield" />
                </div>
                <div>
                  <p className="mb-0 fs-4 fw-bold">34,000</p>
                  <span className="small">New Joiners</span>
                </div>
              </div>
              <img
                src={img}
                style={{ marginBottom: "-22px" }}
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
          {/* Pending Verifications */}
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
                  <i className="fas fa-user-check" />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">98,000</h4>
                  <p className="mb-0">Verifications</p>
                </div>
              </div>
            </div>
          </div>
          {/* Open Positions */}
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
                  <i className="fas fa-briefcase" />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">5,600</h4>
                  <p className="mb-0">Open Positions</p>
                </div>
              </div>
            </div>
          </div>
          {/* Pending Approvals */}
          <div className="col-lg-3 col-md-6 col-sm-12">
            <div
              className="analytics-card"
              style={{
                background: "linear-gradient(135deg, #c62828, #ef5350)",
                color: "white",
                borderRadius: 12,
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              }}
            >
              <div className="d-flex align-items-center">
                <div className="icon-box me-3">
                  <i className="fas fa-check-circle" />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">34,000</h4>
                  <p className="mb-0"> Approvals</p>
                </div>
              </div>
            </div>
          </div>
          {/* Training Sessions */}
          <div className="col-lg-3 col-md-6 col-sm-12">
            <div
              className="analytics-card"
              style={{
                background: "linear-gradient(135deg, #ef6c00, #ffb74d)",
                color: "white",
                borderRadius: 12,
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              }}
            >
              <div className="d-flex align-items-center">
                <div className="icon-box me-3">
                  <i className="fas fa-chalkboard-teacher" />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">1,200</h4>
                  <p className="mb-0">Training Sessions</p>
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
                    <h6 className="mb-0 fw-bold">Latest HR Notices</h6>
                    <div className="notice-header-tools">
                      <span className="badge bg-danger">3 UNREAD</span>
                      <a href="#" className="text-decoration-none">
                        View All »
                      </a>
                    </div>
                  </div>
                  <hr className="mt-1 mb-2" />
                  {/* Notice List (scrollable) */}
                  <div style={{ overflowY: "auto" }}>
                    {/* Staff Duty Roster */}
                    <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
                      <div className="d-flex align-items-center">
                        <span className="text-primary me-2">
                          <i className="fas fa-user-nurse" />
                        </span>
                        <span className="fw-semibold">
                          Nursing Staff Duty Roster Updated
                        </span>
                      </div>
                      <small className="text-muted">1h ago</small>
                    </div>
                    {/* Doctor Shift Schedule */}
                    <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
                      <div className="d-flex align-items-center">
                        <span className="text-warning me-2">
                          <i className="fas fa-stethoscope" />
                        </span>
                        <span className="fw-semibold">
                          Doctor Shift Change Notification
                        </span>
                      </div>
                      <small className="text-muted">2h ago</small>
                    </div>
                    {/* New medical staff */}
                    <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
                      <div className="d-flex align-items-center">
                        <span className="text-success me-2">
                          <i className="fas fa-user-plus" />
                        </span>
                        <span className="fw-semibold">
                          New Medical Staff Joined
                        </span>
                      </div>
                      <small className="text-muted">Today</small>
                    </div>
                    {/* Leave Approvals */}
                    <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
                      <div className="d-flex align-items-center">
                        <span className="text-danger me-2">
                          <i className="fas fa-file-signature" />
                        </span>
                        <span className="fw-semibold">
                          Hospital Leave Approval Updates
                        </span>
                      </div>
                      <small className="text-muted">Yesterday</small>
                    </div>
                    {/* Department meeting */}
                    <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
                      <div className="d-flex align-items-center">
                        <span className="text-primary me-2">
                          <i className="fas fa-users" />
                        </span>
                        <span className="fw-semibold">
                          Department &amp; Ward Meeting Schedule
                        </span>
                      </div>
                      <small className="text-muted">2 days ago</small>
                    </div>
                    {/* Training */}
                    <div className="notice-item d-flex justify-content-between align-items-center py-2">
                      <div className="d-flex align-items-center">
                        <span className="text-warning me-2">
                          <i className="fas fa-chalkboard-teacher" />
                        </span>
                        <span className="fw-semibold">
                          Clinical Training &amp; Skill Development
                        </span>
                      </div>
                      <small className="text-muted">3 days ago</small>
                    </div>
                  </div>
                </div>
              </div>
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
                    <h6 className="mb-0 fw-bold">
                      Recent HR Activities (Hospital)
                    </h6>
                    <a href="#" className="text-decoration-none">
                      View All »
                    </a>
                  </div>
                  <hr className="mt-1 mb-2" />
                  <div style={{ overflowY: "auto" }}>
                    <table className="table table-bordered table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Activity</th>
                          <th>Department</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>Nurse Recruitment Completed</td>
                          <td>Nursing</td>
                          <td>
                            <span className="badge bg-success">Completed</span>
                          </td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>Doctor Shift Change Approval</td>
                          <td>Medical Staff</td>
                          <td>
                            <span className="badge bg-warning">Pending</span>
                          </td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>Mandatory Safety Training</td>
                          <td>Emergency</td>
                          <td>
                            <span className="badge bg-info">Ongoing</span>
                          </td>
                        </tr>
                        <tr>
                          <td>4</td>
                          <td>Payroll Processing for Staff</td>
                          <td>Accounts</td>
                          <td>
                            <span className="badge bg-success">Completed</span>
                          </td>
                        </tr>
                        <tr>
                          <td>5</td>
                          <td>Leave Request Review</td>
                          <td>HR Department</td>
                          <td>
                            <span className="badge bg-danger">Delayed</span>
                          </td>
                        </tr>
                        <tr>
                          <td>6</td>
                          <td>New Ward Boy Induction</td>
                          <td>General Services</td>
                          <td>
                            <span className="badge bg-success">Completed</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {/* ####################################################################### */}
          </div>
          {/* content-wrapper ends */}
          {/* partial:partials/_footer.html */}

          {/* partial */}
        </div>
        {/* main-panel ends */}
      </div>
    </>
  );
};

export default HRDashboard;
