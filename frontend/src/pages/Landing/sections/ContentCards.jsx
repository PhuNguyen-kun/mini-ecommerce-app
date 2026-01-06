import giftImg from '../../../assets/landing/gift-picks.png';
import cleanerImg from '../../../assets/landing/cleaner-fashion.png';

export default function ContentCards() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[185px] py-12 sm:py-16 md:py-20 lg:py-[90px] flex flex-col lg:flex-row gap-6 lg:gap-5">
      {/* Holiday Gift Picks */}
      <div className="w-full lg:w-[505px]">
        <h2 className="text-2xl sm:text-3xl md:text-[34px] font-normal mb-8 sm:mb-10 md:mb-[54px] text-center">Our Holiday Gift Picks</h2>
        <div className="w-full h-[400px] sm:h-[500px] md:h-[550px] lg:h-[626px] rounded-lg overflow-hidden mb-4 sm:mb-5">
          <img 
            src={cleanerImg} 
            alt="Holiday Gift Picks" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <p className="text-sm sm:text-base md:text-[17px] mb-6 sm:mb-8 md:mb-9 text-center">
          The best presents for everyone on your list.
        </p>
        <button className="w-full py-3 sm:py-[15px] text-center text-base sm:text-lg md:text-xl hover:bg-gray-50 transition-colors border border-gray-200 rounded">
          Read More
        </button>
      </div>

      {/* Cleaner Fashion */}
      <div className="w-full lg:w-[505px]">
        <h2 className="text-2xl sm:text-3xl md:text-[34px] font-normal mb-8 sm:mb-10 md:mb-[54px] text-center">Cleaner Fashion</h2>
        <div className="w-full h-[400px] sm:h-[500px] md:h-[550px] lg:h-[626px] rounded-lg overflow-hidden mb-4 sm:mb-5">
          <img 
            src={giftImg} 
            alt="Cleaner Fashion" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <p className="text-sm sm:text-base md:text-[17px] mb-6 sm:mb-8 md:mb-9 text-center">
          See the sustainability efforts behind each of our products.
        </p>
        <button className="w-full py-3 sm:py-[15px] text-center text-base sm:text-lg md:text-xl hover:bg-gray-50 transition-colors border border-gray-200 rounded">
          Learn More
        </button>
      </div>
    </section>
  );
}
