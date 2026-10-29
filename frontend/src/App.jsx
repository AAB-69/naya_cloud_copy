import React, { useState, useEffect } from 'react';
import ServerCard from './components/ServerCard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register' | 'forgot-password' | 'dashboard'
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const savedToken = localStorage.getItem('nayatel_token');
    const savedUser = localStorage.getItem('nayatel_user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setCurrentView('dashboard');
      } catch (e) {
        localStorage.removeItem('nayatel_token');
        localStorage.removeItem('nayatel_user');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  // If authenticated and on dashboard view
  if (currentView === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-modal-card">
        {/* Left Side: Server Room Glow Card */}
        <div className="auth-modal-left">
          <ServerCard />
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="auth-modal-right">
          {currentView === 'login' && (
            <LoginPage
              onNavigate={setCurrentView}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {currentView === 'register' && (
            <RegisterPage
              onNavigate={setCurrentView}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}

          {currentView === 'forgot-password' && (
            <ForgotPasswordModal
              onNavigate={setCurrentView}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
