import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  createBirthCertificate,
  updateBirthCertificate,
  fetchBirthReports,
  selectCreationStatus,
  selectUpdateStatus,
  selectUpdateError,
  selectBirthReports,
  selectBirthReportsStatus,
} from "../../../features/birthAndDethSlice";
import Swal from "sweetalert2";

const EditBirthCertificate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const creationStatus = useSelector(selectCreationStatus);
  const updateStatus = useSelector(selectUpdateStatus);
  const updateError = useSelector(selectUpdateError);
  const birthReports = useSelector(selectBirthReports);
  const birthReportsStatus = useSelector(selectBirthReportsStatus);

  const [initialValues, setInitialValues] = useState({
    hospitalName: "HarishChandra Hospital",
    certificateNo: "",
    childName: "",
    dob: "",
    time: "",
    weight: "",
    height: "",
    gender: "",
    place: "",
    father: "",
    mother: "",
    motherPatientId: "",
    address: "",
    doctor: "",
    mobile: "",
    signatory: "",
    issueDate: "",
    email: "",
    headCircumference: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    console.log("URL ID parameter:", id);
    if (id) {
      setIsEditMode(true);
      // Fetch birth reports if not already loaded
      if (birthReports.length === 0 && birthReportsStatus !== "loading") {
        dispatch(fetchBirthReports());
      }
    }
  }, [id, dispatch, birthReports.length, birthReportsStatus]);

  useEffect(() => {
    if (isEditMode && id && birthReports.length > 0) {
      const certificate = birthReports.find(
        (cert) => cert.id === parseInt(id) || cert.certificateNumber === id
      );

      if (certificate) {
        setInitialValues({
          hospitalName: certificate.placeOfBirth || "HarishChandra Hospital",
          certificateNo: certificate.certificateNumber || "",
          childName: certificate.childName || "",
          dob: certificate.dateOfBirth || "",
          time: certificate.timeOfBirth || "",
          weight: certificate.birthWeight || "",
          height: certificate.birthLength || "",
          gender: certificate.gender || "",
          place: certificate.placeOfBirth || "",
          father: certificate.fatherName || "",
          mother: certificate.motherName || "",
          motherPatientId: certificate.motherPatientId
            ? String(certificate.motherPatientId)
            : "",
          address: certificate.address || "",
          doctor: certificate.attendingDoctor || "",
          mobile: certificate.contactNumber || "",
          signatory: "",
          issueDate: certificate.timeOfIssue || "",
          email: certificate.email || "",
          headCircumference: certificate.headCircumference || "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Certificate Not Found",
          text: "The birth certificate you're trying to edit could not be found.",
        });
        navigate("/dashboard/manage-birth-certificates");
      }
    }
  }, [isEditMode, id, birthReports, navigate]);

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      gender: values.gender.toUpperCase(),
      dateOfBirth: values.dob,
      timeOfBirth: values.time,
      birthWeight: parseFloat(values.weight) || null,
      birthLength: parseFloat(values.height) || null,
      headCircumference: parseFloat(values.headCircumference) || null,
      placeOfBirth: values.place || values.hospitalName,
      attendingDoctor: values.doctor,
      timeOfIssue: values.issueDate,
      certificateNumber: values.certificateNo,
      motherName: values.mother,
      fatherName: values.father,
      contactNumber: values.mobile,
      email: values.email,
      address: values.address,
      motherPatientId: values.motherPatientId
        ? Number(values.motherPatientId)
        : null,
    };

    try {
      if (isEditMode) {
        if (!id) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Certificate ID is required for editing.",
          });
          return;
        }
        // Ensure id is numeric when sending to backend and include it in payload
        const numericId = Number(id);
        if (isNaN(numericId)) {
          Swal.fire({
            icon: "error",
            title: "Invalid ID",
            text: "Certificate ID is invalid.",
          });
          return;
        }

        // include id in the request body as some backends expect it in the payload as well
        const payloadWithId = { ...payload, id: numericId };
        console.log(
          "Updating certificate, id:",
          numericId,
          "payload:",
          payloadWithId
        );

        await dispatch(
          updateBirthCertificate({
            id: numericId,
            certificateData: payloadWithId,
          })
        ).unwrap();

        Swal.fire({
          icon: "success",
          title: "Certificate Updated!",
          text: "The birth certificate has been successfully updated.",
          timer: 2000,
          showConfirmButton: false,
        });

        // Navigate back to certificates list
        navigate("/dashboard/manage-birth-certificates");
      } else {
        // For create: include numeric id from URL if provided (some backends expect it)
        let createPayload = { ...payload };
        if (id) {
          const numericCreateId = Number(id);
          if (isNaN(numericCreateId)) {
            Swal.fire({
              icon: "error",
              title: "Invalid ID",
              text: "Provided ID is invalid.",
            });
            return;
          }
          createPayload.id = numericCreateId;
          console.log(
            "Creating certificate with payload (including id):",
            createPayload
          );
        } else {
          console.log("Creating certificate with payload:", createPayload);
        }

        await dispatch(createBirthCertificate(createPayload)).unwrap();

        Swal.fire({
          icon: "success",
          title: "Certificate Created!",
          text: "The birth certificate has been successfully created.",
          timer: 2000,
          showConfirmButton: false,
        });

        resetForm();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: isEditMode ? "Update Failed" : "Creation Failed",
        text: error.message || "An unexpected error occurred.",
      });
    }
  };

  const validationSchema = Yup.object({
    hospitalName: Yup.string().required("Hospital name is required"),
    childName: Yup.string(),
    dob: Yup.date()
      .required("Date of birth is required")
      .max(new Date(), "Date of birth cannot be in the future"),
    gender: Yup.string().required("Gender is required"),
    time: Yup.string().required("Time of birth is required"),
  });

  return (
    <div className="card full-width-card shadow-sm w-100 border-0">
      <div
        className="card-header text-white text-center"
        style={{ backgroundColor: "#01C0C8" }}
      >
        <h3 className="mb-0">
          <i className="bi bi-heart-pulse me-2"></i>
          {isEditMode
            ? "Edit Birth Certificate"
            : "Baby Birth Certificate Form"}
        </h3>
      </div>

      <div className="card-body">
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) =>
            handleSubmit(values, { resetForm })
          }
        >
          {({ values, handleChange, handleSubmit, errors, touched }) => (
            <form id="birthForm" autoComplete="off" onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Hospital Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="hospitalName"
                    value={values.hospitalName}
                    onChange={handleChange}
                  />
                  {touched.hospitalName && errors.hospitalName && (
                    <div className="text-danger small">
                      {errors.hospitalName}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Mother’s Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="mother"
                    value={values.mother}
                    onChange={handleChange}
                    placeholder="Enter mother's name"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Issue Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="issueDate"
                    value={values.issueDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    Date of Birth <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="dob"
                    value={values.dob}
                    onChange={handleChange}
                  />
                  {touched.dob && errors.dob && (
                    <div className="text-danger small">{errors.dob}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <label className="form-label">
                    Time of Birth <span className="text-danger">*</span>
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    id="time"
                    name="time"
                    value={values.time}
                    onChange={handleChange}
                  />
                  {touched.time && errors.time && (
                    <div className="text-danger small">{errors.time}</div>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="weight"
                    value={values.weight}
                    onChange={handleChange}
                    placeholder="e.g., 3.2"
                    step="0.01"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Height (inch)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="height"
                    value={values.height}
                    onChange={handleChange}
                    placeholder="e.g., 20"
                    step="0.1"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    Gender <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="gender"
                    value={values.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  {touched.gender && errors.gender && (
                    <div className="text-danger small">{errors.gender}</div>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Place of Birth (Hospital / Ward)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="place"
                    value={values.place}
                    onChange={handleChange}
                    placeholder="Enter place of birth"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Father’s Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="father"
                    value={values.father}
                    onChange={handleChange}
                    placeholder="Enter father's name"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="mobile"
                    value={values.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    maxLength={10}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    value={values.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Attending Doctor / Midwife
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="doctor"
                    value={values.doctor}
                    onChange={handleChange}
                    placeholder="Enter doctor’s name"
                  />
                </div>
              </div>

              <div className="text-center mt-4">
                <button
                  type="submit"
                  className="btn text-white px-4"
                  style={{ backgroundColor: "#01C0C8", borderColor: "#01C0C8" }}
                  disabled={creationStatus === "loading"}
                >
                  {creationStatus === "loading" ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save-fill me-1"></i>
                      {isEditMode ? "Update Certificate" : "Save Certificate"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditBirthCertificate;
