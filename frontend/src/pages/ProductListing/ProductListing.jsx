import { useLocation } from 'react-router-dom';
import FilterSidebar from './components/FilterSidebar';
import ProductGrid from './components/ProductGrid';

const ProductListing = () => {
  const location = useLocation();
  const isMenPage = location.pathname === '/men';
  const category = isMenPage ? 'Men' : 'Women';

  return (
    <div className="bg-white w-full">
      <div className="flex gap-4 px-20 py-7">
        <FilterSidebar />
        <ProductGrid category={category} />
      </div>
    </div>
  );
};

export default ProductListing;
