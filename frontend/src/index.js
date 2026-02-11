import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // ← App.js (not App.jsx)
import './index.css';
import './i18n';

// Initialize theme from localStorage (for color palettes)
const savedTheme = localStorage.getItem('colorTheme') || 'modern-dark';
document.documentElement.setAttribute('data-theme', savedTheme);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
