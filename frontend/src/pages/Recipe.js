import React, { useState, useEffect } from 'react';
import '../css/styles.css'; 
import Nav from "../components/Nav";
import CommentSection from "../components/CommentSection"; // Import the new component

const Recipe = ({ Toggle }) => {
  const [data, setData] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [filteredReport, setFilteredReport] = useState([]);
  const [selectedPackageName, setSelectedPackageName] = useState('PackageName'); // Default name
//  const [clickedPackageName, setClickedPackageName] = useState('PackageName'); // For displaying in the new table
  
  // States for checkboxes
  const [binaryBroken, setBinaryBroken] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);
  const [recipeBroken, setRecipeBroken] = useState(false);
  const [dockerfileBroken, setDockerfileBroken] = useState(false);
  const [ciBroken, setCiBroken] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch the JSON data
    fetch('/detail.json')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setFilteredReport(data.report); // Initialize with all data
      })
      .catch(error => console.error('Error fetching the data:', error));
  }, []);

  useEffect(() => {
    // Filter data whenever selectedOwner changes
    if (data && selectedOwner) {
      const filteredData = data.report.filter(row => row.owner === selectedOwner);
      setFilteredReport(filteredData);
    } else if (data) {
      setFilteredReport(data.report); // Show all data if no owner is selected
    }
  }, [selectedOwner, data]);

  const handleOwnerChange = (event) => {
    setSelectedOwner(event.target.value);
  };

  const handlePackageNameClick = (packageName) => {
    setSelectedPackageName(packageName);
//    setClickedPackageName(packageName); // Update the clicked package name for the new table
    setIsEditing(false); // Reset the editing state when a new package is clicked
  };

  const handleSubmit = () => {
    // Handle the submission of the form (e.g., send data to the server)
    console.log('Binary Broken:', binaryBroken);
    console.log('Image Broken:', imageBroken);
    console.log('Recipe Broken:', recipeBroken);
    console.log('Dockerfile Broken:', dockerfileBroken);
    console.log('CI Broken:', ciBroken);
  
    setIsEditing(false); // Exit editing mode after submission
  };

  const handleEdit = () => {
    setIsEditing(true); // Enter editing mode
  };

  if (!data) {
    return <div>Loading...</div>; // Show a loading message while fetching
  }

  // Generate a 5x5 grid for the recipes table
  const fixedSizeRecipes = data?.recipes?.map(row => {
    const filledRow = [...row];
    while (filledRow.length < 5) {
      filledRow.push(""); // Fill with empty strings to make the row length 5
    }
    return filledRow;
  }) || [];

  while (fixedSizeRecipes.length < 5) {
    fixedSizeRecipes.push(["", "", "", "", ""]); // Add empty rows if necessary
  }

  // Extract unique owners for the dropdown menu
  const uniqueOwners = [...new Set(data.report.map(row => row.owner))];

  return (
    <div className="jenkins-report">
      <Nav Toggle={Toggle} />
      
      <div className="main-container">
        <div className="cards-container">
          <div className="outer-card">
            <div className="search-section">
              <select value={selectedOwner} onChange={handleOwnerChange}>
                <option value="">ALL</option>
                {uniqueOwners.map((owner, index) => (
                  <option key={index} value={owner}>
                    {owner}
                  </option>
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
                    <th>Size</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReport.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>
                        <span 
                          onClick={() => handlePackageNameClick(row.packageName)} 
                          style={{ cursor: 'pointer', color: 'blue' }}
                        >
                          {row.packageName}
                        </span>
                      </td>
                      <td>{row.recipe}</td>
                      <td>{row.docker}</td>
                      <td>{row.ciLinks}</td>
                      <td>{row.image}</td>
                      <td>{row.binary}</td>
                      <td>{row.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Include the CommentSection component below the tables */}
            <CommentSection />
          </div>
          
          <div className="outer-card">
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
              
              {/* Checkbox and button section */}
              <div className="status-section">
                <label>
                  <input 
                    type="checkbox" 
                    checked={binaryBroken} 
                    onChange={() => setBinaryBroken(!binaryBroken)} 
                    disabled={!isEditing}
                  /> Binary Broken
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={imageBroken} 
                    onChange={() => setImageBroken(!imageBroken)} 
                    disabled={!isEditing}
                  /> Image Broken
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={recipeBroken} 
                    onChange={() => setRecipeBroken(!recipeBroken)} 
                    disabled={!isEditing}
                  /> Recipe Broken
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={dockerfileBroken} 
                    onChange={() => setDockerfileBroken(!dockerfileBroken)} 
                    disabled={!isEditing}
                  /> Dockerfile Broken
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={ciBroken} 
                    onChange={() => setCiBroken(!ciBroken)} 
                    disabled={!isEditing}
                  /> CI Broken
                </label>
                
                <div className="button-section">
                  {!isEditing ? (
                    <button className="edit-btn" onClick={handleEdit}>
                      Edit
                    </button>
                  ) : (
                    <button className="submit-btn" onClick={handleSubmit}>
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>



        <div className="legends-section">
          <h3>Legends</h3>
          <div className="legends">
            <div className="legend-item">
              <span className="legend-color na"></span> NA
            </div>
            <div className="legend-item">
              <span className="legend-color all-good"></span> All Good
            </div>
            <div className="legend-item">
              <span className="legend-color failedlessthan2"></span> Failed less than 2 times
            </div>
            <div className="legend-item">
              <span className="legend-color failedmorethan2"></span> Failed more than 2 times
            </div>
            <div className="legend-item">
              <span className="legend-color jenkins-broken"></span> Jenkins broken
            </div>
            <div className="legend-item">
              <span className="legend-color broken"></span> Broken
            </div>
            <div className="legend-item">
              <span className="legend-color job-not-run"></span> Job not run
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recipe;
