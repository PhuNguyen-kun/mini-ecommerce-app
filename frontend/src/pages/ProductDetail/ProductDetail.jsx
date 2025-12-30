import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import productService from '../../services/productService';
import ProductGallery from './sections/ProductGallery';
import ProductInfo from './sections/ProductInfo';
import RecommendedProducts from './sections/RecommendedProducts';
import Reviews from './sections/Reviews';
import TransparentPricing from './sections/TransparentPricing';

const ProductDetail = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const reviewsRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // State cho gallery ảnh
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColorId, setSelectedColorId] = useState(null); // Track color option value ID

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productService.getProductBySlug(slug);

        if (response.success) {
          const productData = response.data;
          setProduct(productData);

          // Extract available colors and sizes from variants
          const colors = new Set();
          const sizes = new Set();

          productData.variants?.forEach(variant => {
            variant.option_values?.forEach(optVal => {
              const optionName = optVal.option?.name?.toLowerCase();
              if (optionName === 'màu sắc' || optionName === 'color') {
                colors.add(optVal.value);
              } else if (optionName === 'kích cỡ' || optionName === 'size') {
                sizes.add(optVal.value);
              }
            });
          });

          // Không tự động chọn màu/size, để user tự chọn
          // Gallery sẽ hiển thị tất cả ảnh khi chưa chọn màu
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

  // Tự động tìm variant khi chọn màu/size
  useEffect(() => {
    if (!product || !selectedColor || !selectedSize) {
      setSelectedVariant(null);
      return;
    }

    // Tìm variant có cả màu và size đã chọn
    const matchedVariant = product.variants?.find(variant => {
      const hasColor = variant.option_values?.some(optVal =>
        (optVal.option?.name?.toLowerCase().includes('màu') ||
          optVal.option?.name?.toLowerCase().includes('color')) &&
        optVal.value === selectedColor
      );

      const hasSize = variant.option_values?.some(optVal =>
        (optVal.option?.name?.toLowerCase().includes('kích cỡ') ||
          optVal.option?.name?.toLowerCase().includes('size')) &&
        optVal.value === selectedSize
      );

      return hasColor && hasSize;
    });

    setSelectedVariant(matchedVariant || null);
  }, [selectedColor, selectedSize, product]);

  // Xử lý chọn màu → Nhảy ảnh và lọc ảnh theo màu
  const handleColorSelect = (color) => {
    setSelectedColor(color);

    // Nếu bỏ chọn màu (color = null), reset về hiển thị tất cả ảnh
    if (!color) {
      setSelectedColorId(null);
      setCurrentImageIndex(0);
      return;
    }

    // Tìm option value ID của màu này và jump đến ảnh tương ứng
    if (product?.options) {
      const colorOption = product.options.find(opt =>
        opt.name.toLowerCase().includes('màu') || opt.name.toLowerCase().includes('color')
      );

      if (colorOption) {
        const colorValue = colorOption.values?.find(val => val.value === color);

        if (colorValue) {
          setSelectedColorId(colorValue.id);

          // Tìm index của ảnh có product_option_value_id tương ứng
          if (product.images) {
            const imageIndex = product.images.findIndex(
              img => img.product_option_value_id === colorValue.id
            );

            if (imageIndex !== -1) {
              setCurrentImageIndex(imageIndex);
            }
          }
        }
      }
    }
  };

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
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 px-4 sm:px-6 md:px-10 lg:px-20 py-4 lg:py-8">
        <ProductGallery
          images={product.images || []} videos={product.videos} discount={product.discount}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          selectedColorId={selectedColorId}
        />
        <ProductInfo
          product={product}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedColor={selectedColor}
          setSelectedColor={handleColorSelect}
          selectedVariant={selectedVariant}
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
