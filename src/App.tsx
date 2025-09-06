import React, { useState } from 'react';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { CookbookPage } from './pages/CookbookPage';
import { Navbar } from './components/Navbar';
import { DbCookbook } from './utils/types';

type AppPage = 'home' | 'profile' | 'cookbook';

export function App() {
  const [selectedCookbook, setSelectedCookbook] = useState<DbCookbook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  // Helper function to create URL-friendly slug from cookbook title
  const createSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  };

  const handleCookbookSelect = (cookbook: DbCookbook) => {
    setSelectedCookbook(cookbook);
    setCurrentPage('cookbook');
    
    // Update URL without causing page reload
    const slug = createSlug(cookbook.title);
    window.history.pushState(
      { page: 'cookbook', cookbookId: cookbook.id }, 
      `${cookbook.title} | Community Cookbook`,
      `/cookbook/${slug}`
    );
  };

  const handleBackFromCookbook = () => {
    setSelectedCookbook(null);
    setCurrentPage('home');
    
    // Update URL back to home
    window.history.pushState(
      { page: 'home' }, 
      'Community Cookbook',
      '/'
    );
  };

  const handlePageChange = (page: 'home' | 'profile') => {
    setCurrentPage(page);
    setSelectedCookbook(null);
    
    // Update URL
    const url = page === 'home' ? '/' : '/profile';
    const title = page === 'home' ? 'Community Cookbook' : 'My Profile | Community Cookbook';
    window.history.pushState({ page }, title, url);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
      />
      
      {currentPage === 'cookbook' && selectedCookbook ? (
        <CookbookPage 
          cookbook={selectedCookbook} 
          onBack={handleBackFromCookbook} 
        />
      ) : (
        <main className="container mx-auto px-4 py-6">
          {currentPage === 'home' ? (
            <Home onCookbookSelect={handleCookbookSelect} searchQuery={searchQuery} />
          ) : (
            <Profile onCookbookSelect={handleCookbookSelect} />
          )}
        </main>
      )}
    </div>
  );
}
        ) : (
          <Profile onCookbookSelect={setSelectedCookbook} />
        )}
      </main>
      {selectedCookbook && <CookbookModal cookbook={selectedCookbook} onClose={() => setSelectedCookbook(null)} />}
    </div>;
}