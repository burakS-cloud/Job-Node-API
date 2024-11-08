import React, { useEffect, useState } from "react";
import "./App.css";
import CreateJobButton from "./components/CreateJobButton";
import JobItem from "./components/JobItem";
import JobList from "./components/JobList.js";

function App() {
  const [jobs, setJobs] = useState([]);
  const [singleJob, setSingleJob] = useState(null);

  useEffect(() => {
    // Check if we're on a single job route
    const path = window.location.pathname;
    const match = path.match(/\/jobs\/(.+)/);

    let intervalId;

    if (match) {
      // Initial fetch of the specific job
      const fetchAndCheckJob = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/jobs/${match[1]}`
          );
          const job = await response.json();
          setSingleJob(job);

          // If job is completed or failed, don't set up the interval
          if (job.status !== "completed" && job.status !== "failed") {
            intervalId = setInterval(async () => {
              const response = await fetch(
                `http://localhost:8080/jobs/${match[1]}`
              );
              const updatedJob = await response.json();
              setSingleJob(updatedJob);

              // Clear interval if job is complete or failed
              if (
                updatedJob.status === "completed" ||
                updatedJob.status === "failed"
              ) {
                clearInterval(intervalId);
              }
            }, 5000);
          }
        } catch (error) {
          console.error("Error fetching job:", error);
        }
      };

      fetchAndCheckJob();
    } else {
      // Load all jobs and set up polling if needed
      const loadJobs = async () => {
        try {
          const response = await fetch("http://localhost:8080/jobs");
          const jobsData = await response.json();
          setJobs(jobsData);
        } catch (error) {
          console.error("Error loading jobs:", error);
        }
      };

      loadJobs();
      intervalId = setInterval(loadJobs, 5000);
    }

    // Cleanup function
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
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  // If we're on a single job route, only show that job
  if (singleJob) {
    return (
      <div className="App">
        <h1>Food Photo Job Manager</h1>
        <JobItem job={singleJob} />
      </div>
    );
  }

  // Otherwise show the normal list view
  return (
    <div className="App">
      <h1>Food Photo Job Manager</h1>
      <CreateJobButton onCreateJob={handleCreateJob} />
      <JobList jobs={jobs} />
    </div>
  );
}

export default App;
