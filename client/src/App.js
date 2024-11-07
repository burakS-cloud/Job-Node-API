import React, { useEffect, useState } from "react";
import CreateJobButton from "../components/CreateJobButton.js";
import JobList from "../components/JobList.js";
import "./App.css";

function App() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await fetch("http://localhost:8080/jobs");
      const jobsData = await response.json();
      setJobs(jobsData);

      // Start polling for pending jobs
      jobsData.forEach((job) => {
        if (job.status === "pending") {
          pollJobStatus(job.id);
        }
      });
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  };

  const pollJobStatus = async (jobId) => {
    while (true) {
      try {
        const response = await fetch(`http://localhost:8080/jobs/${jobId}`);
        const job = await response.json();

        setJobs((prevJobs) => prevJobs.map((j) => (j.id === job.id ? job : j)));

        if (job.status === "completed" || job.status === "failed") {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error polling job status:", error);
        break;
      }
    }
  };

  const handleCreateJob = async () => {
    try {
      const response = await fetch("http://localhost:8080/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { jobId } = await response.json();

      // Add the new job to the list
      const newJob = {
        id: jobId,
        status: "pending",
        result: null,
      };

      setJobs((prevJobs) => [newJob, ...prevJobs]);
      pollJobStatus(jobId);
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  return (
    <div className="App">
      <h1>Food Photo Job Manager</h1>
      <CreateJobButton onCreateJob={handleCreateJob} />
      <JobList jobs={jobs} />
    </div>
  );
}

export default App;
