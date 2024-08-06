import React, { useEffect, useState } from 'react';
import './styles.css';

function Overview() {
  const [data, setData] = useState({ totalPackages: 0, completedBuilds: 0, failedBuilds: 0, inProgress: 0 });

  useEffect(() => {
    // Fetch data from the API
    fetch('/data.json')
      .then(res => res.json())
      .then(data => {
        setData({
          totalPackages: data.totalPackages,
          completedBuilds: data.completedBuilds,
          failedBuilds: data.failedBuilds,
          inProgress: data.inProgress
        });
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>Overview</h1>
      <div className="overview">
        <div className="card blue">Total Packages<br />{data.totalPackages}</div>
        <div className="card green">Completed Builds<br />{data.completedBuilds}</div>
        <div className="card red">Failed Builds<br />{data.failedBuilds}</div>
        <div className="card yellow">In Progress<br />{data.inProgress}</div>
      </div>
    </div>
  );
}

export default Overview;