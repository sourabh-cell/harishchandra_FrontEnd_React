import React, { useState } from "react";

const Medicine1 = () => {
  const [medicineData, setMedicineData] = useState({
    drugId: "MED001",
    drugName: "Paracetamol 500mg",
    drugCategory: "Antipyretic",
    drugType: "Tablet",
    drugManufacturer: "Sun Pharmaceutical",
    drugBatch: "BTH001",
    drugQty: 1000,
    drugBarcode: "8901234567001"
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setMedicineData({ ...medicineData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Medicine 1 submitted:", medicineData);
    alert("Medicine 1 saved successfully!");
  };

  return (
    <div className="medicine1-container">
      <h5 className="mb-3">
        <i className="fa-solid fa-pills me-2"></i>Medicine - First Entry
      </h5>
      
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Drug ID</label>
            <input
              type="text"
              id="drugId"
              className="form-control"
              value={medicineData.drugId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Name</label>
            <input
              type="text"
              id="drugName"
              className="form-control"
              value={medicineData.drugName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Category</label>
            <select
              id="drugCategory"
              className="form-select"
              value={medicineData.drugCategory}
              onChange={handleChange}
            >
              <option>Antibiotic</option>
              <option>Analgesic</option>
              <option>Antipyretic</option>
              <option>Supplement</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Type</label>
            <select
              id="drugType"
              className="form-select"
              value={medicineData.drugType}
              onChange={handleChange}
            >
              <option>Tablet</option>
              <option>Syrup</option>
              <option>Injection</option>
              <option>Ointment</option>
              <option>Capsule</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Manufacturer</label>
            <input
              type="text"
              id="drugManufacturer"
              className="form-control"
              value={medicineData.drugManufacturer}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Batch No.</label>
            <input
              type="text"
              id="drugBatch"
              className="form-control"
              value={medicineData.drugBatch}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              id="drugQty"
              className="form-control"
              value={medicineData.drugQty}
              onChange={handleChange}
              min={0}
            />
          </div>
          
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            style={{ backgroundColor: "#01C0C8", border: 0 }}
          >
            <i className="fa-solid fa-floppy-disk me-1"></i> Save Medicine 1
          </button>
        </div>
      </form>
    </div>
  );
};

export default Medicine1;
