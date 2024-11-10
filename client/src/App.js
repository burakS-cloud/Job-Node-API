import React, { useEffect, useState } from "react";
import "./App.css";
import CreateJobButton from "./components/CreateJobButton";
import JobItem from "./components/JobItem";
import JobList from "./components/JobList.js";

function App() {
  const [jobs, setJobs] = useState([]);
  const [singleJob, setSingleJob] = useState(null);

  const fetchSingleJob = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:8080/jobs/${jobId}`);
      const job = await response.json();
      setSingleJob(job);
      return job;
    } catch (error) {
      console.error("Error fetching job:", error);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await fetch("http://localhost:8080/jobs");
      const jobsData = await response.json();
      setJobs(jobsData);
      return jobsData;
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  };

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/jobs\/(.+)/);
    let intervalId;

    const initialize = async () => {
      if (match) {
        const jobId = match[1];
        const job = await fetchSingleJob(jobId);

        if (job && job.status !== "completed" && job.status !== "failed") {
          intervalId = setInterval(async () => {
            const updatedJob = await fetchSingleJob(jobId);
            if (
              updatedJob?.status === "completed" ||
              updatedJob?.status === "failed"
            ) {
              clearInterval(intervalId);
            }
          }, 5000);
        }
      } else {
        const initialJobs = await loadJobs();

        if (initialJobs?.some((job) => job.status === "pending")) {
          intervalId = setInterval(async () => {
            const updatedJobs = await loadJobs();
            if (!updatedJobs?.some((job) => job.status === "pending")) {
              clearInterval(intervalId);
            }
          }, 5000);
        }
      }
    };

    initialize();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const handleCreateJob = async () => {
    try {
      const response = await fetch("http://localhost:8080/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { jobId } = await response.json();

      const newJob = {
        id: jobId,
        status: "pending",
        result: null,
      };

      setJobs((prevJobs) => [newJob, ...prevJobs]);

      const intervalId = setInterval(async () => {
        const updatedJobs = await loadJobs();
        if (!updatedJobs?.some((job) => job.status === "pending")) {
          clearInterval(intervalId);
        }
      }, 5000);

      return () => clearInterval(intervalId);
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  if (singleJob) {
    return (
      <div className="App">
        <h1>Food Photo Job Manager</h1>
        <JobItem job={singleJob} />
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Food Photo Job Manager</h1>
      <CreateJobButton onCreateJob={handleCreateJob} />
      <JobList jobs={jobs} />
    </div>
  );
}

export default App;
