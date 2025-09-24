import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { CookbookPage } from './pages/CookbookPage';
import { DbCookbook } from './utils/types';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'profile'>('home');
  const [selectedCookbook, setSelectedCookbook] = useState<DbCookbook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCookbookSelect = (cookbook: DbCookbook) => {
    setSelectedCookbook(cookbook);
  };

  const handleBackToHome = () => {
    setSelectedCookbook(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <div className="container mx-auto px-4 py-8">
        {selectedCookbook ? (
          <CookbookPage 
            cookbook={selectedCookbook} 
            onBack={handleBackToHome} 
          />
        ) : currentPage === 'home' ? (
          <Home 
            onCookbookSelect={handleCookbookSelect}
            searchQuery={searchQuery}
          />
        ) : currentPage === 'profile' ? (
          user ? (
            <Profile onCookbookSelect={handleCookbookSelect} />
          ) : (
            <div className="text-center py-12">
              <p className="text-charcoal/60">Please sign in to view your profile</p>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

export default App;