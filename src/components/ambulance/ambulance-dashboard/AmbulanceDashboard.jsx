import React, { useState, useEffect } from "react";
import "./AmbulanceDashboard.css";
import AmbulanceTable from "../ambulance-table/AmbulanceTable";
import DriverTable from "../driver-table/DriverTable";
import AssignmentTable from "../assignment-table/AssignmentTable";
import ViewAmbulanceAssignmentCompletedTable from "../view-ambulance-assignment-complited-table/ViewAmbulanceAssignmentCompletedTable";

const AmbulanceDashboard = () => {
  const [activeTab, setActiveTab] = useState("ambulance");
  const [tabData, setTabData] = useState("Loading...");
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch content from backend when tab changes
  useEffect(() => {
    // For the ambulance, driver, assignment and assignmentHistory tabs we render React components directly
    if (
      activeTab === "ambulance" ||
      activeTab === "driver" ||
      activeTab === "assignment" ||
      activeTab === "assignmentHistory"
    ) {
      setTabData(null);
      return;
    }

    const fetchData = async () => {
      let url = "";
      switch (activeTab) {
        case "assignment":
          url = "/assignment/list";
          break;
        case "assignmentHistory":
          url = "/assignment/history";
          break;
        default:
          return;
      }

      try {
        setTabData("Loading...");
        const res = await fetch(url);
        const html = await res.text();
        setTabData(html);
      } catch (error) {
        console.error("Error fetching tab data:", error);
        setTabData("<p class='text-danger'>Failed to load data.</p>");
      }
    };

    fetchData();
  }, [activeTab]);

  // Clear search when changing tabs
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  return (
    <div className="ambulance-dashboard">
      {/* ============================ */}
      {/* Title Bar Section */}
      {/* ============================ */}

      <div className="position-relative heading text-white rounded-top">
        <div className="header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-truck-medical"></i>
            <h4 className="mb-0">Ambulance Management Dashboard</h4>
          </div>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "white", color: "black" }}
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ============================ */}
      {/* Search Bar Section */}
      {/* ============================ */}
      <div className="border-start border-end p-3 bg-white">
        <div className="input-group">
          <span className="input-group-text">
            <i className="fa-solid fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setSearchQuery("")}
            >
              <i className="fa-solid fa-times"></i>
            </button>
          )}
        </div>
        {searchQuery && (
          <small className="text-muted mt-1 d-block">
            Searching for: "{searchQuery}"
          </small>
        )}
      </div>

      {/* ============================ */}
      {/* Tabs Section */}
      {/* ============================ */}
      <div className="border rounded-bottom p-3 bg-white">
        <ul
          className="nav nav-tabs"
          id="dashboardTabs"
          role="tablist"
          style={{ fontSize: "medium" }}
        >
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "ambulance" ? "active" : ""
              }`}
              onClick={() => setActiveTab("ambulance")}
            >
              View Ambulance
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "driver" ? "active" : ""}`}
              onClick={() => setActiveTab("driver")}
            >
              View Driver
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "assignment" ? "active" : ""
              }`}
              onClick={() => setActiveTab("assignment")}
            >
              View Ambulance Assignment
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "assignmentHistory" ? "active" : ""
              }`}
              onClick={() => setActiveTab("assignmentHistory")}
            >
              View Ambulance Assignment Completed
            </button>
          </li>
        </ul>

        {/* ============================ */}
        {/* Tab Content */}
        {/* ============================ */}
        <div className="tab-content">
          {activeTab === "ambulance" ? (
            <div className="tab-pane fade show active">
              <AmbulanceTable
                refreshKey={refreshKey}
                searchQuery={searchQuery}
              />
            </div>
          ) : activeTab === "driver" ? (
            <div className="tab-pane fade show active">
              <DriverTable refreshKey={refreshKey} searchQuery={searchQuery} />
            </div>
          ) : activeTab === "assignment" ? (
            <div className="tab-pane fade show active">
              <AssignmentTable
                refreshKey={refreshKey}
                searchQuery={searchQuery}
              />
            </div>
          ) : activeTab === "assignmentHistory" ? (
            <div className="tab-pane fade show active">
              <ViewAmbulanceAssignmentCompletedTable
                refreshKey={refreshKey}
                searchQuery={searchQuery}
              />
            </div>
          ) : (
            <div
              className="tab-pane fade show active"
              dangerouslySetInnerHTML={{ __html: tabData }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AmbulanceDashboard;
