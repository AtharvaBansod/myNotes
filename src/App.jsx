

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';

function AppWrapper() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('supabase_token');
      
      if (token) {
        try {
          // Verify token with your edge function
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-session`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include' // Required for cookies/session
          });
  
          if (!response.ok) {
            throw new Error('Session verification failed');
          }
  
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data.user?.user_metadata?.name || data.user?.email);
        } catch (error) {
          console.error('Session check failed:', error);
          localStorage.removeItem('supabase_token');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
  
    checkSession();
  }, []);
  const toggleAuth = (userName) => {
    setIsAuthenticated(!isAuthenticated);
    setUser(userName);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', newMode);
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    document.documentElement.setAttribute('data-theme', savedMode ? 'dark' : 'light');
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="app-container">
      <Navbar 
        isAuthenticated={isAuthenticated} 
        user={user}
        toggleAuth={toggleAuth} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
      />
      <Routes>
        <Route path="/auth" element={<AuthPage toggleAuth={toggleAuth} />} />
        <Route path="/" element={
          isAuthenticated ? 
            <HomePage darkMode={darkMode} user={user} /> : 
            <AuthPage toggleAuth={toggleAuth} />
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;