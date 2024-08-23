import React, { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import '../css/styles.css'; // Ensure this is imported to apply the styles

// Data fetching URL (update with actual path if needed)
const dataUrl = '/data.json'; // Adjust the path based on where the JSON file is served

const Overview = ({ Toggle }) => {
  const [data, setData] = useState({
    totalPackages: 0,
    completedBuilds: 0,
    failedBuilds: 0,
    inProgress: 0,
  });

  useEffect(() => {
    fetch(dataUrl)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="overviewcontainer">
      <Nav Toggle={Toggle} />
      <div className="container">
        <h1>Overview</h1>
        <div className="overview">
          <div className="card blue">
            <h2>Total Packages</h2>
            <p>{data.totalPackages}</p>
          </div>
          <div className="card green">
            <h2>Completed Builds</h2>
            <p>{data.completedBuilds}</p>
          </div>
          <div className="card red">
            <h2>Failed Builds</h2>
            <p>{data.failedBuilds}</p>
          </div>
          <div className="card yellow">
            <h2>In Progress</h2>
            <p>{data.inProgress}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
