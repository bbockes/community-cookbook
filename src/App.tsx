import React, { useState } from 'react';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Navbar } from './components/Navbar';
import { CookbookModal } from './components/CookbookModal';
import { DbCookbook } from './utils/types';

export function App() {
  const [selectedCookbook, setSelectedCookbook] = useState<DbCookbook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<'home' | 'profile'>('home');

  return <div className="min-h-screen bg-white">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <main className="container mx-auto px-4 py-6">
        {currentPage === 'home' ? (
          <Home onCookbookSelect={setSelectedCookbook} searchQuery={searchQuery} />
        ) : (
          <Profile onCookbookSelect={setSelectedCookbook} />
        )}
      </main>
      {selectedCookbook && <CookbookModal cookbook={selectedCookbook} onClose={() => setSelectedCookbook(null)} />}
    </div>;
}