const AddBloodStock = () => {
  return (
    <div className="card full-width-card shadow">
      {/* Header */}
      <div className="card-header d-flex align-items-center">
        <h3 className="mb-0 text-white d-flex align-items-center">
          <i className="fa-solid fa-droplet fa-lg text-white me-2"></i>
          Add Blood Stock
        </h3>
      </div>

      {/* Form Body */}
      <div className="card-body">
        <form id="addStockForm" noValidate>
          {/* Stock ID */}
          <div className="mb-3">
            <label htmlFor="stockId" className="form-label">
              Stock ID
            </label>
            <input
              type="text"
              className="form-control"
              id="stockId"
              name="stockId"
              placeholder="Stock ID will appear here"
              readOnly
              required
              disabled
            />
          </div>

          {/* Blood Group */}
          <div className="mb-3">
            <label htmlFor="bloodGroup" className="form-label">
              Blood Group
            </label>
            <select
              className="form-select"
              id="bloodGroup"
              name="bloodGroup"
              required
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="O-">O-</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="A-">A-</option>
              <option value="O+">O+</option>
              <option value="AB-">AB-</option>
              <option value="B-">B-</option>
            </select>
          </div>

          {/* Units */}
          <div className="mb-3">
            <label htmlFor="unitsAvailable" className="form-label">
              Add Units To Stock
            </label>
            <input
              type="number"
              min="0"
              className="form-control"
              id="unitsAvailable"
              name="unitsAvailable"
              placeholder="e.g. 12"
              required
            />
          </div>

          {/* Expiry Date */}
          <div className="mb-3">
            <label htmlFor="expiryDate" className="form-label">
              Expiry Date
            </label>
            <input
              type="date"
              className="form-control"
              id="expiryDate"
              name="expiryDate"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="d-flex justify-content-center align-items-center">
            <button type="submit" className="btn btn-primary px-4">
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBloodStock;
