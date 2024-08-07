const express = require("express");
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb"); // Import ObjectId

const app = express();
app.use(express.json());

//db connection
let db;
connectToDb((err) => {
  if (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1); // Exit the process if connection fails
  } else {
    db = getDb();
    app.listen(3000, () => {
      console.log("App listening on port 3000");
    });
  }
});

// routes

app.get("/jobs", (req, res) => {
  const page = parseInt(req.query.p) || 0; // Ensure page is a number
  const jobsPerPage = 2;

  db.collection("jobs")
    .find()
    .skip(jobsPerPage * page)
    .limit(jobsPerPage)
    .toArray() // Convert cursor to array
    .then((jobs) => {
      res.status(200).json(jobs);
    })
    .catch((err) => {
      res.status(500).json({ error: "Error retrieving jobs" });
    });
});

// using id

app.get("/jobs/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid job ID format" });
  }

  const jobId = new ObjectId(req.params.id);

  db.collection("jobs")
    .findOne({ _id: jobId })
    .then((job) => {
      if (job) {
        res.status(200).json(job);
      } else {
        res.status(404).json({ error: "Job not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: "Error retrieving the job" });
    });
});

//post
app.post("/jobs", (req, res) => {
  const job = req.body;
  db.collection("jobs")
    .insertOne(job)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ err: "Could not create new job" });
    });
});

//delete

app.delete("/jobs/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid job ID format" });
  }

  const jobId = new ObjectId(req.params.id);

  db.collection("jobs")
    .deleteOne({ _id: jobId })
    .then((result) => {
      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Job deleted successfully" });
      } else {
        res.status(404).json({ error: "Job not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: "Error deleting the job" });
    });
});

//update
app.patch("/jobs/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid job ID format" });
  }

  const jobId = new ObjectId(req.params.id);
  const updates = req.body;

  db.collection("jobs")
    .updateOne({ _id: jobId }, { $set: updates })
    .then((result) => {
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: "Job updated successfully" });
      } else {
        res.status(404).json({ error: "Job not found or no changes made" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: "Error updating the job" });
    });
});
