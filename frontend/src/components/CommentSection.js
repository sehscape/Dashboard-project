import React, { useState } from 'react';
import '../css/styles.css'; // Ensure there is no CSS hiding the buttons

const CommentSection = ({ comments, owner, jobId, updateComments }) => {
  const [newComment, setNewComment] = useState(''); // For new comment input
  const [editingCommentId, setEditingCommentId] = useState(null); // Track comment being edited
  const [editedCommentText, setEditedCommentText] = useState(''); // Track edited comment input

  // Handle new comment input change
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  // Handle saving a new comment with the current date and time
  const handleSaveComment = () => {
    const savedComment = newComment;
    const currentDate = new Date().toISOString(); // Get current date and time
    setNewComment(''); // Clear input optimistically

    fetch(`http://localhost:4000/updatecomment/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commentText: savedComment,
        date: currentDate, 
      }),
    })
      .then((response) => response.json())
      .then((updatedJob) => {
        updateComments(updatedJob.comments); 
        alert('Comment updated successfully');
      })
      .catch((error) => {
        console.error('Error updating comment:', error);
        setNewComment(savedComment); // Revert input if there's an error
        alert('Failed to update comment. Please try again.');
      });
  };

  // Handle deleting a comment
  const handleDeleteComment = (commentId) => {
    const updatedComments = comments.filter((comment) => comment._id !== commentId);
    updateComments(updatedComments); // Optimistically update UI

    fetch(`http://localhost:4000/comments/${jobId}/${commentId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          alert('Comment deleted successfully');
        } else {
          throw new Error('Failed to delete comment');
        }
      })
      .catch((error) => {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment. Please try again.');
      });
  };

  // Handle editing a comment
  const handleEditComment = (commentId, commentText) => {
    setEditingCommentId(commentId); // Set the comment ID being edited
    setEditedCommentText(commentText); // Set the current text for editing
  };

  // Handle saving an edited comment
  const handleSaveEditedComment = () => {
    const currentDate = new Date().toISOString(); // Get current date and time

    fetch(`http://localhost:4000/updatecomment/${jobId}/${editingCommentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commentText: editedCommentText,
        date: currentDate, // Update date with current time
      }),
    })
      .then((response) => response.json())
      .then((updatedJob) => {
        updateComments(updatedJob.comments); // Update comments in the frontend
        setEditingCommentId(null); // Reset editing state
        setEditedCommentText(''); // Clear input
        alert('Comment edited successfully');
      })
      .catch((error) => {
        console.error('Error editing comment:', error);
        alert('Failed to edit comment. Please try again.');
      });
  };

  return (
    <div className="comment-section">
      <h3>Comments for {owner}</h3>

      {/* Display previous comments */}
      <ul>
        {comments.map((comment) => (
          <li key={comment._id}>
            {editingCommentId === comment._id ? (
              <div>
                <textarea
                  value={editedCommentText}
                  onChange={(e) => setEditedCommentText(e.target.value)}
                  rows="2"
                  cols="50"
                />
                <button onClick={handleSaveEditedComment} disabled={!editedCommentText.trim()}>
                  Save Edit
                </button>
                <button onClick={() => setEditingCommentId(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <strong>Date:</strong> {new Date(comment.date).toLocaleString()} <br />
                <strong>Comment:</strong> {comment.commentText}
                <button onClick={() => handleEditComment(comment._id, comment.commentText)}>
                  Edit
                </button>
                <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* New Comment Input */}
      <textarea
        value={newComment}
        onChange={handleCommentChange}
        rows="4"
        cols="50"
        placeholder="Add a new comment..."
      />
      <button onClick={handleSaveComment} disabled={!newComment.trim()}>
        Add Comment
      </button>
    </div>
  );
};

export default CommentSection;
