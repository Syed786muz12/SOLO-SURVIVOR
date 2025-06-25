import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../components/signup.css';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { generatePlayerId } from '../utils/idGenerator';
import { FirebaseUserService } from '../services/firebaseUserService';
import LoadingScreen from '../components/LoadingScreen';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const withTimeout = (promise, ms = 10000) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("⏱️ Timeout: Server took too long")), ms)
    );
    return Promise.race([promise, timeout]);
  };

  const savePlayerToLocal = (uid, playerId, playerData) => {
    localStorage.setItem('uid', uid);
    localStorage.setItem('playerId', playerId);
    localStorage.setItem('lastLoginEmail', playerData.email);
    localStorage.setItem('playerName', playerData.name);
    localStorage.setItem('playerAvatar', playerData.avatar);
    localStorage.setItem('playerCharacter', playerData.character);
    localStorage.setItem('playerBackground', playerData.background);
    localStorage.setItem('playerXp', playerData.xp);
    localStorage.setItem('playerLevel', playerData.level);
    localStorage.setItem('playerStatus', playerData.status);
    localStorage.setItem('playerLastActive', playerData.lastActive);
    localStorage.setItem('equippedWeapon', playerData.equippedWeapon || 'rifle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      // Validate terms checkbox
      if (!formData.agreeTerms) {
        throw new Error("You must agree to the terms");
      }

      // Create user with Firebase Auth
      const userCredential = await withTimeout(
        createUserWithEmailAndPassword(auth, formData.email, formData.password)
      );

      const uid = userCredential.user.uid;
      const playerId = generatePlayerId();

      // Update user profile
      await updateProfile(userCredential.user, {
        displayName: formData.username,
      });

      // Create player profile data
      const profileData = {
        email: formData.email,
        name: formData.username,
        id: playerId,
        xp: 0,
        level: 1,
        avatar: '/assets/avatar.webp',
        character: '/assets/character.glb',
        background: '/assets/bg-dashboard.jpg',
        status: 'Ready for Battle',
        lastActive: new Date().toISOString(),
        equippedWeapon: 'rifle',
        ownedItems: [],
        friends: [],
        requestsSent: [],
        requestsReceived: [],
      };

      // Save profile to Firebase
      const createdProfile = await FirebaseUserService.createProfile(uid, profileData);
      await FirebaseUserService.syncWithBackend(userCredential.user);
      savePlayerToLocal(uid, playerId, createdProfile);

      // Ensure loading screen shows for at least 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/dashboard');

    } catch (error) {
      console.error('Signup Error:', error);
      setError(error.message);
      
      // Special handling for common errors
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      }
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="game-signup-container">
      <div className="particles">{renderParticles()}</div>

      <div className="signup-card animate_animated animate_fadeInUp">
        <div className="game-logo mb-4">
          <div className="logo-icon animate_animated animate_pulse animate_infinite">
            <span role="img" aria-label="rocket">🚀</span>
          </div>
          <h1 className="brand-name">SOLO GAMING</h1>
          <p className="tagline">Join the Ultimate Gaming Experience</p>
        </div>

        {error && (
          <div className="alert alert-danger mb-3">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 input-group">
            <span className="input-group-text"><i className="fas fa-user"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="mb-3 input-group">
            <span className="input-group-text"><i className="fas fa-lock"></i></span>
            <input
              type="password"
              className="form-control"
              placeholder="Password (min 6 characters)"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="mb-4 input-group">
            <span className="input-group-text"><i className="fas fa-lock"></i></span>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="mb-4 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
            />
            <label htmlFor="agreeTerms" className="form-check-label text-white">
              I agree to the Terms & Conditions
            </label>
          </div>

          <button
            type="submit"
            className="btn signup-btn w-100 mb-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-gamepad me-2"></i>
                CREATE ACCOUNT
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-white">
              Already have an account?{' '}
              <Link to="/login" className="highlight-link">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;