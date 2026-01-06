import shippingIcon from '../../../assets/landing/icon-shipping.png';
import craftedIcon from '../../../assets/landing/icon-crafted.png';
import storeIcon from '../../../assets/landing/icon-store.png';

export default function Features() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-10 lg:px-20 py-12 sm:py-16 md:py-20 lg:py-[90px]">
      <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12 lg:gap-20">
        {/* Complimentary Shipping */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-[78px] sm:h-[78px] mb-4 sm:mb-5">
            <img 
              src={shippingIcon} 
              alt="Shipping" 
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-lg sm:text-xl md:text-[21px] font-normal mb-1.5">Complimentary Shipping</h3>
          <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
            Enjoy free shipping on U.S. orders over $100.
          </p>
        </div>

        {/* Consciously Crafted */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-[78px] sm:h-[78px] mb-4 sm:mb-5">
            <img 
              src={craftedIcon} 
              alt="Crafted" 
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-lg sm:text-xl md:text-[21px] font-normal mb-1.5">Consciously Crafted</h3>
          <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
            Designed with you and the planet in mind.
          </p>
        </div>

        {/* Come Say Hi */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-[78px] sm:h-[78px] mb-4 sm:mb-5">
            <img 
              src={storeIcon} 
              alt="Store" 
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-lg sm:text-xl md:text-[21px] font-normal mb-1.5">Come Say Hi</h3>
          <p className="text-sm sm:text-base md:text-[17px] text-gray-600">
            We have 11 stores across the U.S.
          </p>
        </div>
      </div>
    </section>
  );
}
