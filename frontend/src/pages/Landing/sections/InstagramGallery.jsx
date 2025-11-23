import { HiChevronLeft, HiChevronRight, HiShoppingCart } from 'react-icons/hi2';
import insta1 from '../../../assets/landing/insta-1.png';
import insta2 from '../../../assets/landing/insta-2.png';
import insta3 from '../../../assets/landing/insta-3.png';
import insta4 from '../../../assets/landing/insta-4.png';
import insta5 from '../../../assets/landing/insta-5.png';

export default function InstagramGallery() {
  return (
    <section className="w-full py-[90px]">
      {/* Header */}
      <div className="text-center mb-12 px-[54px] pt-[90px] pb-0 border-t border-neutral-800">
        <h2 className="text-[32px] leading-[40px] font-normal mb-6">Everlane On You</h2>
        <div className="space-y-1">
          <p className="text-sm leading-[16.8px] tracking-[1.4px]">
            Share your latest look with #EverlaneOnYou for a chance to be featured.
          </p>
          <p className="text-sm leading-5 tracking-[1.4px] underline cursor-pointer hover:opacity-70">
            Add Your Photo
          </p>
        </div>
      </div>

      {/* Gallery */}
      <div className="px-10 flex items-center gap-[18px]">
        {/* Left Arrow */}
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
          <HiChevronLeft className="w-6 h-6" />
        </button>

        {/* Images */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide">
          {[insta1, insta2, insta3, insta4, insta5].map((img, index) => (
            <div key={index} className="relative w-[225.6px] h-[225px] flex-shrink-0 overflow-hidden cursor-pointer group">
              <img 
                src={img} 
                alt={`Instagram ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              {/* Icon Button */}
              <button className="absolute top-2.5 right-2.5 w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                <HiShoppingCart className="w-4 h-4 text-neutral-800" />
              </button>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
          <HiChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
