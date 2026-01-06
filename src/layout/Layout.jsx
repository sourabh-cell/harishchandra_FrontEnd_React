import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  selectCurrentUser,
  selectAuthRoles,
  selectAuthPermissions,
  selectAuthExpiry,
} from "../features/authSlice";
import useSessionTimeout from "../hooks/useSessionTimeout";
import "./Layout.css";
import RoleSelector from "../components/role-dashboards/RoleSelector";
import sidebarMenu from "../role/sidebarMenu";

const Layout = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const lastClickRef = useRef({});
  const CLICK_THRESHOLD = 300; // ms

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const authRoles = useSelector(selectAuthRoles);
  const permissions = useSelector(selectAuthPermissions);
  const expiry = useSelector(selectAuthExpiry);

  // run session timeout hook here so it has Router context (useNavigate)
  useSessionTimeout(expiry);
  const SHOW_LEGACY_SIDEBAR = false;
  // console.log("Current User in Layout:", currentUser);
  const handleToggleSafe = (key) => {
    const now = Date.now();
    const last = lastClickRef.current[key] || 0;
    if (now - last < CLICK_THRESHOLD) return; // ignore rapid double clicks
    lastClickRef.current[key] = now;
    setOpenMenu(openMenu === key ? null : key);
  };

  const location = useLocation();
  // Legacy static sidebar support (disabled)
  const isAllowed = () => false;

  // Auto-open menu that contains the current route
  useEffect(() => {
    if (!location || location.pathname === "/dashboard") return;

    // Find which menu contains the current path
    const currentPath = location.pathname;
    for (const item of sidebarMenu) {
      if (item.children && Array.isArray(item.children)) {
        const hasActiveChild = item.children.some(
          (child) =>
            child.path === currentPath ||
            (child.children &&
              child.children.some((gc) => gc.path === currentPath))
        );
        if (hasActiveChild) {
          const key = item.collapseId || slug(item.title);
          setOpenMenu(key);
          break;
        }
      }
    }
  }, [location]);

  // Also listen to browser history (back/forward) events to ensure
  // the open menu stays in sync when users use the browser Back/Forward
  useEffect(() => {
    const handlePop = () => {
      if (!location || location.pathname === "/dashboard") return;
      const currentPath = location.pathname;
      for (const item of sidebarMenu) {
        if (item.children && Array.isArray(item.children)) {
          const hasActiveChild = item.children.some(
            (child) =>
              child.path === currentPath ||
              (child.children &&
                child.children.some((gc) => gc.path === currentPath))
          );
          if (hasActiveChild) {
            const key = item.collapseId || slug(item.title);
            setOpenMenu(key);
            return;
          }
        }
      }
      // if none match, close menus
      setOpenMenu(null);
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [location]);

  useEffect(() => {
    // remove any leftover 'active' classes from sidebar nav items so styles
    // coming from CSS selectors like `.nav-item.active` do not apply.
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    const activeEls = sidebar.querySelectorAll(".active");
    activeEls.forEach((el) => el.classList.remove("active"));
    // If user is on dashboard root, ensure no sidebar menu is open by default
    if (location && location.pathname === "/dashboard") {
      setOpenMenu(null);
    }
  }, [location]);

  // Auto-scroll to top on route change so components rendered in <Outlet />
  // start at the top of the viewport. Also clear the scroll of the
  // '.content-wrapper' container if present (app may use inner scrolling).
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (
          typeof window !== "undefined" &&
          typeof window.scrollTo === "function"
        ) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch {
        // ignore
      }

      const content =
        document.querySelector(".content-wrapper") ||
        document.querySelector(".main-panel");
      if (content && typeof content.scrollTo === "function") {
        try {
          content.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        } catch {
          content.scrollTop = 0;
        }
      } else if (content) {
        content.scrollTop = 0;
      }
    }, 40);
    return () => clearTimeout(id);
  }, [location.pathname]);

  useEffect(() => {
    // enforce accordion: only the collapse matching openMenu should have 'show'
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    const collapses = sidebar.querySelectorAll(".collapse[data-menu-key]");
    collapses.forEach((el) => {
      const key = el.getAttribute("data-menu-key");
      if (openMenu === key) {
        el.classList.add("show");
      } else {
        el.classList.remove("show");
      }
    });
    // reset nested submenu state whenever a new main menu opens
    // (we don't yet track openSub in this file; if present, clear it here)
  }, [openMenu]);

  // Ensure the mobile hamburger always toggles the sidebar even if React mounts
  // after the page DOMContentLoaded handlers ran. This avoids relying on
  // external jQuery/bootstrap scripts for the offcanvas toggle.
  const handleMobileToggle = (e) => {
    e && e.preventDefault && e.preventDefault();
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("active");
  };

  // const isUiBasicOpen =
  const normalizedRoles = (authRoles || [])
    .map((r) => (r && r.startsWith("ROLE_") ? r.slice(5) : r))
    .map((r) => String(r || "").toUpperCase());

  const hasRole = (allowedRoles) => {
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true;
    return allowedRoles.some((r) =>
      normalizedRoles.includes(String(r).toUpperCase())
    );
  };

  const hasPermission = (requiredPerms) => {
    if (!Array.isArray(requiredPerms) || requiredPerms.length === 0)
      return true;
    const userPerms = Array.isArray(permissions) ? permissions : [];
    // show if user has ANY of the listed permissions
    return requiredPerms.some((p) => userPerms.includes(p));
  };

  const isVisibleItem = (item) => {
    // Require BOTH role and permission checks to pass for an item to be visible.
    // If an item has no explicit roles or permissions defined, that check
    // defaults to true (see hasRole / hasPermission helpers).
    const roleOk = hasRole(item.roles);
    const permOk = hasPermission(item.permissions);
    if (!roleOk || !permOk) return false;

    // If the item has children, ensure at least one child is visible
    // using the same strict logic. This prevents showing a parent menu
    // when none of its children are accessible.
    if (Array.isArray(item.children) && item.children.length > 0) {
      return item.children.some((child) => isVisibleItem(child));
    }

    return true;
  };

  const slug = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const renderChildren = (children, parentId, parentRoles) => {
    return (
      <ul className="nav flex-column sub-menu">
        {children
          .filter((child) => isVisibleItem(child))
          .map((child) => {
            const hasKids =
              Array.isArray(child.children) && child.children.length > 0;
            if (hasKids) {
              const nestedId =
                child.collapseId || `${parentId}-${slug(child.title)}`;
              return (
                <li key={nestedId} className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="collapse"
                    data-bs-target={`#${nestedId}`}
                    aria-expanded="false"
                    aria-controls={nestedId}
                  >
                    {child.title}
                  </a>
                  <ul
                    className="flex-column sub-menu collapse"
                    id={nestedId}
                    style={{ listStyle: "none" }}
                  >
                    {child.children
                      .filter((g) => isVisibleItem(g))
                      .map((g) => (
                        <li key={`${nestedId}-${slug(g.title)}`}>
                          {g.path ? (
                            <NavLink to={g.path} className="nav-link">
                              {g.title}
                            </NavLink>
                          ) : (
                            <span className="nav-link">{g.title}</span>
                          )}
                        </li>
                      ))}
                  </ul>
                </li>
              );
            }
            return (
              <li key={`${parentId}-${slug(child.title)}`} className="nav-item">
                {child.path ? (
                  <NavLink className="nav-link" to={child.path}>
                    {child.title}
                  </NavLink>
                ) : (
                  <span className="nav-link">{child.title}</span>
                )}
              </li>
            );
          })}
      </ul>
    );
  };

  const renderSidebar = () => {
    return sidebarMenu.filter(isVisibleItem).map((item) => {
      const hasKids = Array.isArray(item.children) && item.children.length > 0;
      if (!hasKids) {
        return (
          <li key={item.title} className="nav-item">
            <NavLink className="nav-link" to={item.path || "/dashboard"}>
              <span className="menu-title">{item.title}</span>
              {item.icon ? <i className={`${item.icon} menu-icon`} /> : null}
            </NavLink>
          </li>
        );
      }
      const key = item.collapseId || slug(item.title);
      const opened = openMenu === key;
      return (
        <li key={key} className="nav-item">
          <a
            className="nav-link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleToggleSafe(key);
            }}
          >
            <span className="menu-title">{item.title}</span>
            {item.icon ? <i className={`${item.icon} menu-icon`} /> : null}
          </a>
          <div
            className={`collapse ${opened ? "show" : ""}`}
            data-menu-key={key}
          >
            {renderChildren(item.children, key)}
          </div>
        </li>
      );
    });
  };
  //   location.pathname === "/add-new-employee" ||
  //   location.pathname === "/manage-employees";
  // const isFormsOpen = location.pathname === "/add-doctor";

  return (
    <div className="container-scroller">
      {/* partial:partials/_navbar.html */}
      <nav className="navbar default-layout-navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
        <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
          <a className="navbar-brand brand-logo" href="index.html">
            <img
              src="/assets/images/harishchandra-logo1.png"
              alt="logo"
              className="logo-dark"
              style={{ width: "60px", height: "60px", marginLeft: "20px" }}
            />
            <img
              src="/assets/images/logo-light.svg"
              alt="logo-light"
              className="logo-light"
            />
          </a>
          <a className="navbar-brand brand-logo-mini" href="index.html">
            <img src="/assets/images/harishchandra-logo1.png" alt="logo" />
          </a>
          <button
            className="navbar-toggler navbar-toggler align-self-center"
            type="button"
            data-bs-toggle="minimize"
          >
            <span className="icon-menu" />
          </button>
        </div>
        <div
          className="navbar-menu-wrapper d-flex align-items-center"
          style={{ backgroundColor: "#01c0c8" }}
        >
          <h5
            className="mb-0 font-weight-bold d-none d-lg-flex"
            style={{ fontSize: "20px", fontFamily: "Ubuntu, sans-serif" }}
          >
            Harishchandra Multispeciality
          </h5>
          <ul className="navbar-nav navbar-nav-right">
            <li className="nav-item dropdown user-dropdown me-2">
              <a
                className="nav-link dropdown-toggle"
                id="UserDropdown"
                href="#"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  className="img-xs rounded-circle ms-2"
                  src="/assets/images/profile-icon.jpg"
                  alt="Profile image"
                />
                <span className="font-weight-normal">
                  {" "}
                  {currentUser?.username || "Admin"}{" "}
                </span>
              </a>
              <div
                className="dropdown-menu dropdown-menu-right navbar-dropdown"
                aria-labelledby="UserDropdown"
              >
                <div className="dropdown-header text-center">
                  <img
                    className="img-md rounded-circle"
                    src="/assets/images/profile-icon1.png"
                    alt="Profile image"
                  />
                  <p className="mb-1 mt-3">
                    {currentUser?.username || "Admin"}
                  </p>
                  <p className="font-weight-light text-muted mb-0">
                    {currentUser?.firstName + " " + currentUser?.lastName}
                  </p>
                </div>
                <NavLink to="/dashboard/my-profile" className="dropdown-item">
                  <i className="dropdown-item-icon icon-user text-primary" /> My
                  Profile
                  <span className="badge badge-pill badge-danger">1</span>
                </NavLink>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    dispatch(logout());
                    navigate("/");
                  }}
                >
                  <i className="dropdown-item-icon icon-power text-primary" />
                  Sign Out
                </button>
              </div>
            </li>
          </ul>
          <button
            className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
            type="button"
            onClick={handleMobileToggle}
          >
            <span className="icon-menu" />
          </button>
        </div>
      </nav>
      {/* partial */}
      <div className="container-fluid page-body-wrapper px-0 pb-0">
        {/* partial:partials/_sidebar.html */}
        <nav className="sidebar sidebar-offcanvas" id="sidebar">
          <ul className="nav">
            <li className="nav-item navbar-brand-mini-wrapper mt-3">
              <a
                className="nav-link navbar-brand brand-logo-mini"
                href="index.html"
              >
                <img
                  className="mt-2"
                  src="/assets/images/harishchandra-logo1.png"
                  alt="logo"
                  width={"50px"}
                  height={"50px"}
                />
              </a>
            </li>
            {/* ################## */}
            <li className="nav-item nav-category">
              <span className="nav-link" />
            </li>
            {/* ################## */}
            {renderSidebar()}
            {SHOW_LEGACY_SIDEBAR && (
              <>
                {/* Legacy static menu below (disabled) */}
                {isAllowed("dashboard") && (
                  <li className="nav-item">
                    <NavLink to="/dashboard" end className="nav-link">
                      <span className="menu-title">Dashboard</span>
                      <i className="fa fa-tachometer-alt menu-icon" />
                    </NavLink>
                  </li>
                )}
                {isAllowed("hr") && (
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleSafe("hr");
                      }}
                    >
                      <span className="menu-title">Human Resources</span>
                      <i className="fa fa-users menu-icon" />
                    </a>
                    <div
                      className={`collapse ${openMenu === "hr" ? "show" : ""}`}
                      data-menu-key="hr"
                    >
                      <ul className="nav flex-column sub-menu">
                        <li className="nav-item">
                          <NavLink className="nav-link" to="add-new-employee">
                            Add Employee
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink className="nav-link" to="manage-employees">
                            Manage Employee
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </li>
                )}
                {isAllowed("departments") && (
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenMenu(
                          openMenu === "departments" ? null : "departments"
                        );
                      }}
                    >
                      <span className="menu-title">Departments</span>
                      <i className="fa fa-building menu-icon" />
                    </a>
                    <div
                      className={`collapse ${
                        openMenu === "departments" ? "show" : ""
                      }`}
                      data-menu-key="departments"
                    >
                      <ul className="nav flex-column sub-menu">
                        <li className="nav-item">
                          <NavLink className="nav-link" to="add-department">
                            Add Department
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink className="nav-link" to="manage-department">
                            Manage Departments{" "}
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </li>
                )}
                {isAllowed("doctor") && (
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleSafe("doctor");
                      }}
                    >
                      <span className="menu-title">Doctor</span>
                      <i className="fa fa-user-md menu-icon" />
                    </a>
                    <div
                      className={`collapse ${
                        openMenu === "doctor" ? "show" : ""
                      }`}
                      data-menu-key="doctor"
                    >
                      <ul className="nav flex-column sub-menu">
                        <li className="nav-item">
                          <NavLink to="add-doctor" className="nav-link">
                            Add Doctor
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" href="#">
                            View Doctor’s List{" "}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </li>
                )}
                {isAllowed("patient") && (
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenMenu(openMenu === "patient" ? null : "patient");
                      }}
                    >
                      <span className="menu-title"> Patient Management</span>
                      <i className="fa fa-procedures menu-icon" />
                    </a>
                    <div
                      className={`collapse ${
                        openMenu === "patient" ? "show" : ""
                      }`}
                      data-menu-key="patient"
                    >
                      <ul className="nav flex-column sub-menu">
                        {/* OPD Management */}
                        <li className="nav-item">
                          <a
                            className="nav-link"
                            data-bs-toggle="collapse"
                            data-bs-target="#opdMenu"
                            aria-expanded="false"
                            aria-controls="opdMenu"
                          >
                            OPD Management
                          </a>
                          <ul
                            className="flex-column sub-menu collapse"
                            id="opdMenu"
                            data-bs-parent="#charts"
                            style={{ listStyle: "none" }}
                          >
                            <li>
                              <a href="#" className="nav-link">
                                Add Patients
                              </a>
                            </li>
                            <li>
                              <a href="#" className="nav-link">
                                View Patients
                              </a>
                            </li>
                            <li>
                              <a href="#" className="nav-link">
                                Add Prescriptions
                              </a>
                            </li>
                            <li>
                              <a href="#" className="nav-link">
                                Lab Orders
                              </a>
                            </li>
                            <li>
                              <a href="#" className="nav-link">
                                Billing
                              </a>
                            </li>
                          </ul>
                        </li>
                        {/* IPD Management */}
                        <li className="nav-item">
                          <a
                            className="nav-link"
                            data-bs-toggle="collapse"
                            data-bs-target="#ipdMenu"
                            aria-expanded="false"
                            aria-controls="ipdMenu"
                          >
                            IPD Management
                          </a>
                          <ul
                            className="flex-column sub-menu collapse"
                            id="ipdMenu"
                            data-bs-parent="#charts"
                            style={{ listStyle: "none" }}
                          >
                            <li>
                              <a href="#" className="nav-link">
                                Add Patient
                              </a>
                            </li>
                            <li>
                              <a href="#" className="nav-link">
                                View Patient
                              </a>
                            </li>
                            <li>
                              <a href="#" className="nav-link">
                                Ward/Bed Allocation
                              </a>
                            </li>
                            <li>
                              <a href="#" className="nav-link">
                                Prescriptions
                              </a>
                            </li>
                            <li>
                              <a href="#" className="nav-link">
                                Lab Orders
                              </a>
                            </li>
                            <li>
                              <a href="#" className="nav-link">
                                Discharge Summary
                              </a>
                            </li>
                            <li>
                              <a href="#" className="nav-link">
                                Billing
                              </a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </li>
                )}
                {isAllowed("schedule") && (
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenMenu(
                          openMenu === "schedule" ? null : "schedule"
                        );
                      }}
                    >
                      <span className="menu-title">Doctor’s Schedule</span>
                      <i className="fa fa-calendar-alt menu-icon" />
                    </a>
                    <div
                      className={`collapse ${
                        openMenu === "schedule" ? "show" : ""
                      }`}
                      data-menu-key="schedule"
                    >
                      <ul className="nav flex-column sub-menu">
                        <li className="nav-item">
                          <NavLink
                            className="nav-link"
                            to="/dashboard/add-doctor-schedule"
                          >
                            Add Schedule
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink
                            className="nav-link"
                            to="view-doctor-schedule-list"
                          >
                            View Schedule{" "}
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </li>
                )}
                {isAllowed("appointments") && (
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenMenu(
                          openMenu === "appointments" ? null : "appointments"
                        );
                      }}
                    >
                      <span className="menu-title">Appointments</span>
                      <i className="fa fa-calendar-check menu-icon" />
                    </a>
                    <div
                      className={`collapse ${
                        openMenu === "appointments" ? "show" : ""
                      }`}
                    >
                      <ul className="nav flex-column sub-menu">
                        <li className="nav-item">
                          <NavLink
                            className="nav-link"
                            to="add-patient-appointment"
                          >
                            {" "}
                            Add Appointments{" "}
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink
                            className="nav-link"
                            to="view-patient-appointments"
                          >
                            {" "}
                            View Appointments{" "}
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </li>
                )}
                {isAllowed("billing") && (
                  <li className="nav-item">
                    <NavLink to="#" className="nav-link">
                      <span className="menu-title">Invoice</span>
                      <i className="fa fa-file-invoice menu-icon" />
                    </NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(openMenu === "case" ? null : "case");
                    }}
                  >
                    <span className="menu-title">Case Manager</span>
                    <i className="fa fa-briefcase-medical menu-icon" />
                  </a>
                  <div
                    className={`collapse ${openMenu === "case" ? "show" : ""}`}
                    data-menu-key="case"
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <a className="nav-link" href="add-case-study.html">
                          Add Case Study
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="case-list.html">
                          View Case Study
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(openMenu === "bed" ? null : "bed");
                    }}
                  >
                    <span className="menu-title">Bed Manager</span>
                    <i className="fa fa-bed menu-icon" />
                    {/* <i class="fa-solid fa-bed-pulse"></i> */}
                  </a>
                  <div
                    className={`collapse ${openMenu === "bed" ? "show" : ""}`}
                    data-menu-key="bed"
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <NavLink className="nav-link" to="add-beds">
                          Add New Bed
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="add-room">
                          Add New Room
                        </NavLink>
                      </li>

                      <li className="nav-item">
                        <NavLink className="nav-link" to="bed-list">
                          Bed List
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(openMenu === "reports" ? null : "reports");
                    }}
                  >
                    <span className="menu-title">Reports</span>
                    <i className="fa fa-file-medical-alt menu-icon" />
                  </a>
                  <div
                    className={`collapse ${
                      openMenu === "reports" ? "show" : ""
                    }`}
                    data-menu-key="reports"
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          data-bs-toggle="collapse"
                          data-bs-target="#pathMenu"
                          aria-expanded="false"
                          aria-controls="pathMenu"
                        >
                          Pathology Reports
                        </a>
                        <ul
                          className="flex-column sub-menu collapse"
                          id="pathMenu"
                          data-bs-parent="#reports"
                          style={{ listStyle: "none" }}
                        >
                          <li>
                            <NavLink
                              to="add-pathology-report"
                              className="nav-link"
                            >
                              Add New Report
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="manage-pathology-reports"
                              className="nav-link"
                            >
                              Manage Reports
                            </NavLink>
                          </li>
                        </ul>
                      </li>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          data-bs-toggle="collapse"
                          data-bs-target="#radMenu"
                          aria-expanded="false"
                          aria-controls="radMenu"
                        >
                          Radiology Reports
                        </a>
                        <ul
                          className="flex-column sub-menu collapse"
                          id="radMenu"
                          data-bs-parent="#reports"
                          style={{ listStyle: "none" }}
                        >
                          <li>
                            <NavLink
                              to="add-radiology-report"
                              className="nav-link"
                            >
                              Add New Report
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="manage-radiology-reports"
                              className="nav-link"
                            >
                              Manage Reports
                            </NavLink>
                          </li>
                        </ul>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          className="nav-link"
                          to="baby-birth-certificate"
                        >
                          Birth Reports
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="death-certificate">
                          Death Reports
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          className="nav-link"
                          to="manage-birth-certificates"
                        >
                          Manage Birth Certificates
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          className="nav-link"
                          to="manage-death-certificates"
                        >
                          Manage Birth Certificates
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(
                        openMenu === "prescriptions" ? null : "prescriptions"
                      );
                    }}
                  >
                    <span className="menu-title">Prescriptions</span>
                    <i className="fa fa-prescription-bottle-alt menu-icon" />
                  </a>
                  <div
                    className={`collapse ${
                      openMenu === "prescriptions" ? "show" : ""
                    }`}
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <NavLink className="nav-link" to="add-new-prescription">
                          Add New Prescriptions
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="manage-prescriptions">
                          Manage Prescriptions
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(openMenu === "pharmacy" ? null : "pharmacy");
                    }}
                  >
                    <span className="menu-title">Pharmacy</span>
                    <i className="fa fa-pills menu-icon" />
                  </a>
                  <div
                    className={`collapse ${
                      openMenu === "pharmacy" ? "show" : ""
                    }`}
                    data-menu-key="pharmacy"
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <NavLink className="nav-link" to="pharmacy-module">
                          Inventory
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(
                        openMenu === "insurance" ? null : "insurance"
                      );
                    }}
                  >
                    <span className="menu-title">Insurance</span>
                    <i className="fa fa-shield-alt menu-icon" />
                  </a>
                  <div
                    className={`collapse ${
                      openMenu === "insurance" ? "show" : ""
                    }`}
                    data-menu-key="insurance"
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          data-bs-toggle="collapse"
                          data-bs-target="#polMenu"
                          aria-expanded="false"
                          aria-controls="polMenu"
                        >
                          Policy Management
                        </a>
                        <ul
                          className="flex-column sub-menu collapse"
                          id="polMenu"
                          data-bs-parent="#insurance"
                          style={{ listStyle: "none" }}
                        >
                          <li>
                            <a href="#" className="nav-link">
                              Add Insurance/Register Patient
                            </a>
                          </li>
                          <li>
                            <a href="#" className="nav-link">
                              Manage Insurance
                            </a>
                          </li>
                        </ul>
                      </li>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          data-bs-toggle="collapse"
                          data-bs-target="#claimMenu"
                          aria-expanded="false"
                          aria-controls="claimMenu"
                        >
                          Claims
                        </a>
                        <ul
                          className="flex-column sub-menu collapse"
                          id="claimMenu"
                          data-bs-parent="#insurance"
                          style={{ listStyle: "none" }}
                        >
                          <li>
                            <a href="#" className="nav-link">
                              Add Claim
                            </a>
                          </li>
                          <li>
                            <a href="#" className="nav-link">
                              Manage Claims
                            </a>
                          </li>
                        </ul>
                      </li>
                      <li className="nav-item">
                        <a
                          className="nav-link"
                          data-bs-toggle="collapse"
                          data-bs-target="#rpMenu"
                          aria-expanded="false"
                          aria-controls="rpMenu"
                        >
                          Report
                        </a>
                        <ul
                          className="flex-column sub-menu collapse"
                          id="rpMenu"
                          data-bs-parent="#insurance"
                          style={{ listStyle: "none" }}
                        >
                          <li>
                            <a href="#" className="nav-link">
                              Claim Summary / Report
                            </a>
                          </li>
                          <li>
                            <a href="#" className="nav-link">
                              Outstanding Claim Report
                            </a>
                          </li>
                          <li>
                            <a href="#" className="nav-link">
                              Approval Report
                            </a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(openMenu === "blood" ? null : "blood");
                    }}
                  >
                    <span className="menu-title">Blood Bank</span>
                    <i className="fa fa-tint menu-icon" />
                  </a>
                  <div
                    className={`collapse ${openMenu === "blood" ? "show" : ""}`}
                    data-menu-key="blood"
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <NavLink className="nav-link" to="add-new-donor">
                          Add New Donor
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="manage-donors">
                          Manage Donors
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="add-stock">
                          Add Blood Stock
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="manage-blood-stock">
                          Manage Blood Stock
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(openMenu === "finances" ? null : "finances");
                    }}
                  >
                    <span className="menu-title">Finances</span>
                    <i className="fa fa-wallet menu-icon" />
                  </a>
                  <div
                    className={`collapse ${
                      openMenu === "finances" ? "show" : ""
                    }`}
                    data-menu-key="finances"
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Add Invoice
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Manage Invoices
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Financial Report
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(openMenu === "assets" ? null : "assets");
                    }}
                  >
                    <span className="menu-title">Asset Management</span>
                    <i className="fa fa-cogs menu-icon" />
                  </a>
                  <div
                    className={`collapse ${
                      openMenu === "assets" ? "show" : ""
                    }`}
                    data-menu-key="assets"
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <NavLink className="nav-link" to="add-asset">
                          Add New Assets
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="asset-list">
                          Manage Assets
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </li>
                {/* <li className="nav-item">
              <a
                className="nav-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenMenu(openMenu === "activities" ? null : "activities");
                }}
              >
                <span className="menu-title">Activities</span>
                <i className="fa fa-tasks menu-icon" />
              </a>
              <div
                className={`collapse ${
                  openMenu === "activities" ? "show" : ""
                }`}
              >
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      Add New Birth Records
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      Manage Birth Records
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      Add Death Records
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      Manage Death Records
                    </a>
                  </li>
                </ul>
              </div>
            </li> */}
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(
                        openMenu === "ambulance" ? null : "ambulance"
                      );
                    }}
                  >
                    <span className="menu-title">Ambulance Management</span>
                    <i className="fa fa-ambulance menu-icon" />
                  </a>
                  <div
                    className={`collapse ${
                      openMenu === "ambulance" ? "show" : ""
                    }`}
                    data-menu-key="ambulance"
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <NavLink className="nav-link" to="ambulance-dashboard">
                          Ambulance Dashboard
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="ambulance-add">
                          Add New Ambulance
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="ambulance-assignment">
                          Ambulance Assignment
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="add-driver">
                          Add Driver
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(openMenu === "packages" ? null : "packages");
                    }}
                  >
                    <span className="menu-title">Health Packages</span>
                    <i className="fa fa-heartbeat menu-icon" />
                  </a>
                  <div
                    className={`collapse ${
                      openMenu === "packages" ? "show" : ""
                    }`}
                    data-menu-key="packages"
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <NavLink className="nav-link" to="add-health-package">
                          Add Health Packages
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          className="nav-link"
                          to="manage-health-packages"
                        >
                          Manage Health Packages
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenu(openMenu === "notice" ? null : "notice");
                    }}
                  >
                    <span className="menu-title">Notice Board</span>
                    <i className="fa fa-bullhorn menu-icon" />
                  </a>
                  <div
                    className={`collapse ${
                      openMenu === "notice" ? "show" : ""
                    }`}
                    data-menu-key="notice"
                  >
                    <ul className="nav flex-column sub-menu">
                      <li className="nav-item">
                        <NavLink className="nav-link" to="add-new-notice">
                          Add New Notice
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="manage-notices">
                          Manage Notices
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="settings">
                    <span className="menu-title">Settings</span>
                    <i className="fa fa-cog menu-icon" />
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
        {/* partial */}
        <div className="main-panel">
          <div className="content-wrapper mt-n3">
            <Outlet />
          </div>
          {/* <Outlet /> */}

          {/* content-wrapper ends */}
          {/* partial:partials/_footer.html */}
          <footer className="footer">
            <div className="d-sm-flex justify-content-center justify-content-sm-between">
              <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">
                Copyright © 2025 Hospital Management System. All rights
                reserved.
                {/* <a href="#"> Terms of use</a
          ><a href="#">Privacy Policy</a> */}
              </span>
              <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
                Designed and Developed by
                <a
                  href="https://kavyainfoweb.com/"
                  target="_blank"
                  style={{ textDecoration: "none", color: "rgb(2, 62, 62)" }}
                >
                  Kavya Infoweb Pvt. Ltd.
                </a>
              </span>
            </div>
          </footer>
          {/* partial */}
        </div>
        {/* main-panel ends */}
      </div>
      {/* page-body-wrapper ends */}
    </div>
  );
};

export default Layout;
