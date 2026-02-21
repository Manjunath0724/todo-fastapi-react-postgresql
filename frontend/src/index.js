// Purpose: React application entry point and initial theming bootstrapping
// Why: Mounts App component and establishes persisted theme before React renders
// How: Reads localStorage to apply data-theme and dark class, then hydrates DOM
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // ← App.js (not App.jsx)
import './index.css';
import './i18n';

// Read preferred color theme and apply CSS variables host-wide
const savedTheme = localStorage.getItem('colorTheme') || 'pro-dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Toggle dark class for Tailwind dark styles based on chosen palette
if (savedTheme === 'pro-dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Create root and render app under StrictMode for highlighting side effects
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
