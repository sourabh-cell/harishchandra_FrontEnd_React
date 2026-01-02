import React, { useState, useEffect } from "react";


const ManageInvoice = () => {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    patientId: "",
    age: "",
    contact: "",
    admission: "",
    discharge: "",
    method: "Cash",
    status: "Paid",
    doctors: [{ name: "", fee: 0 }],
    tests: [{ name: "Blood Test", price: 0 }],
    medicines: [{ name: "Paracetamol", qty: 1, price: 10 }],
    beds: [{ type: "General Ward", days: 1, price: 1000 }],
  });
  const [editIndex, setEditIndex] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    setPatients(savedPatients);
  }, []);

  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patients));
  }, [patients]);

  const resetForm = () => {
    setFormData({
      name: "",
      patientId: "",
      age: "",
      contact: "",
      admission: "",
      discharge: "",
      method: "Cash",
      status: "Paid",
      doctors: [{ name: "", fee: 0 }],
      tests: [{ name: "Blood Test", price: 0 }],
      medicines: [{ name: "Paracetamol", qty: 1, price: 10 }],
      beds: [{ type: "General Ward", days: 1, price: 1000 }],
    });
    setEditIndex(null);
  };

  const handleAddRow = (key, newRow) => {
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], newRow] }));
  };

  const handleRemoveRow = (key, index) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (key, index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev[key]];
      updated[index][field] = field === "name" ? value.replace(/[^A-Za-z ]/g, '') : value;
      return { ...prev, [key]: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedPatients = [...patients];
    if (editIndex !== null) {
      updatedPatients[editIndex] = formData;
    } else {
      updatedPatients.push(formData);
    }
    setPatients(updatedPatients);
    resetForm();
    // close modal
    const modalEl = document.getElementById("invoiceModal");
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.hide();
  };

  const handleEdit = (index) => {
    setFormData(patients[index]);
    setEditIndex(index);
    const modalEl = document.getElementById("invoiceModal");
    new bootstrap.Modal(modalEl).show();
  };

  const handleDelete = (index) => {
    const updatedPatients = [...patients];
    updatedPatients.splice(index, 1);
    setPatients(updatedPatients);
  };

  const handleView = (index) => {
    localStorage.setItem("hospitalInvoice", JSON.stringify(patients[index]));
    window.open("invoice.html", "_blank");
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.patientId.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    
      <div className="card shadow mb-4">
        <div className="card-header text-center text-white" style={{ backgroundColor: "#01C0C8" }}>
          <h3 className="mb-0">
            <i className="fa-solid fa-hospital me-2"></i>Patient Records
          </h3>
        </div>
        <div className="card-body">
          <input
            type="text"
            id="searchInput"
            className="form-control mb-3"
            placeholder="Search by Name or Patient ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <table className="table table-bordered table-hover text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Patient ID</th>
                <th>Age</th>
                <th>Contact</th>
                <th>Admission</th>
                <th>Discharge</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="patientTableBody">
              {filteredPatients.map((p, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.patientId}</td>
                  <td>{p.age}</td>
                  <td>{p.contact}</td>
                  <td>{p.admission}</td>
                  <td>{p.discharge}</td>
                  <td>
                    <button className="btn btn-info btn-sm view-btn" onClick={() => handleView(i)}>
                      <i className="fa-solid fa-eye"></i>
                    </button>{" "}
                    <button className="btn btn-warning btn-sm edit-btn" onClick={() => handleEdit(i)}>
                      <i className="fa-solid fa-edit"></i>
                    </button>{" "}
                    <button className="btn btn-danger btn-sm delete-btn" onClick={() => handleDelete(i)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
     

      {/* Modal */}
      <div className="modal fade" id="invoiceModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header" style={{ backgroundColor: "#01C0C8", color: "white" }}>
              <h5 className="modal-title">
                {editIndex !== null ? (
                  <><i className="fa-solid fa-edit me-2"></i>Edit Patient / Invoice</>
                ) : (
                  <><i className="fa-solid fa-file-invoice me-2"></i>Add Patient / Invoice</>
                )}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form id="invoiceForm" onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="Enter name"
                      value={formData.name}
                      required
                      onChange={handleInputChange}
                      onInput={(e) => (e.target.value = e.target.value.replace(/[^A-Za-z ]/g, ""))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Patient ID</label>
                    <input type="text" className="form-control" name="patientId" value={formData.patientId} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-control" name="age" value={formData.age} min="1" onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Contact</label>
                    <input
                      type="text"
                      className="form-control"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      maxLength="10"
                      inputMode="numeric"
                      title="Enter exactly 10 digit mobile number"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Admission Date</label>
                    <input type="date" className="form-control" name="admission" value={formData.admission} min={today} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Discharge Date</label>
                    <input type="date" className="form-control" name="discharge" id="dischargeDate" value={formData.discharge} min={today} onChange={handleInputChange} required />
                  </div>
                </div>

                {/* Doctors Table */}
                <div className="mb-3">
                  <h5>Doctors</h5>
                  <table className="table table-bordered text-center align-middle" id="doctorTable">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Fee</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.doctors.map((doc, i) => (
                        <tr key={i}>
                          <td><input type="text" className="form-control doc-name" value={doc.name} required onChange={(e) => handleTableChange("doctors", i, "name", e.target.value)} /></td>
                          <td><input type="number" className="form-control doc-fee" value={doc.fee} min="0" required onChange={(e) => handleTableChange("doctors", i, "fee", e.target.value)} /></td>
                          <td><button type="button" className="btn btn-danger btn-sm remove-row" onClick={() => handleRemoveRow("doctors", i)}>X</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button type="button" id="addDoctor" className="btn btn-outline-primary mb-3" onClick={() => handleAddRow("doctors", { name: "", fee: 0 })}>+ Add Doctor</button>
                </div>

                {/* Tests Table */}
                <div className="mb-3">
                  <h5>Tests / Treatments</h5>
                  <table className="table table-bordered text-center align-middle" id="testTable">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.tests.map((t, i) => (
                        <tr key={i}>
                          <td><input type="text" className="form-control test-name" value={t.name} required onChange={(e) => handleTableChange("tests", i, "name", e.target.value)} /></td>
                          <td><input type="number" className="form-control test-price" value={t.price} min="0" required onChange={(e) => handleTableChange("tests", i, "price", e.target.value)} /></td>
                          <td><button type="button" className="btn btn-danger btn-sm remove-row" onClick={() => handleRemoveRow("tests", i)}>X</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button type="button" id="addTest" className="btn btn-outline-primary mb-3" onClick={() => handleAddRow("tests", { name: "", price: 0 })}>+ Add Test</button>
                </div>

                {/* Medicines Table */}
                <div className="mb-3">
                  <h5>Medicines</h5>
                  <table className="table table-bordered text-center align-middle" id="medicineTable">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.medicines.map((m, i) => (
                        <tr key={i}>
                          <td><input type="text" className="form-control med-name" value={m.name} required onChange={(e) => handleTableChange("medicines", i, "name", e.target.value)} /></td>
                          <td><input type="number" className="form-control med-qty" value={m.qty} min="1" required onChange={(e) => handleTableChange("medicines", i, "qty", e.target.value)} /></td>
                          <td><input type="number" className="form-control med-price" value={m.price} min="0" required onChange={(e) => handleTableChange("medicines", i, "price", e.target.value)} /></td>
                          <td><button type="button" className="btn btn-danger btn-sm remove-row" onClick={() => handleRemoveRow("medicines", i)}>X</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button type="button" id="addMedicine" className="btn btn-outline-primary mb-3" onClick={() => handleAddRow("medicines", { name: "", qty: 1, price: 10 })}>+ Add Medicine</button>
                </div>

                {/* Beds Table */}
                <div className="mb-3">
                  <h5>Bed / Room Charges</h5>
                  <table className="table table-bordered text-center align-middle" id="bedTable">
                    <thead className="table-light">
                      <tr>
                        <th>Type</th>
                        <th>Days</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.beds.map((b, i) => (
                        <tr key={i}>
                          <td>
                            <select className="form-select bed-type" value={b.type} onChange={(e) => handleTableChange("beds", i, "type", e.target.value)} required>
                              <option value="General Ward">General Ward</option>
                              <option value="Semi-Private">Semi-Private</option>
                              <option value="Private Room">Private Room</option>
                              <option value="ICU">ICU</option>
                            </select>
                          </td>
                          <td><input type="number" className="form-control bed-days" value={b.days} min="1" required onChange={(e) => handleTableChange("beds", i, "days", e.target.value)} /></td>
                          <td><input type="number" className="form-control bed-price" value={b.price} min="0" required onChange={(e) => handleTableChange("beds", i, "price", e.target.value)} /></td>
                          <td><button type="button" className="btn btn-danger btn-sm remove-row" onClick={() => handleRemoveRow("beds", i)}>X</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button type="button" id="addBed" className="btn btn-outline-primary mb-3" onClick={() => handleAddRow("beds", { type: "General Ward", days: 1, price: 1000 })}>+ Add Bed</button>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" name="method" value={formData.method} onChange={handleInputChange}>
                      <option>Cash</option>
                      <option>Card</option>
                      <option>Online</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Payment Status</label>
                    <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                      <option>Paid</option>
                      <option>Pending</option>
                      <option>Partial</option>
                    </select>
                  </div>
                </div>

                <div className="text-center">
                  <button type="submit" className="btn" style={{ backgroundColor: "#01C0C8", color: "white" }}>Save Patient</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageInvoice;
