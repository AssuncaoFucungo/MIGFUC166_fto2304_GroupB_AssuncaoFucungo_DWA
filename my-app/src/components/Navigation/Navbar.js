import React, { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const showOverlay = () => {
    setOverlayVisible(true);
  }

  const hideOverlay = () => {
    setOverlayVisible(false);
  }

  return (
    <nav className="navbar">
      <button onClick={showOverlay}>
        <img src="/user.png" alt="User" className="nav-link-image-user" />
      </button>
      <div className="center-section">
        <img src="/waveform.png" alt="Logo" className="logo-img" />
      </div>

      {isOverlayVisible && (
        <div className="overlay">
          <div className="overlay-content">
            <button onClick={hideOverlay}>Close</button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
