import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { PlusCircle, Image, Loader, AlertCircle } from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !price || !category || !condition || !imageFile) {
      setError('Please fill in all fields and select a product image');
      return;
    }

    if (parseFloat(price) < 0) {
      setError('Price cannot be negative');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', parseFloat(price));
    formData.append('category', category);
    formData.append('condition', condition);
    formData.append('image', imageFile);

    setLoading(true);
    try {
      await productService.create(formData);
      navigate('/marketplace');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to add product. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 min-h-[85vh]">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <PlusCircle className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">List a New Product</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Title
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="e.g. HC Verma Physics Volume 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
            />
          </div>

          {/* Grid for Price, Category, Condition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                required
                min={0}
                placeholder="e.g. 150"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 bg-white"
              >
                <option value="">Select Category</option>
                <optgroup label="Academic">
                  <option value="Academic">Books & Notes</option>
                  <option value="Academic">Scientific Calculator</option>
                  <option value="Academic">Drafter / Instruments</option>
                </optgroup>
                <optgroup label="Hostel Essentials">
                  <option value="Hostel Essentials">Mattress & Pillow</option>
                  <option value="Hostel Essentials">Bucket & Mug</option>
                  <option value="Hostel Essentials">Hangers / Storage</option>
                  <option value="Hostel Essentials">Extension Board / Lamp</option>
                </optgroup>
                <optgroup label="Electronics">
                  <option value="Electronics">Headphones & Speakers</option>
                  <option value="Electronics">Mouse & Keyboard</option>
                  <option value="Electronics">Power Bank / Chargers</option>
                </optgroup>
                <optgroup label="Snacks">
                  <option value="Snacks">Instant Maggi & Chips</option>
                  <option value="Snacks">Biscuits & Chocolates</option>
                  <option value="Snacks">Drinks & Instant Coffee</option>
                </optgroup>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                required
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 bg-white"
              >
                <option value="">Select Condition</option>
                <option value="New">New (Unopened)</option>
                <option value="Like New">Like New (Barely Used)</option>
                <option value="Good">Good (Working fine)</option>
                <option value="Fair">Fair (Wear & tear)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              rows={4}
              maxLength={1000}
              placeholder="Describe your product details: purchase date, condition notes, availability details etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Image
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 border-dashed rounded-xl px-4 py-6 cursor-pointer text-gray-500 hover:text-gray-700 flex-grow text-center text-sm">
                <Image size={20} className="text-gray-400" />
                <span>Choose product image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">Maximum file size: 5MB. Only image files supported.</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors text-sm shadow-sm flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={16} />
                Uploading & Creating...
              </>
            ) : (
              'Create Product Listing'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
