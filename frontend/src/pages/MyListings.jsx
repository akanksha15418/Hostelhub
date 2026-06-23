import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService, productService } from '../services/api';
import { Edit2, Trash2, CheckCircle, RotateCcw, PlusCircle, Loader, AlertCircle } from 'lucide-react';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getListings();
      setListings(data);
    } catch (err) {
      setError('Failed to fetch your product listings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE';
    setActionLoadingId(id);
    try {
      await productService.updateStatus(id, nextStatus);
      // Update state locally for instant response
      setListings(
        listings.map((item) =>
          item.id === id ? { ...item, status: nextStatus } : item
        )
      );
    } catch (err) {
      console.error('Failed to change product status: ', err);
      alert('Failed to update product status. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) {
      return;
    }

    setActionLoadingId(id);
    try {
      await productService.delete(id);
      setListings(listings.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete listing: ', err);
      alert('Failed to delete the listing. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Product Listings</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage, edit, delete, or mark your listings as sold.</p>
        </div>
        <Link
          to="/add-product"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors text-sm shadow-sm"
        >
          <PlusCircle size={16} />
          List New Item
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader className="animate-spin text-indigo-600 mb-3" size={36} />
          <span>Fetching your listings...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 border border-red-200 rounded-xl p-8 text-red-800 max-w-md mx-auto">
          <AlertCircle className="mx-auto mb-2 text-red-700" size={36} />
          <p className="font-semibold mb-3">{error}</p>
          <button onClick={fetchMyListings} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-xs">
            Retry
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl bg-gray-50 max-w-3xl mx-auto">
          <PlusCircle className="text-gray-300 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No listings yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 px-4">
            Declutter your room and turn your old items, notes, or snacks into cash! List them on campus.
          </p>
          <Link
            to="/add-product"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((product) => {
            const isSold = product.status === 'SOLD';
            const isWorking = actionLoadingId === product.id;

            return (
              <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full relative">
                {/* Image & Sold Overlay */}
                <div className="aspect-[4/3] bg-gray-50 relative border-b border-gray-100 overflow-hidden">
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
                      <span className="bg-gray-800 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded border border-gray-700 shadow">
                        Sold Out
                      </span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 text-xs font-semibold px-2 py-0.5 rounded text-indigo-600 shadow-sm border border-indigo-50">
                    {product.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-grow flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Condition: {product.condition}</span>
                  <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 text-base">
                    <Link to={`/product/${product.id}`} className="hover:text-indigo-600">
                      {product.title}
                    </Link>
                  </h3>
                  <div className="text-lg font-black text-indigo-600 mb-4">
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>

                  {/* Actions Grid */}
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                    {/* Mark Sold/Available Toggle */}
                    <button
                      onClick={() => handleStatusChange(product.id, product.status)}
                      disabled={isWorking}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                        isSold
                          ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                          : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isSold ? (
                        <>
                          <RotateCcw size={14} />
                          Re-list Item
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          Mark as Sold
                        </>
                      )}
                    </button>

                    {/* Edit */}
                    <Link
                      to={`/edit-product/${product.id}`}
                      className="border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors text-center"
                    >
                      <Edit2 size={14} />
                      Edit Details
                    </Link>

                    {/* Delete (Span Full width in second row) */}
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={isWorking}
                      className="col-span-2 border border-red-200 hover:bg-red-50 text-red-600 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Delete Listing
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyListings;
