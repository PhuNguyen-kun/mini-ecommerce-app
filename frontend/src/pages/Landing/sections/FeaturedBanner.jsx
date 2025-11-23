import bannerImg from '../../../assets/landing/featured-banner.png';

export default function FeaturedBanner() {
  return (
    <section className="w-full px-10 py-[90px]">
      <div className="relative w-full h-[281px] flex flex-col items-center justify-center gap-5 py-11">
        <img 
          src={bannerImg} 
          alt="Featured Banner" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Text Content */}
        <div className="relative z-10 flex flex-col items-center gap-3 text-center text-white">
          <h2 className="text-[32px] leading-[40px] font-normal">
            We're on a Mission To Clean Up the Industry
          </h2>
          <p className="text-base leading-6 tracking-[0.64px]">
            Read about our progress in our latest Impact Report.
          </p>
        </div>
        
        {/* Button */}
        <button className="relative z-10 bg-white text-neutral-800 px-0 py-3 w-60 text-sm tracking-[1.4px] font-normal hover:bg-gray-100 transition-colors">
          LEARN MORE
        </button>
      </div>
    </section>
  );
}
