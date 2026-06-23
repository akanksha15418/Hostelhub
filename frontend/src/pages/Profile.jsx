import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, wishlistService } from '../services/api';
import { User, Mail, Phone, Home, Calendar, LogOut, Loader, ShoppingBag, Heart, Edit2, Check, X, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [listingCount, setListingCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Mode states
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hostel, setHostel] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      // Sync local profile details with backend
      await refreshProfile();
      
      // Fetch profile data, listings, and wishlist concurrently
      const [profileData, listings, wishlist] = await Promise.all([
        userService.getProfile(),
        userService.getListings(),
        wishlistService.getAll()
      ]);

      setProfile(profileData);
      setName(profileData.name);
      setPhone(profileData.phone);
      setHostel(profileData.hostel);

      setListingCount(listings.length);
      setWishlistCount(wishlist.length);
    } catch (err) {
      setError('Failed to load user profile dashboard details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setSuccessMessage('');

    if (!name.trim() || !phone.trim() || !hostel.trim()) {
      setEditError('Please fill in all fields');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setEditError('Phone number must be at least 10 digits long');
      return;
    }

    setEditLoading(true);
    try {
      const updatedProfile = await userService.updateProfile({
        name: name.trim(),
        phone: cleanPhone,
        hostel: hostel.trim()
      });

      setProfile(updatedProfile);
      setName(updatedProfile.name);
      setPhone(updatedProfile.phone);
      setHostel(updatedProfile.hostel);
      
      // Sync local storage / AuthContext user
      await refreshProfile();
      
      setSuccessMessage('Profile updated successfully!');
      setEditMode(false);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setEditError(
        err.response?.data?.message || 
        'Failed to update profile details. Phone number might already be in use.'
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setHostel(profile.hostel);
    }
    setEditError('');
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-500">
        <Loader className="animate-spin text-indigo-600 mb-3" size={36} />
        <span>Loading profile data...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto my-16 text-center border border-gray-250 bg-gray-50 p-8 rounded-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error loading dashboard</h3>
        <p className="text-gray-500 mb-6">{error || 'User details not found'}</p>
        <button onClick={fetchProfileData} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 min-h-[80vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">View your account details and marketplace activity.</p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm">
          <Check size={18} className="flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Profile Details / Edit Form */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-start pb-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl uppercase border border-indigo-200">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">{profile.name}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-600 inline-block mt-1">
                  Student Account
                </span>
              </div>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-semibold border border-gray-255 px-3 py-1.5 rounded-lg hover:border-indigo-200 transition-all"
              >
                <Edit2 size={14} />
                Edit Profile
              </button>
            )}
          </div>

          {editError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          {editMode ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-r-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Hostel & Room details
                </label>
                <input
                  type="text"
                  required
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors text-sm disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={editLoading}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={18} className="text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email Address</div>
                  <div className="font-semibold text-gray-800">{profile.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={18} className="text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Phone Number</div>
                  <div className="font-semibold text-gray-800">+91 {profile.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Home size={18} className="text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Hostel & Room</div>
                  <div className="font-semibold text-gray-800">{profile.hostel}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Member Since</div>
                  <div className="font-semibold text-gray-800">
                    {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!editMode && (
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleLogoutClick}
                className="border border-red-200 hover:bg-red-50 text-red-600 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm w-full sm:w-auto"
              >
                <LogOut size={16} />
                Logout Account
              </button>
            </div>
          )}
        </div>

        {/* Right Card: Activity Stats */}
        <div className="space-y-4">
          {/* Listings Stat Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Active Listings</span>
              <span className="text-3xl font-black text-indigo-600 mt-1 block">{listingCount}</span>
              <Link to="/my-listings" className="text-xs text-indigo-600 font-semibold hover:underline mt-2 inline-block">
                Manage listings &rarr;
              </Link>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <ShoppingBag size={24} />
            </div>
          </div>

          {/* Wishlist Stat Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Wishlisted Items</span>
              <span className="text-3xl font-black text-red-500 mt-1 block">{wishlistCount}</span>
              <Link to="/wishlist" className="text-xs text-indigo-600 font-semibold hover:underline mt-2 inline-block">
                View wishlist &rarr;
              </Link>
            </div>
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500">
              <Heart size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
