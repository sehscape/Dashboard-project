// src/components/Drawer.js
import React from 'react';
import '../css/styles.css';

const Drawer = ({ isOpen, onClose, content }) => {
  return (
  <div className={`drawer ${isOpen ? 'open' : ''}`}>
      <button className="drawer-close" onClick={onClose}>✕</button>
      <div className="drawer-content">
        {content}
      </div>
    </div>
  );
};

export default Drawer;
