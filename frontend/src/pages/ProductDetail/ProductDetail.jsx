import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductGallery from './sections/ProductGallery';
import ProductInfo from './sections/ProductInfo';
import RecommendedProducts from './sections/RecommendedProducts';
import Reviews from './sections/Reviews';
import TransparentPricing from './sections/TransparentPricing';

// Mock products database - Trong thực tế sẽ lấy từ API
const productsDatabase = [
  {
    id: 1,
    name: 'The Cloud Relaxed Cardigan',
    category: 'Women / Sweaters & Cardigans',
    price: 132,
    originalPrice: 188,
    discount: '30% off',
    rating: 4.5,
    reviewCount: 28,
    colorName: 'Black',
    colors: [
      { name: "Black", value: "#514535" },
      { name: "Charcoal", value: "#3A3840" },
      { name: "Brown", value: "#8C7058" }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800&h=1000&fit=crop"
    ],
    description: "The Cloud Relaxed Cardigan is your new go-to for effortless style. Made with premium materials and designed for ultimate comfort, this cardigan features a relaxed fit that's perfect for layering. Crafted with sustainable practices and eco-friendly materials.",
    model: "Model is 5'9\", wearing a size S"
  },
  {
    id: 2,
    name: 'The Organic Cotton Long-Sleeve Turtleneck',
    category: 'Women / Tops & Tees',
    price: 40,
    originalPrice: 50,
    discount: '20% off',
    rating: 4.8,
    reviewCount: 45,
    colorName: 'Black',
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Grey", value: "#808080" },
      { name: "Tan", value: "#8B7355" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1000&fit=crop"
    ],
    description: "Made from 100% organic cotton, this turtleneck is soft, sustainable, and stylish. Perfect for layering or wearing on its own, it features a classic silhouette that never goes out of style. GOTS certified organic cotton.",
    model: "Model is 5'10\", wearing a size M"
  },
  {
    id: 3,
    name: 'The Wool Flannel Pant',
    category: 'Women / Pants',
    price: 97,
    originalPrice: 130,
    discount: '30% off',
    rating: 4.6,
    reviewCount: 32,
    colorName: 'Charcoal',
    colors: [
      { name: "Charcoal", value: "#000000" },
      { name: "Navy", value: "#2F4F4F" }
    ],
    sizes: ["24", "25", "26", "27", "28", "29", "30", "31", "32"],
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1000&fit=crop"
    ],
    description: "Crafted from premium wool flannel, these pants offer warmth, style, and sustainability. Features a tailored fit with a comfortable waist and clean lines. Made with GRS-certified recycled wool.",
    model: "Model is 5'9\", wearing a size 27"
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('');
  
  // Lấy product từ database dựa trên ID
  const product = productsDatabase.find(p => p.id === parseInt(id)) || productsDatabase[0];
  
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Black');

  return (
    <div className="bg-white w-full">
      {/* Product Details Section */}
      <div className="flex gap-6 px-20 py-8">
        <ProductGallery images={product.images} discount={product.discount} />
        <ProductInfo
          product={product}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
      </div>

      {/* Recommended Products Section */}
      <RecommendedProducts currentProductId={product.id} />

      {/* Reviews Section */}
      <Reviews />

      {/* Transparent Pricing Section */}
      <TransparentPricing />
    </div>
  );
};

export default ProductDetail;
