import React, { useState } from 'react';
import { SearchIcon, UserIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleSignOut = async () => {
    await signOut();
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">
              <span className="text-indigo-600">Whisk</span>list
            </h1>
          </div>
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input type="text" placeholder="Search cookbooks..." className="w-full py-2 px-4 pl-10 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all" />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <SearchIcon size={18} />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 text-sm">
                  Welcome, {user.email}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
                >
                  <LogOutIcon size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => openAuthModal('signin')}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => openAuthModal('signup')}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-sm hover:bg-indigo-700 transition-all duration-200 flex items-center shadow-sm hover:shadow"
                >
                  <UserIcon size={18} className="mr-1.5" />
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </nav>;
};