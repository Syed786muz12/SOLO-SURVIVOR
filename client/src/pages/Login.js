import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../components/login.css';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { FirebaseUserService } from '../services/firebaseUserService';
import LoadingScreen from '../components/LoadingScreen';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const lastEmail = localStorage.getItem('lastLoginEmail');
    if (lastEmail) {
      setFormData((prev) => ({ ...prev, email: lastEmail }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const withTimeout = (promise, ms = 10000) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('⏱️ Timeout: Server took too long')), ms)
    );
    return Promise.race([promise, timeout]);
  };

  const savePlayerToLocal = (uid, data) => {
    localStorage.setItem('uid', uid);
    localStorage.setItem('playerId', data.id);
    localStorage.setItem('lastLoginEmail', data.email || formData.email);
    localStorage.setItem('playerName', data.name);
    localStorage.setItem('playerAvatar', data.avatar);
    localStorage.setItem('playerCharacter', data.character);
    localStorage.setItem('playerBackground', data.background);
    localStorage.setItem('playerXp', data.xp);
    localStorage.setItem('playerLevel', data.level);
    localStorage.setItem('playerStatus', data.status);
    localStorage.setItem('playerLastActive', data.lastActive);
    localStorage.setItem('equippedWeapon', data.equippedWeapon || 'rifle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userCredential = await withTimeout(
        signInWithEmailAndPassword(auth, formData.email, formData.password)
      );
      const uid = userCredential.user.uid;

      const data = await FirebaseUserService.getProfile(uid);
      if (!data) {
        alert('⚠️ Player profile not found.');
        return;
      }

      savePlayerToLocal(uid, data);
      setIsLoading(true);
      setTimeout(() => navigate('/dashboard'), 5000); // Show loading screen for 5 seconds
    } catch (error) {
      console.error('Login Error:', error);
      alert('❌ Login failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderParticles = () => {
    return [...Array(20)].map((_, i) => {
      const size = Math.random() * 10 + 5;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 10;
      const r = Math.floor(Math.random() * 100) + 100;
      const g = Math.floor(Math.random() * 100) + 92;
      const b = Math.floor(Math.random() * 100) + 231;
      const a = Math.random() * 0.5 + 0.3;
      const color = `rgba(${r}, ${g}, ${b}, ${a})`;

      return (
        <div
          key={i}
          className="particle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            position: 'absolute',
            top: `${y}%`,
            left: `${x}%`,
            backgroundColor: color,
            borderRadius: '50%',
            animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
          }}
        />
      );
    });
  };

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="game-login-container">
          <div className="particles">{!isSubmitting && renderParticles()}</div>

          <div className="login-card animate_animated animate_fadeInDown">
            <div className="game-logo mb-4">
              <div className="logo-icon animate_animated animate_pulse animate_infinite">
                <span role="img" aria-label="rocket">🚀</span>
              </div>
              <h1 className="brand-name">SOLO GAMING</h1>
              <p className="tagline">Welcome Back, Warrior!</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3 input-group">
                <span className="input-group-text"><i className="fas fa-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4 input-group">
                <span className="input-group-text"><i className="fas fa-lock"></i></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="input-group-text"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide' : 'Show'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </span>
              </div>

              <button
                type="submit"
                className="btn login-btn w-100 mb-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="spinner-grow spinner-grow-sm text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i> LOGIN
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-white">
                  Don't have an account?{' '}
                  <Link to="/signup" className="highlight-link">Sign up</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;