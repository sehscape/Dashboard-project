// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  package_name: { type: String, required: true },
  comments: [
    {
      comment_body: { type: String, required: true },
      comment_date: { type: Date, default: Date.now }, // Automatically set to current date
    },
  ],
});


module.exports = mongoose.model('Comment', commentSchema);
