import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, isWishlisted, onWishlistToggle }) => {
  const { isAuthenticated } = useAuth();

  const handleWishlistClick = (e) => {
    e.preventDefault(); // Prevent navigating to product details page
    e.stopPropagation();
    onWishlistToggle(product.id);
  };

  const isSold = product.status === 'SOLD';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full group">
      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=600&auto=format&fit=crop&q=60';
          }}
        />
        {/* SOLD Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-md uppercase tracking-wider text-sm shadow">
              Sold
            </span>
          </div>
        )}
        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-indigo-600 border border-indigo-100 shadow-sm">
          {product.category}
        </span>
      </Link>

      {/* Wishlist Button */}
      {!isSold && (
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 hover:scale-110 transition-all"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
        </button>
      )}

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
          Condition: {product.condition}
        </span>
        <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 text-base hover:text-indigo-600">
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h3>
        
        {/* Price */}
        <div className="text-lg font-extrabold text-indigo-600 mb-3">
          ₹{product.price.toLocaleString('en-IN')}
        </div>

        {/* Footer Info */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin size={12} className="flex-shrink-0 text-gray-400" />
            <span className="truncate">{product.seller?.hostel || 'Hostel'}</span>
          </div>
          <span className="text-gray-400 whitespace-nowrap">
            {new Date(product.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
