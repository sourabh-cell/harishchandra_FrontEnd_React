import React, { useState, useEffect } from 'react';


// Styles object
const styles = {
  card: {
    transition: 'box-shadow 0.3s ease'
  },
  cardHover: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1) !important'
  },
  cardHeaderCustom: {
    background: 'linear-gradient(135deg, #01C0C8 0%, #00a8ad 100%)',
    color: 'white',
    borderRadius: '8px 8px 0 0 !important',
    padding: '12px 20px !important'
  },
  infoLabel: {
    color: '#6c757d',
    fontSize: '0.85rem',
    fontWeight: 500
  },
  infoValue: {
    color: '#212529',
    fontWeight: 600
  },
  vitalBadge: {
    backgroundColor: '#e9ecef',
    padding: '8px 16px',
    borderRadius: '8px',
    display: 'inline-block',
    minWidth: '120px',
    textAlign: 'center'
  },
  vitalValue: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#01C0C8'
  },
  sectionDivider: {
    height: '3px',
    background: 'linear-gradient(90deg, #01C0C8, transparent)',
    margin: '20px 0',
    borderRadius: '3px'
  },
  statusBadge: {
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '0.9rem'
  },
  tableCard: {
    border: 'none',
    overflow: 'hidden'
  },
  tableCardHeader: {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #01C0C8',
    padding: '12px 20px'
  },
  timelineItem: {
    borderLeft: '3px solid #01C0C8',
    paddingLeft: '15px',
    marginBottom: '15px',
    position: 'relative'
  },
  timelineItemBefore: {
    content: '""',
    position: 'absolute',
    left: '-8px',
    top: '5px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#01C0C8'
  }
};

const PatientCaseView = () => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [status, setStatus] = useState('Open');
  const [showStatusEdit, setShowStatusEdit] = useState(false);
  const [showIdEdit, setShowIdEdit] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [showClinicalEdit, setShowClinicalEdit] = useState(false);
  const [showVitalsEdit, setShowVitalsEdit] = useState(false);
  const [showLabForm, setShowLabForm] = useState(false);
  
  const demoPatients = [
    { id: "P001", name: "Amit Sharma", dob: "1990-05-12", status: "Open", clinical: { snapshotDate: "2025-01-10 10:30 AM", observation: "Mild fever, dehydration.", vitals: "Temp: 101°F | O₂ Sat: 95%", temp: "101°F", doctor: "Dr. R. Kamune", latestLab: "CBC Normal", lastVitalsUpdated: "2025-01-10 10:30 AM", vitalsHistory: [{ time: "2025-01-10 10:30 AM", vitals: "Temp: 101°F | O₂ Sat: 95%" }], note: "Patient advised to drink fluids." }, medications: [{ name: "Paracetamol", dose: "500mg – TID", doctor: "Dr. Kamune", start: "2025-01-10", end: "2025-01-10" }, { name: "ORS", dose: "As Required", doctor: "Nurse Staff", start: "2025-01-10" }], labs: ["CBC: Normal", "Urine: Normal"], timeline: [{ datetime: "2025-01-10 10:00 AM", event: "Patient admitted" }, { datetime: "2025-01-10 10:30 AM", event: "Vitals recorded" }, { datetime: "2025-01-10 11:00 AM", event: "Medication started" }] },
    { id: "P002", name: "Sneha Patil", dob: "1985-09-22", status: "Closed", clinical: { snapshotDate: "2025-01-05 02:00 PM", observation: "Throat infection, mild cough.", vitals: "Temp: 99°F | O₂ Sat: 97%", temp: "99°F", doctor: "Dr. S. Kulkarni", latestLab: "Throat Swab: Bacterial", lastVitalsUpdated: "2025-01-05 02:00 PM", vitalsHistory: [{ time: "2025-01-05 02:00 PM", vitals: "Temp: 99°F | O₂ Sat: 97%" }], note: "Antibiotic course given." }, medications: [{ name: "Azithromycin", dose: "500mg – OD", doctor: "Dr. Kulkarni", start: "2025-01-05" }], labs: ["Throat Swab: Bacterial"], timeline: [{ datetime: "2025-01-05 01:30 PM", event: "Patient consulted" }, { datetime: "2025-01-05 02:00 PM", event: "Vitals taken" }] }
  ];

  useEffect(() => {
    if (!localStorage.getItem("patients")) {
      localStorage.setItem("patients", JSON.stringify(demoPatients));
    }
    loadPatient();
  }, []);

  const safeParse = (value, fallback) => {
    try { return JSON.parse(value || 'null') || fallback } catch (e) { return fallback }
  };

  const loadPatient = () => {
    const id = localStorage.getItem('selectedPatientId');
    if (!id) {
      alert('No patient selected');
      window.location.href = 'patient-case-table.html';
      return;
    }

    const patients = safeParse(localStorage.getItem('patients'), []);
    const p = patients.find(x => x.id === id);

    if (!p) {
      alert('Patient not found');
      window.location.href = 'patient-case-table.html';
      return;
    }

    const patient = {
      ...p,
      medications: p.medications || [],
      clinical: {
        ...p.clinical,
        vitalsHistory: p.clinical?.vitalsHistory || []
      }
    };

    setCurrentPatient(patient);
    setStatus(p.status || 'Open');
    setPatientId(p.id || '');
  };

  const persistCurrentPatient = (showAlert = true) => {
    const patients = safeParse(localStorage.getItem('patients'), []);
    let idx = patients.findIndex(x => x.id === currentPatient.id);
    if (idx === -1) {
      idx = patients.findIndex(x => x.name === currentPatient.name);
    }
    if (idx !== -1) patients[idx] = currentPatient;
    else patients.push(currentPatient);
    localStorage.setItem('patients', JSON.stringify(patients));
    if (showAlert) alert('Patient data saved successfully!');
  };

  const getAge = (dob) => {
    if (!dob) return '';
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const handleStatusEdit = () => setShowStatusEdit(true);
  const handleStatusSave = (newStatus) => {
    setStatus(newStatus);
    setCurrentPatient({ ...currentPatient, status: newStatus });
    setShowStatusEdit(false);
    persistCurrentPatient();
  };

  const handleIdEdit = () => setShowIdEdit(true);
  const handleIdSave = (newId) => {
    if (!newId) return alert('Enter ID');
    setPatientId(newId);
    setCurrentPatient({ ...currentPatient, id: newId });
    setShowIdEdit(false);
    persistCurrentPatient();
  };

  const handleClinicalEdit = () => setShowClinicalEdit(!showClinicalEdit);
  
  const saveClinicalData = (snapshotDate, treatingDoctor, observation, note) => {
    const clinical = { ...currentPatient.clinical };
    
    if (snapshotDate) {
      const dateObj = new Date(snapshotDate);
      clinical.snapshotDate = dateObj.toLocaleString();
    }
    persistCurrentPatient();
  };

  const addMedicine = () => {
    const medications = [...currentPatient.medications, { name: '', dose: '', doctor: '', start: '', end: '' }];
    setCurrentPatient({ ...currentPatient, medications });
    persistCurrentPatient(false);
    alert('Medicine added successfully!');
  };

  const updateMedField = (idx, field, value) => {
    const medications = currentPatient.medications.map((m, i) => 
      i === idx ? { ...m, [field]: value } : m
    );
    setCurrentPatient({ ...currentPatient, medications });
    persistCurrentPatient(false);
  };

  const removeMedication = (idx) => {
    if (!confirm('Remove this medication?')) return;
    const medications = currentPatient.medications.filter((_, i) => i !== idx);
    setCurrentPatient({ ...currentPatient, medications });
    persistCurrentPatient();
  };

  const addNote = (noteValue) => {
    if (!noteValue) return alert('Enter a note first!');
    
    const time = new Date().toLocaleString();
    const timeline = [...(currentPatient.timeline || []), { datetime: time, event: noteValue }];
    const note = (currentPatient.clinical?.note ? currentPatient.clinical.note + '\n' : '') + `${time}: ${noteValue}`;
    
    setCurrentPatient({
      ...currentPatient,
      timeline,
      clinical: { ...currentPatient.clinical, note }
    });
    
    persistCurrentPatient();
  };

  const addLabTest = (testValue) => {
    if (!testValue) return alert('Enter a lab test result!');
    const labs = [...(currentPatient.labs || []), testValue];
    setCurrentPatient({ ...currentPatient, labs });
    persistCurrentPatient(false);
    alert('Lab test added successfully!');
  };

  const removeLab = (idx) => {
    if (!confirm('Remove this lab result?')) return;
    const labs = currentPatient.labs.filter((_, i) => i !== idx);
    setCurrentPatient({ ...currentPatient, labs });
    persistCurrentPatient();
  };

  const updateVitals = (systolic, diastolic, pulse, temp, spo2, resp, date) => {
    const vitalsStr = `BP: ${systolic}/${diastolic} | Pulse: ${pulse} bpm | Temp: ${temp}°F | SpO2: ${spo2}% | Resp: ${resp}/min`;
    const vitalsHistory = [...(currentPatient.clinical?.vitalsHistory || []), { time: date || new Date().toLocaleString(), vitals: vitalsStr }];
    const clinical = { 
      ...currentPatient.clinical, 
      vitals: vitalsStr,
      vitalsHistory,
      lastVitalsUpdated: new Date().toLocaleString()
    };
    setCurrentPatient({ ...currentPatient, clinical });
    setShowVitalsEdit(false);
    persistCurrentPatient();
  };

  const generateSummary = () => {
    if (!currentPatient) return;
    const meds = (currentPatient.medications || []).map(m => `${m.name} | ${m.dose} | ${m.doctor} | ${m.start}`).join('\n') || '(No medications)';
    const labs = (currentPatient.labs || []).join('\n') || '(No lab results)';
    const timeline = (currentPatient.timeline || []).map(t => `${t.datetime} — ${t.event}`).join('\n') || '(No timeline)';

    const summary = `
==================== PATIENT SUMMARY =====================
👤 Name: ${currentPatient.name}
📋 ID: ${currentPatient.id}
📅 DOB: ${currentPatient.dob || '(unknown)'}
📋 Status: ${currentPatient.status || 'Open'}

-------------------- CLINICAL SNAPSHOT --------------------
${currentPatient.clinical ? (`Snapshot: ${currentPatient.clinical.snapshotDate || ''}\nObservation: ${currentPatient.clinical.observation || ''}\nVitals: ${currentPatient.clinical.vitals || ''}\nTemp: ${currentPatient.clinical.temp || ''}\nDoctor: ${currentPatient.clinical.doctor || ''}\nNote: ${currentPatient.clinical.note || ''}\nLatest Lab: ${currentPatient.clinical.latestLab || ''}`) : '(No clinical snapshot)'}

-------------------- MEDICATION LIST --------------------
${meds}

-------------------- LAB / TEST RESULTS --------------------
${labs}

-------------------- CASE TIMELINE --------------------
${timeline}

==========================================================
`;

    const w = window.open('', '_blank');
    w.document.write('<pre>' + summary + '</pre>');
    w.document.close();
  };

  if (!currentPatient) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div className="text-center text-white rounded py-3 mb-4 shadow" style={{ backgroundColor: '#01C0C8' }}>
        <h4 className="fw-semibold mb-0"><i className="bi bi-person-lines-fill me-2"></i>Patient Case View</h4>
      </div>

      {/* Patient Overview Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header card-header-custom d-flex justify-content-between align-items-center flex-wrap">
          <h5 className="mb-0"><i className="bi bi-person-badge me-2"></i>Patient Information</h5>
          <div>
            <span id="statusCircle" className={`badge ${status === 'Closed' ? 'bg-danger text-white' : 'bg-light text-success'} fs-6`}>●</span>
            <span id="statusText" className="me-2 fw-semibold">{status}</span>
            {!showStatusEdit && (
              <button id="editStatusBtn" className="btn btn-light btn-sm" onClick={handleStatusEdit}>
                <i className="bi bi-pencil"></i>
              </button>
            )}
            {showStatusEdit && (
              <select id="statusSelect" className="form-select form-select-sm d-inline-block ms-2" style={{ width: 'auto' }} onChange={(e) => handleStatusSave(e.target.value)} value={status}>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            )}
          </div>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-3">
              <div className="d-flex align-items-center">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-person-fill text-white fs-3"></i>
                </div>
                <div>
                  <p className="info-label mb-0">Patient Name</p>
                  <p id="patientNameHeading" className="info-value mb-0 fs-5">{currentPatient.name || 'Name'}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <p className="info-label mb-1">Patient ID</p>
              <div className="d-flex align-items-center">
                {!showIdEdit && (
                  <>
                    <span id="patientIdText" className="info-value me-2">{patientId}</span>
                    <button id="editIdBtn" className="btn btn-outline-secondary btn-sm" onClick={handleIdEdit}>
                      <i className="bi bi-pencil"></i>
                    </button>
                  </>
                )}
                {showIdEdit && (
                  <>
                    <input id="patientIdInput" className="form-control form-control-sm d-inline-block" style={{ width: '120px' }} value={patientId} onChange={(e) => setPatientId(e.target.value)} />
                    <button id="saveIdBtn" className="btn btn-success btn-sm" onClick={() => handleIdSave(patientId)}>
                      <i className="bi bi-check"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <p className="info-label mb-1">Age</p>
              <p id="patientAge" className="info-value mb-0">{getAge(currentPatient.dob)}</p>
            </div>
            <div className="col-md-3">
              <p className="info-label mb-1">Date of Birth</p>
              <p id="patientDob" className="info-value mb-0">{currentPatient.dob}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Snapshot Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header card-header-custom d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><i className="bi bi-clipboard2-pulse me-2"></i>Clinical Snapshot</h5>
          <button className="btn btn-light btn-sm" onClick={handleClinicalEdit}>
            <i className="bi bi-pencil me-1"></i>Edit
          </button>
        </div>
        <div className="card-body">
          {/* View Mode */}
          {!showClinicalEdit && (
            <div id="clinicalViewMode">
              <div className="row g-4">
                <div className="col-lg-8">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <p className="info-label mb-1"><i className="bi bi-calendar3 me-1"></i>Snapshot Date</p>
                      <p id="snapshotDate" className="info-value mb-0">{currentPatient.clinical?.snapshotDate || 'Not recorded'}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="info-label mb-1"><i className="bi bi-person-badge-doctor me-1"></i>Treating Doctor</p>
                      <p id="treatingDoctor" className="info-value mb-0">{currentPatient.clinical?.doctor || 'Not assigned'}</p>
                    </div>
                    <div className="col-12">
                      <p className="info-label mb-1"><i className="bi bi-clipboard-heart me-1"></i>Diagnosis / Observation</p>
                      <p id="clinicalObservation" className="info-value mb-0 bg-light p-3 rounded">{currentPatient.clinical?.observation || 'No observation recorded'}</p>
                    </div>
                    <div className="col-12">
                      <p className="info-label mb-1"><i className="bi bi-chat-text me-1"></i>Clinical Note</p>
                      <p id="clinicalNote" className="info-value mb-0 bg-light p-3 rounded" style={{ whiteSpace: 'pre-line' }}>{currentPatient.clinical?.note || 'No notes available'}</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="bg-light p-3 rounded h-100">
                    <p className="info-label mb-3"><i className="bi bi-activity me-1"></i>Current Vitals</p>
                    <div id="currentVitals" className="d-flex flex-column gap-2">
                      <div className="vital-badge">
                        <div className="vital-value">{currentPatient.clinical?.vitals || 'Not recorded'}</div>
                      </div>
                    </div>
                    <hr />
                    <p className="info-label mb-0"><i className="bi bi-clock-history me-1"></i>Last Updated</p>
                    <p id="lastVitalsUpdated" className="info-value mb-0 small">{currentPatient.clinical?.lastVitalsUpdated || 'Never'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Edit Mode */}
          {showClinicalEdit && (
            <div id="clinicalEditMode">
              <ClinicalEditForm 
                clinical={currentPatient.clinical} 
                onSave={saveClinicalData} 
                onCancel={handleClinicalEdit}
              />
            </div>
          )}
        </div>
      </div>

      {/* Vitals History Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header card-header-custom d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><i className="bi bi-heart-pulse me-2"></i>Vitals History</h5>
          <button className="btn btn-light btn-sm" onClick={() => setShowVitalsEdit(!showVitalsEdit)}>
            <i className="bi bi-pencil me-1"></i>Edit Vitals
          </button>
        </div>
        <div className="card-body">
          <div id="vitalsHistoryList" className="row g-3">
            {currentPatient.clinical?.vitalsHistory?.length === 0 ? (
              <div className="col-12 text-center text-muted py-3">No vitals history available.</div>
            ) : (
              currentPatient.clinical?.vitalsHistory?.slice().reverse().map((v, i) => (
                <div key={i} className="col-md-4 col-lg-3">
                  <div className="bg-light p-3 rounded border-start border-4" style={{ borderColor: '#01C0C8 !important' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="info-label mb-1">{v.time}</p>
                        <p className="info-value mb-0 small">{v.vitals}</p>
                      </div>
                      <i className="bi bi-heart-pulse text-primary fs-4"></i>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Vitals Edit Form */}
          {showVitalsEdit && (
            <div id="vitalsEditForm" className="mt-4 pt-4 border-top">
              <VitalsEditForm onSave={updateVitals} onCancel={() => setShowVitalsEdit(false)} />
            </div>
          )}
        </div>
      </div>

      {/* Medications Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header card-header-custom d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><i className="bi bi-capsule me-2"></i>Medication List</h5>
          <button className="btn btn-light btn-sm" onClick={addMedicine}>
            <i className="bi bi-plus-lg me-1"></i>Add Medicine
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Medicine Name</th>
                  <th>Dose & Schedule</th>
                  <th>Prescribed By</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody id="medList">
                {currentPatient.medications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No medications added yet.</td>
                  </tr>
                ) : (
                  currentPatient.medications.map((m, i) => (
                    <tr key={i}>
                      <td className="ps-4">
                        <input className="form-control form-control-sm" value={m.name || ''} onChange={(e) => updateMedField(i, 'name', e.target.value)} />
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={m.dose || ''} onChange={(e) => updateMedField(i, 'dose', e.target.value)} />
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={m.doctor || ''} onChange={(e) => updateMedField(i, 'doctor', e.target.value)} />
                      </td>
                      <td>
                        <input type="date" className="form-control form-control-sm" value={m.start || ''} onChange={(e) => updateMedField(i, 'start', e.target.value)} />
                      </td>
                      <td>
                        <input type="date" className="form-control form-control-sm" value={m.end || ''} onChange={(e) => updateMedField(i, 'end', e.target.value)} />
                      </td>
                      <td className="text-center">
                        <button className="btn btn-danger btn-sm" onClick={() => removeMedication(i)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lab Results Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header card-header-custom d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><i className="bi bi-flask me-2"></i>Lab Test Results</h5>
          <button className="btn btn-light btn-sm" onClick={() => setShowLabForm(!showLabForm)}>
            <i className="bi bi-plus-lg me-1"></i>Add Lab Result
          </button>
        </div>
        <div className="card-body">
          {/* Add Lab Form */}
          {showLabForm && (
            <div id="labForm" className="mb-4 pb-4 border-bottom">
              <div className="row g-3">
                <div className="col-md-8">
                  <input type="text" id="newLabTest" className="form-control" placeholder="Enter test result (e.g., CBC: Normal)" />
                </div>
                <div className="col-md-4">
                  <button className="btn w-100" style={{ backgroundColor: '#01C0C8', color: 'white' }} onClick={(e) => addLabTest(e.target.previousElementSibling?.value)}>
                    <i className="bi bi-plus-circle me-1"></i>Add Result
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="row g-3">
            <div className="col-md-6">
              <h6 className="text-muted mb-3"><i className="bi bi-clipboard2-check me-1"></i>Test History</h6>
              <ul id="labTestHistory" className="list-group list-group-flush">
                {currentPatient.labs?.length === 0 ? (
                  <li className="list-group-item text-center text-muted">No lab results yet.</li>
                ) : (
                  currentPatient.labs?.map((l, i) => (
                    <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                      <span><i className="bi bi-check-circle text-success me-2"></i>{l}</span>
                      <button className="btn btn-danger btn-sm" onClick={() => removeLab(i)}><i className="bi bi-trash"></i></button>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="col-md-6">
              <h6 className="text-muted mb-3"><i className="bi bi-star me-1"></i>Latest Lab</h6>
              <div id="latestLabBadge" className="alert alert-info">
                {currentPatient.clinical?.latestLab ? <strong>{currentPatient.clinical.latestLab}</strong> : 'No latest lab result available.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header card-header-custom">
          <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i>Case Timeline</h5>
        </div>
        <div className="card-body">
          <div className="timeline-container">
            <div id="timelineList">
              {currentPatient.timeline?.length === 0 ? (
                <p className="text-center text-muted py-3">No timeline events yet.</p>
              ) : (
                currentPatient.timeline?.slice().reverse().map((t, i) => (
                  <div key={i} className="timeline-item">
                    <div className="d-flex justify-content-between align-items-start flex-wrap">
                      <div>
                        <p className="info-label mb-0 small">{t.datetime}</p>
                        <p className="mb-1">{t.event}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Add Note Section */}
          <div className="mt-4 pt-4 border-top">
            <h6 className="mb-3"><i className="bi bi-chat-quote me-1"></i>Add Timeline Note</h6>
            <div className="row g-3">
              <div className="col-md-10">
                <textarea id="clinicalNoteInput" className="form-control" rows="2" placeholder="Enter a new note or event..."></textarea>
              </div>
              <div className="col-md-2">
                <button className="btn w-100" style={{ backgroundColor: '#01C0C8', color: 'white' }} onClick={(e) => addNote(e.target.previousElementSibling?.value)}>
                  <i className="bi bi-send me-1"></i>Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
        <button id="generateBtn" className="btn fs-6 fw-semibold px-4 py-2"
          style={{ minWidth: '160px', borderRadius: '10px', backgroundColor: '#01C0C8', color: 'white' }}
          onClick={generateSummary}>
          <i className="bi bi-printer me-1"></i> Generate
        </button>

        <button id="saveBtn" className="btn btn-success text-white fs-6 fw-semibold px-4 py-2"
          style={{ minWidth: '160px', borderRadius: '10px' }} onClick={() => persistCurrentPatient()}>
          <i className="bi bi-save me-1"></i> Save
        </button>

        <a href="patient-case-table.html" className="btn btn-secondary text-white fs-6 fw-semibold px-4 py-2"
          style={{ minWidth: '160px', borderRadius: '10px' }}>
          <i className="bi bi-arrow-left me-1"></i> Back
        </a>
      </div>
    </div>
  );
};

// Clinical Edit Form Component
const ClinicalEditForm = ({ clinical, onSave, onCancel }) => {
  const [snapshotDate, setSnapshotDate] = useState('');
  const [treatingDoctor, setTreatingDoctor] = useState('');
  const [observation, setObservation] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (clinical) {
      let dateValue = clinical.snapshotDate || '';
      if (dateValue) {
        try {
          const dateObj = new Date(dateValue);
          if (!isNaN(dateObj)) {
            dateValue = dateObj.toISOString().slice(0, 16);
          }
        } catch (e) {}
      }
      setSnapshotDate(dateValue);
      setTreatingDoctor(clinical.doctor || '');
      setObservation(clinical.observation || '');
      setNote(clinical.note || '');
    }
  }, [clinical]);

  const handleSave = () => {
    onSave(snapshotDate, treatingDoctor, observation, note);
  };

  return (
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label">Snapshot Date</label>
        <input type="datetime-local" id="editSnapshotDate" className="form-control" value={snapshotDate} onChange={(e) => setSnapshotDate(e.target.value)} />
      </div>
      <div className="col-md-6">
        <label className="form-label">Treating Doctor</label>
        <input type="text" id="editTreatingDoctor" className="form-control" placeholder="Dr. Name" value={treatingDoctor} onChange={(e) => setTreatingDoctor(e.target.value)} />
      </div>
      <div className="col-12">
        <label className="form-label">Diagnosis / Observation</label>
        <textarea id="editClinicalObservation" className="form-control" rows="3" placeholder="Enter diagnosis or observation" value={observation} onChange={(e) => setObservation(e.target.value)}></textarea>
      </div>
      <div className="col-12">
        <label className="form-label">Clinical Note</label>
        <textarea id="editClinicalNote" className="form-control" rows="3" placeholder="Enter clinical notes" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
      </div>
      <div className="col-12">
        <button className="btn me-2" style={{ backgroundColor: '#01C0C8', color: 'white' }} onClick={handleSave}>
          <i className="bi bi-check-circle me-1"></i>Save
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          <i className="bi bi-x-circle me-1"></i>Cancel
        </button>
      </div>
    </div>
  );
};

// Vitals Edit Form Component
const VitalsEditForm = ({ onSave, onCancel }) => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [resp, setResp] = useState('');
  const [date, setDate] = useState('');

  const handleSave = () => {
    onSave(systolic, diastolic, pulse, temp, spo2, resp, date);
  };

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <label className="form-label">Systolic BP (mmHg)</label>
        <input type="number" id="systolicBP" className="form-control" placeholder="120" value={systolic} onChange={(e) => setSystolic(e.target.value)} />
      </div>
      <div className="col-md-4">
        <label className="form-label">Diastolic BP (mmHg)</label>
        <input type="number" id="diastolicBP" className="form-control" placeholder="80" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} />
      </div>
      <div className="col-md-4">
        <label className="form-label">Pulse (bpm)</label>
        <input type="number" id="pulse" className="form-control" placeholder="72" value={pulse} onChange={(e) => setPulse(e.target.value)} />
      </div>
      <div className="col-md-4">
        <label className="form-label">Temperature (°F)</label>
        <input type="number" step="0.1" id="temperature" className="form-control" placeholder="98.6" value={temp} onChange={(e) => setTemp(e.target.value)} />
      </div>
      <div className="col-md-4">
        <label className="form-label">SpO2 (%)</label>
        <input type="number" id="spo2" className="form-control" placeholder="98" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
      </div>
      <div className="col-md-4">
        <label className="form-label">Respiration Rate</label>
        <input type="number" id="respirationRate" className="form-control" placeholder="16" value={resp} onChange={(e) => setResp(e.target.value)} />
      </div>
      <div className="col-md-4">
        <label className="form-label">Recorded Date</label>
        <input type="date" id="recordedAt" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="col-md-12">
        <button className="btn" style={{ backgroundColor: '#01C0C8', color: 'white' }} onClick={handleSave}>
          <i className="bi bi-check-circle me-1"></i>Save Vitals
        </button>
      </div>
    </div>
  );
};

export default PatientCaseView;
