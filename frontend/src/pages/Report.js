import React, { useState, useEffect } from 'react';
import Nav from "../components/Nav";
import '../css/styles.css';

const Report = ({ Toggle }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [recipes, setRecipes] = useState([]);
//  const [comment, setComment] = useState(''); // State for the comment

  useEffect(() => {
    fetch('http://localhost:4000/getjobs')
      .then(response => response.json())
      .then(data => setJobs(data))
      .catch(error => console.error('Error fetching data:', error));

    fetch('/detail.json')
      .then(response => response.json())
      .then(data => setRecipes(data.recipes))
      .catch(error => console.error('Error fetching recipes data:', error));
  }, []);

  const handleRowClick = (job) => {
    setSelectedJob(job);
  };

  const closeDrawer = () => {
    setSelectedJob(null);
  };

  const chunkRecipes = (recipes, chunkSize) => {
    const result = [];
    for (let i = 0; i < recipes.length; i += chunkSize) {
      result.push(recipes.slice(i, i + chunkSize));
    }
    return result;
  };

  const recipesInRows = chunkRecipes(recipes.flat(), 4);

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
              <th>Version</th>
              <th>Published Version</th>
              <th>Distro</th>
              <th>Status</th>
              <th>Job URL</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={job._id} onClick={() => handleRowClick(job)}>
                <td>{index + 1}</td>
                <td>{job.packageName}</td>
                <td>{job.version}</td>
                <td>{job.publishedVersion}</td>
                <td>{job.distro}</td>
                <td>{job.status}</td>
                <td><a href={job.jobDetails.jobUrl} target="_blank" rel="noopener noreferrer">View Job</a></td>
                <td>{job.jobDetails.duration.toFixed(2)} seconds</td>
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
            <p><strong>Distro:</strong> {selectedJob.distro}</p>
            <p><strong>Status:</strong> {selectedJob.status}</p>
            <p><strong>Job URL:</strong> <a href={selectedJob.jobDetails.jobUrl} target="_blank" rel="noopener noreferrer">View Job</a></p>
            <p><strong>Duration:</strong> {selectedJob.jobDetails.duration.toFixed(2)} seconds</p>

            <div className="recipe-grid">
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
            </div>

           {/* Non-editable Comment Section 
            <div className="comment-section">
              <p className="comment-text">{comment}</p>
            </div>  */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
