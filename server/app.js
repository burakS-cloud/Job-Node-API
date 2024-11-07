const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = "YOUR_UNSPLASH_ACCESS_KEY";
const unsplash = axios.create({
  baseURL: "https://api.unsplash.com",
  headers: {
    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
  },
});

// Job storage
const jobs = new Map();

// Helper function to create random delay (5 seconds to 5 minutes, in 5-second increments)
const getRandomDelay = () => Math.floor(Math.random() * 60) * 5000 + 5000;

// Function to fetch a random food image from Unsplash
async function fetchFoodImage() {
  const response = await unsplash.get("/photos/random", {
    params: { query: "food", orientation: "landscape" },
  });
  return response.data.urls.regular;
}

// Create a new job
app.post("/jobs", async (req, res) => {
  const jobId = Date.now().toString();
  const job = {
    id: jobId,
    status: "pending",
    result: null,
    createdAt: new Date(),
  };

  jobs.set(jobId, job);

  // Asynchronous job processing
  setTimeout(async () => {
    try {
      const imageUrl = await fetchFoodImage();
      job.status = "completed";
      job.result = imageUrl;
    } catch (error) {
      job.status = "failed";
      job.error = error.message;
    }
  }, getRandomDelay());

  res.json({ jobId });
});

// List all jobs
app.get("/jobs", (req, res) => {
  const jobList = Array.from(jobs.values());
  res.json(jobList);
});

// Get a specific job
app.get("/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  res.json(job);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
