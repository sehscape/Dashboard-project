import React, { useState } from 'react';

const CommentSection = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editedComment, setEditedComment] = useState('');

  const handleAddComment = () => {
    setComments([...comments, { text: newComment, id: Date.now() }]);
    setNewComment('');
  };

  const handleEditComment = (id) => {
    const commentToEdit = comments.find(comment => comment.id === id);
    setIsEditing(id);
    setEditedComment(commentToEdit.text);
  };

  const handleSaveEdit = (id) => {
    const updatedComments = comments.map(comment =>
      comment.id === id ? { ...comment, text: editedComment } : comment
    );
    setComments(updatedComments);
    setIsEditing(null);
    setEditedComment('');
  };

  const handleDeleteComment = (id) => {
    const updatedComments = comments.filter(comment => comment.id !== id);
    setComments(updatedComments);
  };

  const handleSubmit = () => {
    // Here you can send the comments data to the server
    console.log('Comments submitted:', comments);
  };

  return (
    <div className="comment-section">
      <h3>Comments</h3>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id} className="comment-item">
            {isEditing === comment.id ? (
              <div className="edit-container">
                <textarea
                  className="edit-textarea"
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                />
                <div className="edit-buttons">
                  <button onClick={() => handleSaveEdit(comment.id)}>Save</button>
                  <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                </div>
              </div>
            ) : (
              <div className="comment-content">
                <span>{comment.text}</span>
                <div className="comment-buttons">
                  <button onClick={() => handleEditComment(comment.id)}>Edit</button>
                  <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="add-comment-container">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>
      <div className="submit-button-container">
        <button onClick={handleSubmit}>Submit</button>
        </div>
    </div>
  );
};

export default CommentSection;
