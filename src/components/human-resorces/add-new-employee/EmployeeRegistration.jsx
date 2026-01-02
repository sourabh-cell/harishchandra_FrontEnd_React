import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import {
  BloodGroupOptions,
  ExperienceLevel,
  GenderOptions,
  QualificationOptions,
} from "../../../../constants";
import { useSelector, useDispatch } from "react-redux";
import { fetchStates } from "../../../features/statesSlice";
import { fetchDepartments } from "../../../features/departmentSlice";
import { IdProofTypeOptions } from "../../../../constants";
import { RoleNameOptions } from "../../../../constants";
import {
  registerEmployee,
  resetEmployeeState,
} from "../../../features/employeeSlice";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { SPECIALIZATIONS } from "../../../../specialization";

const EmployeeRegistration = () => {
  const fieldLabels = {
    firstName: "First Name",
    lastName: "Last Name",
    mobileNumber: "Mobile Number",
    username: "Username",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    gender: "Gender",
    dob: "Date of Birth",
    role: "Role",
    qualifications: "Qualifications",
    addressLine1: "Address Line 1",
    state: "State",
    city: "City",
  };

  const dispatch = useDispatch();
  const { list: states, status: statesStatus } = useSelector(
    (state) => state.states
  );
  const { list: departments, status: departmentsStatus } = useSelector(
    (state) => state.departments
  );
  const { success, error, message } = useSelector((state) => state.employee);

  const [districts, setDistricts] = useState([]);
  const [passwordRules, setPasswordRules] = useState({
    uppercase: false,
    number: false,
    special: false,
  });
  const [passwordMatch, setPasswordMatch] = useState("");

  // Ensure the entire page scrolls to the absolute top. This is a minimal
  // helper (no refs) that performs an instant jump to top and clears common
  // document scroll positions so alerts at the top become visible.
  const scrollToTopFull = (opts = { behavior: "smooth" }) => {
    if (
      typeof window !== "undefined" &&
      typeof window.scrollTo === "function"
    ) {
      try {
        // instant jump first to remove offsets then optionally smooth
        window.scrollTo({ top: 0, behavior: "auto" });
        if (opts.behavior === "smooth") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch {
        // ignore
      }
    }
    try {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    } catch {
      // ignore
    }
  };

  // 1) Include all expected keys in initialValues (use consistent names)
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      dob: "",
      age: "",
      addressLine1: "",
      addressLine2: "",
      idProofType: "",
      idProof: null,
      joiningDate: "", // unified name (was joiningdate previously)
      state: "",
      district: "",
      city: "",
      country: "India",
      pincode: "",
      role: "", // will be option value (string) — convert to number before sending
      profilePic: null,
      bloodGroup: "",
      experience: "",
      qualifications: [],
      category: "",
      specialization: "",
      licenseNumber: "",
      department: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      mobileNumber: Yup.string()
        .matches(/^[0-9]{10}$/, "Must be a 10-digit number")
        .required("Mobile number is required"),
      username: Yup.string().required("Username is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Must contain one uppercase letter")
        .matches(/[0-9]/, "Must contain one number")
        .matches(/[@$!%*?&#~]/, "Must contain one special character")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
      gender: Yup.string().required("Gender is required"),
      dob: Yup.date()
        .required("Date of Birth is required")
        .typeError("Date of Birth must be a valid date")
        .max(new Date(), "Date of Birth cannot be in the future")
        .min(new Date(1900, 0, 1), "Date of Birth cannot be before 1900"),
      role: Yup.string().required("Role is required"),
      qualifications: Yup.array()
        .of(Yup.string())
        .min(1, "At least one qualification is required")
        .required("Qualifications are required"),
      // Address validation - basic requirements
      addressLine1: Yup.string().required("Address Line 1 is required"),
      state: Yup.string().required("State is required"),
      city: Yup.string().required("City is required"),
      pincode: Yup.string().test(
        "pincode-format",
        "Pincode must be a valid 6-digit Indian postal code",
        (value) => {
          if (!value) return true; // optional
          return /^\d{6}$/.test(value);
        }
      ),
    }),
    // 2) Use Formik onSubmit to dispatch the thunk; convert role to number
    onSubmit: async (values, { setSubmitting, resetForm, setTouched }) => {
      setSubmitting(true);
      try {
        // If there are errors, show notification and mark fields as touched
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          const errorFields = Object.keys(errors)
            .map((field) => fieldLabels[field] || field)
            .join(", ");
          await Swal.fire({
            title: "Validation Errors",
            text: `Please fill the following required fields: ${errorFields}`,
            icon: "warning",
            confirmButtonText: "OK",
          });
          setTouched(
            Object.keys(formik.initialValues).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {})
          );
          //  Scroll to the first error field
          const firstErrorField = Object.keys(errors)[0];
          document
            .querySelector(`[name="${firstErrorField}"]`)
            ?.scrollIntoView({ behavior: "smooth" });

          setSubmitting(false);
          return;
        }

        // ...existing code...
        console.log("✅ Raw Formik Values:", values);

        // Build structured payload (matches your working payload)
        const payload = {
          username: values.username,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          firstName: values.firstName,
          lastName: values.lastName,
          mobileNumber: values.mobileNumber,
          gender: values.gender,
          dob: values.dob,
          age: values.age ? Number(values.age) : null,
          idProofType: values.idProofType || null,
          joiningDate: values.joiningDate || null,
          bloodGroup: values.bloodGroup || null,
          roleId: Number(values.role), // role → roleId
          addressDto: {
            addressLine1: values.addressLine1 || "",
            addressLine2: values.addressLine2 || "",
            city: values.city || "",
            district: values.district || "",
            state: values.state || "",
            pincode: values.pincode || "",
            country: values.country || "India",
          },
        };

        console.log("✅ Payload before role-specific DTOs:", payload);

        // ...existing code...
        if (String(values.role) === "3") {
          payload.doctorDto = {
            specialization: values.specialization || "",
            experience: values.experience || null,
            qualifications: values.qualifications, // note: server expects 'qualifications' (plural)
            licenseNumber: values.licenseNumber || "",
            departmentId: values.department ? Number(values.department) : 3, // default departmentId
          };
        } // HR (role 7)
        else if (String(values.role) === "7") {
          payload.humanResourceDto = {
            experience: values.experience || null,
            qualifications: values.qualifications,
          };
        }

        // ...existing code...
        else if (String(values.role) === "10") {
          payload.receptionistDto = {
            experience: values.experience || null,
            qualifications: values.qualifications,
          };
        }

        // ...existing code...
        else if (String(values.role) === "5") {
          payload.pharmacistDto = {
            experience: values.experience || null,
            qualifications: values.qualifications,
          };
        }

        // ...existing code...
        else if (String(values.role) === "4") {
          payload.headNurseDto = {
            experience: values.experience || null,
            qualifications: values.qualifications,
          };
        }

        // ...existing code...
        else if (String(values.role) === "6") {
          payload.accountantDto = {
            experience: values.experience || null,
            qualifications: values.qualifications,
          };
        }

        // ...existing code...
        else if (String(values.role) === "9") {
          payload.insurerDto = {
            experience: values.experience || null,
            qualifications: values.qualifications,
          };
        }

        // ...existing code...
        else if (String(values.role) === "8") {
          payload.laboratoristDto = {
            experience: values.experience || null,
            qualifications: values.qualifications,
            laboratoryType: values.category || null,
          };
        }

        console.log(
          "✅ Final payload with role-specific DTO:",
          JSON.stringify(payload, null, 2)
        );

        // ...existing code...
        // const hasFiles =
        //   values.profilePic instanceof File || values.idProof instanceof File;

        // let requestData;

        //  4. Always send as FormData (even without files)
        const formData = new FormData();
        formData.append(
          "dto",
          new Blob([JSON.stringify(payload)], { type: "application/json" })
        );

        if (values.profilePic instanceof File) {
          formData.append("profilePic", values.profilePic);
        }
        if (values.idProof instanceof File) {
          formData.append("idProofPic", values.idProof);
        }

        const requestData = formData;

        // if (hasFiles) {
        //   // Build FormData for files + payload JSON
        //   const formData = new FormData();

        //   // Append JSON fields as strings
        //   formData.append(
        //     "dto",
        //     new Blob([JSON.stringify(payload)], { type: "application/json" })
        //   );

        //   // Append file uploads separately
        //   if (values.profilePic instanceof File) {
        //     formData.append("profilePic", values.profilePic);
        //   }
        //   if (values.idProof instanceof File) {
        //     formData.append("idProofPic", values.idProof);
        //   }

        //   requestData = formData;
        //   console.log("✅ Sending FormData with files");
        // } else {
        //   // Send as JSON
        //   requestData = payload;
        //   console.log(
        //     "✅ Sending JSON payload:",
        //     JSON.stringify(payload, null, 2)
        //   );
        // }

        const resultAction = await dispatch(registerEmployee(requestData));
        console.log("🔍 Full resultAction:", resultAction);
        console.log("❌ Error payload:", resultAction.payload);

        const status = resultAction?.meta?.requestStatus;

        if (status === "rejected") {
          // const errMsg = resultAction.payload || resultAction.error?.message || "Registration failed";
          let errMsg;

          // ✅ Extract error array from Axios response
          if (resultAction.payload?.response?.data) {
            errMsg = resultAction.payload.response.data;
          } else if (Array.isArray(resultAction.payload)) {
            errMsg = resultAction.payload;
          } else {
            errMsg =
              resultAction.payload ||
              resultAction.error?.message ||
              "Registration failed";
          }

          if (Array.isArray(errMsg)) {
            const fieldErrors = {};

            errMsg.forEach((err) => {
              if (err.field && err.defaultMessage) {
                // Preserve top-level fields like "username", "email"

                // Normalize nested fields like "doctorDto.experience" → "experience"
                const normalizedField = err.field.includes(".")
                  ? err.field.split(".").pop()
                  : err.field;
                fieldErrors[normalizedField] = err.defaultMessage;
              }
            });

            formik.setErrors(fieldErrors);
            console.log("✅ Formik errors set:", fieldErrors);

            formik.setTouched(
              Object.keys(fieldErrors).reduce((acc, key) => {
                acc[key] = true;
                return acc;
              }, {})
            );
            console.log("✅ Formik touched set:", formik.touched);

            const firstField = Object.keys(fieldErrors)[0];
            if (firstField) {
              // ensure viewport goes fully to top then focus field
              if (typeof scrollToTopFull === "function")
                scrollToTopFull({ behavior: "smooth" });
              setTimeout(() => {
                const el = document.querySelector(`[name="${firstField}"]`);
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
                try {
                  el?.focus();
                } catch {
                  /* ignore */
                }
              }, 200);
            }

            // Show backend validation messages (array) in SweetAlert as well
            try {
              const arrMsg = (Array.isArray(errMsg) ? errMsg : [])
                .map((e) => e.defaultMessage || e.message || JSON.stringify(e))
                .filter(Boolean)
                .join("\n");
              if (arrMsg)
                await Swal.fire({
                  title: "Error",
                  text: arrMsg,
                  icon: "error",
                  confirmButtonText: "OK",
                });
            } catch {
              /* ignore */
            }

            setSubmitting(false);
            return;
          } else if (typeof errMsg === "object" && errMsg !== null) {
            // Handle object errors like { field: message } or { message: "error" }
            const fieldErrors = {};
            const generalMessages = [];
            for (const key in errMsg) {
              if (errMsg[key]) {
                if (
                  Object.prototype.hasOwnProperty.call(
                    formik.initialValues,
                    key
                  )
                ) {
                  fieldErrors[key] = errMsg[key];
                } else {
                  generalMessages.push(errMsg[key]);
                }
              }
            }
            if (Object.keys(fieldErrors).length > 0) {
              formik.setErrors(fieldErrors);
              formik.setTouched(
                Object.keys(fieldErrors).reduce((acc, key) => {
                  acc[key] = true;
                  return acc;
                }, {})
              );
              const firstField = Object.keys(fieldErrors)[0];
              if (firstField) {
                if (typeof scrollToTopFull === "function")
                  scrollToTopFull({ behavior: "smooth" });
                setTimeout(() => {
                  const el = document.querySelector(`[name="${firstField}"]`);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  try {
                    el?.focus();
                  } catch {
                    /* ignore */
                  }
                }, 200);
              }
              setSubmitting(false);
              return;
            }
            if (generalMessages.length > 0) {
              const gm = generalMessages.filter(Boolean).join("\n");
              await Swal.fire({
                title: "Error",
                text:
                  gm ||
                  "An error occurred during registration. Please check your input and try again.",
                icon: "error",
                confirmButtonText: "OK",
              });
              setSubmitting(false);
              return;
            }
          }
          // fallback - show backend message if present
          try {
            let messageToShow =
              "An error occurred during registration. Please check your input and try again.";
            if (typeof errMsg === "string") messageToShow = errMsg;
            else if (Array.isArray(errMsg))
              messageToShow = errMsg
                .map((e) => e.defaultMessage || e.message || JSON.stringify(e))
                .filter(Boolean)
                .join("\n");
            else if (errMsg && typeof errMsg === "object")
              messageToShow = errMsg.message || JSON.stringify(errMsg);
            await Swal.fire({
              title: "Error",
              text: messageToShow,
              icon: "error",
              confirmButtonText: "OK",
            });
          } catch {
            await Swal.fire({
              title: "Error",
              text: "An error occurred during registration.",
              icon: "error",
              confirmButtonText: "OK",
            });
          }

          setSubmitting(false);
          return;
        }

        if (status === "fulfilled") {
          const serverMessage =
            resultAction.payload?.message || "Registration Successful";
          await Swal.fire({
            title: "Success!",
            text: serverMessage,
            icon: "success",
            confirmButtonText: "OK",
          });
          // } else {
          //   // Handle backend array errors or a single message
          //   let errMsg =
          //     resultAction.payload ||
          //     resultAction.error?.message ||
          //     "Registration failed";

          //   // Check if it's an array (like your backend response)
          //   if (Array.isArray(errMsg)) {
          //     // Extract readable messages
          //     const messages = errMsg
          //       .map((err) => `• ${err.defaultMessage}`)
          //       .join("\n");
          //     errMsg = messages;
          //   } else if (typeof errMsg === "object" && errMsg.defaultMessage) {
          //     // Handle single error object
          //     errMsg = errMsg.defaultMessage;
          //   }

          //   await Swal.fire({
          //     title: "Error",
          //     text: errMsg,
          //     icon: "error",
          //     confirmButtonText: "OK",
          //   });
          // }

          // Reset form after successful registration
          resetForm();
        }
      } catch (err) {
        console.error("❌ Submit Error:", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // fetch states
  useEffect(() => {
    if (statesStatus === "idle") dispatch(fetchStates());
  }, [dispatch, statesStatus]);

  // fetch departments
  useEffect(() => {
    if (departmentsStatus === "idle") dispatch(fetchDepartments());
  }, [dispatch, departmentsStatus]);

  // Reset employee state on component mount
  useEffect(() => {
    dispatch(resetEmployeeState());
  }, [dispatch]);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(resetEmployeeState());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  // generic change for non-file inputs (we mostly use formik.handleChange directly)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || !files.length) return;
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds 5 MB limit!`);
      return;
    }
    formik.setFieldValue(name, file);
  };

  // Age calc (unchanged)
  useEffect(() => {
    if (!formik.values.dob) return;
    const dob = new Date(formik.values.dob);
    const today = new Date();
    if (dob > today || dob.getFullYear() < 1900) {
      formik.setFieldValue("age", "");
      return;
    }
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    formik.setFieldValue("age", age);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.dob]);

  // Password rules
  useEffect(() => {
    const { password, confirmPassword } = formik.values;
    setPasswordRules({
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&#~]/.test(password),
    });
    if (!confirmPassword) setPasswordMatch("");
    else
      setPasswordMatch(
        password === confirmPassword
          ? "✅ Passwords match"
          : "❌ Passwords do not match"
      );
  }, [formik.values]);

  // State -> district
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    formik.setFieldValue("state", selectedState);
    formik.setFieldValue("district", "");
    if (!selectedState) {
      setDistricts([]);
      return;
    }
    const selected = states.find((s) => s.state === selectedState);
    setDistricts(selected ? selected.districts : []);
  };

  // Department change handler to reset specialization
  const handleDepartmentChange = (e) => {
    formik.setFieldValue("department", e.target.value);
    formik.setFieldValue("specialization", "");
  };

  // Role-specific fields renderer remains but uses the canonical keys (experience, qualification, category)
  const renderRoleSpecificFields = () => {
    const { role } = formik.values;
    const roleLabelObj = RoleNameOptions?.find(
      (r) => String(r.value) === String(role)
    );
    const roleLabel = roleLabelObj ? roleLabelObj.label : role;

    switch (String(role)) {
      case "3":
        const selectedDept = departments.find(
          (d) => String(d.id) === String(formik.values.department)
        );
        const deptName = selectedDept ? selectedDept.departmentName : "";
        const specializations = SPECIALIZATIONS[deptName] || [];
        return (
          <div id="doctorFields" className="mt-3">
            <h5>{roleLabel} Specific Fields</h5>
            <div className="row">
              {/* Experience */}
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Experience</label>
                <select
                  name="experience"
                  value={formik.values.experience}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="form-select"
                >
                  <option value="">Select Experience</option>
                  {ExperienceLevel.map((exp) => (
                    <option key={exp.value} value={exp.value}>
                      {exp.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Department */}
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Department</label>
                <select
                  name="department"
                  value={formik.values.department}
                  onChange={handleDepartmentChange}
                  onBlur={formik.handleBlur}
                  className="form-select"
                >
                  <option value="">
                    {departmentsStatus === "loading"
                      ? "Loading Departments..."
                      : departmentsStatus === "failed"
                      ? "Error loading departments"
                      : "Select Department"}
                  </option>
                  {departmentsStatus === "succeeded" &&
                    departments?.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.departmentName}
                      </option>
                    ))}
                </select>
              </div>
              {/* Specialization */}
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Specialization</label>
                <select
                  name="specialization"
                  value={formik.values.specialization}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="form-control"
                  style={{ height: "40px", fontSize: "16px" }}
                >
                  <option value="">-- Select Specialization --</option>
                  {specializations.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qualifications (Formik) */}
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Qualifications</label>
                <Select
                  isMulti
                  isSearchable
                  name="qualifications"
                  options={QualificationOptions[role]?.filter(
                    (opt) => opt.value !== ""
                  )}
                  value={QualificationOptions[role]?.filter((opt) =>
                    formik.values.qualifications.includes(opt.value)
                  )}
                  onChange={(selected) => {
                    formik.setFieldValue(
                      "qualifications",
                      selected ? selected.map((s) => s.value) : []
                    );
                  }}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.qualifications &&
                    formik.errors.qualifications
                      ? "is-invalid"
                      : ""
                  }
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor:
                        formik.touched.qualifications &&
                        formik.errors.qualifications
                          ? "#dc3545"
                          : provided.borderColor,
                      "&:hover": {
                        borderColor:
                          formik.touched.qualifications &&
                          formik.errors.qualifications
                            ? "#dc3545"
                            : provided.borderColor,
                      },
                    }),
                  }}
                />
                <div className="invalid-feedback">
                  {formik.errors.qualifications}
                </div>
              </div>
              {/* License Number */}
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formik.values.licenseNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="form-control"
                />
              </div>
            </div>
          </div>
        );
      case "7":
      case "10":
      case "5":
      case "4":
      case "6":
      case "9":
        return (
          <div id={`${role}Fields`} className="mt-3">
            <h5>{roleLabel} Specific Fields</h5>

            {/* Experience Field */}
            <div className="row">
              <div className="mb-3 col-md-6">
                <label className="form-label">Experience</label>
                <select
                  name="experience"
                  value={formik.values.experience}
                  onChange={(e) =>
                    formik.setFieldValue("experience", e.target.value)
                  }
                  onBlur={formik.handleBlur}
                  className="form-select"
                >
                  <option value="">Select Experience</option>
                  {ExperienceLevel.map((exp) => (
                    <option key={exp.value} value={exp.value}>
                      {exp.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qualification Field */}
              <div className="mb-3 col-md-6">
                <label className="form-label">Qualifications</label>
                <Select
                  isMulti
                  isSearchable
                  name="qualifications"
                  options={QualificationOptions[role]?.filter(
                    (opt) => opt.value !== ""
                  )}
                  value={QualificationOptions[role]?.filter((opt) =>
                    formik.values.qualifications.includes(opt.value)
                  )}
                  onChange={(selected) => {
                    formik.setFieldValue(
                      "qualifications",
                      selected ? selected.map((s) => s.value) : []
                    );
                  }}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.qualifications &&
                    formik.errors.qualifications
                      ? "is-invalid"
                      : ""
                  }
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor:
                        formik.touched.qualifications &&
                        formik.errors.qualifications
                          ? "#dc3545"
                          : provided.borderColor,
                      "&:hover": {
                        borderColor:
                          formik.touched.qualifications &&
                          formik.errors.qualifications
                            ? "#dc3545"
                            : provided.borderColor,
                      },
                    }),
                  }}
                />
                <div className="invalid-feedback">
                  {formik.errors.qualifications}
                </div>
              </div>
            </div>
          </div>
        );
      case "8":
        return (
          <div id="labTechFields" className="mt-3">
            <h5>{roleLabel} Specific Fields</h5>
            <div className="row">
              {/* Category */}
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  <option value="RADIOLOGY">RADIOLOGY</option>
                  <option value="PATHLAB">PATHLAB</option>
                </select>
              </div>
              {/* Experience */}
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Experience</label>
                <select
                  name="experience"
                  value={formik.values.experience}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="form-select"
                >
                  <option value="">Select Experience</option>
                  {ExperienceLevel.map((exp) => (
                    <option key={exp.value} value={exp.value}>
                      {exp.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Qualifications (Formik) */}
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Qualifications</label>
                <Select
                  isMulti
                  isSearchable
                  name="qualifications"
                  options={QualificationOptions[role]?.filter(
                    (opt) => opt.value !== ""
                  )}
                  value={QualificationOptions[role]?.filter((opt) =>
                    formik.values.qualifications.includes(opt.value)
                  )}
                  onChange={(selected) => {
                    formik.setFieldValue(
                      "qualifications",
                      selected ? selected.map((s) => s.value) : []
                    );
                  }}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.qualifications &&
                    formik.errors.qualifications
                      ? "is-invalid"
                      : ""
                  }
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor:
                        formik.touched.qualifications &&
                        formik.errors.qualifications
                          ? "#dc3545"
                          : provided.borderColor,
                      "&:hover": {
                        borderColor:
                          formik.touched.qualifications &&
                          formik.errors.qualifications
                            ? "#dc3545"
                            : provided.borderColor,
                      },
                    }),
                  }}
                />
                <div className="invalid-feedback">
                  {formik.errors.qualifications}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // JSX — ensure every input uses value & onChange from formik, and file inputs call handleFileChange
  return (
    <div className="card full-width-card shadow border-0 w-100">
      <div
        className="card-header text-white text-center py-3"
        style={{ backgroundColor: "#01C0C8" }}
      >
        <h3 className="mb-0">
          <i className="fa-solid fa-user-plus" /> Employee Registration
        </h3>
      </div>

      <div className="card-body px-5 py-4">
        {/* Success/Error Messages */}
        {success && message && (
          <div
            className="alert alert-success alert-dismissible fade show"
            role="alert"
          >
            {message}
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
        )}
        {typeof error === "string" && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            {error}
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
        )}

        {Array.isArray(error) && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            <ul className="mb-0">
              {error.map((err, idx) => (
                <li key={idx}>{err.defaultMessage}</li>
              ))}
            </ul>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Use formik.handleSubmit on form */}
        <form
          onSubmit={formik.handleSubmit}
          onReset={() => {
            formik.resetForm();
            setDistricts([]);
          }}
        >
          {/* Name Fields */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                First Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`form-control ${
                  formik.touched.firstName && formik.errors.firstName
                    ? "is-invalid"
                    : ""
                }`}
              />
              <div className="invalid-feedback">{formik.errors.firstName}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Last Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`form-control ${
                  formik.touched.lastName && formik.errors.lastName
                    ? "is-invalid"
                    : ""
                }`}
              />
              <div className="invalid-feedback">{formik.errors.lastName}</div>
            </div>
          </div>

          {/* Contact Fields */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Mobile No <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="number"
                name="mobileNumber"
                value={formik.values.mobileNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onInput={(e) => (e.target.value = e.target.value.slice(0, 10))}
                className={`form-control ${
                  formik.touched.mobileNumber && formik.errors.mobileNumber
                    ? "is-invalid"
                    : ""
                }`}
              />
              <div className="invalid-feedback">
                {formik.errors.mobileNumber}
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Email <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`form-control ${
                  formik.touched.email && formik.errors.email
                    ? "is-invalid"
                    : ""
                }`}
              />
              <div className="invalid-feedback">{formik.errors.email}</div>
            </div>
          </div>

          {/* username */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Username <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`form-control ${
                  formik.touched.username && formik.errors.username
                    ? "is-invalid"
                    : ""
                }`}
              />
              <div className="invalid-feedback">{formik.errors.username}</div>
            </div>
          </div>

          {/* Password Fields */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Password <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`form-control ${
                  formik.touched.password && formik.errors.password
                    ? "is-invalid"
                    : ""
                }`}
              />
              <div className="invalid-feedback">{formik.errors.password}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Confirm Password <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`form-control ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "is-invalid"
                    : ""
                }`}
              />
              <div className="invalid-feedback">
                {formik.errors.confirmPassword}
              </div>
              {passwordMatch && (
                <small
                  className="form-text"
                  style={{
                    color: passwordMatch.includes("✅") ? "green" : "red",
                  }}
                >
                  {passwordMatch}
                </small>
              )}
            </div>
          </div>

          {/* Password Rules */}
          <ul className="list-unstyled small mb-4">
            <li style={{ color: passwordRules.uppercase ? "green" : "red" }}>
              Must include at least one uppercase letter
            </li>
            <li style={{ color: passwordRules.number ? "green" : "red" }}>
              Must include one number
            </li>
            <li style={{ color: passwordRules.special ? "green" : "red" }}>
              Must include one special character
            </li>
          </ul>

          {/* Gender / DOB / Age */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Gender <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="gender"
                className={`form-select ${
                  formik.touched.gender && formik.errors.gender
                    ? "is-invalid"
                    : ""
                }`}
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select Gender</option>
                {GenderOptions?.map((g, idx) => (
                  <option key={idx} value={g.value || g}>
                    {g.label || g}
                  </option>
                ))}
              </select>
              <div className="invalid-feedback">{formik.errors.gender}</div>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formik.values.dob}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`form-control ${
                  formik.touched.dob && formik.errors.dob ? "is-invalid" : ""
                }`}
              />
              <div className="invalid-feedback">{formik.errors.dob}</div>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Age</label>
              <input
                type="text"
                name="age"
                value={formik.values.age}
                readOnly
                className="form-control"
              />
            </div>
          </div>

          {/* Joining Date & Blood Group */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formik.values.joiningDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Blood Group</label>
              <select
                name="bloodGroup"
                className="form-select"
                value={formik.values.bloodGroup}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select Blood Group</option>
                {BloodGroupOptions?.map((group, idx) => (
                  <option key={idx} value={group.value || group}>
                    {group.label || group}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="border rounded p-3 mb-3">
            <h5 className="fw-bold mb-3">Address Details</h5>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="addressLine1" className="form-label">
                  Address Line 1 <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  className={`form-control ${
                    formik.touched.addressLine1 && formik.errors.addressLine1
                      ? "is-invalid"
                      : ""
                  }`}
                  placeholder="Enter Address Line 1"
                  value={formik.values.addressLine1}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="invalid-feedback">
                  {formik.errors.addressLine1}
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="addressLine2" className="form-label">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  className="form-control"
                  placeholder="Enter Address Line 2"
                  value={formik.values.addressLine2}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="state" className="form-label">
                  State <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  className={`form-select ${
                    formik.touched.state && formik.errors.state
                      ? "is-invalid"
                      : ""
                  }`}
                  onChange={handleStateChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.state}
                >
                  <option value="">Select State</option>
                  {statesStatus === "loading" && <option>Loading...</option>}
                  {statesStatus === "failed" && (
                    <option>Error loading states</option>
                  )}
                  {statesStatus === "succeeded" &&
                    states.map((s, i) => (
                      <option key={i} value={s.state}>
                        {s.state}
                      </option>
                    ))}
                </select>
                <div className="invalid-feedback">{formik.errors.state}</div>
              </div>

              <div className="col-md-4">
                <label htmlFor="district" className="form-label">
                  District
                </label>
                <select
                  id="district"
                  name="district"
                  className="form-select"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.district}
                  disabled={!formik.values.state}
                >
                  <option value="">Select District</option>
                  {districts.map((d, idx) => (
                    <option key={idx} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="city" className="form-label">
                  City <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className={`form-control ${
                    formik.touched.city && formik.errors.city
                      ? "is-invalid"
                      : ""
                  }`}
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="invalid-feedback">{formik.errors.city}</div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="country" className="form-label">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  className="form-select"
                  value={formik.values.country}
                  disabled
                >
                  <option value="India">India</option>
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="pincode" className="form-label">
                  Pincode
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  className={`form-control ${
                    formik.touched.pincode && formik.errors.pincode
                      ? "is-invalid"
                      : ""
                  }`}
                  value={formik.values.pincode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onInput={(e) =>
                    (e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6))
                  }
                />
                <div className="invalid-feedback">{formik.errors.pincode}</div>
              </div>
            </div>
          </div>

          {/* ID Proof Upload */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Select Id Proof</label>
              <select
                name="idProofType"
                className="form-select"
                value={formik.values.idProofType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select Id Proof</option>
                {IdProofTypeOptions?.map((idProof, idx) => (
                  <option key={idx} value={idProof.value || idProof}>
                    {idProof.label || idProof}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Upload Id Proof</label>
              <input
                type="file"
                name="idProof"
                onChange={handleFileChange}
                className="form-control"
              />
            </div>
          </div>

          {/* Profile & Role */}
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Profile Picture</label>
              <input
                type="file"
                name="profilePic"
                onChange={handleFileChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Role</label>
              <select
                name="role"
                className={`form-select ${
                  formik.touched.role && formik.errors.role ? "is-invalid" : ""
                }`}
                {...formik.getFieldProps("role")}
              >
                <option value="">Select Role</option>
                {RoleNameOptions?.map((role, idx) => (
                  <option key={idx} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <div className="invalid-feedback">{formik.errors.role}</div>
            </div>
          </div>

          {renderRoleSpecificFields()}

          {/* Buttons: use type="submit" so formik.handleSubmit runs */}
          <div className="text-center">
            <button
              type="submit"
              className="btn text-white px-4 me-2"
              style={{ backgroundColor: "#01C0C8" }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Submitting..." : "Register"}
            </button>
            <button type="reset" className="btn btn-secondary px-4">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegistration;
