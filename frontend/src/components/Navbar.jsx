import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Heart, List, User, PlusCircle, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const activeClass = "text-indigo-600 font-semibold flex items-center gap-1.5 py-2";
  const inactiveClass = "text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-1.5 py-2 transition-colors";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <span className="bg-indigo-600 text-white p-1.5 rounded-lg flex items-center justify-center">
                <ShoppingBag size={18} />
              </span>
              <span>Hostel<span className="text-indigo-600">Hub</span></span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/marketplace" className={isActive('/marketplace') ? activeClass : inactiveClass}>
              Marketplace
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className={isActive('/wishlist') ? activeClass : inactiveClass}>
                  <Heart size={16} />
                  Wishlist
                </Link>
                <Link to="/my-listings" className={isActive('/my-listings') ? activeClass : inactiveClass}>
                  <List size={16} />
                  My Listings
                </Link>
                <Link to="/profile" className={isActive('/profile') ? activeClass : inactiveClass}>
                  <User size={16} />
                  Profile ({user?.name.split(' ')[0]})
                </Link>
                <Link 
                  to="/add-product" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <PlusCircle size={16} />
                  Sell Item
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-gray-500 hover:text-red-600 flex items-center gap-1 py-2 transition-colors ml-2"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none p-1"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 py-3 px-4 space-y-3 shadow-inner">
          <Link 
            to="/marketplace" 
            className="block text-gray-700 hover:text-indigo-600 font-medium py-1.5"
            onClick={() => setIsOpen(false)}
          >
            Marketplace
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/wishlist" 
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium py-1.5"
                onClick={() => setIsOpen(false)}
              >
                <Heart size={16} />
                Wishlist
              </Link>
              <Link 
                to="/my-listings" 
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium py-1.5"
                onClick={() => setIsOpen(false)}
              >
                <List size={16} />
                My Listings
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium py-1.5"
                onClick={() => setIsOpen(false)}
              >
                <User size={16} />
                Profile ({user?.name})
              </Link>
              <Link 
                to="/add-product" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-center font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <PlusCircle size={16} />
                Sell Item
              </Link>
              <button 
                onClick={handleLogout} 
                className="w-full text-left text-red-600 hover:bg-red-50 flex items-center gap-2 py-2 border-t border-gray-100 font-medium"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <Link 
                to="/login" 
                className="text-center text-gray-700 border border-gray-300 hover:bg-gray-50 py-2 rounded-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
