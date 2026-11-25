import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';
import Biometrics from '../components/Biometrics';
import { useCart } from '../context/CartContext';

export default function StoreAuth() {
  const { refreshSession } = useCart();
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [modalMode, setModalMode] = useState('register'); // 'register' after signup or login
  const [activeUser, setActiveUser] = useState('');
  
  // Sign In states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Sign Up states
  const [regUsername, setRegUsername] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    const trimmedUser = loginUsername.trim();
    localStorage.setItem('last_attempted_username', trimmedUser);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Portal': 'store' },
        body: JSON.stringify({ 
          username: trimmedUser, 
          password: loginPassword 
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Remember who is signed in so the cart and checkout use the right account
        const loggedUser = data.user?.username || trimmedUser;
        localStorage.setItem('athaliah_active_user', loggedUser);
        localStorage.setItem('username', loggedUser);
        await refreshSession();

        // Successful login: Ask user if they want to add biometrics or skip
        setActiveUser(loggedUser);
        setModalMode('register');
        setShowBiometricModal(true);
      } else {
        setError(data.message || data.error || 'Invalid credentials.');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Server connection error. Ensure Flask backend is running.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    const trimmedRegUser = regUsername.trim();
    localStorage.setItem('last_attempted_username', trimmedRegUser);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Portal': 'store' },
        body: JSON.stringify({ 
          username: trimmedRegUser,
          name: name,
          surname: surname,
          email: regEmail,
          phone: regNumber, 
          password: regPassword 
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Switch back to Sign In view automatically and pre-fill username
        setIsSignUp(false);
        setSuccessMessage('Account created successfully! Please sign in below.');
        setLoginUsername(trimmedRegUser);
        setRegUsername('');
        setName('');
        setSurname('');
        setRegEmail('');
        setRegNumber('');
        setRegPassword('');
      } else {
        setError(data.message || data.error || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration fetch error:', err);
      setError('Server connection error. Ensure Flask backend is running.');
    }
  };

  const handleBiometricLoginSuccess = async () => {
    const who = loginUsername.trim() || localStorage.getItem('last_attempted_username');
    if (who) {
      localStorage.setItem('athaliah_active_user', who);
      localStorage.setItem('username', who);
    }
    await refreshSession();
    setSuccessMessage("Biometric sign-in verified!");
    setTimeout(() => {
      navigate('/store');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden">
      
      {/* Top Navbar */}
      <header className="w-full py-4 px-6 bg-transparent flex justify-between items-center z-25">
        <Link to="/" className="text-base sm:text-xl font-bold tracking-wider text-white hover:text-indigo-400 transition">
          ATHALIAH COLLECTIONS
        </Link>
        <Link to="/" className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition">
          ← Back to Homepage
        </Link>
      </header>

      {/* Main Split-Panel Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 z-20">
        <div className="relative w-full max-w-4xl bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden min-h-[580px] flex">
          
          {/* --- SIGN IN FORM CONTAINER --- */}
          <div className={`w-full lg:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center transition-all duration-700 ${
            isSignUp ? 'opacity-0 pointer-events-none hidden lg:flex' : 'opacity-100 flex'
          }`}>
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
              <p className="text-xs uppercase tracking-widest text-indigo-400 mt-1 font-mono">Sign in to your customer account</p>
            </div>

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center font-medium">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => {
                    setLoginUsername(e.target.value);
                    localStorage.setItem('last_attempted_username', e.target.value.trim());
                  }}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password recovery prompt sent.'); }} className="text-xs text-indigo-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <button
                type="submit"
                style={{ backgroundColor: '#8F5A1D' }}
                className="w-full py-3.5 mt-2 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition tracking-wide text-xs"
              >
                SIGN IN
              </button>
            </form>

            {/* Biometric Sign-In Option */}
            <div className="mt-4 pt-4 border-t border-slate-700/60">
              <p className="text-[11px] text-slate-400 text-center mb-2.5">Or sign in with fingerprint / Face ID:</p>
              <Biometrics 
                username={loginUsername} 
                mode="login" 
                onSuccess={handleBiometricLoginSuccess} 
                onError={(msg) => setError(msg)} 
              />
            </div>
          </div>

          {/* --- SIGN UP FORM CONTAINER --- */}
          <div className={`w-full lg:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center transition-all duration-700 ${
            !isSignUp ? 'opacity-0 pointer-events-none hidden lg:flex' : 'opacity-100 flex'
          }`}>
            <div className="text-center mb-5">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
              <p className="text-xs uppercase tracking-widest text-indigo-400 mt-1 font-mono">Join Athaliah Collections today</p>
            </div>

            {error && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => {
                    setRegUsername(e.target.value);
                    localStorage.setItem('last_attempted_username', e.target.value.trim());
                  }}
                  placeholder="Choose unique username"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Surname</label>
                  <input
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="09123456789"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <button
                type="submit"
                style={{ backgroundColor: '#8F5A1D' }}
                className="w-full py-3 mt-1 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition tracking-wide text-xs"
              >
                SIGN UP
              </button>
            </form>
          </div>

          {/* --- SLIDING OVERLAY PANEL (DESKTOP) --- */}
          <div className={`hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-12 flex-col justify-center items-center text-center absolute top-0 bottom-0 transition-all duration-700 z-30 ${
            isSignUp ? 'left-0 rounded-r-[80px]' : 'left-1/2 rounded-l-[80px]'
          }`}>
            {!isSignUp ? (
              <div className="space-y-6">
                <h3 className="text-4xl font-extrabold tracking-tight">Hello, Friend!</h3>
                <p className="text-indigo-200 text-sm max-w-xs leading-relaxed">
                  Enter your personal details and start your shopping journey with Athaliah Collections.
                </p>
                <button
                  onClick={() => setIsSignUp(true)}
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-slate-900 transition tracking-wider text-xs uppercase"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-4xl font-extrabold tracking-tight">Welcome Back!</h3>
                <p className="text-indigo-200 text-sm max-w-xs leading-relaxed">
                  To keep connected with us please login with your personal info.
                </p>
                <button
                  onClick={() => setIsSignUp(false)}
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-slate-900 transition tracking-wider text-xs uppercase"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Mobile Toggle Banner */}
      <div className="lg:hidden py-4 text-center z-20">
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-indigo-400 text-xs sm:text-sm underline hover:text-indigo-300 font-medium"
        >
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </button>
      </div>

      {/* --- POST-LOGIN BIOMETRIC SETUP MODAL (ADD OR SKIP) --- */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
              <Fingerprint size={36} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Would you like to add biometrics?</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Save your fingerprint or Face ID to your account (<strong className="text-indigo-300">{activeUser}</strong>) for instant, password-free login next time.
              </p>
            </div>

            <div className="space-y-3">
              <Biometrics 
                username={activeUser} 
                mode="register" 
                onSuccess={() => {
                  alert("Biometrics added successfully!");
                  setShowBiometricModal(false);
                  navigate('/store');
                }} 
                onError={(msg) => alert(msg)} 
              />
              <button 
                onClick={() => {
                  setShowBiometricModal(false);
                  navigate('/store');
                }}
                className="w-full bg-slate-900 border border-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-5 px-6 text-center text-xs text-slate-500 border-t border-slate-800 z-20">
        © 2026 Athaliah Collections. All rights reserved.
      </footer>
    </div>
  );
}