import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FilterSidebar from './components/FilterSidebar';
import ProductGrid from './components/ProductGrid';

const ProductListing = () => {
  const location = useLocation();
  const isMenPage = location.pathname === '/men';
  const category = isMenPage ? 'Men' : 'Women';
  const gender = isMenPage ? 'male' : 'female';
  const [totalProducts, setTotalProducts] = useState(0);
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

  // Reset selected filters when changing between Men/Women pages
  useEffect(() => {
    setSelectedFilters({
      categoryIds: [],
      colors: [],
      sizes: []
    });
  }, [gender]);

  return (
    <div className="bg-white w-full">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-4 px-4 sm:px-6 md:px-10 lg:px-20 py-4 sm:py-5 lg:py-7">
        <FilterSidebar 
          totalProducts={totalProducts} 
          gender={gender}
          availableFilters={filters}
          onFiltersChange={setFilters}
          selectedFilters={selectedFilters}
          onSelectedFiltersChange={setSelectedFilters}
        />
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
