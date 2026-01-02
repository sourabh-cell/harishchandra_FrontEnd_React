import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchPatients,
  selectPatients,
} from "../../../features/patientAutoSuggestionSlice";

import {
  fetchInvoiceFormData,
  selectInvoiceFormData,
} from "../../../features/InvoiceSlice";

const CreateInvoice = () => {
  const dispatch = useDispatch();
  const patients = useSelector(selectPatients);
  const invoiceData = useSelector(selectInvoiceFormData);

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showServices, setShowServices] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    patientId: "",
    age: "",
    contact: "",
    admission: "",
    discharge: "",
    method: "Cash",
    status: "Paid",
  });

  const [doctors, setDoctors] = useState([]);
  const [tests, setTests] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [beds, setBeds] = useState([]);

  /* ---------------- LOAD PATIENTS ---------------- */
  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  /* ---------------- AUTO-FILL FROM BACKEND ---------------- */
  useEffect(() => {
    if (!invoiceData) return;

    setFormData({
      name: invoiceData.patientName || "",
      patientId: invoiceData.patientId || "",
      age: invoiceData.patientAge || "",
      contact: invoiceData.patientContact || "",
      admission: invoiceData.admissionDate || "",
      discharge: invoiceData.dischargeDate || "",
      method: invoiceData.paymentMethod || "Cash",
      status: invoiceData.paymentStatus || "Paid",
    });

    setDoctors(
      invoiceData.doctors?.map(d => ({
        name: d.doctorName,
        fee: d.fee,
      })) || []
    );

    setTests([
      ...(invoiceData.pathologyTests || []),
      ...(invoiceData.radiologyTests || []),
    ].map(t => ({
      name: t.testName,
      price: t.price,
    })));

    setMedicines(
      invoiceData.medicines?.map(m => ({
        name: m.medicineName,
        qty: m.qty || 1,
        price: m.pricePerUnit,
      })) || []
    );

    setBeds(
      invoiceData.rooms?.map(r => ({
        type: r.roomName,
        days: r.days || 1,
        price: r.pricePerDay,
      })) || []
    );

    setShowServices(true);
  }, [invoiceData]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAdd = (type) => {
    if (type === "doctor") setDoctors([...doctors, { name: "", fee: 0 }]);
    if (type === "test") setTests([...tests, { name: "", price: 0 }]);
    if (type === "medicine") setMedicines([...medicines, { name: "", qty: 1, price: 0 }]);
    if (type === "bed") setBeds([...beds, { type: "General Ward", days: 1, price: 0 }]);
  };

  const handleRemove = (type, i) => {
    if (type === "doctor") setDoctors(doctors.filter((_, idx) => idx !== i));
    if (type === "test") setTests(tests.filter((_, idx) => idx !== i));
    if (type === "medicine") setMedicines(medicines.filter((_, idx) => idx !== i));
    if (type === "bed") setBeds(beds.filter((_, idx) => idx !== i));
  };

  const handleServiceChange = (type, i, field, value) => {
    const map = { doctor: doctors, test: tests, medicine: medicines, bed: beds };
    const setter = { doctor: setDoctors, test: setTests, medicine: setMedicines, bed: setBeds };
    const arr = [...map[type]];
    arr[i][field] = value;
    setter[type](arr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      ...formData,
      doctors,
      tests,
      medicines,
      beds,
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="card shadow">
      <div className="card-header text-white text-center" style={{ background: "#01C0C8" }}>
        <h4>Create Hospital Invoice</h4>
      </div>

      <div className="card-body">
        {/* Patient Search */}
        <label className="form-label">Patient Name / ID</label>
        <input
          className="form-control"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder="Search patient"
        />

        {showSuggestions && (
          <ul className="list-group position-absolute w-50">
            {patients
              .filter(p =>
                p.patientName.toLowerCase().includes(query.toLowerCase()) ||
                String(p.id).includes(query)
              )
              .map(p => (
                <li
                  key={p.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                    setQuery(p.patientName);
                    setShowSuggestions(false);
                    dispatch(fetchInvoiceFormData(p.id));
                  }}
                >
                  {p.patientName} ({p.hospitalPatientId})
                </li>
              ))}
          </ul>
        )}

        <hr />

        {/* Patient Details */}
        <div className="row g-3 mb-3">
          {["name", "patientId", "age", "contact", "admission", "discharge"].map(f => (
            <div className="col-md-6" key={f}>
              <label className="form-label text-capitalize">{f}</label>
              <input
                className="form-control"
                name={f}
                value={formData[f]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        {!showServices && (
          <div className="text-center">
            <button className="btn btn-info text-white" onClick={() => setShowServices(true)}>
              + Add Services
            </button>
          </div>
        )}

        {/* Services */}
        {showServices && (
          <>
            <h5>Doctors</h5>
            {doctors.map((d, i) => (
              <div className="row g-2 mb-2" key={i}>
                <input className="col form-control" value={d.name}
                  onChange={e => handleServiceChange("doctor", i, "name", e.target.value)} />
                <input className="col form-control" type="number" value={d.fee}
                  onChange={e => handleServiceChange("doctor", i, "fee", e.target.value)} />
                <button className="btn btn-danger col-1" onClick={() => handleRemove("doctor", i)}>X</button>
              </div>
            ))}
            <button className="btn btn-outline-primary" onClick={() => handleAdd("doctor")}>+ Add Doctor</button>

            <hr />
            <button className="btn btn-success mt-3" onClick={handleSubmit}>
              Save Invoice
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateInvoice;
