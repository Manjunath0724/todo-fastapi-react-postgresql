import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AllTasks from './components/AllTasks';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
        <div className="flex">
          <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen}
            onLogout={handleLogout}
          />
          <main
            className={`flex-1 transition-all duration-300 min-h-screen ${
              isSidebarOpen ? 'ml-56 sm:ml-60' : 'ml-14'
            }`}
          >
            <Routes>
              <Route path="/" element={<Dashboard isDarkMode={isDarkMode} />} />
              <Route path="/dashboard" element={<Dashboard isDarkMode={isDarkMode} />} />
              <Route path="/tasks" element={<AllTasks isDarkMode={isDarkMode} />} />
              <Route path="/analytics" element={<Analytics isDarkMode={isDarkMode} />} />
              <Route 
                path="/settings" 
                element={
                  <Settings 
                    isDarkMode={isDarkMode} 
                    toggleTheme={toggleTheme}
                  />
                } 
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
