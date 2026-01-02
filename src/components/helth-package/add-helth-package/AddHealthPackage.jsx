import { useState } from "react";
import { useDispatch } from "react-redux";
import { addHealthPackage } from "../../../features/healthPackageSlice";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const AddHealthPackage = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    price: "",
    image: null,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.code.trim() ||
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price
    ) {
      await Swal.fire({
        title: "Validation Error!",
        text: "Please fill in all required fields",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const form = new FormData();
    // Append DTO as a JSON blob so Spring can bind the @RequestPart("dto") to a DTO
    const dto = {
      code: formData.code,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
    };
    form.append(
      "dto",
      new Blob([JSON.stringify(dto)], { type: "application/json" })
    );
    if (formData.image) {
      // ensure the field name matches what backend expects (commonly 'image' or 'file')
      form.append("image", formData.image);
    }

    try {
      // Dispatch FormData to the thunk. The thunk will forward it to the API.
      await dispatch(addHealthPackage(form)).unwrap();

      // Reset form on success
      setFormData({
        code: "",
        name: "",
        description: "",
        price: "",
        image: null,
      });

      await Swal.fire({
        title: "Success!",
        text: "Health package saved successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      // Check for specific error types
      const errorMessage =
        err?.message || err || "Failed to save health package";

      await Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="container my-4 p-0 m-0 ">
      {/* Header */}
      <div className="card-border">
        <div className="card-header d-flex justify-content-center align-items-center">
          <div className="text-center d-flex align-items-center">
            <i
              className="fa-solid fa-notes-medical me-2"
              style={{ color: "#ffffff" }}
            ></i>
            <span className="text" style={{ color: "#ffffff" }}>
              Health Packages
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form className="mx-4 my-4" onSubmit={handleSubmit}>
        <div className="row mb-4">
          <div className="form-group col-md-6">
            <label htmlFor="packageCode">Health Package Code</label>
            <input
              type="text"
              className="form-control"
              id="packageCode"
              name="code"
              placeholder="Enter code"
              value={formData.code}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="packageName">Health Package Name</label>
            <input
              type="text"
              className="form-control"
              id="packageName"
              name="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="row mb-4">
          <div className="form-group col-md-12">
            <label htmlFor="packageDescription">
              Health Package Description
            </label>
            <input
              type="text"
              className="form-control"
              id="packageDescription"
              name="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="row mb-4">
          <div className="form-group col-md-6">
            <label htmlFor="packagePrice">Health Package Price</label>
            <input
              type="number"
              className="form-control"
              id="packagePrice"
              name="price"
              placeholder="Enter price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group col-md-6 mt-2">
            <div className="file-upload-wrapper d-flex flex-column">
              <label className="mb-1">Choose Icon</label>
              <input
                type="file"
                className="form-control"
                id="iconInput"
                onChange={handleFileChange}
              />
              {/* <span className="mt-1 text-muted">{fileName}</span> */}
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center">
          <button
            type="submit"
            className="btn btn-primary px-4"
            style={{ backgroundColor: "#01c0c8", border: "none" }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHealthPackage;
