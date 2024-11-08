const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const app = express();
const port = 8080;
const dotenv = require("dotenv");
dotenv.config();
const { createApi } = require("unsplash-js");
const nodeFetch = require("node-fetch");
global.fetch = nodeFetch;

app.use(cors());
app.use(express.json());

const unsplash = createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY });

// File paths
const DATA_DIR = path.join(__dirname, "data");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");

// Ensure data directory exists
async function initializeStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(JOBS_FILE);
    } catch {
      await fs.writeFile(JOBS_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    process.exit(1);
  }
}

// File-based job operations
async function readJobs() {
  try {
    const data = await fs.readFile(JOBS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading jobs:", error);
    return [];
  }
}

async function writeJobs(jobs) {
  try {
    await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2));
  } catch (error) {
    console.error("Error writing jobs:", error);
    throw error;
  }
}

// Get random delay between 5 sec and 5 min with 5 sec steps
const getRandomDelay = () => {
  const steps = Math.floor(Math.random() * 60); // 0-59 steps
  return (steps * 5 + 5) * 1000; // 5sec to 5min
};

// Fetch food image from Unsplash
async function fetchFoodImage() {
  try {
    const result = await unsplash.photos.getRandom({
      query: "food",
      orientation: "landscape",
    });

    if (result.errors) {
      throw new Error("Failed to fetch Unsplash image: " + result.errors[0]);
    }

    return result.response.urls.regular;
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
}

// Create new job
app.post("/jobs", async (req, res) => {
  try {
    const jobs = await readJobs();
    const jobId = Date.now().toString();

    const newJob = {
      id: jobId,
      status: "pending",
      result: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      error: null,
    };

    jobs.push(newJob);
    await writeJobs(jobs);

    // Process job asynchronously
    setTimeout(async () => {
      try {
        const imageUrl = await fetchFoodImage();
        const updatedJobs = await readJobs();
        const jobIndex = updatedJobs.findIndex((job) => job.id === jobId);

        if (jobIndex !== -1) {
          updatedJobs[jobIndex].status = "completed";
          updatedJobs[jobIndex].result = imageUrl;
          updatedJobs[jobIndex].completedAt = new Date().toISOString();
          await writeJobs(updatedJobs);
        }
      } catch (error) {
        const updatedJobs = await readJobs();
        const jobIndex = updatedJobs.findIndex((job) => job.id === jobId);

        if (jobIndex !== -1) {
          updatedJobs[jobIndex].status = "failed";
          updatedJobs[jobIndex].error = error.message;
          updatedJobs[jobIndex].completedAt = new Date().toISOString();
          await writeJobs(updatedJobs);
        }
      }
    }, getRandomDelay());

    res.status(201).json({ jobId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
});

// Get all jobs
app.get("/jobs", async (req, res) => {
  try {
    const jobs = await readJobs();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Get specific job
app.get("/jobs/:id", async (req, res) => {
  try {
    const jobs = await readJobs();
    const job = jobs.find((job) => job.id === req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// Initialize storage and start server
initializeStorage().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
