import React, { useState, useEffect } from 'react';

const demoPatients = [
  { id: "P001", name: "Amit Sharma", dob: "1990-05-12", status: "Open", clinical: { snapshotDate: "2025-01-10 10:30 AM", observation: "Mild fever, dehydration.", vitals: "Temp: 101°F | O₂ Sat: 95%", temp: "101°F", doctor: "Dr. R. Kamune", latestLab: "CBC Normal", lastVitalsUpdated: "2025-01-10 10:30 AM", vitalsHistory: [{ time: "2025-01-10 10:30 AM", vitals: "Temp: 101°F | O₂ Sat: 95%" }], note: "Patient advised to drink fluids." }, medications: [{ name: "Paracetamol", dose: "500mg – TID", doctor: "Dr. Kamune", start: "2025-01-10", end: "2025-01-10" }, { name: "ORS", dose: "As Required", doctor: "Nurse Staff", start: "2025-01-10" }], labs: ["CBC: Normal", "Urine: Normal"], timeline: [{ datetime: "2025-01-10 10:00 AM", event: "Patient admitted" }, { datetime: "2025-01-10 10:30 AM", event: "Vitals recorded" }, { datetime: "2025-01-10 11:00 AM", event: "Medication started" }] },
  { id: "P002", name: "Sneha Patil", dob: "1985-09-22", status: "Closed", clinical: { snapshotDate: "2025-01-05 02:00 PM", observation: "Throat infection, mild cough.", vitals: "Temp: 99°F | O₂ Sat: 97%", temp: "99°F", doctor: "Dr. S. Kulkarni", latestLab: "Throat Swab: Bacterial", lastVitalsUpdated: "2025-01-05 02:00 PM", vitalsHistory: [{ time: "2025-01-05 02:00 PM", vitals: "Temp: 99°F | O₂ Sat: 97%" }], note: "Antibiotic course given." }, medications: [{ name: "Azithromycin", dose: "500mg – OD", doctor: "Dr. Kulkarni", start: "2025-01-05" }], labs: ["Throat Swab: Bacterial"], timeline: [{ datetime: "2025-01-05 01:30 PM", event: "Patient consulted" }, { datetime: "2025-01-05 02:00 PM", event: "Vitals taken" }] }
];

function safeParse(value, fallback) {
  try { return JSON.parse(value || 'null') || fallback } catch (e) { return fallback }
}

function calculateAge(dob) {
  if (!dob) return '';
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function PatientCaseTable() {
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('patients');
    if (stored) {
      const patients = safeParse(stored, demoPatients);
      setAllPatients(patients);
      setFilteredPatients(patients);
    } else {
      setAllPatients(demoPatients);
      setFilteredPatients(demoPatients);
      localStorage.setItem('patients', JSON.stringify(demoPatients));
    }
  }, []);

  useEffect(() => {
    const filtered = allPatients.filter(p => {
      const matchSearch = (p.name?.toLowerCase().includes(searchInput.toLowerCase()) || p.id?.toLowerCase().includes(searchInput.toLowerCase()));
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
    setFilteredPatients(filtered);
  }, [searchInput, statusFilter, allPatients]);

  const handleClearFilters = () => {
    setSearchInput('');
    setStatusFilter('');
  };

  const handleRefresh = () => {
    const stored = localStorage.getItem('patients');
    if (stored) {
      const patients = safeParse(stored, demoPatients);
      setAllPatients(patients);
      setFilteredPatients(patients);
    } else {
      setAllPatients(demoPatients);
      setFilteredPatients(demoPatients);
      localStorage.setItem('patients', JSON.stringify(demoPatients));
    }
  };

  const handleViewPatient = (id) => {
    localStorage.setItem('selectedPatientId', id);
    window.location.href = 'patient-case-view.html';
  };

  const handleEditPatient = (id) => {
    localStorage.setItem('selectedPatientId', id);
    window.location.href = 'patient-case-view.html';
  };

  const handleDeletePatient = (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    const updated = allPatients.filter(p => p.id !== id);
    setAllPatients(updated);
    setFilteredPatients(updated);
    localStorage.setItem('patients', JSON.stringify(updated));
    alert('Patient deleted successfully.');
  };

  const handleAddNewPatient = () => {
    const newId = 'P' + String(allPatients.length + 1).padStart(3, '0');
    const newPatient = {
      id: newId,
      name: 'New Patient',
      dob: '',
      status: 'Open',
      clinical: { doctor: '', observation: '' },
      medications: [],
      labs: [],
      timeline: []
    };
    const updated = [...allPatients, newPatient];
    setAllPatients(updated);
    localStorage.setItem('patients', JSON.stringify(updated));
    localStorage.setItem('selectedPatientId', newId);
    window.location.href = 'patient-case-view.html';
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header (Sticky) */}
      <div className="text-center text-white rounded-top py-3 sticky-top shadow" style={{ backgroundColor: '#01C0C8', zIndex: 1000 }}>
        <h4 className="fw-semibold mb-0"><i className="bi bi-table me-2"></i>Patient Case Table</h4>
      </div>

      {/* Search & Table Section (Joined) */}
      <div className="card border-0 shadow-sm rounded-0">
        {/* Search Bar */}
        <div className="card-body border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  id="searchInput"
                  className="form-control"
                  placeholder="Search by name or ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                id="statusFilter"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={handleClearFilters}>
                <i className="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={handleAddNewPatient} style={{ backgroundColor: '#01C0C8', borderColor: '#01C0C8' }}>
                <i className="bi bi-person-plus me-1"></i>Add
              </button>
            </div>
          </div>
        </div>

        {/* Patient Table */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="text-white" style={{ backgroundColor: '#01C0C8' }}>
                <tr>
                  <th className="ps-4">Patient ID</th>
                  <th>Name</th>
                  <th>Date of Birth</th>
                  <th>Status</th>
                  <th>Treating Doctor</th>
                  <th>Latest Observation</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody id="patientTableBody">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      <i className="bi bi-inbox fs-4 d-block mb-2"></i>
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id}>
                      <td className="ps-4 fw-semibold">{p.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '35px', height: '35px' }}>
                            <i className="bi bi-person-fill text-white small"></i>
                          </div>
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td>
                        {formatDate(p.dob)} <small className="text-muted">({calculateAge(p.dob)} yrs)</small>
                      </td>
                      <td>
                        <span className={`badge ${p.status === 'Closed' ? 'bg-danger' : 'bg-success'}`}>
                          {p.status || 'Open'}
                        </span>
                      </td>
                      <td>{p.clinical?.doctor || 'Not assigned'}</td>
                      <td>
                        <small>
                          {(p.clinical?.observation || 'No observation').substring(0, 50)}
                          {(p.clinical?.observation || 'No observation').length > 50 ? '...' : ''}
                        </small>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => handleViewPatient(p.id)} title="View">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-secondary" onClick={() => handleEditPatient(p.id)} title="Edit">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => handleDeletePatient(p.id)} title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientCaseTable;
