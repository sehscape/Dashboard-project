import React, { useState, useEffect } from 'react';
import CommentSection from './CommentSection';

const ParentComponent = ({ jobId, owner }) => {
  const [comments, setComments] = useState([]);

  // Fetch comments when the component loads
  useEffect(() => {
    fetchComments();
  }, [jobId]);

  // Function to fetch comments for the current jobId
  const fetchComments = () => {
    fetch(`http://localhost:4000/comments/${jobId}`)
      .then((response) => response.json())
      .then((data) => setComments(data.comments))
      .catch((error) => console.error('Error fetching comments:', error));
  };

  // Function to update comments (passed to CommentSection)
  const updateComments = (newComments) => {
    setComments(newComments); // Update comments in parent state
  };

  return (
    <div>
      <h2>Job Comments for {owner}</h2>
      <CommentSection
        comments={comments}
        owner={owner}
        jobId={jobId}
        updateComments={updateComments} // Pass update function to child
      />
    </div>
  );
};

export default ParentComponent;
