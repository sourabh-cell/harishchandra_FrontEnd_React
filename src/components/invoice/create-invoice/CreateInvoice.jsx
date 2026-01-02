import React, { useState } from "react";

const CreateInvoice = () => {
  const [showServices, setShowServices] = useState(false);
  const [doctors, setDoctors] = useState([{ name: "", fee: 0 }]);
  const [tests, setTests] = useState([{ name: "", price: 0 }]);
  const [medicines, setMedicines] = useState([{ name: "", qty: 1, price: 10 }]);
  const [beds, setBeds] = useState([{ type: "General Ward", days: 1, price: 1000 }]);
  const [formData, setFormData] = useState({
    name: "",
    patientId: "",
    age: "",
    contact: "",
    admission: "",
    discharge: "",
    method: "Cash",
    status: "Paid"
  });

  const handleAdd = (type) => {
    if (type === "doctor") setDoctors([...doctors, { name: "", fee: 0 }]);
    if (type === "test") setTests([...tests, { name: "", price: 0 }]);
    if (type === "medicine") setMedicines([...medicines, { name: "", qty: 1, price: 10 }]);
    if (type === "bed") setBeds([...beds, { type: "General Ward", days: 1, price: 1000 }]);
  };

  const handleRemove = (type, index) => {
    if (type === "doctor") setDoctors(doctors.filter((_, i) => i !== index));
    if (type === "test") setTests(tests.filter((_, i) => i !== index));
    if (type === "medicine") setMedicines(medicines.filter((_, i) => i !== index));
    if (type === "bed") setBeds(beds.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (type, index, field, value) => {
    if (type === "doctor") {
      const newDoctors = [...doctors];
      newDoctors[index][field] = field === "fee" ? parseFloat(value) : value;
      setDoctors(newDoctors);
    }
    if (type === "test") {
      const newTests = [...tests];
      newTests[index][field] = field === "price" ? parseFloat(value) : value;
      setTests(newTests);
    }
    if (type === "medicine") {
      const newMedicines = [...medicines];
      if (field === "qty" || field === "price") newMedicines[index][field] = parseFloat(value);
      else newMedicines[index][field] = value;
      setMedicines(newMedicines);
    }
    if (type === "bed") {
      const newBeds = [...beds];
      if (field === "days" || field === "price") newBeds[index][field] = parseFloat(value);
      else newBeds[index][field] = value;
      setBeds(newBeds);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      age: parseInt(formData.age),
      doctors,
      tests,
      medicines,
      beds
    };
    const patients = JSON.parse(localStorage.getItem("patients") || "[]");
    patients.push(data);
    localStorage.setItem("patients", JSON.stringify(patients));
    localStorage.setItem("hospitalInvoice", JSON.stringify(data));
    window.location.href = "invoice-table.html";
  };

  return (
    <div className="container my-5">
      <div className="card shadow">
        <div className="card-header text-center text-white" style={{ backgroundColor: "#01C0C8" }}>
          <h3 className="mb-0"><i className="fa-solid fa-file-invoice me-2"></i>Create Hospital Invoice</h3>
        </div>
        <div className="card-body">
          <form id="invoiceForm" onSubmit={handleSubmit}>
            {/* Patient Details */}
            <h5>👤 Patient Details</h5>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange}
                  required pattern="[A-Za-z ]+" title="Only alphabets are allowed"
                  onInput={(e) => e.target.value = e.target.value.replace(/[^A-Za-z ]/g, '')}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Patient ID</label>
                <input type="text" className="form-control" name="patientId" value={formData.patientId} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Age</label>
                <input type="number" className="form-control" name="age" value={formData.age} onChange={handleChange} min="1" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact</label>
                <input type="text" className="form-control" name="contact" value={formData.contact} onChange={handleChange} maxLength="10" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Admission Date</label>
                <input type="date" className="form-control" name="admission" value={formData.admission} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Discharge Date</label>
                <input type="date" className="form-control" name="discharge" value={formData.discharge} onChange={handleChange} required />
              </div>
            </div>

            <div className="text-center mb-4">
              {!showServices && <button type="button" id="showServices" className="btn" style={{ backgroundColor: "#01C0C8", color: "white" }} onClick={() => setShowServices(true)}>+ Add Services</button>}
            </div>

            {/* Services Section */}
            {showServices && (
              <>
                {/* Doctor Fees */}
                <h5>👨‍⚕️ Doctor Fees</h5>
                <table className="table table-bordered text-center align-middle" id="doctorTable">
                  <thead className="table-light">
                    <tr>
                      <th>Doctor Name</th>
                      <th>Fee (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doc, i) => (
                      <tr key={i}>
                        <td>
                          <input type="text" className="form-control doc-name" placeholder="Dr. Name" value={doc.name} required
                            onChange={e => handleServiceChange("doctor", i, "name", e.target.value)} />
                        </td>
                        <td>
                          <input type="number" className="form-control doc-fee" value={doc.fee} min="0" required
                            onChange={e => handleServiceChange("doctor", i, "fee", e.target.value)} />
                        </td>
                        <td><button type="button" className="btn btn-danger btn-sm remove-row" onClick={() => handleRemove("doctor", i)}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" id="addDoctor" className="btn btn-outline-primary mb-3" onClick={() => handleAdd("doctor")}>+ Add Doctor</button>

                {/* Tests */}
                <h5>🧪 Tests / Treatments</h5>
                <table className="table table-bordered text-center align-middle" id="testTable">
                  <thead className="table-light">
                    <tr>
                      <th>Test / Treatment Name</th>
                      <th>Price (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((t, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control test-name" placeholder="Test Name" value={t.name} required
                          onChange={e => handleServiceChange("test", i, "name", e.target.value)} /></td>
                        <td><input type="number" className="form-control test-price" value={t.price} min="0" required
                          onChange={e => handleServiceChange("test", i, "price", e.target.value)} /></td>
                        <td><button type="button" className="btn btn-danger btn-sm remove-row" onClick={() => handleRemove("test", i)}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" id="addTest" className="btn btn-outline-primary mb-3" onClick={() => handleAdd("test")}>+ Add Test</button>

                {/* Medicines */}
                <h5>💊 Medicines</h5>
                <table className="table table-bordered text-center align-middle" id="medicineTable">
                  <thead className="table-light">
                    <tr>
                      <th>Medicine Name</th>
                      <th>Qty</th>
                      <th>Price per Unit (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((m, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control med-name" placeholder="Medicine Name" value={m.name} required
                          onChange={e => handleServiceChange("medicine", i, "name", e.target.value)} /></td>
                        <td><input type="number" className="form-control med-qty" value={m.qty} min="1" required
                          onChange={e => handleServiceChange("medicine", i, "qty", e.target.value)} /></td>
                        <td><input type="number" className="form-control med-price" value={m.price} min="0" required
                          onChange={e => handleServiceChange("medicine", i, "price", e.target.value)} /></td>
                        <td><button type="button" className="btn btn-danger btn-sm remove-row" onClick={() => handleRemove("medicine", i)}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" id="addMedicine" className="btn btn-outline-primary mb-3" onClick={() => handleAdd("medicine")}>+ Add Medicine</button>

                {/* Bed Charges */}
                <h5>🛏️ Bed / Room Charges</h5>
                <table className="table table-bordered text-center align-middle" id="bedTable">
                  <thead className="table-light">
                    <tr>
                      <th>Room Type</th>
                      <th>Days</th>
                      <th>Charge per Day (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beds.map((b, i) => (
                      <tr key={i}>
                        <td>
                          <select className="form-select bed-type" value={b.type} required
                            onChange={e => handleServiceChange("bed", i, "type", e.target.value)}>
                            <option value="General Ward">General Ward</option>
                            <option value="Semi-Private">Semi-Private</option>
                            <option value="Private Room">Private Room</option>
                            <option value="ICU">ICU</option>
                          </select>
                        </td>
                        <td><input type="number" className="form-control bed-days" value={b.days} min="1" required
                          onChange={e => handleServiceChange("bed", i, "days", e.target.value)} /></td>
                        <td><input type="number" className="form-control bed-price" value={b.price} min="0" required
                          onChange={e => handleServiceChange("bed", i, "price", e.target.value)} /></td>
                        <td><button type="button" className="btn btn-danger btn-sm remove-row" onClick={() => handleRemove("bed", i)}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" id="addBed" className="btn btn-outline-primary mb-3" onClick={() => handleAdd("bed")}>+ Add Bed</button>

                {/* Payment Info */}
                <h5>💳 Payment Info</h5>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" name="method" value={formData.method} onChange={handleChange}>
                      <option>Cash</option>
                      <option>Card</option>
                      <option>Online</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Payment Status</label>
                    <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                      <option>Paid</option>
                      <option>Pending</option>
                      <option>Partial</option>
                    </select>
                  </div>
                </div>

                <div className="text-center">
                  <button type="submit" className="btn" style={{ backgroundColor: "#01C0C8", color: "white" }}>Save & View Table</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
