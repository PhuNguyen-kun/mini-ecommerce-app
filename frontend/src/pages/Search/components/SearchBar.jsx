import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <section className="w-full px-4 sm:px-[156px] lg:px-[326px] py-8 border-b border-gray-200 bg-white">
      <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-black focus-within:bg-white transition-all">
              <HiMagnifyingGlass className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..." 
                className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none placeholder:text-gray-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <HiXMark className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              type="submit"
              disabled={!searchQuery.trim()}
              className="px-6 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Tìm kiếm
            </button>
            <button 
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
