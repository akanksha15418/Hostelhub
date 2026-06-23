import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService, wishlistService } from '../services/api';
import { MessageSquare, Heart, Calendar, MapPin, Tag, Shield, Edit, ArrowLeft, Loader } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productService.getById(id);
      setProduct(data);
      
      // If user is logged in, check if product is in their wishlist
      if (isAuthenticated) {
        const check = await wishlistService.check(id);
        setIsWishlisted(check.isWishlisted);
      }
    } catch (err) {
      setError('Product not found or failed to load details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistService.remove(product.id);
        setIsWishlisted(false);
      } else {
        await wishlistService.add(product.id);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist: ', err);
    }
  };

  // Generate WhatsApp contact link
  const getWhatsAppLink = () => {
    if (!product || !product.seller) return '#';
    
    let phone = product.seller.phone.replace(/\D/g, ''); // Remove non-digits
    
    // Auto-prepend +91 for standard Indian 10-digit numbers
    if (phone.length === 10) {
      phone = '91' + phone;
    } else if (phone.length === 12 && phone.startsWith('91')) {
      // Already has 91, keep it
    } else {
      // fallback if length is different
      phone = '91' + phone;
    }

    const text = `Hi, I saw your listing for "${product.title}" (Price: ₹${product.price}) on HostelHub. Is it still available?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-500">
        <Loader className="animate-spin text-indigo-600 mb-3" size={36} />
        <span>Loading product details...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center border border-gray-250 bg-gray-50 p-8 rounded-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error loading details</h3>
        <p className="text-gray-500 mb-6">{error || 'Product details not found'}</p>
        <Link to="/marketplace" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user && product.seller && user.id === product.seller.id;
  const isSold = product.status === 'SOLD';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[85vh]">
      {/* Back Link */}
      <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 mb-6 font-medium transition-colors">
        <ArrowLeft size={16} />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-white border border-gray-200 rounded-2xl overflow-hidden p-6 md:p-8 shadow-sm">
        {/* Left Side: Product Image */}
        <div className="relative aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden border border-gray-150 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=600&auto=format&fit=crop&q=60';
            }}
          />
          {isSold && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-red-600 text-white font-bold px-6 py-2 rounded-md uppercase tracking-wider text-base shadow-lg">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Info */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Title & Wishlist */}
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                  <Tag size={12} />
                  {product.category}
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{product.title}</h1>
              </div>

              {!isSold && (
                <button
                  onClick={handleWishlistToggle}
                  className="p-2.5 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 hover:scale-105 transition-all flex-shrink-0"
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                </button>
              )}
            </div>

            {/* Price */}
            <div className="text-3xl font-black text-indigo-600 mb-6">
              ₹{product.price.toLocaleString('en-IN')}
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 pt-5 mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>

            {/* Product Meta */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-gray-400" />
                <span>Condition: <span className="font-semibold text-gray-900">{product.condition}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>Listed: <span className="font-semibold text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span></span>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Seller Details</h3>
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-gray-900 text-base">{product.seller?.name}</div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{product.seller?.hostel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            {isOwner ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to={`/edit-product/${product.id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
                >
                  <Edit size={16} />
                  Edit Listing
                </Link>
                <Link
                  to="/my-listings"
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg text-center transition-colors text-sm"
                >
                  Manage Listings
                </Link>
              </div>
            ) : isSold ? (
              <button
                disabled
                className="w-full bg-gray-150 text-gray-400 font-bold py-3 rounded-lg text-sm cursor-not-allowed"
              >
                Item Sold Out
              </button>
            ) : (
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm shadow-md"
              >
                <MessageSquare size={18} />
                Contact Seller (WhatsApp)
              </a>
            )}
            <p className="text-center text-xs text-gray-500 mt-3 leading-tight">
              {isOwner ? "This is your product listing." : "Clicking will open WhatsApp to message the seller. Transact safely on campus."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
