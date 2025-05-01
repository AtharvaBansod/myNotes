


import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated, user, toggleAuth, darkMode, toggleDarkMode }) => {
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      localStorage.removeItem('supabase_token');
      toggleAuth();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <motion.nav 
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-left">
        <Link to="/" className="app-name">
          <i className="fas fa-book-open"></i> NoteIt
        </Link>
      </div>
      
      <div className="navbar-right">
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
        </button>
        
        {isAuthenticated ? (
          <>
            <div className="user-profile">
              <div className="profile-icon">
                <i className="fas fa-user"></i>
              </div>
              <span className="username">{user}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="login-btn">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;