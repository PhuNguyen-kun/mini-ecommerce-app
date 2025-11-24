import ProductCard from './ProductCard';

const ProductGrid = ({ category }) => {
  // Mock data - sẽ thay bằng API call
  const products = [
    {
      id: 1,
      image: '/src/assets/listing/product-1.png',
      name: 'The Cloud Relaxed Cardigan',
      price: 132,
      originalPrice: 188,
      discount: '30% off',
      colorName: 'Black',
      colors: ['#514535', '#3A3840', '#8C7058', '#262525']
    },
    {
      id: 2,
      image: '/src/assets/listing/product-2.png',
      name: 'The Organic Cotton Long-Sleeve Turtleneck',
      price: 40,
      originalPrice: 50,
      discount: '20% off',
      colorName: 'Black',
      colors: ['#000000', '#808080', '#8B7355'],
      tags: ['ORGANIC COTTON']
    },
    {
      id: 3,
      image: '/src/assets/listing/product-3.png',
      name: 'The Wool Flannel Pant',
      price: 97,
      originalPrice: null,
      discount: '30% off',
      colorName: 'Charcoal',
      colors: ['#000000', '#8B7355'],
      tags: ['RENEWED MATERIALS', 'CLEANER CHEMISTRY']
    },
    {
      id: 4,
      image: '/src/assets/listing/product-4.png',
      name: 'The Cloud Relaxed Cardigan',
      price: 132,
      originalPrice: 188,
      discount: '20% off',
      colorName: 'Black',
      colors: ['#000000', '#808080', '#8B7355', '#FFFFFF']
    },
    {
      id: 5,
      image: '/src/assets/listing/product-5.png',
      name: 'The Organic Cotton Long-Sleeve Turtleneck',
      price: 88,
      originalPrice: 110,
      discount: '20% off',
      colorName: 'Olive',
      colors: ['#556B2F', '#000000', '#8B4513'],
      tags: ['ORGANIC COTTON']
    },
    {
      id: 6,
      image: '/src/assets/listing/product-6.png',
      name: 'The Wool Flannel Pant',
      price: 97,
      originalPrice: 130,
      discount: '30% off',
      colorName: 'Navy Plaid',
      colors: ['#2F4F4F', '#000000'],
      tags: ['RENEWED MATERIALS', 'CLEANER CHEMISTRY']
    },
    {
      id: 7,
      image: '/src/assets/listing/product-7.png',
      name: 'The Cloud Relaxed Cardigan',
      price: 132,
      originalPrice: 188,
      discount: '20% off',
      colorName: 'Heather Grey',
      colors: ['#808080', '#8B7355', '#000000', '#FFFFFF']
    },
    {
      id: 8,
      image: '/src/assets/listing/product-8.png',
      name: 'The Organic Cotton Long-Sleeve Turtleneck',
      price: 47,
      originalPrice: null,
      discount: '20% off',
      colorName: 'Blue',
      colors: ['#4682B4', '#000000', '#8B4513'],
      tags: ['ORGANIC COTTON']
    },
    {
      id: 9,
      image: '/src/assets/listing/product-9.png',
      name: 'The Wool Flannel Pant',
      price: 87,
      originalPrice: null,
      discount: '20% off',
      colorName: 'Grey',
      colors: ['#808080', '#000000'],
      tags: ['RENEWED MATERIALS', 'CLEANER CHEMISTRY']
    }
  ];

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-gray-600 mb-2">Home / {category}</p>
        <h1 className="text-[32px] font-semibold text-black mb-4">
          {category}'s Clothing & Apparel - New Arrivals
        </h1>
        <div className="flex items-center justify-between">
          <select className="text-sm border-none outline-none cursor-pointer">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-3 gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
