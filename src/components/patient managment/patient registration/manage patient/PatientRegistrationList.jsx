import { useEffect, useState } from "react";

export default function PatientRegistrationList() {
  const [patients, setPatients] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("patients")) || [];
    setPatients(data);
  }, []);

  const savePatients = (data) => {
    localStorage.setItem("patients", JSON.stringify(data));
    setPatients(data);
  };

  const deletePatient = (index) => {
    if (window.confirm("Delete this patient?")) {
      const updated = [...patients];
      updated.splice(index, 1);
      savePatients(updated);
    }
  };

  const editPatient = (index) => {
    const p = patients[index];
    setEditIndex(index);

    document.getElementById("firstName").value = p.firstName;
    document.getElementById("lastName").value = p.lastName;
    document.getElementById("gender").value = p.gender;
    document.getElementById("dob").value = p.dob;
    document.getElementById("age").value = p.age;
    document.getElementById("contact").value = p.contact;
    document.getElementById("bloodGroup").value = p.bloodGroup;
    document.getElementById("city").value = p.city;
    document.getElementById("occupation").value = p.occupation;

    clearErrors();

    const modal = new window.bootstrap.Modal(
      document.getElementById("editModal")
    );
    modal.show();
  };

  const clearErrors = () => {
    document.getElementById("firstNameError").textContent = "";
    document.getElementById("lastNameError").textContent = "";
    document.getElementById("contactError").textContent = "";
  };

  const updatePatient = () => {
    clearErrors();
    let valid = true;

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const contact = document.getElementById("contact").value.trim();

    const nameRegex = /^[A-Za-z ]+$/;
    const contactRegex = /^[0-9]{10}$/;

    if (!nameRegex.test(firstName)) {
      document.getElementById("firstNameError").textContent =
        "Only alphabets allowed";
      valid = false;
    }

    if (!nameRegex.test(lastName)) {
      document.getElementById("lastNameError").textContent =
        "Only alphabets allowed";
      valid = false;
    }

    if (!contactRegex.test(contact)) {
      document.getElementById("contactError").textContent =
        "Contact must be 10 digits";
      valid = false;
    }

    if (!valid) return;

    const updated = [...patients];
    updated[editIndex] = {
      ...updated[editIndex],
      firstName,
      lastName,
      gender: document.getElementById("gender").value,
      dob: document.getElementById("dob").value,
      age: document.getElementById("age").value,
      contact,
      bloodGroup: document.getElementById("bloodGroup").value,
      city: document.getElementById("city").value,
      occupation: document.getElementById("occupation").value,
    };

    savePatients(updated);

    const modalEl = document.getElementById("editModal");
    const modal = window.bootstrap.Modal.getInstance(modalEl);
    modal.hide();
  };

  return (
    <>
      {/* BOOTSTRAP CDN (required once in app) */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      
        
          <div className="card shadow-lg rounded-4">
            <div
              className="card-header text-white text-center fs-4 fw-semibold"
              style={{ backgroundColor: "#01C0C8" }}
            >
              Patient Registration List
            </div>

            <div className="table-responsive p-3">
              <table className="table table-bordered table-striped text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>DOB</th>
                    <th>Age</th>
                    <th>Contact</th>
                    <th>Blood Group</th>
                    <th>City</th>
                    <th>Occupation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="patientTableBody">
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-muted py-4">
                        No patient records found
                      </td>
                    </tr>
                  ) : (
                    patients.map((p, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{p.firstName} {p.lastName}</td>
                        <td>{p.gender}</td>
                        <td>{p.dob}</td>
                        <td>{p.age}</td>
                        <td>{p.contact}</td>
                        <td>{p.bloodGroup}</td>
                        <td>{p.city}</td>
                        <td>{p.occupation}</td>
                        <td>
                          <button
                            className="btn btn-sm text-white me-1"
                            style={{ backgroundColor: "#01C0C8" }}
                            onClick={() => editPatient(index)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => deletePatient(index)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
       
      

      {/* EDIT MODAL (UNCHANGED IDs & CLASSES) */}
      <div className="modal fade" id="editModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div
              className="modal-header text-white"
              style={{ backgroundColor: "#01C0C8" }}
            >
              <h5 className="modal-title">Edit Patient</h5>
              <button
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <input type="hidden" id="editIndex" />

              <div className="row g-3">
                {[
                  ["First Name", "firstName"],
                  ["Last Name", "lastName"],
                  ["Gender", "gender"],
                  ["DOB", "dob", "date"],
                  ["Age", "age", "number"],
                  ["Contact", "contact"],
                  ["Blood Group", "bloodGroup"],
                  ["City", "city"],
                  ["Occupation", "occupation"],
                ].map(([label, id, type = "text"]) => (
                  <div className="col-md-6" key={id}>
                    <label>{label}</label>
                    <input type={type} id={id} className="form-control" />
                    <small className="text-danger" id={`${id}Error`}></small>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn text-white"
                style={{ backgroundColor: "#01C0C8" }}
                onClick={updatePatient}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
