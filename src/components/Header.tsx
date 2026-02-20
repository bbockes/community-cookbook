import React, { useState } from 'react';
import { MenuIcon, XIcon, SearchIcon } from 'lucide-react';
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <header className="shadow-sm sticky top-0 z-10" style={{ backgroundColor: '#F4F1DF' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: "'Livvic', sans-serif", color: '#394282' }}>
                Community Cookbook
              </span>
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6">
              <a
                href="#"
                className="text-gray-700 hover:text-amber-600 font-medium">

                Home
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-amber-600 font-medium">

                About
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-amber-600">
                <SearchIcon size={20} />
              </button>
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700">

              {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen &&
      <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-3 py-3">
              <a
              href="#"
              className="text-gray-700 hover:text-amber-600 font-medium py-1">

                Home
              </a>
              <a
              href="#"
              className="text-gray-700 hover:text-amber-600 font-medium py-1">

                Shop
              </a>
              <a
              href="#"
              className="text-gray-700 hover:text-amber-600 font-medium py-1">

                Collections
              </a>
              <a
              href="#"
              className="text-gray-700 hover:text-amber-600 font-medium py-1">

                About
              </a>
            </nav>
          </div>
        </div>
      }
    </header>);

};