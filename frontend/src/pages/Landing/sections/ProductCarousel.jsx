import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import product1 from '../../../assets/landing/product-1.png';
import product2 from '../../../assets/landing/product-2.png';
import product3 from '../../../assets/landing/product-3.png';
import product4 from '../../../assets/landing/product-4.png';
import product5 from '../../../assets/landing/product-5.png';

const products = [
  {
    name: 'The Waffle Long-Sleeve Crew',
    price: '$60',
    color: 'Bone',
    image: product1,
  },
  {
    name: 'The Bomber Jacket | Uniform',
    price: '$148',
    color: 'Toasted Coconut',
    image: product2,
  },
  {
    name: 'The Slim 4-Way Stretch Organic Jean | Uniform',
    price: '$98',
    color: 'Dark Indigo',
    image: product3,
  },
  {
    name: 'The Essential Organic Crew',
    price: '$30',
    color: 'Vintage Black',
    image: product4,
  },
  {
    name: 'The Heavyweight',
    price: '',
    color: 'Heathered Brown',
    image: product5,
  },
];

export default function ProductCarousel() {
  return (
    <section className="w-full py-[90px]">
      {/* Title Section */}
      <div className="px-10 mb-[100px]">
        <h2 className="text-[34px] font-normal mb-3 text-center">Everlane Favorites</h2>
        <p className="text-lg text-gray-600 text-center">
          Beautifully Functional. Purposefully Designed. Consciously Crafted.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative flex items-center gap-3">
        {/* Left Arrow */}
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <HiChevronLeft className="w-6 h-6" />
        </button>

        {/* Products */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-3">
          {products.map((product, index) => (
            <div key={index} className="flex-shrink-0 w-[282px]">
              <div className="w-full h-[420px] rounded-lg overflow-hidden mb-2">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm flex-1">{product.name}</p>
                  {product.price && <p className="text-sm font-medium">{product.price}</p>}
                </div>
                <p className="text-sm text-gray-600">{product.color}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <HiChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Indicator */}
      <div className="flex justify-center gap-2 mt-12">
        <div className="w-2 h-2 rounded-full bg-black"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
      </div>
    </section>
  );
}
