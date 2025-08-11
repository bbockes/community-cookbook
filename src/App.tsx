import React, { useState } from 'react';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import { CookbookModal } from './components/CookbookModal';
import { Cookbook } from './utils/types';
export function App() {
  const [selectedCookbook, setSelectedCookbook] = useState<Cookbook | null>(null);
  return <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Home onCookbookSelect={setSelectedCookbook} />
      </main>
      {selectedCookbook && <CookbookModal cookbook={selectedCookbook} onClose={() => setSelectedCookbook(null)} />}
    </div>;
}