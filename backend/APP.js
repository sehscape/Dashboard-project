const express = require("express");
const cors = require('cors');
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb"); // Import ObjectId

const app = express();
app.use(express.json());
app.use(cors());

//db connection
let db;
connectToDb((err) => {
  if (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1); // Exit the process if connection fails
  } else {
    db = getDb();
    app.listen(4000, () => {
      console.log("App listening on port 4000");
    });
  }
});

// routes(1)

app.get("/getjobs", (req, res) => {
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

// using id(1)

app.get("/getjobs/:id", (req, res) => {
  console.log("Received ID:", req.params.id);
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

//post(00)
app.post("/jobs/new", (req, res) => {
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

app.delete("/jobs/delete/:id", (req, res) => {
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
app.patch("/jobs/update/:id", (req, res) => {
  console.log("Received ID:", req.params.id);

  // Ensure the ID is a valid MongoDB ObjectId
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid job ID format" });
  }

  const jobId = new ObjectId(req.params.id);
  let updates = req.body;

  // Remove the 'packageName' field from the updates if it exists
  if (updates.hasOwnProperty("packageName")) {
    delete updates.packageName;
  }

  // Update the job in the database with the filtered updates
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

// Route to get all packages of the owner where any Broken field is true
app.get('/getjobsof/:owner', async (req, res) => {
  const { owner } = req.params;

  try {
      // Query the database for jobs where `owner` matches and any of the Broken fields are true
      const jobsCollection = db.collection("jobs");
      const userPackages = await jobsCollection.find({
          owner: owner,
          $or: [
              { 'Broken.CI': true },
              { 'Broken.Recipe': true },
              { 'Broken.Dockerfile': true },
              { 'Broken.Image': true },
              { 'Broken.Binary': true }
          ]
      }).toArray();

      if (userPackages.length > 0) {
          res.json(userPackages);
      } else {
          res.status(404).json({ message: 'No broken packages found for the specified owner' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving packages', error: error.message });
  }
});

///////////

// Route to get all packages where any Broken field is true
app.get('/getallbroken', async (req, res) => {
  try {
      // Query the database for jobs where any of the Broken fields are true
      const brokenPackages = await db.collection('jobs').find({
          $or: [
              { 'Broken.CI': true },
              { 'Broken.Recipe': true },
              { 'Broken.Dockerfile': true },
              { 'Broken.Image': true },
              { 'Broken.Binary': true }
          ]
      }).toArray();

      if (brokenPackages.length > 0) {
          res.json(brokenPackages);
      } else {
          res.status(404).json({ message: 'No packages with broken parameters found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving packages', error: error.message });
  }
});








//update broken
app.patch("/jobs/update-broken/:id", (req, res) => {
  // Ensure the ID is a valid MongoDB ObjectId
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid job ID format" });
  }

  const jobId = new ObjectId(req.params.id);
  const brokenUpdates = req.body.Broken;

  // Ensure the 'Broken' field is an object
  if (typeof brokenUpdates !== "object" || !brokenUpdates) {
    return res.status(400).json({ error: "Invalid 'Broken' data" });
  }

  // Initialize an empty object to hold the updates
  const updates = {};

  // Add only the fields that are present in the request to the update object
  if (brokenUpdates.hasOwnProperty("CI")) {
    updates["Broken.CI"] = brokenUpdates.CI;
  }
  if (brokenUpdates.hasOwnProperty("Recipe")) {
    updates["Broken.Recipe"] = brokenUpdates.Recipe;
  }
  if (brokenUpdates.hasOwnProperty("Dockerfile")) {
    updates["Broken.Dockerfile"] = brokenUpdates.Dockerfile;
  }
  if (brokenUpdates.hasOwnProperty("Image")) {
    updates["Broken.Image"] = brokenUpdates.Image;
  }
  if (brokenUpdates.hasOwnProperty("Binary")) {
    updates["Broken.Binary"] = brokenUpdates.Binary;
  }

  // If no valid fields were provided, return an error
  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ error: "No valid fields to update in 'Broken'" });
  }

  // Update the document with only the fields that were provided
  db.collection("jobs")
    .updateOne({ _id: jobId }, { $set: updates })
    .then((result) => {
      if (result.modifiedCount > 0) {
        res
          .status(200)
          .json({ message: "Job 'Broken' field updated successfully" });
      } else {
        res.status(404).json({ error: "Job not found or no changes made" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: "Error updating the 'Broken' field" });
    });
});
