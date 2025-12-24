import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import ProductGallery from './sections/ProductGallery';
import ProductInfo from './sections/ProductInfo';
import RecommendedProducts from './sections/RecommendedProducts';
import Reviews from './sections/Reviews';
import TransparentPricing from './sections/TransparentPricing';

const ProductDetail = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const reviewsRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await productService.getProductBySlug(slug);
        
        if (response.success) {
          const productData = response.data;
          console.log('Product Data:', productData);
          console.log('Variants:', productData.variants);
          setProduct(productData);
          
          // Extract available colors and sizes from variants
          const colors = new Set();
          const sizes = new Set();
          
          productData.variants?.forEach(variant => {
            console.log('Variant:', variant);
            variant.option_values?.forEach(optVal => {
              console.log('Option Value:', optVal);
              const optionName = optVal.option?.name?.toLowerCase();
              if (optionName === 'màu sắc' || optionName === 'color') {
                colors.add(optVal.value);
              } else if (optionName === 'kích cỡ' || optionName === 'size') {
                sizes.add(optVal.value);
              }
            });
          });
          
          console.log('Colors:', Array.from(colors));
          console.log('Sizes:', Array.from(sizes));
          
          // Set default selections
          if (colors.size > 0) setSelectedColor(Array.from(colors)[0]);
          if (sizes.size > 0) setSelectedSize(Array.from(sizes)[0]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Handle scroll to reviews and open modal when review query param is present
  useEffect(() => {
    if (product && searchParams.get('review') === 'true') {
      // Wait for reviews section to render
      setTimeout(() => {
        if (reviewsRef.current) {
          reviewsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
    }
  }, [product, searchParams]);

  if (loading) {
    return (
      <div className="bg-white w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <a href="/" className="text-blue-600 hover:underline">Return to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full">
      {/* Product Details Section */}
      <div className="flex gap-6 px-20 py-8">
        <ProductGallery 
          images={product.images || []} 
          discount={product.discount}
        />
        <ProductInfo
          product={product}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
      </div>

      {/* Recommended Products Section */}
      <RecommendedProducts 
        currentProductId={product.id}
        gender={product.gender}
        categoryId={product.category_id}
      />

      {/* Reviews Section */}
      <div ref={reviewsRef}>
        <Reviews 
          productId={product.id} 
          autoOpenModal={searchParams.get('review') === 'true'}
          onModalClose={() => {
            // Remove review query param when modal closes
            if (searchParams.get('review') === 'true') {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete('review');
              setSearchParams(newSearchParams, { replace: true });
            }
          }}
        />
      </div>

      {/* Transparent Pricing Section */}
      <TransparentPricing />
    </div>
  );
};

export default ProductDetail;
