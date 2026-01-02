import React, { useState } from "react";
import Inventory from "./Inventory";
import Prescription from "./Prescription";
import Invoice from "./Invoice";
import Order from "./Order";
import Report from "./Report";

function PharmacyModule() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");

  // Define tab icons
  const tabIcons = {
    inventory: "fa-boxes-stacked",
    prescription: "fa-prescription",
    invoice: "fa-file-invoice-dollar",
    order: "fa-cart-shopping",
    report: "fa-chart-line",
  };

  return (
    <div className="full-width-card card shadow-sm">
      {/* Header */}
      <div
        className=" card-header d-flex justify-content-between align-items-center text-white"
        style={{ backgroundColor: "#01C0C8" }}
      >
        <h4 className="mb-0">
          <i className="fa-solid fa-prescription me-2"></i> Pharmacy Module
        </h4>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs px-3 pt-2">
        {["inventory", "prescription", "invoice", "order", "report"].map(
          (tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab(tab)}
              >
                <i className={`fa-solid ${tabIcons[tab]} me-2`}></i>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          )
        )}
      </ul>

      {/* Tab content */}
      <div className="p-3">
        {activeTab === "inventory" && (
          <Inventory
            search={search}
            setSearch={setSearch}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterType={filterType}
            setFilterType={setFilterType}
          />
        )}
        {activeTab === "prescription" && (
          <Prescription
            search={search}
            setSearch={setSearch}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterType={filterType}
            setFilterType={setFilterType}
          />
        )}
        {activeTab === "invoice" && <Invoice />}
        {activeTab === "order" && <Order />}
        {activeTab === "report" && <Report />}
      </div>
    </div>
  );
}

export default PharmacyModule;
