import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="group cursor-pointer flex flex-col gap-2.5">
      {/* Image Container */}
      <div className="relative w-full h-[392px] overflow-hidden">
        {product.discount && (
          <div className="absolute top-2 left-2 bg-white px-1.5 py-1 text-xs text-[#d0021b] z-10">
            {product.discount}
          </div>
        )}
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-[3px] w-full">
        {/* Name and Price */}
        <div className="flex gap-3 items-start py-2 w-full">
          <p className="flex-1 text-xs text-black leading-4 group-hover:underline">
            {product.name}
          </p>
          <div className="flex gap-1 items-center text-xs leading-4 text-right">
            {product.originalPrice && (
              <p className="text-gray-500 line-through">
                ${product.originalPrice}
              </p>
            )}
            <p className="text-black font-semibold">
              ${product.price}
            </p>
          </div>
        </div>

        {/* Color Name */}
        <p className="text-xs text-gray-500 leading-4 h-4">
          {product.colorName || ''}
        </p>
      </div>

      {/* Color Swatches */}
      <div className="flex gap-2.5 items-center w-full">
        {product.colors && product.colors.map((color, index) => (
          <div 
            key={index}
            className="w-5 h-5 rounded-full border border-gray-300 cursor-pointer hover:border-gray-500 transition-colors"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex gap-2 items-start w-full">
          {product.tags.map((tag, index) => (
            <div 
              key={index}
              className="border border-[#dddbdc] px-2 py-1.5 text-[10px] text-gray-500 text-center tracking-[1px] leading-4"
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </Link>
  );
};

export default ProductCard;
