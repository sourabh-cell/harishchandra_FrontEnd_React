import { useEffect } from "react";

const AddPatientCase = () => {

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    document.getElementById("admissionDate").min = today;
    document.getElementById("recordedAt").max = today;

    calculateAge();
  }, []);

  const calculateAge = () => {
    const dob = new Date(document.getElementById("patientDob").value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (
      today <
      new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
    ) {
      age--;
    }
    document.getElementById("patientAge").value = age;
  };

  const addRow = (tableId) => {
    const tbody = document.querySelector(`#${tableId} tbody`);
    const row = tbody.rows[0].cloneNode(true);
    row.querySelectorAll("input").forEach((i) => (i.value = ""));
    tbody.appendChild(row);
  };

  const removeRow = (btn) => {
    const tbody = btn.closest("tbody");
    if (tbody.rows.length > 1) {
      btn.closest("tr").remove();
    }
  };

  const addTimeline = () => {
    const date = document.getElementById("timelineDate").value;
    const event = document.getElementById("timelineEvent").value;

    if (!date || !event) {
      alert("Enter date & event");
      return;
    }

    const div = document.createElement("div");
    div.className = "border rounded p-2 mb-2 bg-white";
    div.innerHTML = `${date} - ${event}
      <button class="btn btn-sm text-danger ms-2"
        onclick="this.parentElement.remove()">
        Remove
      </button>`;

    document.getElementById("timelinePreview").prepend(div);

    document.getElementById("timelineDate").value = "";
    document.getElementById("timelineEvent").value = "";
  };

  return (
    
      <div className="card shadow">
        <div
          className="card-header text-white text-center"
          style={{ backgroundColor: "#01c0c8" }}
        >
          <h4 className="mb-0">
            <i className="bi bi-person-plus-fill me-2"></i>
            Add Patient Case
          </h4>
        </div>

        <div className="card-body">
          <form>

            {/* ================= Patient Info ================= */}
            <h5 className="mb-3" style={{ color: "#01c0c8" }}>
              Patient Information
            </h5>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">Patient ID *</label>
                <input className="form-control" required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Patient Name *</label>
                <input
                  className="form-control"
                  required
                  onInput={(e) =>
                    (e.target.value = e.target.value.replace(/[^A-Za-z ]/g, ""))
                  }
                />
              </div>

              <input type="hidden" id="patientDob" value="1990-05-12" />

              <div className="col-md-6">
                <label className="form-label">Age</label>
                <input
                  className="form-control"
                  id="patientAge"
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Patient Admission Date *
                </label>
                <input
                  type="date"
                  id="admissionDate"
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Appointed Doctor *</label>
                <input className="form-control" required />
              </div>
            </div>

            {/* ================= Diagnosis ================= */}
            <h5 className="mb-3" style={{ color: "#01c0c8" }}>
              Diagnosis
            </h5>
            <div className="mb-4 col-md-6">
              <input
                className="form-control"
                placeholder="Diagnosis details"
              />
            </div>

            {/* ================= Vitals ================= */}
            <h5 className="mb-3" style={{ color: "#01c0c8" }}>
              Vitals
            </h5>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <input className="form-control" type="number" placeholder="Systolic BP" />
              </div>
              <div className="col-md-6">
                <input className="form-control" type="number" placeholder="Diastolic BP" />
              </div>
              <div className="col-md-6">
                <input className="form-control" type="number" placeholder="Pulse" />
              </div>
              <div className="col-md-6">
                <input className="form-control" type="number" step="0.1" placeholder="Temperature" />
              </div>
              <div className="col-md-6">
                <input className="form-control" type="number" placeholder="SpO2 %" min="0" max="100" />
              </div>
              <div className="col-md-6">
                <input className="form-control" type="number" placeholder="Respiration Rate" />
              </div>
              <div className="col-md-6">
                <input
                  className="form-control"
                  type="date"
                  id="recordedAt"
                />
              </div>
            </div>

            {/* ================= Pathology ================= */}
            <h5 className="mb-3" style={{ color: "#01c0c8" }}>
              Pathology Test Report
            </h5>

            <table className="table table-bordered text-center" id="pathologyTable">
              <thead className="table-light">
                <tr>
                  <th>Test</th>
                  <th>Value</th>
                  <th>Range</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input className="form-control" /></td>
                  <td><input className="form-control" /></td>
                  <td><input className="form-control" /></td>
                  <td><input type="date" className="form-control" /></td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={(e) => removeRow(e.target)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-end mb-4">
              <button
                type="button"
                className="btn btn-outline"
                style={{ color: "#01c0c8", borderColor: "#01c0c8" }}
                onClick={() => addRow("pathologyTable")}
              >
                + Add Test
              </button>
            </div>

            {/* ================= Timeline ================= */}
            <h5 className="mb-3" style={{ color: "#01c0c8" }}>
              Case Timeline
            </h5>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <input type="date" id="timelineDate" className="form-control" />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  id="timelineEvent"
                  className="form-control"
                  placeholder="Event"
                />
              </div>
            </div>

            <div className="text-end mb-3">
              <button
                type="button"
                className="btn btn-outline"
                style={{ color: "#01c0c8", borderColor: "#01c0c8" }}
                onClick={addTimeline}
              >
                + Add Timeline
              </button>
            </div>

            <div id="timelinePreview"></div>

            {/* ================= Submit ================= */}
            <div className="text-center mt-4">
              <button
                type="submit"
                className="btn text-white"
                style={{ backgroundColor: "#01c0c8" }}
              >
                Save Patient Case
              </button>
            </div>

          </form>
        </div>
      </div>
    
  );
};

export default AddPatientCase;
