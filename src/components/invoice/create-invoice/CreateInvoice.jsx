import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPatients, selectPatients } from "../../../features/patientAutoSuggestionSlice";
import { fetchInvoiceFormData, selectInvoiceFormData, createInvoice, fetchAllInvoices, clearInvoiceState, clearCreateInvoiceState } from "../../../features/InvoiceSlice";
import Swal from "sweetalert2";

const CreateInvoice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const patients = useSelector(selectPatients);
  const patientStatus = useSelector((state) => state.patients.status);
  const invoiceFormData = useSelector(selectInvoiceFormData);
  const invoiceStatus = useSelector((state) => state.invoice.status);
  const createInvoiceStatus = useSelector((state) => state.invoice.createStatus);

  const [showServices, setShowServices] = useState(false);
  const [doctors, setDoctors] = useState([{ name: "", fee: 0 }]);
  const [tests, setTests] = useState([{ name: "", price: 0 }]);
  const [medicines, setMedicines] = useState([{ name: "", qty: 1, price: 10 }]);
  const [beds, setBeds] = useState([{ type: "General Ward", days: 1, price: 1000 }]);
  const [patientIdInput, setPatientIdInput] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null); // Store actual patient ID
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

  // Reset form when component mounts
  useEffect(() => {
    // Clear Redux invoice state
    dispatch(clearInvoiceState());
    dispatch(clearCreateInvoiceState());
    
    // Reset all local state to initial values
    setShowServices(false);
    setDoctors([{ name: "", fee: 0 }]);
    setTests([{ name: "", price: 0 }]);
    setMedicines([{ name: "", qty: 1, price: 10 }]);
    setBeds([{ type: "General Ward", days: 1, price: 1000 }]);
    setPatientIdInput("");
    setSelectedPatientId(null);
    setFormData({
      name: "",
      patientId: "",
      age: "",
      contact: "",
      admission: "",
      discharge: "",
      method: "Cash",
      status: "Paid"
    });
  }, [dispatch]);

  useEffect(() => {
    if (patientStatus === 'idle') {
      dispatch(fetchPatients());
    }
  }, [patientStatus, dispatch]);

  // Populate form when API data is received
  useEffect(() => {
    if (invoiceFormData && invoiceStatus === 'succeeded') {
      // Store patient ID from API response if available
      if (invoiceFormData.patientId) {
        setSelectedPatientId(invoiceFormData.patientId);
      }

      // Map API response to form state
      setFormData(prev => ({
        ...prev,
        name: invoiceFormData.patientName || prev.name,
        age: invoiceFormData.patientAge || prev.age,
        contact: invoiceFormData.patientContact || prev.contact,
        patientId: invoiceFormData.hospitalPatientId || prev.patientId,
        admission: invoiceFormData.admissionDate ? invoiceFormData.admissionDate.split('T')[0] : prev.admission,
        discharge: invoiceFormData.dischargeDate ? invoiceFormData.dischargeDate.split('T')[0] : prev.discharge,
        method: invoiceFormData.paymentMethod || prev.method,
        status: invoiceFormData.paymentStatus || prev.status
      }));

      // Update patientIdInput to show hospitalPatientId
      if (invoiceFormData.hospitalPatientId) {
        setPatientIdInput(invoiceFormData.hospitalPatientId);
      }

      // Map doctors (preserve IDs from API)
      if (invoiceFormData.doctors && invoiceFormData.doctors.length > 0) {
        const mappedDoctors = invoiceFormData.doctors.map(doc => ({
          doctorId: doc.doctorId || null,
          name: doc.doctorName || "",
          fee: doc.fee || 0
        }));
        setDoctors(mappedDoctors);
      }

      // Map medicines (preserve IDs from API)
      if (invoiceFormData.medicines && invoiceFormData.medicines.length > 0) {
        const mappedMedicines = invoiceFormData.medicines.map(med => ({
          medicineId: med.medicineId || null,
          name: med.medicineName || "",
          qty: med.qty || 1,
          price: med.pricePerUnit || 0
        }));
        setMedicines(mappedMedicines);
      }

      // Map rooms to beds (preserve IDs from API)
      if (invoiceFormData.rooms && invoiceFormData.rooms.length > 0) {
        const mappedBeds = invoiceFormData.rooms.map(room => ({
          roomId: room.roomId || null,
          bedId: room.bedId || null,
          type: room.roomName || "General Ward",
          days: room.days || 1,
          price: room.pricePerDay || 0
        }));
        setBeds(mappedBeds);
      }

      // Map pathology and radiology tests (preserve IDs from API)
      const allTests = [];
      if (invoiceFormData.pathologyTests && invoiceFormData.pathologyTests.length > 0) {
        invoiceFormData.pathologyTests.forEach(test => {
          allTests.push({
            testId: test.testId || null,
            name: test.testName || "",
            price: test.price || 0,
            testType: "pathology"
          });
        });
      }
      if (invoiceFormData.radiologyTests && invoiceFormData.radiologyTests.length > 0) {
        invoiceFormData.radiologyTests.forEach(test => {
          allTests.push({
            testId: test.testId || null,
            name: test.testName || "",
            price: test.price || 0,
            testType: "radiology"
          });
        });
      }
      if (allTests.length > 0) {
        setTests(allTests);
      }

      // Show services section if there's any service data
      if (invoiceFormData.doctors?.length > 0 || 
          invoiceFormData.medicines?.length > 0 || 
          invoiceFormData.rooms?.length > 0 || 
          invoiceFormData.pathologyTests?.length > 0 || 
          invoiceFormData.radiologyTests?.length > 0) {
        setShowServices(true);
      }
    }
  }, [invoiceFormData, invoiceStatus]);

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
    if (name === 'patientId') {
      const selected = patients.find(p => `${p.fullName} - ${p.hospitalPatientId}` === value);
      if (selected) {
        setPatientIdInput(selected.hospitalPatientId);
        setSelectedPatientId(selected.id); // Store actual patient ID
        setFormData(prev => ({ ...prev, patientId: selected.hospitalPatientId, name: selected.fullName, age: selected.age }));
        // Fetch invoice form data for the selected patient
        if (selected.id) {
          dispatch(fetchInvoiceFormData(selected.id));
        }
      } else {
        setPatientIdInput(value);
        setSelectedPatientId(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate patient ID
    if (!selectedPatientId) {
      Swal.fire({
        icon: "error",
        title: "Patient Required",
        text: "Please select a patient from the suggestions.",
      });
      return;
    }

    // Separate pathology and radiology tests
    const pathologyTests = tests
      .filter(test => test.testType === "pathology" && test.testId)
      .map(test => ({
        testId: test.testId,
        testName: test.name,
        price: test.price
      }));

    const radiologyTests = tests
      .filter(test => test.testType === "radiology" && test.testId)
      .map(test => ({
        testId: test.testId,
        testName: test.name,
        price: test.price
      }));

    // Map doctors to API format
    const mappedDoctors = doctors
      .filter(doc => doc.doctorId && doc.name)
      .map(doc => ({
        doctorId: doc.doctorId,
        doctorName: doc.name,
        fee: doc.fee || 0
      }));

    // Map medicines to API format
    const mappedMedicines = medicines
      .filter(med => med.medicineId && med.name)
      .map(med => ({
        medicineId: med.medicineId,
        medicineName: med.name,
        qty: med.qty || 0,
        pricePerUnit: med.price || 0
      }));

    // Map beds/rooms to API format
    const mappedRooms = beds
      .filter(bed => bed.roomId && bed.days > 0)
      .map(bed => ({
        roomId: bed.roomId,
        roomName: bed.type,
        bedId: bed.bedId || null,
        days: bed.days || 0,
        pricePerDay: bed.price || 0
      }));

    // Prepare payload
    const payload = {
      patientId: selectedPatientId,
      doctorId: null,
      medicineId: null,
      roomId: null,
      admissionDate: formData.admission || null,
      dischargeDate: formData.discharge || null,
      totalAmount: null,
      paymentMethod: formData.method?.toUpperCase() || "CASH",
      paymentStatus: formData.status?.toUpperCase() || "PAID",
      doctors: mappedDoctors,
      medicines: mappedMedicines,
      rooms: mappedRooms,
      pathologyTests: pathologyTests,
      radiologyTests: radiologyTests
    };

    try {
      await dispatch(createInvoice(payload)).unwrap();
      // Fetch updated invoices list
      await dispatch(fetchAllInvoices());
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Invoice created successfully!",
        confirmButtonColor: "#01C0C8",
      }).then(() => {
        navigate("/dashboard/invoice/manage-invoices");
      });
    } catch (error) {
      const errorMessage = error?.message || error?.error || "Failed to create invoice";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#01C0C8",
      });
    }
  };

  return (
   
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
                <label className="form-label">Patient ID</label>
                <input type="text" className="form-control" name="patientId" value={patientIdInput} onChange={handleChange} list="patientSuggestions" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange}
                  required pattern="[A-Za-z ]+" title="Only alphabets are allowed"
                  onInput={(e) => e.target.value = e.target.value.replace(/[^A-Za-z ]/g, '')}
                />
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
          <datalist id="patientSuggestions">
            {patients.map(patient => (
              <option key={patient.id} value={`${patient.fullName} - ${patient.hospitalPatientId}`} />
            ))}
          </datalist>
        </div>
      </div>

  );
};

export default CreateInvoice;
