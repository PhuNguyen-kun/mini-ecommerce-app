import { useState } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

const FilterSidebar = () => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    color: true,
    size: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const categories = [
    'Outerwear, All Gender Collection',
    'Accessories & Gift Cards',
    'Backpacks, Weekenders & More',
    'Jeans, Pants & Shorts',
    'Dress Shirts & Button Downs',
    'Outerwear, All Gender Collection',
    'Accessories & Gift Cards',
    'Backpacks, Weekenders & More',
    'Jeans, Pants & Shorts',
    'Dress Shirts & Button Downs'
  ];

  const colors = [
    { name: 'Black', color: '#1A1A1A' },
    { name: 'Blue', color: '#21558D' },
    { name: 'Brown', color: '#925C37' },
    { name: 'Green', color: '#585B45' },
    { name: 'Grey', color: '#E1E1E3' },
    { name: 'Orange', color: '#D38632' },
    { name: 'Pink', color: '#EFCEC9' },
    { name: 'Red', color: '#BD2830' },
    { name: 'Tan', color: '#B3A695' }
  ];

  const waistSizes = ['28', '30', '32', '34', '36', '38', '40', '42'];
  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

  return (
    <div className="w-[196px] shrink-0">
      {/* Product Count */}
      <div className="py-4">
        <p className="text-xs text-gray-600">249 Products</p>
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
            <div className="h-[169px] overflow-y-auto space-y-3 mb-2">
              {categories.map((cat, index) => (
                <label key={index} className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span className="text-xs text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
            <button className="text-xs text-gray-700 hover:underline">View More +</button>
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
            <div className="grid grid-cols-3 gap-4">
              {colors.map((color, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <button 
                    className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color.color }}
                  />
                  <span className="text-xs text-gray-700">{color.name}</span>
                </div>
              ))}
            </div>
            <button className="text-xs text-gray-700 hover:underline mt-4">View More +</button>
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
          <div className="space-y-4">
            {/* Waist Sizes */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Waist</p>
              <div className="grid grid-cols-4 gap-2">
                {waistSizes.map((size) => (
                  <button 
                    key={size}
                    className="border border-gray-300 px-2 py-2 text-xs hover:border-black transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Clothing Sizes */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Clothing</p>
              <div className="grid grid-cols-4 gap-2">
                {clothingSizes.map((size) => (
                  <button 
                    key={size}
                    className="border border-gray-300 px-2 py-2 text-xs hover:border-black transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
