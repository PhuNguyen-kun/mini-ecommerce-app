import heroImage from '../../../assets/landing/hero-banner.png';

export default function HeroSection() {
  return (
    <section className="relative w-full h-[758px] flex items-center justify-start px-8">
      {/* Background Image */}
      <img 
        src={heroImage} 
        alt="Hero Background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-[632px] flex flex-col items-center gap-7 ml-6">
        
        <div className="flex flex-col items-center gap-3.5 text-center text-white">
          <h1 className="text-[46px] leading-[55.2px] tracking-[0.92px] font-normal">
            Your Cozy Era
          </h1>
          <div className="text-2xl leading-[33.24px]">
            <p className="mb-0">Get peak comfy-chic</p>
            <p>with new winter essentials.</p>
          </div>
        </div>
        
       
        <button className="bg-white text-neutral-800 px-0 py-3 w-60 text-sm tracking-[1.4px] font-normal hover:bg-gray-100 transition-colors">
          SHOP NOW
        </button>
      </div>
    </section>
  );
}
