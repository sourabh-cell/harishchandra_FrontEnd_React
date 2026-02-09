import React, { useState } from "react"; 
import Medicine1 from "./Medicine1";
import Inventory from "./Inventory";
import Prescription from "./Prescription";
import Invoice from "./Invoice";
import Order from "./Order";

function PharmacyModule() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [activeTab, setActiveTab] = useState("medicine1");

  // Define tab icons
  const tabIcons = {
    medicine1: "fa-pills",
    inventory: "fa-boxes-stacked",
    prescription: "fa-prescription",
    invoice: "fa-file-invoice-dollar",
    order: "fa-cart-shopping",
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
        {["medicine1", "inventory", "prescription", "invoice", "order"].map(
          (tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab(tab)}
              >
                <i className={`fa-solid ${tabIcons[tab]} me-2`}></i>
                {tab === "medicine1" ? "Medicine 1" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          )
        )}
      </ul>

      {/* Tab content */}
      <div className="p-3">
        {activeTab === "medicine1" && <Medicine1 />}
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
      </div>
    </div>
  );
}

export default PharmacyModule;
