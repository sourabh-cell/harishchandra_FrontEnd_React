import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminDashboardData,
  selectDashboardStatistics,
  selectDashboardNotices,
  selectDashboardLoading,
  selectDashboardError,
} from "../../features/dashboardSlice";

const AdminDashboardRole = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const statistics = useSelector(selectDashboardStatistics);
  const notices = useSelector(selectDashboardNotices);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);

  useEffect(() => {
    dispatch(fetchAdminDashboardData());
  }, [dispatch]);

  // ===== Dynamic Greeting Logic =====
  const currentHour = new Date().getHours();
  let greeting = "Good Morning";

  if (currentHour >= 12 && currentHour < 16) {
    greeting = "Good Afternoon";
  } else if (currentHour >= 16) {
    greeting = "Good Evening";
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        Error loading dashboard data: {error}
      </div>
    );
  }

  return (
    <>
      <div className="header-toolbar d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <span className="text-dark font-weight-bold mx-2">
            {" "}
            Welcome Admin{" "}
          </span>
        </div>
        <div className="d-flex align-items-center">
          <button
            className="btn make-appoint rounded-pill me-2"
            onClick={() => navigate("/dashboard/add-patient-appointment")}
          >
            <i className="fas fa-plus me-1" /> Make Appointment
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="jumbotron-hero">
            <div>
              {/* ===== Dynamic Greeting Here ===== */}
              <h5 className="fw-normal">{greeting}.</h5>
              <h2 className="fw-bold">Admin</h2>
              <p className="mb-0">Overview of the system.</p>
            </div>
            <div className="card-container">
              {/* Cards removed as per user request */}
            </div>
            <img
               src="../../assets/images/dashboard/dash1.png"
               className="illustration"
               alt="Medical team illustration"
               style={{ height: "210px",width: "335px", bottom: "-16px"}}
             />
          </div>
        </div>
      </div>
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
                <i className="fas fa-bed" />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{statistics.patientIpdCount}</h4>
                <p className="mb-0">IPD Patients</p>
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
                <i className="fas fa-heartbeat" />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{statistics.patientOpdCount}</h4>
                <p className="mb-0">OPD Patients</p>
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
                <i className="fas fa-procedures" />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{statistics.patientErCount}</h4>
                <p className="mb-0">ER Patients</p>
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
                <i className="fas fa-user-md" />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{statistics.totalActivePatients}</h4>
                <p className="mb-0">Total Patient</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3 mt-0">
        <div className="col-lg-3 col-md-6 col-sm-12">
          <div
            className="analytics-card"
            style={{
              background: "linear-gradient(135deg, #2e7d32, #81c784)",
              color: "white",
              borderRadius: 12,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div className="d-flex align-items-center">
              <div className="icon-box me-3">
                <i className="fas fa-users" />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{statistics.totalStaffs}</h4>
                <p className="mb-0">Total Staff</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <div
            className="analytics-card"
            style={{
              background: "linear-gradient(135deg, #6a1b9a, #ba68c8)",
              color: "white",
              borderRadius: 12,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div className="d-flex align-items-center">
              <div className="icon-box me-3">
                <i className="fas fa-calendar-check" />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{statistics.todaysAppointments}</h4>
                <p className="mb-0"> Appointments</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <div
            className="analytics-card"
            style={{
              background: "linear-gradient(135deg, #4527a0, #9575cd)",
              color: "white",
              borderRadius: 12,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div className="d-flex align-items-center">
              <div className="icon-box me-3">
                <i className="fas fa-user-md" />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{statistics.totalAvailableDoctors}</h4>
                <p className="mb-0">Available Doctors</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <div
            className="analytics-card"
            style={{
              background: "linear-gradient(135deg, #0277bd, #4fc3f7)",
              color: "white",
              borderRadius: 12,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div className="d-flex align-items-center">
              <div className="icon-box me-3">
                <i className="fas fa-bed" />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{statistics.availableBeds}</h4>
                <p className="mb-0" style={{ whiteSpace: "nowrap" }}>
                  Available Beds
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3 mt-0">
        {/* Latest Notices */}
        <div className="col-lg-6 col-md-12 col-sm-12 d-flex mb-4">
          <div
            className="analytics-card w-100 d-flex flex-column"
            style={{ minHeight: "100%" }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0 fw-bold">LATEST NOTICES</h6>
              <div className="notice-header-tools">
                <a href="#" className="text-decoration-none">
                  View All »
                </a>
              </div>
            </div>
            <hr />
            {/* Notice Items */}
            <div className="flex-grow-1">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="notice-item d-flex justify-content-between align-items-center py-2 border-bottom"
                >
                  <div className="d-flex align-items-center">
                    <span className={notice.iconColor + " me-2"}>
                      <i className={"fas " + notice.icon} />
                    </span>
                    <span className="fw-semibold">{notice.title}</span>
                  </div>
                  <small className="text-muted">{notice.time}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Hospital Status */}
        <div className="col-lg-6 col-md-12 col-sm-12 d-flex mb-4">
          <div
            className="analytics-card doctor-stats w-100 d-flex flex-column"
            style={{ minHeight: "100%" }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0 fw-bold">Hospital Status</h6>
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
                    {statistics.totalDoctors} <small className="text-success"></small>
                  </h5>
                  <p className="mb-0">Total Doctors</p>
                </div>
              </div>

              <div className="col-sm-6 col-12">
                <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
                  <h5>
                    {statistics.totalHeadNurses} <small className="text-success"></small>
                  </h5>
                  <p className="mb-0">Total Head Nurses</p>
                </div>
              </div>

              <div className="col-sm-6 col-12">
                <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
                  <h5>
                    {statistics.totalBeds} <small className="text-success"></small>
                  </h5>
                  <p className="mb-0">Total Beds</p>
                </div>
              </div>

              <div className="col-sm-6 col-12">
                <div className="p-3 border h-100" style={{ borderRadius: 1 }}>
                  <h5>
                    {statistics.totalAppointments} <small className="text-success"></small>
                  </h5>
                  <p className="mb-0">Total Appointments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ####################################################################### */}
    </>
  );
};

export default AdminDashboardRole;
