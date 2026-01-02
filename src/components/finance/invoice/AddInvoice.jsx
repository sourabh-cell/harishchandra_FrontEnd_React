import React, { useState } from "react";

const CreateInvoice = () => {
  const today = new Date().toISOString().split("T")[0];

  const [showServices, setShowServices] = useState(false);
  const [doctors, setDoctors] = useState([{ name: "", fee: 0 }]);
  const [tests, setTests] = useState([{ name: "", price: 0 }]);
  const [medicines, setMedicines] = useState([{ name: "", qty: 0, price: 0 }]);
  const [beds, setBeds] = useState([
    { type: "General Ward", days: 0, price: 0 },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    patientId: "",
    age: 0,
    contact: 0,
    admission: "",
    discharge: today,
    method: "Cash",
    status: "Paid",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoctorChange = (index, field, value) => {
    const newDoctors = [...doctors];
    newDoctors[index][field] = value;
    setDoctors(newDoctors);
  };

  const handleTestChange = (index, field, value) => {
    const newTests = [...tests];
    newTests[index][field] = value;
    setTests(newTests);
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const handleBedChange = (index, field, value) => {
    const newBeds = [...beds];
    newBeds[index][field] = value;
    setBeds(newBeds);
  };

  const addDoctor = () => setDoctors([...doctors, { name: "", fee: 0 }]);
  const removeDoctor = (index) =>
    setDoctors(doctors.filter((_, i) => i !== index));

  const addTest = () => setTests([...tests, { name: "", price: 0 }]);
  const removeTest = (index) => setTests(tests.filter((_, i) => i !== index));

  const addMedicine = () =>
    setMedicines([...medicines, { name: "", qty: 0, price: 0 }]);
  const removeMedicine = (index) =>
    setMedicines(medicines.filter((_, i) => i !== index));

  const addBed = () =>
    setBeds([...beds, { type: "General Ward", days: 0, price: 0 }]);
  const removeBed = (index) => setBeds(beds.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, doctors, tests, medicines, beds };
    localStorage.setItem("hospitalInvoice", JSON.stringify(data));
    window.location.href = "/invoice"; // Update to your route
  };

  return (
    <div className="container p-0 m-0">
      <div className="card shadow">
        <div
          className="card-header text-center text-white"
          style={{ backgroundColor: "#01c0c8" }}
        >
          <h3 className="mb-0">
            <i className="fa-solid fa-file-invoice me-2"></i> Create Hospital
            Invoice
          </h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Patient Details */}
            <h5 className="mb-3">👤 Patient Details</h5>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="Enter Your Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange(e)}
                  required
                  onInput={(e) =>
                    (e.target.value = e.target.value.replace(
                      /[^A-Za-z\s]/g,
                      ""
                    ))
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Patient ID</label>
                <input
                  type="text"
                  className="form-control"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-control"
                  name="age"
                  value={formData.age}
                  min={0}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact</label>
                <input
                  type="number"
                  name="phone"
                  className="form-control"
                  placeholder="Enter contact number"
                  min={0}
                  onInput={(e) => {
                    if (e.target.value.length > 10) {
                      e.target.value = e.target.value.slice(0, 10);
                    }
                  }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Admission Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="admission"
                  value={formData.admission}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Discharge Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="discharge"
                  value={formData.discharge}
                  onChange={handleInputChange}
                  min={today}
                  required
                />
              </div>
            </div>

            <div className="text-center mt-4">
              {!showServices && (
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: "#01c0c8", color: "white" }}
                  onClick={() => setShowServices(true)}
                >
                  + Add Services
                </button>
              )}
            </div>

            {showServices && (
              <>
                {/* Doctor Fees */}
                <h5>👨‍⚕️ Doctor Fees</h5>
                <table className="table table-bordered text-center align-middle">
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
                          <input
                            type="text"
                            className="form-control"
                            value={doc.name}
                            placeholder="Dr. Name"
                            required
                            onChange={(e) =>
                              handleDoctorChange(
                                i,
                                "name",
                                e.target.value.replace(/[^A-Za-z\s]/g, "")
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            min={0}
                            value={doc.fee}
                            required
                            onChange={(e) =>
                              handleDoctorChange(
                                i,
                                "fee",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeDoctor(i)}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-outline-primary mb-3"
                  onClick={addDoctor}
                >
                  + Add Doctor
                </button>

                {/* Tests */}
                <h5>🧪 Tests / Treatments</h5>
                <table className="table table-bordered text-center align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Test / Treatment Name</th>
                      <th>Price (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((test, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={test.name}
                            placeholder="Blood Test"
                            required
                            onChange={(e) =>
                              handleTestChange(
                                i,
                                "name",
                                e.target.value.replace(/[^A-Za-z\s]/g, "")
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={test.price}
                            min={0}
                            required
                            onChange={(e) =>
                              handleTestChange(
                                i,
                                "price",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeTest(i)}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-outline-primary mb-3"
                  onClick={addTest}
                >
                  + Add Test
                </button>

                {/* Medicines */}
                <h5>💊 Medicines</h5>
                <table className="table table-bordered text-center align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Medicine Name</th>
                      <th>Qty</th>
                      <th>Price per Unit (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((med, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={med.name}
                            placeholder="Paracetamol"
                            required
                            onChange={(e) =>
                              handleMedicineChange(
                                i,
                                "name",
                                e.target.value.replace(/[^A-Za-z\s]/g, "")
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={med.qty}
                            min={0}
                            required
                            onChange={(e) =>
                              handleMedicineChange(
                                i,
                                "qty",
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={med.price}
                            min={0}
                            required
                            onChange={(e) =>
                              handleMedicineChange(
                                i,
                                "price",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeMedicine(i)}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-outline-primary mb-3"
                  onClick={addMedicine}
                >
                  + Add Medicine
                </button>

                {/* Bed / Room Charges */}
                <h5>🛏️ Bed / Room Charges</h5>
                <table className="table table-bordered text-center align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Room Type</th>
                      <th>Days</th>
                      <th>Charge per Day (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beds.map((bed, i) => (
                      <tr key={i}>
                        <td>
                          <select
                            className="form-select"
                            value={bed.type}
                            required
                            onChange={(e) =>
                              handleBedChange(i, "type", e.target.value)
                            }
                          >
                            <option value="General Ward">General Ward</option>
                            <option value="Semi-Private">Semi-Private</option>
                            <option value="Private Room">Private Room</option>
                            <option value="ICU">ICU</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={bed.days}
                            min={0}
                            required
                            onChange={(e) =>
                              handleBedChange(
                                i,
                                "days",
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={bed.price}
                            min={0}
                            required
                            onChange={(e) =>
                              handleBedChange(
                                i,
                                "price",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeBed(i)}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-outline-primary mb-3"
                  onClick={addBed}
                >
                  + Add Bed
                </button>

                {/* Payment Info */}
                <h5>💳 Payment Info</h5>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-select"
                      name="method"
                      value={formData.method}
                      onChange={handleInputChange}
                    >
                      <option>Cash</option>
                      <option>Card</option>
                      <option>Online</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Payment Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option>Paid</option>
                      <option>Pending</option>
                      <option>Partial</option>
                    </select>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn"
                    style={{ backgroundColor: "#01c0c8", color: "white" }}
                  >
                    Save Invoice
                  </button>
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
