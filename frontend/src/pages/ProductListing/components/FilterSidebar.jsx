import { useState, useEffect } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import productService from '../../../services/productService';

const FilterSidebar = ({ totalProducts = 0, gender, availableFilters, onFiltersChange, selectedFilters, onSelectedFiltersChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    color: true,
    size: true
  });
  const [loading, setLoading] = useState(true);

  // Fetch available filters from API
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        const filters = await productService.getAvailableFilters(gender);
        if (onFiltersChange) {
          onFiltersChange(filters);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      } finally {
        setLoading(false);
      }
    };

    if (gender) {
      fetchFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender]); // Only re-fetch when gender changes

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categoryId) => {
    const newCategoryIds = selectedFilters?.categoryIds?.includes(categoryId)
      ? selectedFilters.categoryIds.filter(id => id !== categoryId)
      : [...(selectedFilters?.categoryIds || []), categoryId];
    
    onSelectedFiltersChange({
      ...selectedFilters,
      categoryIds: newCategoryIds
    });
  };

  const handleColorChange = (colorName) => {
    const newColors = selectedFilters?.colors?.includes(colorName)
      ? selectedFilters.colors.filter(c => c !== colorName)
      : [...(selectedFilters?.colors || []), colorName];
    
    onSelectedFiltersChange({
      ...selectedFilters,
      colors: newColors
    });
  };

  const handleSizeChange = (sizeName) => {
    const newSizes = selectedFilters?.sizes?.includes(sizeName)
      ? selectedFilters.sizes.filter(s => s !== sizeName)
      : [...(selectedFilters?.sizes || []), sizeName];
    
    onSelectedFiltersChange({
      ...selectedFilters,
      sizes: newSizes
    });
  };

  // Color mapping for display
  const colorMap = {
    'Black': '#1A1A1A',
    'Blue': '#21558D',
    'Brown': '#925C37',
    'Green': '#585B45',
    'Grey': '#E1E1E3',
    'Gray': '#E1E1E3',
    'Orange': '#D38632',
    'Pink': '#EFCEC9',
    'Red': '#BD2830',
    'Tan': '#B3A695',
    'White': '#FFFFFF',
    'Yellow': '#F4E04D',
    'Purple': '#8B5A8F',
    'Navy': '#1C3F6C',
    'Beige': '#D9C9B0',
    // Vietnamese colors
    'Đen': '#1A1A1A',
    'Trắng': '#FFFFFF',
    'Đỏ': '#BD2830',
    'Xanh Navy': '#1C3F6C',
    'Xanh Dương': '#21558D',
    'Xám': '#9CA3AF',
    'Be': '#D9C9B0',
    'Hồng': '#EFCEC9'
  };

  const getColorHex = (colorName) => {
    return colorMap[colorName] || '#CCCCCC';
  };

  const categories = availableFilters?.categories || [];
  const colors = availableFilters?.colors || [];
  const sizes = availableFilters?.sizes || [];

  // Separate sizes into waist and clothing sizes
  const waistSizes = sizes.filter(s => /^\d+$/.test(s.name)).sort((a, b) => parseInt(a.name) - parseInt(b.name));
  const clothingSizes = sizes.filter(s => /^[A-Z]+$/.test(s.name));

  return (
    <div className="w-[196px] shrink-0">
      {/* Product Count */}
      <div className="py-4">
        <p className="text-xs text-gray-600">
          {loading ? 'Loading...' : `${totalProducts} ${totalProducts === 1 ? 'Product' : 'Products'}`}
        </p>
      </div>

      {/* Category Section */}
      <div className="border-t border-gray-200 py-4">
        <button 
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="text-sm font-semibold">Category</h3>
          {expandedSections.category ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </button>
        {expandedSections.category && (
          <>
            {loading ? (
              <p className="text-xs text-gray-500">Loading...</p>
            ) : categories.length > 0 ? (
              <>
                <div className="h-[169px] overflow-y-auto space-y-3 mb-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-start gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="mt-1"
                        checked={selectedFilters?.categoryIds?.includes(cat.id) || false}
                        onChange={() => handleCategoryChange(cat.id)}
                      />
                      <span className="text-xs text-gray-700 flex-1">{cat.name}</span>
                      <span className="text-xs text-gray-500">({cat.count})</span>
                    </label>
                  ))}
                </div>
                {categories.length > 10 && (
                  <button className="text-xs text-gray-700 hover:underline">View More +</button>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500">No categories available</p>
            )}
          </>
        )}
      </div>

      {/* Color Section */}
      <div className="border-t border-gray-200 py-4">
        <button 
          onClick={() => toggleSection('color')}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="text-sm font-semibold">Color</h3>
          {expandedSections.color ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </button>
        {expandedSections.color && (
          <>
            {loading ? (
              <p className="text-xs text-gray-500">Loading...</p>
            ) : colors.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {colors.slice(0, 9).map((color, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <button 
                        className={`w-6 h-6 rounded-full border-2 transition-colors ${
                          selectedFilters?.colors?.includes(color.name) 
                            ? 'border-black ring-2 ring-black ring-offset-2' 
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: getColorHex(color.name) }}
                        title={`${color.name} (${color.count})`}
                        onClick={() => handleColorChange(color.name)}
                      />
                      <span className="text-xs text-gray-700 text-center">{color.name}</span>
                      <span className="text-[10px] text-gray-500">({color.count})</span>
                    </div>
                  ))}
                </div>
                {colors.length > 9 && (
                  <button className="text-xs text-gray-700 hover:underline mt-4">View More +</button>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500">No colors available</p>
            )}
          </>
        )}
      </div>

      {/* Size Section */}
      <div className="border-t border-gray-200 py-4">
        <button 
          onClick={() => toggleSection('size')}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="text-sm font-semibold">Size</h3>
          {expandedSections.size ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </button>
        {expandedSections.size && (
          <>
            {loading ? (
              <p className="text-xs text-gray-500">Loading...</p>
            ) : (
              <div className="space-y-4">
                {/* Waist Sizes */}
                {waistSizes.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Waist</p>
                    <div className="grid grid-cols-4 gap-2">
                      {waistSizes.map((size) => (
                        <button 
                          key={size.name}
                          className={`border px-2 py-2 text-xs transition-colors relative ${
                            selectedFilters?.sizes?.includes(size.name)
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 hover:border-black'
                          }`}
                          title={`${size.count} products`}
                          onClick={() => handleSizeChange(size.name)}
                        >
                          {size.name}
                          <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                            {size.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clothing Sizes */}
                {clothingSizes.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Clothing</p>
                    <div className="grid grid-cols-4 gap-2">
                      {clothingSizes.map((size) => (
                        <button 
                          key={size.name}
                          className={`border px-2 py-2 text-xs transition-colors relative ${
                            selectedFilters?.sizes?.includes(size.name)
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 hover:border-black'
                          }`}
                          title={`${size.count} products`}
                          onClick={() => handleSizeChange(size.name)}
                        >
                          {size.name}
                          <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                            {size.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {waistSizes.length === 0 && clothingSizes.length === 0 && (
                  <p className="text-xs text-gray-500">No sizes available</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
