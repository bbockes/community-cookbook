import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { CookbookPage } from './pages/CookbookPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/profile" 
              element={user ? <Profile /> : <Navigate to="/" replace />} 
            />
            <Route path="/cookbook/:slug" element={<CookbookPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;