import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PatientRegistration() {
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for DOM to be fully rendered before filling form
    const timer = setTimeout(() => {
      const firstName = document.getElementById("FirstName");
      const lastName = document.getElementById("LastName");
      const contact = document.getElementById("contact");
      const emergencyContact = document.getElementById("emergencyContact");
      const dob = document.getElementById("dob");
      const age = document.getElementById("age");

      // Check if editing existing patient
      const editPatientData = localStorage.getItem("editPatient");
      if (editPatientData) {
        const patient = JSON.parse(editPatientData);
        
        // Fill form fields with patient data
        if (firstName) firstName.value = patient.firstName || "";
        if (lastName) lastName.value = patient.lastName || "";
        if (contact) contact.value = patient.contact || "";
        if (dob) dob.value = patient.dob || "";
        if (age) age.value = patient.age || "";
        
        // Set gender if it matches an option
        const genderSelect = document.getElementById("gender");
        if (genderSelect) {
          for (let i = 0; i < genderSelect.options.length; i++) {
            if (genderSelect.options[i].text === patient.gender) {
              genderSelect.selectedIndex = i;
              break;
            }
          }
        }
        
        // Set blood group if it matches an option
        const bloodGroupSelect = document.getElementById("bloodGroup");
        if (bloodGroupSelect) {
          for (let i = 0; i < bloodGroupSelect.options.length; i++) {
            if (bloodGroupSelect.options[i].text === patient.bloodGroup) {
              bloodGroupSelect.selectedIndex = i;
              break;
            }
          }
        }
        
        // Fill other fields
        const occupation = document.getElementById("occupation");
        if (occupation) occupation.value = patient.occupation || "";
        
        const city = document.getElementById("city");
        if (city) city.value = patient.city || "";
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const firstName = document.getElementById("FirstName");
    const lastName = document.getElementById("LastName");
    const contact = document.getElementById("contact");
    const emergencyContact = document.getElementById("emergencyContact");
    const dob = document.getElementById("dob");
    const age = document.getElementById("age");

    /* Name → only letters */
    [firstName, lastName].forEach(input => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^a-zA-Z\s]/g, "");
      });
    });

    /* Contact → only numbers, max 10 */
    [contact, emergencyContact].forEach(input => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 10);
      });
    });

    /* DOB → no future date */
    const today = new Date().toISOString().split("T")[0];
    dob.setAttribute("max", today);

    /* Age calculation (no negative) */
    dob.addEventListener("change", () => {
      if (!dob.value) {
        age.value = "";
        return;
      }

      const birth = new Date(dob.value);
      const now = new Date();

      let years = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();

      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        years--;
      }

      age.value = years >= 0 ? years : "";
    });

  }, []);

  return (
    <>
      <>
        
          <div className="card shadow-lg rounded-4 overflow-hidden">

            {/* Header */}
            <div
              className="d-flex justify-content-center align-items-center gap-2 py-3 position-relative"
              style={{ backgroundColor: "#01C0C8", color: "white" }}
            >
            
               
              <i class="fa-solid fa-hospital-user" style={{ fontSize: "25px" }}></i>
              <h3 className="mb-0 fw-semibold">Patient Registration</h3>
            </div>

            <div className="card-body">
              <form id="erPatientForm" noValidate>

                {/* Name */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">First Name *</label>
                    <input type="text" id="FirstName" className="form-control" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Last Name *</label>
                    <input type="text" id="LastName" className="form-control" required />
                  </div>
                </div>

                {/* Email / DOB / Age */}
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Email</label>
                    <input type="email" id="email" className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Date of Birth *</label>
                    <input type="date" id="dob" className="form-control" required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Age</label>
                    <input type="text" id="age" className="form-control bg-light" readOnly />
                  </div>
                </div>

                {/* Address */}
                <div className="border rounded-3 p-3 mb-3">
                  <h5 className="fw-semibold mb-3">Address Details</h5>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Address Line 1 *</label>
                      <input type="text" id="address" className="form-control" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Address Line 2</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">State *</label>
                      <input type="text" id="state" className="form-control" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">District *</label>
                      <input type="text" id="district" className="form-control" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">City *</label>
                      <input type="text" id="city" className="form-control" required />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Country *</label>
                      <select id="country" className="form-select" disabled>
                        <option>India</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Pincode *</label>
                      <input type="text" id="pincode" className="form-control" required />
                    </div>
                  </div>
                </div>

                {/* Gender / Occupation */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Gender *</label>
                    <select id="gender" className="form-select" required>
                      <option value="">-- Select --</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Occupation *</label>
                    <input type="text" id="occupation" className="form-control" required />
                  </div>
                </div>

                {/* Blood / Contact */}
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Blood Group *</label>
                    <select id="bloodGroup" className="form-select" required>
                      <option value="">-- Select --</option>
                      <option>A+</option><option>A-</option>
                      <option>B+</option><option>B-</option>
                      <option>AB+</option><option>AB-</option>
                      <option>O+</option><option>O-</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Contact *</label>
                    <input type="text" id="contact" className="form-control" required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Emergency Contact *</label>
                    <input type="text" id="emergencyContact" className="form-control" required />
                  </div>
                </div>

                {/* ID Proof */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Upload ID Proof *</label>
                    <input type="file" id="idProofFile" className="form-control" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">ID Proof Number *</label>
                    <input type="text" id="idProofNumber" className="form-control" required />
                  </div>
                </div>

                {/* Marital / Note */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Marital Status</label>
                    <select id="maritalStatus" className="form-select">
                      <option value="">-- Select --</option>
                      <option>Single</option>
                      <option>Married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Note</label>
                    <textarea id="note" className="form-control"></textarea>
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-center gap-3">
                  <button type="reset" className="btn btn-secondary px-4 py-2 rounded-3">
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="btn px-4 py-2 rounded-3 text-white"
                    style={{ backgroundColor: "#01C0C8" }}
                  >
                    Save
                  </button>
                </div>

              </form>
            </div>
          </div>
        
      </>
    </>
  );
}
