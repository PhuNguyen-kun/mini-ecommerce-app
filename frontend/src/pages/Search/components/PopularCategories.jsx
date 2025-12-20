import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService from '../../../services/categoryService';
import productService from '../../../services/productService';

export default function PopularCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesWithImages = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();
        
        if (response.success) {
          // Get first 8 categories
          const categoriesData = response.data.slice(0, 8);
          
          // Fetch products for each category to get images
          const categoriesWithImages = await Promise.all(
            categoriesData.map(async (category) => {
              try {
                const productsResponse = await productService.getProducts({
                  category_ids: category.id,
                  limit: 1,
                  view: 'card'
                });
                
                // Handle both card mode (primary_image) and full mode (images[])
                const product = productsResponse.data?.products?.[0];
                const image = product?.primary_image ||
                             product?.images?.find(img => img.is_primary)?.image_url ||
                             product?.images?.[0]?.image_url;
                
                return {
                  ...category,
                  image
                };
              } catch (error) {
                console.error(`Error fetching products for category ${category.id}:`, error);
                return { ...category, image: null };
              }
            })
          );
          
          setCategories(categoriesWithImages);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithImages();
  }, []);

  if (loading) {
    return (
      <section className="w-full px-4 sm:px-[156px] py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="h-6 w-48 bg-gray-200 animate-pulse mb-8 rounded"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <div className="w-full h-[300px] bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-4 sm:px-[156px] py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-light text-gray-900 mb-8">
          Danh Mục Phổ Biến
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group flex flex-col gap-3 cursor-pointer"
            >
              <div className="w-full h-[300px] overflow-hidden rounded-lg bg-gray-100">
                {category.image ? (
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <span className="text-4xl font-light text-gray-400">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-gray-900 group-hover:underline">
                  {category.name}
                </p>
                {category.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
