import React from "react";
import { NavLink } from "react-router-dom";
import '../css/styles.css';

function Sidebar() {
  return (
    <div className="bg-white sidebar p-2">
      <div className="m-2">
        <i className="bi bi-person-circle text-dark me-2 fs-4"></i>
        <span className="brand-name text-dark fs-4">WELCOME</span>
      </div>
      <hr className="text-dark" />
      <div className="list-group list-group-flush">
        <NavLink to="/dashboard" className="list-group-item py-2 my-1">
          <i className="bi bi-speedometer2 fs-5 me-3"></i>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/report" className="list-group-item py-2 my-1">
          <i className="bi bi-clipboard-data fs-5 me-3"></i>
          <span>Report</span>
        </NavLink>
        <NavLink to="/recipe" className="list-group-item py-2 my-1">
          <i className="bi bi-table fs-5 me-3"></i>
          <span>Recipe</span>
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
