import React, { useState, useEffect } from 'react';

const StatusSection = ({ selectedJob, updateJobStatus }) => {
  const [binaryBroken, setBinaryBroken] = useState(selectedJob.Broken?.Binary || false);
  const [imageBroken, setImageBroken] = useState(selectedJob.Broken?.Image || false);
  const [recipeBroken, setRecipeBroken] = useState(selectedJob.Broken?.Recipe || false);
  const [dockerfileBroken, setDockerfileBroken] = useState(selectedJob.Broken?.Dockerfile || false);
  const [ciBroken, setCiBroken] = useState(selectedJob.Broken?.CI || false);

  const handleStatusChange = (statusType) => {
    const newStatus = !eval(statusType);
    updateJobStatus(statusType, newStatus);

    fetch(`http://localhost:4000/updatejob/${selectedJob._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Broken: {
          ...selectedJob.Broken,
          [statusType]: newStatus
        }
      }),
    })
      .then(response => response.json())
      .then(updatedJob => {
        updateJobStatus(statusType, newStatus);
        alert('Status updated successfully');
      })
      .catch(error => {
        console.error('Error updating status:', error);
        alert('Failed to update status');
      });
  };

  return (
    <div className="status-section">
      <label>
        <input
          type="checkbox"
          checked={binaryBroken}
          onChange={() => handleStatusChange('binaryBroken')}
        /> Binary Broken
      </label>
      <label>
        <input
          type="checkbox"
          checked={imageBroken}
          onChange={() => handleStatusChange('imageBroken')}
        /> Image Broken
      </label>
      <label>
        <input
          type="checkbox"
          checked={recipeBroken}
          onChange={() => handleStatusChange('recipeBroken')}
        /> Recipe Broken
      </label>
      <label>
        <input
          type="checkbox"
          checked={dockerfileBroken}
          onChange={() => handleStatusChange('dockerfileBroken')}
        /> Dockerfile Broken
      </label>
      <label>
        <input
          type="checkbox"
          checked={ciBroken}
          onChange={() => handleStatusChange('ciBroken')}
        /> CI Broken
      </label>
    </div>
  );
};

export default StatusSection;
