import React, { useState, useEffect } from 'react';
import { wishlistService } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Heart, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await wishlistService.getAll();
      setProducts(data);
    } catch (err) {
      setError('Failed to load wishlist items.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (productId) => {
    try {
      await wishlistService.remove(productId);
      // Directly filter out the removed item from state for smooth UI transition
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist: ', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Heart className="text-red-500 fill-red-500" size={28} />
          My Wishlist
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Products you saved for later contact.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader className="animate-spin text-indigo-600 mb-3" size={36} />
          <span>Loading wishlist...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 border border-red-200 rounded-xl p-8 text-red-800 max-w-md mx-auto">
          <p className="font-semibold">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl bg-gray-50 max-w-3xl mx-auto">
          <Heart className="text-gray-300 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Your wishlist is empty</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 px-4">
            Tap the heart icon on any product card in the marketplace to add it to your wishlist.
          </p>
          <Link
            to="/marketplace"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={true} // They are all wishlisted on this page
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
