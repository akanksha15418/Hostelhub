import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, BookOpen, Laptop, Home, Cookie, ArrowRight } from 'lucide-react';

const Landing = () => {
  const categories = [
    { name: 'Academic', icon: BookOpen, desc: 'Books, notes, calculators, and drafters.', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { name: 'Hostel Essentials', icon: Home, desc: 'Mattresses, buckets, tables, extension boards.', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { name: 'Electronics', icon: Laptop, desc: 'Mouse, headphones, power banks, keyboards.', color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { name: 'Snacks & Beverages', icon: Cookie, desc: 'Maggi, chocolates, instant coffee, chips.', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  ];

  return (
    <div className="bg-white min-h-[80vh] flex flex-col justify-center">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Buy, Sell & Discover <br />
          <span className="text-indigo-600">Within Your Campus Community</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-500 leading-relaxed">
          HostelHub is a student-to-student marketplace. Declutter your room, find cheap academic books, grab late-night snacks, or sell your hostel essentials before you graduate.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/marketplace"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            Browse Marketplace
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/add-product"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-lg transition-colors text-center"
          >
            Sell Your Items
          </Link>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gray-50 py-16 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What can you find on HostelHub?</h2>
            <p className="text-gray-500 mt-3 text-base">
              Everything a hostel student needs, categorised and listed directly by peers on your campus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="bg-white p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${cat.color} mb-4`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trust & Simplicity banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Middlemen, No Listing Fees</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We don't manage payments, take commissions, or host in-app chat. Just browse the marketplace, find what you need, and contact the student seller directly via WhatsApp to coordinate cash or UPI on-campus handovers.
          </p>
          <div className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold">
            <span>Simple, safe, and peer-to-peer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
