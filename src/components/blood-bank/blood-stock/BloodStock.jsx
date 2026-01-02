import { NavLink } from "react-router-dom";
import "./BloodStock.css";

const BloodStock = () => {
  return (
    <div className="card full-width-card shadow-lg border-0 rounded-3 overflow-hidden">
      {/* Header */}
      <div className="card-header text-white d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center mx-auto mx-md-0">
          <i className="fa-solid fa-droplet fa-lg me-2"></i>
          <h4 className="mb-0 fw-semibold">Blood Stock</h4>
        </div>

        <div className="d-flex gap-2">
          <NavLink
            className="btn btn-light btn-sm fw-semibold"
            to="/dashboard/add-stock"
          >
            <i className="fa-solid fa-plus me-1"></i> Add Stock
          </NavLink>
          <button className="btn btn-outline-light custom-hover text-white btn-sm fw-semibold">
            <i className="fa-regular fa-clock me-1"></i> Expired Units
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered align-middle text-center mb-0">
            <thead className="table-light">
              <tr>
                <th>SL.NO</th>
                <th>Stock ID</th>
                <th>Blood Group</th>
                <th>Units Available</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>STK-1001</td>
                <td>
                  <span className="badge text-bg-danger">A+</span>
                </td>
                <td>12</td>
                <td>2025-11-05</td>
                <td>
                  <button className="btn btn-success btn-sm">Use Unit</button>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>STK-1002</td>
                <td>
                  <span className="badge text-bg-dark">O-</span>
                </td>
                <td>0</td>
                <td>2025-10-30</td>
                <td>
                  <button className="btn btn-secondary btn-sm" disabled>
                    No Units
                  </button>
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>STK-1003</td>
                <td>
                  <span className="badge text-bg-primary">B+</span>
                </td>
                <td>5</td>
                <td>2025-12-15</td>
                <td>
                  <button className="btn btn-success btn-sm">Use Unit</button>
                </td>
              </tr>
              <tr>
                <td>4</td>
                <td>STK-1004</td>
                <td>
                  <span className="badge text-bg-warning text-dark">AB+</span>
                </td>
                <td>1</td>
                <td>2025-10-20</td>
                <td>
                  <button className="btn btn-success btn-sm">Use Unit</button>
                </td>
              </tr>
              <tr>
                <td>5</td>
                <td>STK-1005</td>
                <td>
                  <span className="badge text-bg-secondary">A-</span>
                </td>
                <td>0</td>
                <td>2025-09-28</td>
                <td>
                  <button className="btn btn-outline-danger btn-sm" disabled>
                    Expired
                  </button>
                </td>
              </tr>
              <tr>
                <td>6</td>
                <td>STK-1006</td>
                <td>
                  <span className="badge text-bg-success">O+</span>
                </td>
                <td>9</td>
                <td>2025-11-22</td>
                <td>
                  <button className="btn btn-success btn-sm">Use Unit</button>
                </td>
              </tr>
              <tr>
                <td>7</td>
                <td>STK-1007</td>
                <td>
                  <span className="badge text-bg-info text-dark">AB-</span>
                </td>
                <td>0</td>
                <td>2025-10-02</td>
                <td>
                  <button className="btn btn-secondary btn-sm" disabled>
                    No Units
                  </button>
                </td>
              </tr>
              <tr>
                <td>8</td>
                <td>STK-1008</td>
                <td>
                  <span className="badge text-bg-primary">B-</span>
                </td>
                <td>3</td>
                <td>2025-12-01</td>
                <td>
                  <button className="btn btn-success btn-sm">Use Unit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-muted small mb-0">
          Note: Actions are enabled only when units are available and not
          expired.
        </p>
      </div>
    </div>
  );
};

export default BloodStock;
