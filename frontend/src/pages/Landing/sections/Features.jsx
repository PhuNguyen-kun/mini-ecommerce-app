import shippingIcon from '../../../assets/landing/icon-shipping.png';
import craftedIcon from '../../../assets/landing/icon-crafted.png';
import storeIcon from '../../../assets/landing/icon-store.png';

export default function Features() {
  return (
    <section className="w-full px-20 py-[90px]">
      <div className="flex justify-between gap-20">
        {/* Complimentary Shipping */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-[78px] h-[78px] mb-5">
            <img 
              src={shippingIcon} 
              alt="Shipping" 
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-[21px] font-normal mb-1.5">Complimentary Shipping</h3>
          <p className="text-sm leading-relaxed text-gray-600">
            Enjoy free shipping on U.S. orders over $100.
          </p>
        </div>

        {/* Consciously Crafted */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-[78px] h-[78px] mb-5">
            <img 
              src={craftedIcon} 
              alt="Crafted" 
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-[21px] font-normal mb-1.5">Consciously Crafted</h3>
          <p className="text-sm leading-relaxed text-gray-600">
            Designed with you and the planet in mind.
          </p>
        </div>

        {/* Come Say Hi */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="w-[78px] h-[78px] mb-5">
            <img 
              src={storeIcon} 
              alt="Store" 
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-[21px] font-normal mb-1.5">Come Say Hi</h3>
          <p className="text-[17px] text-gray-600">
            We have 11 stores across the U.S.
          </p>
        </div>
      </div>
    </section>
  );
}
