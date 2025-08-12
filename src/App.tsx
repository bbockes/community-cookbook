import React, { useState } from 'react';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import { CookbookModal } from './components/CookbookModal';
import { DbCookbook } from './utils/types';

export function App() {
  const [selectedCookbook, setSelectedCookbook] = useState<DbCookbook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return <div className="min-h-screen bg-white">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="container mx-auto px-4 py-6">
        <Home onCookbookSelect={setSelectedCookbook} searchQuery={searchQuery} />
      </main>
      {selectedCookbook && <CookbookModal cookbook={selectedCookbook} onClose={() => setSelectedCookbook(null)} />}
    </div>;
}