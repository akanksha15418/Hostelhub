import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService, wishlistService } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Loader, RefreshCw } from 'lucide-react';

const Marketplace = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Category states
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    { label: 'All Items', value: '' },
    { label: 'Academic', value: 'Academic' },
    { label: 'Hostel Essentials', value: 'Hostel Essentials' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Snacks', value: 'Snacks' }
  ];

  // Fetch products and wishlist on load or filter change
  useEffect(() => {
    fetchProducts();
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlistedIds(new Set());
    }
  }, [category, activeSearch, isAuthenticated]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productService.getAll(category, activeSearch);
      setProducts(data);
    } catch (err) {
      setError('Failed to load products. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await wishlistService.getAll();
      const ids = new Set(data.map((item) => item.id));
      setWishlistedIds(ids);
    } catch (err) {
      console.error('Failed to load wishlist details: ', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(search);
  };

  const handleSearchClear = () => {
    setSearch('');
    setActiveSearch('');
  };

  const handleWishlistToggle = async (productId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/marketplace' } } });
      return;
    }

    const updated = new Set(wishlistedIds);
    try {
      if (updated.has(productId)) {
        await wishlistService.remove(productId);
        updated.delete(productId);
      } else {
        await wishlistService.add(productId);
        updated.add(productId);
      }
      setWishlistedIds(updated);
    } catch (err) {
      console.error('Failed to toggle wishlist item: ', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Campus Marketplace</h1>
          <p className="text-gray-500 mt-1 text-sm">Discover second-hand essentials, academic material, and snacks.</p>
        </div>
        
        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex gap-2">
          <div className="relative flex-grow md:w-80">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 pl-10 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            {search && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 border-b border-gray-200 mb-8 scrollbar-none">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
              category === cat.value
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-white border-gray-250 text-gray-700 hover:bg-gray-50 hover:border-gray-350'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader className="animate-spin text-indigo-600 mb-3" size={36} />
          <span>Fetching products...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-xl p-8 text-red-800">
          <p className="font-semibold mb-3">{error}</p>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl bg-gray-50">
          <Filter className="text-gray-400 mx-auto mb-3" size={40} />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto px-4">
            Try adjusting your search criteria or select a different category to see available campus items.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistedIds.has(product.id)}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
