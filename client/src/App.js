import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import "./App.css";
import CreateJobButton from "./components/CreateJobButton";
import JobItem from "./components/JobItem";
import JobList from "./components/JobList.js";

function App() {
  const queryClient = useQueryClient();
  const path = window.location.pathname;
  const match = path.match(/\/jobs\/(.+)/);
  const jobId = match ? match[1] : null;

  // Query for single job
  const { data: singleJob } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8080/jobs/${jobId}`);
      const job = await response.json();
      return job;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Poll every 5 seconds if the job is pending
      return query.data?.status === "pending" ? 5000 : false;
    },
    staleTime: 0, // Disable caching
  });

  // Query for all jobs
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8080/jobs");
      const jobs = await response.json();
      return jobs;
    },
    enabled: !jobId,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0, // Disable caching
  });

  // Mutation for creating new job
  const createJobMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("http://localhost:8080/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate the jobs query to ensure we get the latest data
      queryClient.invalidateQueries(["jobs"]);
    },
  });

  const handleCreateJob = () => {
    createJobMutation.mutate();
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
