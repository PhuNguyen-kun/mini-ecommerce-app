import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../config/api';

// Default category images from Unsplash
const categoryImages = {
  'ao-len': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
  'quan': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
  'giay-boots': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400',
  'dam-vay': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
  'giay-bet-giay-cao-got': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
  'ao-khoac': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
  'tui-xach': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
  'ao-thun-ao-ba-lo': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
  'ao-tren': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
};

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CATEGORIES.LIST);
        const data = await response.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="w-full px-10 py-[90px]">
        <h2 className="text-[34px] font-normal mb-[55px] text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-6 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full h-[263px] bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-10 py-[90px]">
      <h2 className="text-[34px] font-normal mb-[55px] text-center">
        Shop by Category
      </h2>
      
      <div className="grid grid-cols-6 gap-5">
        {categories.slice(0, 6).map((category) => (
          <Link 
            key={category.id} 
            to={`/products?category=${category.id}`}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-full h-[263px] rounded-lg overflow-hidden mb-3 bg-gray-100">
              <img 
                src={categoryImages[category.slug] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400'} 
                alt={category.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-center font-medium tracking-wide">
              {category.name.toUpperCase()}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
