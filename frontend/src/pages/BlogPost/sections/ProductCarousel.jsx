import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import product1 from '../../../assets/blogpost/product-1.png';
import product2 from '../../../assets/blogpost/product-2.png';
import product3 from '../../../assets/blogpost/product-3.png';
import product4 from '../../../assets/blogpost/product-4.png';
import product5 from '../../../assets/blogpost/product-5.png';

const ProductCarousel = () => {
  const products = [
    {
      id: 1,
      image: product1,
      name: 'The Cashmere Boxy Crew Sweater',
      price: '$139',
      color: 'Bone'
    },
    {
      id: 2,
      image: product2,
      name: 'The Corduroy Wide-Leg Pant',
      price: '$69',
      color: 'Canvas'
    },
    {
      id: 3,
      image: product3,
      name: 'The Organic Cotton Chunky Beanie',
      price: '$32',
      color: 'Canvas'
    },
    {
      id: 4,
      image: product4,
      name: 'The Chelsea Boot',
      price: '$137',
      color: 'Off-White'
    },
    {
      id: 5,
      image: product5,
      name: 'The Re:Down Puffer',
      price: '',
      color: 'Bone'
    }
  ];

  return (
    <div className="px-[60px] py-[60px]">
      <h2 className="text-[40px] leading-[48px] font-semibold text-black text-center mb-10">
        The White Whites Edit
      </h2>
      
      <div className="flex gap-[22px] items-center mb-10">
        <button className="w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity">
          <FaChevronLeft size={20} />
        </button>
        
        {products.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`} className={`flex flex-col gap-1.5 group cursor-pointer ${product.id === 5 ? 'w-[120px]' : 'flex-1'}`}>
            <div className={`${product.id === 5 ? 'w-[120px]' : 'w-full'} h-[350px] bg-gray-100 overflow-hidden`}>
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col gap-[3px]">
              <div className="flex justify-between gap-3 text-xs text-black">
                <p className="flex-1 group-hover:underline">{product.name}</p>
                {product.price && <p className="text-right">{product.price}</p>}
              </div>
              <p className="text-xs text-gray-500">{product.color}</p>
            </div>
          </Link>
        ))}
        
        <button className="w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity">
          <FaChevronRight size={20} />
        </button>
      </div>

      <div className="flex justify-center">
        <button className="bg-black text-white px-[100px] py-5 rounded-lg text-sm font-semibold tracking-wide hover:bg-gray-800 transition-colors">
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default ProductCarousel;
