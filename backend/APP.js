const express = require("express");
const cors = require('cors');
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb"); // Import ObjectId
const Comment = require("./models/Comment")

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
let db;
connectToDb(async (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err);
        process.exit(1);
    } else {
        db = getDb();
        app.listen(4000, () => {
            console.log("App listening on port 4000");
        });
    }
});

// Routes
// Get all jobs with optional pagination
app.get("/getjobs", async (req, res) => {
    try {
        const jobs = await db.collection("jobs").find().toArray();
        if (jobs.length === 0) {
            return res.status(404).json({ message: "No jobs found" });
        }
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error retrieving jobs:", error);
        res.status(500).json({ error: "Error retrieving jobs" });
    }
});

// Get a specific job by ID
app.get("/getjobs/:id", async (req, res) => {
    try {
        const jobId = req.params.id;

        if (!ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: "Invalid job ID format" });
        }

        const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });

        if (job) {
            res.status(200).json(job);
        } else {
            res.status(404).json({ error: "Job not found" });
        }
    } catch (err) {
        console.error("Error retrieving the job:", err);
        res.status(500).json({ error: "Error retrieving the job" });
    }
});

// Create a new job
app.post("/jobs/new", async (req, res) => {
    try {
        const job = req.body;

        if (!job.packageName || !job.owner) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await db.collection("jobs").insertOne(job);
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating a new job:", err);
        res.status(500).json({ error: "Could not create a new job" });
    }
});

// Delete a job by ID
app.delete("/jobs/delete/:id", async (req, res) => {
    try {
        const jobId = req.params.id;

        if (!ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: "Invalid job ID format" });
        }

        const result = await db.collection("jobs").deleteOne({ _id: new ObjectId(jobId) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: "Job deleted successfully" });
        } else {
            res.status(404).json({ error: "Job not found" });
        }
    } catch (err) {
        console.error("Error deleting the job:", err);
        res.status(500).json({ error: "Error deleting the job" });
    }
});

// Update a job by ID (PATCH method)
app.patch("/jobs/update/:id", async (req, res) => {
    try {
        const jobId = req.params.id;

        if (!ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: "Invalid job ID format" });
        }

        const updates = req.body;

        // Prevent updating certain fields
        if (updates.packageName) {
            delete updates.packageName;
        }

        const result = await db.collection("jobs").updateOne(
            { _id: new ObjectId(jobId) },
            { $set: updates }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Job updated successfully" });
        } else {
            res.status(404).json({ error: "Job not found or no changes made" });
        }
    } catch (err) {
        console.error("Error updating the job:", err);
        res.status(500).json({ error: "Error updating the job" });
    }
});



// Route to get all packages of the owner where any Broken field is true

// Update Broken fields of a job
app.patch("/jobs/update-broken/:id", async (req, res) => {
    try {
        const jobId = req.params.id;

        if (!ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: "Invalid job ID format" });
        }

        const brokenUpdates = req.body.Broken;

        if (typeof brokenUpdates !== "object" || !brokenUpdates) {
            return res.status(400).json({ error: "Invalid 'Broken' data" });
        }

        const updates = {};

        // Update only the fields present in brokenUpdates
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

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No valid fields to update in 'Broken'" });
        }

        const result = await db.collection("jobs").updateOne(
            { _id: new ObjectId(jobId) },
            { $set: updates }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Job 'Broken' field updated successfully" });
        } else {
            res.status(404).json({ error: "Job not found or no changes made" });
        }
    } catch (err) {
        console.error("Error updating the 'Broken' field:", err);
        res.status(500).json({ error: "Error updating the 'Broken' field" });
    }
});

// Get all packages of the owner
app.get('/jobs/:owner', async (req, res) => {
    const { owner } = req.params;

    try {
        const userPackages = await db.collection("jobs").find({ owner: owner }).toArray();

        if (userPackages.length > 0) {
            res.json(userPackages);
        } else {
            res.status(404).json({ message: 'No jobs found for the specified owner' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving jobs', error: error.message });
    }
});

// Get all broken jobs of an owner
app.get('/getbrokenjobsof/:owner', async (req, res) => {
    const { owner } = req.params;

    try {
        const userPackages = await db.collection("jobs").find({
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

// Get all packages where any Broken field is true
app.get('/getallbroken', async (req, res) => {
    try {
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

// Add a comment to a specific package
app.post('/comments/:package_name', async (req, res) => {
    const { package_name } = req.params;
    const { comment_body } = req.body;
    const comment_date = new Date();

    try {
        const newComment = {
            comment_body,
            comment_date,
        };

        const result = await db.collection("comments").findOneAndUpdate(
            { package_name: package_name },
            { $push: { comments: newComment } },
            { returnDocument: "after" }
        );

        if (result.value) {
            res.status(200).json({
                message: "Comment added successfully",
                comments: result.value.comments,
            });
        } else {
            res.status(404).json({ message: "Package not found" });
        }
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Error adding comment" });
    }
});

// Retrieve comments for a specific package
app.get('/comments/:package_name', async (req, res) => {
    const { package_name } = req.params;

    try {
        const packageComments = await db.collection('comments').findOne({ package_name });

        if (!packageComments) {
            return res.status(200).json([]);
        }

        res.status(200).json(packageComments.comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update a comment for a specific package
app.put('/comments/:package_name/:comment_id', async (req, res) => {
    const { package_name, comment_id } = req.params;
    const { comment_body } = req.body;

    try {
        const packageComments = await db.collection('comments').findOne({ package_name });

        if (!packageComments) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const comment = packageComments.comments.find(c => c._id.toString() === comment_id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.comment_body = comment_body;

        await db.collection('comments').updateOne(
            { package_name },
            { $set: { comments: packageComments.comments } }
        );

        res.status(200).json({ message: 'Comment updated', comments: packageComments.comments });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete a comment from a specific package
app.delete('/comments/:jobId/:commentId', async (req, res) => {
    const { jobId, commentId } = req.params;
  
    try {
      const result = await db.collection("comments").updateOne(
        { jobId },
        { $pull: { comments: { _id: new ObjectId(commentId) } } }
      );
  
      if (result.modifiedCount > 0) {
        const updatedComments = await db.collection("comments").findOne({ jobId });
        res.status(200).json(updatedComments.comments);
      } else {
        res.status(404).json({ error: "Comment not found" });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: "Error deleting comment" });
    }
  });
  

// Add logging to help debug
app.post('/comments/:package_name', async (req, res) => {
    const { package_name } = req.params;
    const { comment_body, comment_date } = req.body;

    try {
        console.log('Received request to add comment:', { package_name, comment_body, comment_date });

        const newComment = {
            comment_body,
            comment_date,
        };

        const result = await db.collection("comments").findOneAndUpdate(
            { package_name: package_name },
            { $push: { comments: newComment } },
            { returnDocument: "after" }
        );

        if (result.value) {
            res.status(200).json({
                message: "Comment added successfully",
                comments: result.value.comments,
            });
        } else {
            res.status(404).json({ message: "Package not found" });
        }
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Error adding comment" });
    }
});



// PUT request to update a comment for a specific job
app.put("/updatecomment/:jobId", async (req, res) => {
    const { jobId } = req.params; // Extract job ID from URL params
    const { commentText, date } = req.body; // Extract the updated comment data from request body

    try {
        // Find the job by ID and update the comment field
        const result = await db.collection("jobs").findOneAndUpdate(
            { _id: new ObjectId(jobId) }, // Find job by ID
            { $set: { "comment.commentText": commentText, "comment.date": date } }, // Update the comment
            { returnDocument: "after" } // Return the updated document
        );

        if (result.value) {
            res.status(200).json(result.value); // Return the updated job
        } else {
            res.status(404).json({ message: "Job not found" });
        }
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ error: "Error updating comment" });
    }
});

// Add a comment to a specific package
app.post('/comments/:package_name', async (req, res) => {
    const { package_name } = req.params;
    const { comment_body } = req.body; // Assuming you're sending comment_body in the request

    try {
        const newComment = {
            comment_body,
            comment_date: new Date(), // Automatically set to current date
        };

        const result = await db.collection("comments").findOneAndUpdate(
            { package_name: package_name },
            { $push: { comments: newComment } },
            { returnDocument: "after" }
        );

        if (result.value) {
            res.status(200).json({
                message: "Comment added successfully",
                comments: result.value.comments,
            });
        } else {
            res.status(404).json({ message: "Package not found" });
        }
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Error adding comment" });
    }
});


module.exports = app;