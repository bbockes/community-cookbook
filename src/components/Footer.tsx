import React from 'react';
import { FacebookIcon, InstagramIcon, TwitterIcon } from 'lucide-react';
export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CookBookMarket</h3>
            <p className="text-gray-300 mb-4">
              Your destination for premium cookbooks from renowned chefs and
              culinary experts around the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-amber-400">
                <FacebookIcon size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-amber-400">
                <InstagramIcon size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-amber-400">
                <TwitterIcon size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-300 mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-gray-700 text-white px-4 py-2 rounded-l-lg w-full focus:outline-none focus:ring-1 focus:ring-amber-400" />

              <button className="bg-amber-600 text-white px-4 py-2 rounded-r-lg hover:bg-amber-700">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} CookBookMarket. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>);

};