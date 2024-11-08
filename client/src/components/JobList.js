import React from "react";
import "../styles/JobList.css";
import JobItem from "./JobItem";

function JobList({ jobs }) {
  return (
    <div className="job-list">
      {jobs.map((job) => (
        <JobItem key={job.id} job={job} />
      ))}
    </div>
  );
}

export default JobList;
