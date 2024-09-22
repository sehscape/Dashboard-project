import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import Report from "./pages/Report";
import Recipe from "./pages/Recipe";
import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  const [toggle, setToggle] = useState(true);
  
  const Toggle = () => {
    setToggle(!toggle);
  };

  return (
    <Router>
      <div className="container-fluid bg-secondary min-vh-100">
        <div className="row">
          {toggle && (
            <div className="col-4 col-md-2 bg-white vh-100 position-fixed">
              <Sidebar />
            </div>
          )}
          {toggle && <div className="col-4 col-md-2"></div>}
          <div className="col">
            <Routes>
              <Route path="/" element={<Overview Toggle={Toggle} />} />
              <Route path="/dashboard" element={<Overview Toggle={Toggle} />} />
              <Route path="/report" element={<Report Toggle={Toggle} />} />
              <Route path="/recipe" element={<Recipe Toggle={Toggle} />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
