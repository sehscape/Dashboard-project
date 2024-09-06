const mongoose = require('mongoose');

const jobsSchema = new mongoose.Schema({
  packageName: String,
  version: String,
  publishedVersion: String,
  successTime: Date,
  failureTime: Date,
  privateRunReason: String,
  distroSuccess: [String],
  distroFailure: [String],
  status: String,
  comment: {
    date: Date,
    commentText: String
  },
  owner: String,
  unavailableDistros: [String],
  failureCount: {
    type: Map,
    of: Number
  },
  distroFailureTime: {
    type: Map,
    of: Date
  },
  distroLastRunTime: {
    type: Map,
    of: Date
  },
  Broken: {
    CI: Boolean,
    Recipe: Boolean,
    Dockerfile: Boolean,
    Image: Boolean,
    Binary: Boolean
  },
  imageSize: String,
  CIDetails: {
    type: Map,
    of: new mongoose.Schema({
      Name: String,
      jobLink: String,
      Badge: String,
      Primary: Boolean
    })
  },
  Verification: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  Docker: {
    status: String,
    dockerFailureTime: Date,
    dockerLastRunTime: Date
  },
  Image: {
    status: String,
    imageFailureTime: Date,
    imageLastRunTime: Date
  },
  ImageLinks: {
    type: Map,
    of: String
  },
  BinaryLinks: {
    type: Map,
    of: String
  }
});

module.exports = mongoose.models.Jobs || mongoose.model('Jobs', jobsSchema);
