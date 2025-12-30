import bannerImg from '../../../assets/landing/featured-banner.png';

export default function FeaturedBanner() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-[90px]">
      <div className="relative w-full h-[200px] sm:h-[240px] lg:h-[281px] flex flex-col items-center justify-center gap-3 sm:gap-4 lg:gap-5 py-8 sm:py-10 lg:py-11">
        <img 
          src={bannerImg} 
          alt="Featured Banner" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Text Content */}
        <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3 text-center text-white px-4">
          <h2 className="text-xl sm:text-2xl lg:text-[32px] leading-tight sm:leading-[40px] font-normal font-['Maison_Neue']">
            We're on a Mission To Clean Up the Industry
          </h2>
          <p className="text-sm sm:text-base leading-tight sm:leading-6 tracking-[0.64px] font-['Maison_Neue']">
            Read about our progress in our latest Impact Report.
          </p>
        </div>
        
        {/* Button */}
        <button className="relative z-10 bg-white text-neutral-800 px-6 sm:px-0 py-2.5 sm:py-3 w-48 sm:w-60 text-xs sm:text-sm tracking-[1.4px] font-normal hover:bg-gray-100 transition-colors font-['Maison_Neue']">
          LEARN MORE
        </button>
      </div>
    </section>
  );
}
