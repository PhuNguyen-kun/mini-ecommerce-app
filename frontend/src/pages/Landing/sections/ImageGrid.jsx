import { Link } from 'react-router-dom';
import gridImg1 from '../../../assets/landing/grid-1.png';
import gridImg2 from '../../../assets/landing/grid-2.png';
import gridImg3 from '../../../assets/landing/grid-3.png';

export default function ImageGrid() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-10 flex flex-col md:flex-row gap-3">
      {/* New Arrivals */}
      <div className="relative flex-1 h-[400px] sm:h-[450px] md:h-[534px] flex flex-col items-center justify-center gap-4 md:gap-6">
        <img 
          src={gridImg1} 
          alt="New Arrivals" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <h2 className="relative z-10 text-2xl sm:text-3xl md:text-[40px] leading-tight md:leading-[48px] tracking-[0.2px] text-white text-center font-normal">
          New Arrivals
        </h2>
        <Link 
          to="/products?sort=newest"
          className="relative z-10 bg-white text-neutral-800 px-0 py-3 w-48 sm:w-52 md:w-60 text-xs sm:text-sm tracking-[1.4px] font-normal hover:bg-gray-100 transition-colors text-center"
        >
          SHOP THE LATEST
        </Link>
      </div>

      {/* Best-Sellers */}
      <div className="relative flex-1 h-[400px] sm:h-[450px] md:h-[534px] flex flex-col items-center justify-center gap-4 md:gap-6">
        <img 
          src={gridImg2} 
          alt="Best-Sellers" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <h2 className="relative z-10 text-2xl sm:text-3xl md:text-[40px] leading-tight md:leading-[48px] tracking-[0.2px] text-white text-center font-normal">
          Best-Sellers
        </h2>
        <Link 
          to="/products?sort=featured"
          className="relative z-10 bg-white text-neutral-800 px-0 py-3 w-48 sm:w-52 md:w-60 text-xs sm:text-sm tracking-[1.4px] font-normal hover:bg-gray-100 transition-colors text-center"
        >
          SHOP YOUR FAVORITES
        </Link>
      </div>

      {/* The Holiday Outfit */}
      <div className="relative flex-1 h-[400px] sm:h-[450px] md:h-[534px] flex flex-col items-center justify-center gap-4 md:gap-6">
        <img 
          src={gridImg3} 
          alt="The Holiday Outfit" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <h2 className="relative z-10 text-2xl sm:text-3xl md:text-[40px] leading-tight md:leading-[48px] tracking-[0.2px] text-white text-center font-normal">
          The Holiday Outfit
        </h2>
        <Link 
          to="/products"
          className="relative z-10 bg-white text-neutral-800 px-0 py-3 w-48 sm:w-52 md:w-60 text-xs sm:text-sm tracking-[1.4px] font-normal hover:bg-gray-100 transition-colors text-center"
        >
          SHOP OCCASION
        </Link>
      </div>
    </section>
  );
}
