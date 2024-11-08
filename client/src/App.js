import React, { useEffect, useState } from "react";
import "./App.css";
import CreateJobButton from "./components/CreateJobButton";
import JobList from "./components/JobList.js";

function App() {
  const [jobs, setJobs] = useState([]);
  const [activePolls, setActivePolls] = useState(new Set());

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await fetch("http://localhost:8080/jobs");
      const jobsData = await response.json();
      setJobs(jobsData);

      // Start polling for pending jobs
      /* jobsData.forEach((job) => {
        if (job.status === "pending") {
          pollJobStatus(job.id);
        }
      }); */
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  };

  /* const pollJobStatus = (jobId) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3000/jobs/${jobId}`);
        const job = await response.json();

        setJobs((prevJobs) => {
          const newJobs = prevJobs.map((j) => (j.id === job.id ? job : j));

          // Stop polling when job is no longer pending
          if (job.status === "completed" || job.status === "failed") {
            console.log(`Job ${jobId} ${job.status}. Stopping polling.`);
            clearInterval(intervalId);
          }

          return newJobs;
        });
      } catch (error) {
        console.error("Error polling job status:", error);
        clearInterval(intervalId);
      }
    }, 1000); // Check every second

    // Return intervalId for cleanup
    return intervalId;
  }; */

  // Cleanup function
  /* useEffect(() => {
    return () => {
      activePolls.forEach((intervalId) => clearInterval(intervalId));
    };
  }, [activePolls]); */

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
      //pollJobStatus(jobId);
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
