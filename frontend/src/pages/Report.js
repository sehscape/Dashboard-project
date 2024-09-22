import React, { useState, useEffect } from 'react';
import Nav from "../components/Nav";
import '../css/styles.css';

const Report = ({ Toggle }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/getjobs')
      .then(response => response.json())
      .then(data => setJobs(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleRowClick = (job) => {
    setSelectedJob(job);
  };

  const closeDrawer = () => {
    setSelectedJob(null);
  };

  return (
    <div className={`report ${selectedJob ? 'drawer-open' : ''}`}>
      <Nav Toggle={Toggle} />

      <div className="header-container">
        <div className="search-bar">
          <input type="text" placeholder="Enter Package Name" />
          <button className="button">Search</button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Package Name</th>
              <th>Recipe</th>
              <th>Docker</th>
              <th>CI Links</th>
              <th>Image</th>
              <th>Binary</th>
              <th>Comment</th>
              <th>Size</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={job._id} onClick={() => handleRowClick(job)}>
                <td>{index + 1}</td>
                <td>{job.packageName}</td>
                <td>{job.Broken.Recipe ? 'Broken' : 'Not Broken'}</td>
                <td>{job.Docker.status}</td>
                <td>
                  {Object.values(job.CIDetails).map((ci, ciIndex) => (
                    <a key={ciIndex} href={ci.jobLink} target="_blank" rel="noopener noreferrer">
                      {ci.Name}
                    </a>
                  ))}
                </td>
                <td>{job.Image.status}</td>
                <td>{job.BinaryLinks ? Object.keys(job.BinaryLinks).join(', ') : 'N/A'}</td>
                <td>{job.comment ? job.comment.commentText : 'No Comment'}</td>
                <td>{job.imageSize}</td>
                <td>{job.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`drawer ${selectedJob ? 'open' : ''}`}>
        {selectedJob && (
          <div className="drawer-content">
            <button className="close-btn" onClick={closeDrawer}>Close</button>
            <h2>{selectedJob.packageName}</h2>
            <p><strong>Version:</strong> {selectedJob.version}</p>
            <p><strong>Published Version:</strong> {selectedJob.publishedVersion}</p>
            <p><strong>Distro:</strong> {selectedJob.distroSuccess}</p>
            <p><strong>Status:</strong> {selectedJob.status}</p>
            <p><strong>Job URL:</strong> <a href={selectedJob.CIDetails[Object.keys(selectedJob.CIDetails)[0]].jobLink} target="_blank" rel="noopener noreferrer">View Job</a></p>
            <p><strong>Duration:</strong> {selectedJob.Docker.dockerLastRunTime ? `${new Date() - new Date(selectedJob.Docker.dockerLastRunTime)} ms` : 'N/A'}</p>

            {/* <div className="recipe-grid">
              <h3>Package Recipe</h3>
              <div className="recipe-table-container">
                <table className="recipe-table">
                  <tbody>
                    {recipesInRows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((version, colIndex) => (
                          <td key={colIndex}>{version}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;