import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AllTasks from './components/AllTasks';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Login from './components/Login';
import Signup from './components/Signup';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Load theme preference
    const savedColorTheme = localStorage.getItem('colorTheme') || 'pro-dark';
    if (savedColorTheme === 'pro-dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', savedColorTheme);

    // Set sidebar open by default on desktop, closed on mobile
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    const themeValue = newMode ? 'pro-dark' : 'pro-light';
    localStorage.setItem('colorTheme', themeValue);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', themeValue);
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
        <Navbar 
          isSidebarOpen={isSidebarOpen}
          onLogout={handleLogout} 
          onToggleMenu={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <div className="flex">
          <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen}
          />
          <main
            className={`flex-1 transition-all duration-300 min-h-screen pt-4 sm:pt-6 ${
              isSidebarOpen 
                ? 'lg:ml-60 ml-0' 
                : 'lg:ml-20 ml-0'
            }`}
          >
            <div className="p-0">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<AllTasks />} />
                <Route path="/analytics" element={<Analytics />} />
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
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
