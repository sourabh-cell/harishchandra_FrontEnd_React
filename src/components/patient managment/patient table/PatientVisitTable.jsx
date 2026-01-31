import React, { useState } from "react";

const initialPatient = {
  hospitalId: "HSP001",
  name: "Rahul Patil",
  age: 30,
  contact: "9876543210",
  visitType: "OPD",
  visitStatus: "Active",
  department: "General",
  doctor: "Dr. Sharma",
  refBy: "Dr. Patil",
  refTo: "Dr. Mehta",
  date: "2026-01-25",
  reason: "Fever & Cold",
};

function PatientVisitTable() {
  const [patient, setPatient] = useState(initialPatient);
  const [viewData, setViewData] = useState(null);
  const [editData, setEditData] = useState(null);

  const handleUpdate = () => {
    if (editData) {
      setPatient(editData);
    }
  };

  return (
    <div className="container mt-4">
      
        <div className="card-header bg-info text-white text-center fs-4 fw-semibold py-3">
         Patient Table
        </div>

        <div className="card-body">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-info">
              <tr>
                <th>Hospital ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Contact</th>
                <th>Visit Type</th>
                <th>Visit Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>{patient.hospitalId}</td>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.contact}</td>
                <td>{patient.visitType}</td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={patient.visitStatus}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        visitStatus: e.target.value,
                      })
                    }
                  >
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Discharge</option>
                    <option>Cancel</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#viewModal"
                    onClick={() => setViewData(patient)}
                  >
                    <i className="bi bi-eye"></i>
                  </button>

                  <button
                    className="btn btn-sm btn-warning ms-1"
                    data-bs-toggle="modal"
                    data-bs-target="#updateModal"
                    onClick={() => setEditData({ ...patient })}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      

      {/* ================= VIEW MODAL ================= */}
      <div className="modal fade" id="viewModal">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5 className="modal-title">View Patient Visit</h5>
              <button
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            {viewData && (
              <div className="modal-body">
                <div className="row g-3">
                  {Object.entries(viewData).map(([key, val]) => (
                    <div className="col-md-6" key={key}>
                      <label className="fw-semibold text-capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input className="form-control" value={val} readOnly />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= UPDATE MODAL ================= */}
      <div className="modal fade" id="updateModal">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ background: "#01c0c8" }}
            >
              <h5 className="modal-title">Update Patient Visit</h5>
              <button
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            {editData && (
              <div className="modal-body">
                <div className="row g-3">
                  {Object.entries(editData).map(([key, val]) => (
                    <div className="col-md-6" key={key}>
                      <label className="fw-semibold text-capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </label>

                      <input
                        type={key === "date" ? "date" : "text"}
                        className="form-control"
                        value={val}
                        onChange={(e) => {
                          let value = e.target.value;

                          // ONLY NUMBERS
                          if (["age", "contact"].includes(key)) {
                            value = value.replace(/[^0-9]/g, "");
                          }

                          // ONLY ALPHABETS + SPACE
                          if (
                            [
                              "name",
                              "visitType",
                              "visitStatus",
                              "doctor",
                              "department",
                              "refBy",
                              "refTo",
                              "reason",
                            ].includes(key)
                          ) {
                            value = value.replace(/[^A-Za-z\s]/g, "");
                          }

                          setEditData({
                            ...editData,
                            [key]: value,
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-success"
                data-bs-dismiss="modal"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientVisitTable;
