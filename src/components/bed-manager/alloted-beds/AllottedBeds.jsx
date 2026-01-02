import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllocatedBeds,
  releaseBed,
} from "../../../features/allocatedBedsSlice";
import Swal from "sweetalert2";

const AllottedBeds = () => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.allocatedBeds);

  useEffect(() => {
    dispatch(fetchAllocatedBeds());
  }, [dispatch]);

  // 🔹 Release API Call
  const handleRelease = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will release the bed and update availability.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, release it",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(releaseBed(id))
          .then(() => {
            dispatch(fetchAllocatedBeds()); // refresh list
            Swal.fire({
              icon: "success",
              title: "Released",
              text: "Bed has been released.",
              timer: 1500,
              showConfirmButton: false,
            });
          })
          .catch((err) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: err?.message || "Failed to release bed.",
            });
          });
      }
    });
  };

  return (
    <div className="container my-4 p-0 m-0">
      <div className="card-border" id="tableSection">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Allotted Beds</h5>

          <Link
            to="/dashboard/bed-list"
            className="btn btn-sm btn-success text-white text-decoration-none"
          >
            Vacant Beds
          </Link>
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        {loading && <p>Loading...</p>}

        <div className="container">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm table-striped table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>SL.NO</th>
                    <th>Bed No</th>
                    <th>Room Name</th>
                    <th>Room Type</th>
                    <th>Patient Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No allocated beds
                      </td>
                    </tr>
                  ) : (
                    data.map((bed, index) => (
                      <tr key={bed.bedAssignmentId}>
                        <td>{index + 1}</td>
                        <td>{bed.bedNumber}</td>
                        <td>{bed.roomName}</td>
                        <td>{bed.roomType}</td>
                        <td>{bed.patientName}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRelease(bed.bedAssignmentId)}
                          >
                            Release
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
      </div>
    </div>
  );
};

export default AllottedBeds;
