




import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const AuthPage = ({ toggleAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const payload = isLogin 
//         ? { email: formData.email, password: formData.password }
//         : { email: formData.email, password: formData.password, name: formData.name };

//       const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
//         },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Authentication failed');
//       }

//       // Store the session data
//       localStorage.setItem('supabase_token', data.session.access_token);
      
//       // Get user name from either user_metadata or users table
//       const userName = data.user.user_metadata?.name || data.user.email;
//       toggleAuth(userName);
//       navigate('/');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };



const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      // Validate form data
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }
  
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            email: formData.email, 
            password: formData.password, 
            name: formData.name 
          };
  
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(payload)
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
  
      // Verify we have all required data
      if (!data.user?.id || !data.session?.access_token) {
        throw new Error('Invalid response from server');
      }
  
      // Store session data
      localStorage.setItem('supabase_token', data.session.access_token);
      
      // Get user name from response
      const userName = data.user.user_metadata?.name || formData.name || data.user.email;
      toggleAuth(userName);
      navigate('/');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div 
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <button 
            className="toggle-auth-mode"
            onClick={() => setIsLogin(!isLogin)}
            type="button"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <motion.button
            type="submit"
            className="auth-submit-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default AuthPage;