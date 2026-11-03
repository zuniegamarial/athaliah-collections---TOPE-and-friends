import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

export default function StoreAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin 
      ? { username: loginIdentifier, password } 
      : { username, first_name: firstName, last_name: lastName, email, phone, password };

    try {
      const res = await fetch(`http://192.168.8.199:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include' // CRITICAL: Tells browser to accept and save the session cookie
      });
      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          const loggedInName = data.user?.username || data.username || loginIdentifier;
          const loggedInId = data.user?.id || data.id || '';

          localStorage.setItem('user_id', loggedInId);
          localStorage.setItem('username', loggedInName);

          alert(`Welcome back, ${loggedInName}!`);
          navigate('/store'); 
        } else {
          alert('Account created successfully! Please sign in.');
          setIsLogin(true); 
        }
      } else {
        alert(data.message || data.error || 'Authentication failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f6f0] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#e5e0d8] p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-wider text-gray-900">ATHALIAH</h1>
          <p className="text-xs tracking-[0.25em] text-[#a18b69] mt-1">COLLECTIONS</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${isLogin ? 'bg-white text-[#a18b69] shadow-sm' : 'text-gray-500'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${!isLogin ? 'bg-white text-[#a18b69] shadow-sm' : 'text-gray-500'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Username or Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><User size={16} /></span>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Enter username or email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5e0d8] focus:ring-2 focus:ring-[#a18b69] text-sm outline-none"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><User size={16} /></span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5e0d8] focus:ring-2 focus:ring-[#a18b69] text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Name (First Name)</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5e0d8] focus:ring-2 focus:ring-[#a18b69] text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Surname (Last Name)</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dela Cruz"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e5e0d8] focus:ring-2 focus:ring-[#a18b69] text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Mail size={16} /></span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5e0d8] focus:ring-2 focus:ring-[#a18b69] text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Phone size={16} /></span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5e0d8] focus:ring-2 focus:ring-[#a18b69] text-sm outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Lock size={16} /></span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5e0d8] focus:ring-2 focus:ring-[#a18b69] text-sm outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#a18b69] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#8f795a] transition shadow-sm"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}