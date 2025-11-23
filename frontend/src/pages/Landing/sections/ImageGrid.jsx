import gridImg1 from '../../../assets/grid-1.png';
import gridImg2 from '../../../assets/grid-2.png';
import gridImg3 from '../../../assets/grid-3.png';

export default function ImageGrid() {
  return (
    <section className="w-full px-10 flex gap-3">
      {/* New Arrivals */}
      <div className="relative flex-1 h-[534px] flex flex-col items-center justify-center gap-6">
        <img 
          src={gridImg1} 
          alt="New Arrivals" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <h2 className="relative z-10 text-[40px] leading-[48px] tracking-[0.2px] text-white text-center font-normal">
          New Arrivals
        </h2>
        <button className="relative z-10 bg-white text-neutral-800 px-0 py-3 w-60 text-sm tracking-[1.4px] font-normal hover:bg-gray-100 transition-colors">
          SHOP THE LATEST
        </button>
      </div>

      {/* Best-Sellers */}
      <div className="relative flex-1 h-[534px] flex flex-col items-center justify-center gap-6">
        <img 
          src={gridImg2} 
          alt="Best-Sellers" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <h2 className="relative z-10 text-[40px] leading-[48px] tracking-[0.2px] text-white text-center font-normal">
          Best-Sellers
        </h2>
        <button className="relative z-10 bg-white text-neutral-800 px-0 py-3 w-60 text-sm tracking-[1.4px] font-normal hover:bg-gray-100 transition-colors">
          SHOP YOUR FAVORITES
        </button>
      </div>

      {/* The Holiday Outfit */}
      <div className="relative flex-1 h-[534px] flex flex-col items-center justify-center gap-6">
        <img 
          src={gridImg3} 
          alt="The Holiday Outfit" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <h2 className="relative z-10 text-[40px] leading-[48px] tracking-[0.2px] text-white text-center font-normal">
          The Holiday Outfit
        </h2>
        <button className="relative z-10 bg-white text-neutral-800 px-0 py-3 w-60 text-sm tracking-[1.4px] font-normal hover:bg-gray-100 transition-colors">
          SHOP OCCASION
        </button>
      </div>
    </section>
  );
}
