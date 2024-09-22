import React, { useState, useEffect } from 'react';
import '../css/styles.css';
import Nav from "../components/Nav";
import CommentSection from "../components/CommentSection";

const useJobStatus = (initialBroken) => {
  const [binaryBroken, setBinaryBroken] = useState(initialBroken?.Binary || false);
  const [imageBroken, setImageBroken] = useState(initialBroken?.Image || false);
  const [recipeBroken, setRecipeBroken] = useState(initialBroken?.Recipe || false);
  const [dockerfileBroken, setDockerfileBroken] = useState(initialBroken?.Dockerfile || false);
  const [ciBroken, setCiBroken] = useState(initialBroken?.CI || false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCheckboxChange = (setter) => {
    if (isEditing) {
      setter(prev => !prev); // Toggle the checkbox value
    }
  };

  const handleSubmit = (jobId, onSuccess) => {
    const brokenStatus = {
      CI: ciBroken,
      Recipe: recipeBroken,
      Dockerfile: dockerfileBroken,
      Image: imageBroken,
      Binary: binaryBroken
    };

    fetch(`http://localhost:4000/jobs/update-broken/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Broken: brokenStatus }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Update successful:', data);
        onSuccess();
      })
      .catch(error => console.error('Error updating job:', error));
  };

  return {
    binaryBroken,
    setBinaryBroken,
    imageBroken,
    setImageBroken,
    recipeBroken,
    setRecipeBroken,
    dockerfileBroken,
    setDockerfileBroken,
    ciBroken,
    setCiBroken,
    isEditing,
    setIsEditing,
    handleCheckboxChange,
    handleSubmit
  };
};

const Recipe = ({ Toggle }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [data, setData] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [filteredReport, setFilteredReport] = useState([]);
  const [selectedPackageName, setSelectedPackageName] = useState('');

  const {
    binaryBroken,
    setBinaryBroken,
    imageBroken,
    setImageBroken,
    recipeBroken,
    setRecipeBroken,
    dockerfileBroken,
    setDockerfileBroken,
    ciBroken,
    setCiBroken,
    isEditing,
    setIsEditing,
    handleCheckboxChange,
    handleSubmit
  } = useJobStatus(selectedJob?.Broken);

  useEffect(() => {
    fetch('http://localhost:4000/getjobs')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setFilteredReport(data || []);
      })
      .catch(error => console.error('Error fetching the data:', error));
  }, []);

  useEffect(() => {
    if (data && selectedOwner) {
      const filteredData = data.filter(row => row.owner === selectedOwner) || [];
      setFilteredReport(filteredData);
    } else if (data) {
      setFilteredReport(data);
    }
  }, [selectedOwner, data]);

  const handleOwnerChange = (event) => {
    setSelectedOwner(event.target.value);
  };

  const handlePackageNameClick = (packageName, job) => {
    setSelectedPackageName(packageName);
    setIsEditing(false);
    setSelectedJob(job);

    // Update checkbox states based on selected job's Broken field
    if (job.Broken) {
      setBinaryBroken(job.Broken.Binary || false);
      setImageBroken(job.Broken.Image || false);
      setRecipeBroken(job.Broken.Recipe || false);
      setDockerfileBroken(job.Broken.Dockerfile || false);
      setCiBroken(job.Broken.CI || false);
    }
  };

  const updateJobInList = (updatedJob) => {
    setFilteredReport(prevReport =>
      prevReport.map(job => job._id === updatedJob._id ? updatedJob : job)
    );
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  const recipes = selectedJob?.recipes || [];

  const fixedSizeRecipes = recipes.map(row => {
    const filledRow = [...row];
    while (filledRow.length < 5) {
      filledRow.push("");
    }
    return filledRow;
  });

  while (fixedSizeRecipes.length < 5) {
    fixedSizeRecipes.push(["", "", "", "", ""]);
  }

  const uniqueOwners = [...new Set(data.map(row => row.owner) || [])];

  return (
    <div className="jenkins-report">
      <Nav Toggle={Toggle} />
      <div className="main-container">
        <div className="cards-container">
          <div className="left-card">
            <div className="search-section">
              <select value={selectedOwner} onChange={handleOwnerChange}>
                <option value="">ALL</option>
                {uniqueOwners.map((owner, index) => (
                  <option key={index} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
            <div className="table-section">
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
                  {filteredReport.map((job, index) => (
                    <tr key={job._id} onClick={() => handlePackageNameClick(job.packageName, job)}>
                      <td>{index + 1}</td>
                      <td>{job.packageName}</td>
                      <td>{job.Broken?.Recipe ? 'Broken' : 'Not Broken'}</td>
                      <td>{job.Docker?.status || 'N/A'}</td>
                      <td>
                        {Object.values(job.CIDetails || {}).map((ci, ciIndex) => (
                          <a key={ciIndex} href={ci.jobLink} target="_blank" rel="noopener noreferrer">{ci.Name}</a>
                        ))}
                      </td>
                      <td>{job.Image?.status || 'N/A'}</td>
                      <td>{job.BinaryLinks ? Object.keys(job.BinaryLinks).join(', ') : 'N/A'}</td>
                      <td>{job.comment ? job.comment.commentText : 'No Comment'}</td>
                      <td>{job.imageSize || 'N/A'}</td>
                      <td>{job.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="right-card">
            <div className="recipe-table">
              <h2>{selectedPackageName}</h2>
              <table>
                <thead>
                  <tr>
                    <th colSpan={5}>Recipe</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedSizeRecipes.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((recipe, index) => (
                        <td key={index}>{recipe}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="download-btn">Download Links</button>

              <div className="status-section">
                <label>
                  <input
                    type="checkbox"
                    checked={binaryBroken}
                    onChange={() => handleCheckboxChange(setBinaryBroken)}
                    disabled={!isEditing}
                  /> Binary Broken
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={imageBroken}
                    onChange={() => handleCheckboxChange(setImageBroken)}
                    disabled={!isEditing}
                  /> Image Broken
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={recipeBroken}
                    onChange={() => handleCheckboxChange(setRecipeBroken)}
                    disabled={!isEditing}
                  /> Recipe Broken
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={dockerfileBroken}
                    onChange={() => handleCheckboxChange(setDockerfileBroken)}
                    disabled={!isEditing}
                  /> Dockerfile Broken
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={ciBroken}
                    onChange={() => handleCheckboxChange(setCiBroken)}
                    disabled={!isEditing}
                  /> CI Broken
                </label>

                <div className="button-section">
                  {!isEditing ? (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                  ) : (
                    <button className="submit-btn" onClick={() => handleSubmit(selectedJob._id, () => {
                      setIsEditing(false);
                      updateJobInList({
                        ...selectedJob,
                        Broken: {
                          CI: ciBroken,
                          Recipe: recipeBroken,
                          Dockerfile: dockerfileBroken,
                          Image: imageBroken,
                          Binary: binaryBroken
                        }
                      });
                    })}>Submit</button>
                  )}
                </div>
              </div>

              {/* Include the CommentSection component below the tables */}
              {selectedJob && (
                <CommentSection
                  comments={selectedJob.comments || []} // Pass comments as a prop
                  owner={selectedJob.owner} // Pass the owner of the job
                  jobId={selectedJob._id} // Pass the job ID for update purposes
                  updateComments={(updatedComments) => {
                    // Function to update the comments in the frontend state
                    setFilteredReport((prevData) =>
                      prevData.map((job) =>
                        job._id === selectedJob._id
                          ? { ...job, comments: updatedComments }
                          : job
                      )
                    );
                  }}
                />
              )}

            </div>
          </div>
        </div>

        <div className="legends-section">
          <h3>Legends</h3>
          <div className="legends">
            <div className="legend-item"><span className="legend-color na"></span> NA</div>
            <div className="legend-item"><span className="legend-color all-good"></span> All Good</div>
            <div className="legend-item"><span className="legend-color failedlessthan2"></span> Failed less than 2 times</div>
            <div className="legend-item"><span className="legend-color failedmorethan2"></span> Failed more than 2 times</div>
            <div className="legend-item"><span className="legend-color jenkins-broken"></span> Jenkins broken</div>
            <div className="legend-item"><span className="legend-color dockerfile-broken"></span> Dockerfile broken</div>
            <div className="legend-item"><span className="legend-color job-not-run"></span> Job not run</div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Recipe;
