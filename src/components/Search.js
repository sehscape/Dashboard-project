import React, { useState, useEffect } from 'react';
import './styles.css';

const Search = () => {
  const [developerName, setDeveloperName] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetch('https://dummyjson.com/c/eeba-62ac-45de-a283')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched data:', data);
        setData(data.recipes || []);
        setFilteredData(data.recipes || []);
      })
      .catch(err => console.error('Error fetching data:', err));
  }, []);

  const handleSearch = () => {
    const filtered = data.filter(recipe =>
      recipe.developerName.toLowerCase().includes(developerName.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <div>
      <div className="search">
        <input
          type="text"
          placeholder="Developer Name"
          value={developerName}
          onChange={e => setDeveloperName(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="details-table">
        <h2>Details</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Package Name</th>
              <th>Recipe</th>
              <th>Docker</th>
              <th>CI Link</th>
              <th>Image</th>
              <th>Binary</th>
              <th>Comment</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((recipe, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{recipe.packageName}</td>
                  <td>{recipe.recipeName}</td>
                  <td>{recipe.docker}</td>
                  <td>{recipe.ciLink}</td>
                  <td>{recipe.image}</td>
                  <td>{recipe.binary}</td>
                  <td>{recipe.comment}</td>
                  <td>{recipe.size}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Search;
