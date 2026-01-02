import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStates } from "../../../features/statesSlice";
import { selectCurrentUser } from "../../../features/authSlice";

export default function MyProfile() {
  const dispatch = useDispatch();

  const { list: states, status: statesStatus } = useSelector(
    (state) => state.states
  );

  const currentUser = useSelector(selectCurrentUser);
  console.log("Current User:", currentUser);

  const [districts, setDistricts] = useState([]);

  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    username: "",
    dob: "",
    password: "",
    confirmPassword: "",
    gender: "",
    bloodGroup: "",
    address1: "",
    address2: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
  });

  const [pwdChecks, setPwdChecks] = useState({
    uppercase: false,
    number: false,
    special: false,
    length: false,
  });

  const [matchMessage, setMatchMessage] = useState("");
  const [wasValidated, setWasValidated] = useState(false);

  /* ------------------------- FETCH STATES ---------------------------- */
  useEffect(() => {
    if (statesStatus === "idle") {
      dispatch(fetchStates());
    }
  }, [statesStatus, dispatch]);

  /* --------------------- WHEN STATE CHANGES → GET DISTRICTS --------- */
  const handleStateChange = (e) => {
    const selectedState = e.target.value;

    setFormData((prev) => ({
      ...prev,
      state: selectedState,
      district: "",
    }));

    if (!selectedState) {
      setDistricts([]);
      return;
    }

    const found = states.find((s) => s.state === selectedState);
    setDistricts(found ? found.districts : []);
  };

  /* ------------------------- DISABLE FUTURE DATES ------------------- */
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (formRef.current) {
      const dobEl = formRef.current.querySelector("#dob");
      if (dobEl) dobEl.setAttribute("max", today);
    }
  }, []);

  /* ------------------------- LOAD CURRENT USER INTO FORM --------- */
  useEffect(() => {
    if (!currentUser) return;

    // Map fields safely from currentUser object
    const addr = currentUser.address || currentUser.addresses?.[0] || {};

    setFormData((prev) => ({
      ...prev,
      firstName:
        currentUser.firstName || currentUser.first_name || prev.firstName,
      lastName: currentUser.lastName || currentUser.last_name || prev.lastName,
      mobile:
        currentUser.mobile ||
        currentUser.contactNumber ||
        currentUser.contact ||
        prev.mobile,
      email: currentUser.email || prev.email,
      username: currentUser.username || prev.username,
      dob: currentUser.dob || currentUser.dateOfBirth || prev.dob,
      gender: currentUser.gender || prev.gender,
      bloodGroup: currentUser.bloodGroup || prev.bloodGroup,
      address1: addr.addressLine || addr.line1 || prev.address1,
      address2: addr.addressLine2 || addr.line2 || prev.address2,
      state: addr.state || prev.state,
      district: addr.city || addr.district || prev.district,
      city: addr.city || prev.city,
      pincode: addr.pincode || addr.pin || prev.pincode,
    }));

    // update districts list if state available
    if (addr.state) {
      const found = states.find((s) => s.state === addr.state);
      setDistricts(found ? found.districts : []);
    }
  }, [currentUser, states]);

  /* ------------------------- PASSWORD CHECKER ------------------------ */
  useEffect(() => {
    const value = formData.password;
    setPwdChecks({
      uppercase: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[@$!%*?&#~]/.test(value),
      length: /.{8,}/.test(value),
    });

    if (formData.confirmPassword === "") {
      setMatchMessage("");
    } else if (formData.password === formData.confirmPassword) {
      setMatchMessage("✅ Passwords match");
    } else {
      setMatchMessage("❌ Passwords do not match");
    }
  }, [formData.password, formData.confirmPassword]);

  function handleChange(e) {
    const { name, value } = e.target;

    if ((name === "firstName" || name === "lastName") && /[0-9]/.test(value)) {
      return;
    }

    if ((name === "mobile" || name === "pincode") && /[^0-9]/.test(value)) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  /* ------------------------- RESET ------------------------ */
  function handleReset() {
    setFormData({
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      username: "",
      dob: "",
      password: "",
      confirmPassword: "",
      gender: "",
      bloodGroup: "",
      address1: "",
      address2: "",
      state: "",
      district: "",
      city: "",
      pincode: "",
    });
    setDistricts([]);
    setPwdChecks({
      uppercase: false,
      number: false,
      special: false,
      length: false,
    });
    setMatchMessage("");
    setWasValidated(false);
    if (formRef.current) formRef.current.reset();
  }

  /* ------------------------ SUBMIT ------------------------- */
  function handleSubmit(e) {
    e.preventDefault();
    const formEl = formRef.current;

    const hasPasswordError =
      Object.values(pwdChecks).includes(false) ||
      formData.password !== formData.confirmPassword;

    if (!formEl.checkValidity() || hasPasswordError) {
      // 🔥 SCROLL TO TOP WHEN ANY ERROR OCCURS
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setWasValidated(true);
      formEl.classList.add("was-validated");
      return;
    }

    console.log("Submitting profile:", formData);
    alert("Profile updated successfully (demo). Check console for data.");
  }

  return (
    <>
      <style>{`
          .form-header {
            width: 100%;
            background-color: #01C0C8;
            padding: 25px 0;
            text-align: center;
            color: white;
            font-weight: bold;
            font-size: 1.5rem;
          }
          .was-validated .form-control:valid,
          .was-validated .form-select:valid {
            border-color: #ced4da !important;
            background-image: none !important;
            box-shadow: none !important;
          }
        `}</style>

      <div className="container m-0 p-0">
        <div className="card shadow">
          <div className="form-header">
            <i className="fa-solid fa-user"></i> My Profile
          </div>

          <div className="card-body">
            <form
              ref={formRef}
              className="needs-validation"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="row g-3">
                {/* FIRST NAME */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className="form-control"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                {/* LAST NAME */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className="form-control"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                {/* MOBILE */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Mobile</label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="text"
                    className="form-control"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>

                {/* EMAIL */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* USERNAME */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="form-control"
                    required
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                {/* DOB */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Date of Birth</label>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    className="form-control"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>

                {/* PASSWORD */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-control"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="form-control"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <div className="mt-2 small fw-bold">{matchMessage}</div>
                </div>

                {/* GENDER */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    className="form-select"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="TRANSGENDER">Transgender</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* BLOOD GROUP */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Blood Group</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    className="form-select"
                    required
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="A_POSITIVE">A+</option>
                    <option value="A_NEGATIVE">A-</option>
                    <option value="B_POSITIVE">B+</option>
                    <option value="B_NEGATIVE">B-</option>
                    <option value="AB_POSITIVE">AB+</option>
                    <option value="AB_NEGATIVE">AB-</option>
                    <option value="O_POSITIVE">O+</option>
                    <option value="O_NEGATIVE">O-</option>
                  </select>
                </div>

                {/* ADDRESS SECTION */}
                <div className="col-12 border rounded p-3 mt-3">
                  <h6 className="text-secondary mb-3 fw-bold">Address</h6>

                  <div className="row g-3">
                    {/* ADDRESS 1 */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Address Line 1
                      </label>
                      <input
                        id="address1"
                        name="address1"
                        type="text"
                        className="form-control"
                        required
                        value={formData.address1}
                        onChange={handleChange}
                      />
                    </div>

                    {/* ADDRESS 2 */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Address Line 2
                      </label>
                      <input
                        id="address2"
                        name="address2"
                        type="text"
                        className="form-control"
                        value={formData.address2}
                        onChange={handleChange}
                      />
                    </div>

                    {/* STATE */}
                    <div className="col-md-3">
                      <label className="form-label fw-bold">State</label>
                      <select
                        id="state"
                        name="state"
                        className="form-select"
                        required
                        value={formData.state}
                        onChange={handleStateChange}
                      >
                        <option value="">Select State</option>

                        {statesStatus === "loading" && (
                          <option>Loading...</option>
                        )}

                        {statesStatus === "succeeded" &&
                          states.map((s, i) => (
                            <option key={i} value={s.state}>
                              {s.state}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* DISTRICT */}
                    <div className="col-md-3">
                      <label className="form-label fw-bold">District</label>
                      <select
                        id="district"
                        name="district"
                        className="form-select"
                        required
                        value={formData.district}
                        onChange={handleChange}
                        disabled={!formData.state}
                      >
                        <option value="">Select District</option>

                        {districts.map((d, idx) => (
                          <option key={idx} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CITY */}
                    <div className="col-md-3">
                      <label className="form-label fw-bold">City</label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        className="form-control"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "city",
                              value: e.target.value.replace(/[^A-Za-z ]/g, ""),
                            },
                          })
                        }
                      />
                    </div>

                    {/* PINCODE */}
                    <div className="col-md-3">
                      <label className="form-label fw-bold">Pincode</label>
                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        className="form-control"
                        required
                        maxLength={6}
                        value={formData.pincode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="col-12 text-center mt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-dark me-2"
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="btn text-white"
                    style={{ background: "#01C0C8" }}
                  >
                    Update
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
