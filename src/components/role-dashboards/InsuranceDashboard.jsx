import React from "react";
import "./Dashboard.css";
import img from "/assets/images/dashboard/insurance.png";
const InsuranceDashboard = () => {
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
            Welcome Insurer
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
              <h2 className="fw-bold">Insurer</h2>
            </div>
            <div className="card-container">
              <div className="card-hero">
                <div className="icon-box new-patient">
                  <i className="fas fa-file-medical" />
                </div>
                <div>
                  <p className="mb-0 fs-4 fw-bold">24</p>
                  <span className="small">New Claims Today</span>
                </div>
              </div>
              <div className="card-hero">
                <div className="icon-box surgeries">
                  <i className="fas fa-clock" />
                </div>
                <div>
                  <p className="mb-0 fs-4 fw-bold">15</p>
                  <span className="small">Pending Approvals</span>
                </div>
              </div>
              <div className="card-hero">
                <div className="icon-box discharge">
                  <i className="fas fa-bell" />
                </div>
                <div>
                  <p className="mb-0 fs-4 fw-bold">18</p>
                  <span className="small">Policy Expiry Alerts</span>
                </div>
              </div>
              <img
                src={img}
                style={{ marginBottom: "-10px" }}
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
                background: "linear-gradient(135deg, #00897b, #4db6ac)",
                color: "white",
                borderRadius: 12,
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="d-flex align-items-center">
                <div className="icon-box me-3">
                  <i className="fas fa-file-alt" />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">24</h4>
                  <p className="mb-0">Insurance Claims</p>
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
                borderRadius: 12,
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="d-flex align-items-center">
                <div className="icon-box me-3">
                  <i className="fas fa-hourglass-half" />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">98</h4>
                  <p className="mb-0">Pending Claims</p>
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
                borderRadius: 12,
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="d-flex align-items-center">
                <div className="icon-box me-3">
                  <i className="fas fa-check-circle" />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">135</h4>
                  <p className="mb-0">Approved Claims</p>
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
                borderRadius: 12,
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="d-flex align-items-center">
                <div className="icon-box me-3">
                  <i className="fas fa-times-circle" />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">42</h4>
                  <p className="mb-0">Rejected Claims</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-3 mt-0 mb-4">
          {/* Latest Notices */}
          <div className="col-lg-6 col-md-12 col-sm-12 d-flex">
            <div className="analytics-card w-100 d-flex flex-column h-100">
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
              <div className="flex-grow-1 overflow-auto">
                {/* Insurance Claim Update */}
                <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div className="d-flex align-items-center">
                    <span className="text-primary me-2">
                      <i className="fas fa-file-medical" />
                    </span>
                    <span className="fw-semibold">Insurance Claim Update</span>
                  </div>
                  <small className="text-muted">1h ago</small>
                </div>

                {/* Insurance Policy Renewal */}
                <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div className="d-flex align-items-center">
                    <span className="text-warning me-2">
                      <i className="fas fa-shield-alt" />
                    </span>
                    <span className="fw-semibold">
                      Insurance Policy Renewal
                    </span>
                  </div>
                  <small className="text-muted">2h ago</small>
                </div>

                {/* Cashless Approval Notification */}
                <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div className="d-flex align-items-center">
                    <span className="text-success me-2">
                      <i className="fas fa-check-circle" />
                    </span>
                    <span className="fw-semibold">
                      Cashless Approval Notification
                    </span>
                  </div>
                  <small className="text-muted">3h ago</small>
                </div>

                {/* Insurance Document Verification */}
                <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div className="d-flex align-items-center">
                    <span className="text-primary me-2">
                      <i className="fas fa-file-signature" />
                    </span>
                    <span className="fw-semibold">
                      Insurance Document Verification
                    </span>
                  </div>
                  <small className="text-muted">Yesterday</small>
                </div>

                {/* Insurance Partner Maintenance */}
                <div className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div className="d-flex align-items-center">
                    <span className="text-danger me-2">
                      <i className="fas fa-tools" />
                    </span>
                    <span className="fw-semibold">
                      Insurance Partner Maintenance
                    </span>
                  </div>
                  <small className="text-muted">2 days ago</small>
                </div>
              </div>
            </div>
          </div>
          {/* Insurance Stats */}
          <div className="col-lg-6 col-md-12 col-sm-12 d-flex">
            <div className="analytics-card insurance-stats w-100 d-flex flex-column h-100">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold">Insurance Stats</h6>
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
                  <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
                    <h5>
                      24 <small className="text-success">+12%</small>
                    </h5>
                    <p className="mb-0">New Claims</p>
                  </div>
                </div>
                <div className="col-sm-6 col-12">
                  <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
                    <h5>
                      15 <small className="text-warning">+8%</small>
                    </h5>
                    <p className="mb-0">Pending Approvals</p>
                  </div>
                </div>
                <div className="col-sm-6 col-12">
                  <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
                    <h5>
                      18 <small className="text-danger">-5%</small>
                    </h5>
                    <p className="mb-0">Policy Expiry Alerts</p>
                  </div>
                </div>
                <div className="col-sm-6 col-12">
                  <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
                    <h5>
                      10 <small className="text-success">+20%</small>
                    </h5>
                    <p className="mb-0">Claims Processed</p>
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

        {/* main-panel ends */}
      </div>
    </>
  );
};

export default InsuranceDashboard;
