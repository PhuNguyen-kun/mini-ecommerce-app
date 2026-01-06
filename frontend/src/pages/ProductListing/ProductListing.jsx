import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HiAdjustmentsHorizontal, HiXMark } from 'react-icons/hi2';
import FilterSidebar from './components/FilterSidebar';
import ProductGrid from './components/ProductGrid';

const ProductListing = () => {
  const location = useLocation();
  const isMenPage = location.pathname === '/men';
  const category = isMenPage ? 'Men' : 'Women';
  const gender = isMenPage ? 'male' : 'female';
  const [totalProducts, setTotalProducts] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [filters, setFilters] = useState({
    colors: [],
    sizes: [],
    categories: []
  });
  const [selectedFilters, setSelectedFilters] = useState({
    categoryIds: [],
    colors: [],
    sizes: []
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset selected filters when changing between Men/Women pages
  useEffect(() => {
    setSelectedFilters({
      categoryIds: [],
      colors: [],
      sizes: []
    });
  }, [gender]);

  // Prevent body scroll when filter is open on mobile
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterOpen]);

  return (
    <div className="bg-white w-full">
      {/* Mobile Filter Button */}
      {isMobile && (
        <div className="sticky top-[64px] z-40 bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <HiAdjustmentsHorizontal className="w-5 h-5" />
            Filters ({totalProducts} products)
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-4 px-4 sm:px-6 md:px-10 lg:px-20 py-4 sm:py-5 lg:py-7">
        {/* Desktop Sidebar - Always visible */}
        {!isMobile && (
          <FilterSidebar 
            totalProducts={totalProducts} 
            gender={gender}
            availableFilters={filters}
            onFiltersChange={setFilters}
            selectedFilters={selectedFilters}
            onSelectedFiltersChange={setSelectedFilters}
          />
        )}

        {/* Mobile Filter Modal/Drawer */}
        {isMobile && isFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)}>
            <div 
              className="absolute left-0 top-0 h-full w-[280px] bg-white overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={() => setIsFilterOpen(false)}>
                  <HiXMark className="w-6 h-6" />
                </button>
              </div>
              <FilterSidebar 
                totalProducts={totalProducts} 
                gender={gender}
                availableFilters={filters}
                onFiltersChange={setFilters}
                selectedFilters={selectedFilters}
                onSelectedFiltersChange={setSelectedFilters}
              />
            </div>
          </div>
        )}

        <ProductGrid 
          category={category} 
          gender={gender}
          onTotalChange={setTotalProducts}
          selectedFilters={selectedFilters}
        />
      </div>
    </div>
  );
};

export default ProductListing;
