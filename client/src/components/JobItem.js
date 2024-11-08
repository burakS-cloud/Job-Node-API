import React from "react";
import "../styles/JobItem.css";

function JobItem({ job }) {
  return (
    <div className="job-item">
      <p>Job ID: {job.id}</p>
      <p>Status: {job.status}</p>
      {job.status === "completed" && job.result && (
        <img src={job.result} className="job-image" alt="Yemek" />
      )}
      {job.status === "failed" && <p className="error">Hata: {job.error}</p>}
    </div>
  );
}

export default JobItem;
