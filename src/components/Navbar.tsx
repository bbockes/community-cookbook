import React, { useState } from 'react';
import { SearchIcon, UserIcon, LogOutIcon, HomeIcon, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: 'home' | 'profile';
  setCurrentPage: (page: 'home' | 'profile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  currentPage, 
  setCurrentPage 
}) => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('home'); // Return to home when signing out
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div>
      <nav className="bg-cream shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 
                className="text-2xl font-bold text-navy font-heading cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setCurrentPage('home')}
              >
                <span className="text-navy">Community</span> <span className="text-purple-600">Cookbook</span>
              </h1>
            </div>
            <div className="flex-1 max-w-md mx-4 h-10 flex items-center hidden xl:flex">
              {currentPage === 'home' ? (
                <div className="relative w-full">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cookbooks..." 
                    className="w-full py-2 px-4 pl-10 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-navy transition-all" 
                  />
                  <div className="absolute left-3 top-2.5 text-charcoal/60">
                    <SearchIcon size={18} />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full"></div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage('profile')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      currentPage === 'profile' 
                        ? 'bg-navy text-white' 
                        : 'text-charcoal/70 hover:text-charcoal hover:bg-gray-100'
                    }`}
                  >
                    <User size={16} />
                    My Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                   className="text-charcoal/80 hover:text-charcoal transition-colors flex items-center gap-1 text-sm"
                  >
                    <LogOutIcon size={16} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => openAuthModal('signin')}
                    className="bg-coral text-white px-4 py-2 rounded-sm hover:bg-coral/90 transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => openAuthModal('signup')}
                    className="bg-coral text-white px-5 py-2 rounded-sm hover:bg-coral/90 transition-all duration-200 flex items-center shadow-sm hover:shadow"
                  >
                    <UserIcon size={18} className="mr-1.5" />
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
};