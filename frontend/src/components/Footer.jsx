import React from 'react';
import { ShoppingBag } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span className="bg-indigo-600 text-white p-1 rounded-lg flex items-center justify-center">
              <ShoppingBag size={14} />
            </span>
            <span>HostelHub</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} HostelHub. Developed under the direction of{' '}
            <a 
              href="https://www.linkedin.com/in/akanksha-gupta-72b7032b9/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 hover:underline font-semibold"
            >
              Akanksha Gupta (Product Director)
            </a>
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="hover:text-indigo-600 cursor-pointer">Terms</span>
            <span className="hover:text-indigo-600 cursor-pointer">Privacy</span>
            <span className="hover:text-indigo-600 cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
