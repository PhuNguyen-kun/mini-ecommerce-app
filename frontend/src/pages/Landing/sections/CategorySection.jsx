import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
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
  const scrollContainerRef = useRef(null);

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

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
      <section className="w-full px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-[90px]">
        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-normal mb-8 sm:mb-12 lg:mb-[55px] text-center font-['Maison_Neue']">
          Shop by Category
        </h2>
        <div className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[150px] sm:w-[180px] lg:w-[200px] animate-pulse">
              <div className="w-full h-[180px] sm:h-[220px] lg:h-[263px] bg-gray-200 rounded-lg mb-2 sm:mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-[90px]">
      <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-normal mb-8 sm:mb-12 lg:mb-[55px] text-center font-['Maison_Neue']">
        Shop by Category
      </h2>
      
      {/* Carousel Container */}
      <div className="relative flex items-center gap-2 sm:gap-3">
        {/* Left Arrow */}
        <button 
          onClick={scrollLeft}
          className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center hover:bg-gray-100 transition-colors rounded-full flex-shrink-0 z-10"
          aria-label="Scroll left"
        >
          <HiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Categories Carousel */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.id}`}
              className="flex-shrink-0 w-[150px] sm:w-[180px] lg:w-[200px] cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-full h-[180px] sm:h-[220px] lg:h-[263px] rounded-lg overflow-hidden mb-2 sm:mb-3 bg-gray-100">
                <img 
                  src={categoryImages[category.slug] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400'} 
                  alt={category.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs sm:text-sm text-center font-medium tracking-wide font-['Maison_Neue']">
                {category.name.toUpperCase()}
              </p>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={scrollRight}
          className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center hover:bg-gray-100 transition-colors rounded-full flex-shrink-0 z-10"
          aria-label="Scroll right"
        >
          <HiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </section>
  );
}
