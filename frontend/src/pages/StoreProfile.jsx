import { useState } from 'react';
import { User, MapPin, Settings, HelpCircle, LogOut, Mail, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StoreProfile() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Valued Customer';
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [inputEmail, setInputEmail] = useState('');

  const handleSaveEmail = (e) => {
    e.preventDefault();
    if (inputEmail) {
      localStorage.setItem('email', inputEmail);
      setEmail(inputEmail);
      setIsAddingEmail(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-[#e5e0d8] p-8 text-center mt-6">
      <div className="w-20 h-20 bg-[#CDB4DB] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
        <User size={36} />
      </div>
      
      {/* Display Actual Username */}
      <h2 className="text-xl font-bold text-gray-800">{username}</h2>

      {/* Display Email or Add Email Button */}
      {email ? (
        <p className="text-xs text-gray-500 mb-8 flex items-center justify-center gap-1">
          <Mail size={14} /> {email}
        </p>
      ) : (
        <div className="mb-8">
          {!isAddingEmail ? (
            <button 
              onClick={() => setIsAddingEmail(true)} 
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#a18b69] border border-[#a18b69] px-3 py-1 rounded-full hover:bg-[#a18b69] hover:text-white transition"
            >
              <Plus size={14} /> Add Email Address
            </button>
          ) : (
            <form onSubmit={handleSaveEmail} className="flex gap-2 max-w-xs mx-auto mt-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="flex-1 text-xs px-3 py-2 border rounded-lg border-gray-300 outline-none focus:ring-1 focus:ring-[#a18b69]"
              />
              <button type="submit" className="bg-[#a18b69] text-white text-xs px-3 py-2 rounded-lg font-semibold">Save</button>
            </form>
          )}
        </div>
      )}

      <div className="space-y-3 text-left">
        <button className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition border border-gray-100">
          <MapPin className="text-[#a18b69]" size={20} />
          <span className="flex-1 text-sm font-medium text-gray-700">Shipping Addresses</span>
        </button>
        <button className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition border border-gray-100">
          <Settings className="text-[#a18b69]" size={20} />
          <span className="flex-1 text-sm font-medium text-gray-700">App Settings</span>
        </button>
        <button className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition border border-gray-100">
          <HelpCircle className="text-[#a18b69]" size={20} />
          <span className="flex-1 text-sm font-medium text-gray-700">Help & Support</span>
        </button>
        <button 
          onClick={handleSignOut} 
          className="w-full flex items-center gap-4 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition border border-red-100 text-red-600"
        >
          <LogOut size={20} />
          <span className="flex-1 text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}