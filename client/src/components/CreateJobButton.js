import React from "react";
import "../styles/CreateJobButton.css";

function CreateJobButton({ onCreateJob }) {
  return (
    <button className="create-job-button" onClick={onCreateJob}>
      Create New Job
    </button>
  );
}

export default CreateJobButton;
