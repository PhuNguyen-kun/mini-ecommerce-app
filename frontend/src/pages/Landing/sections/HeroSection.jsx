import heroImage from '../../../assets/landing/hero-banner.png';

export default function HeroSection() {
  return (
    <section className="relative w-full h-[500px] sm:h-[600px] lg:h-[758px] flex items-center justify-start px-4 sm:px-6 lg:px-8">
      {/* Background Image */}
      <img 
        src={heroImage} 
        alt="Hero Background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-[632px] flex flex-col items-center gap-5 sm:gap-7 ml-2 sm:ml-4 lg:ml-6">
        
        <div className="flex flex-col items-center gap-2 sm:gap-3.5 text-center text-white">
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] leading-tight sm:leading-[55.2px] tracking-[0.92px] font-normal font-['Maison_Neue']">
            Your Cozy Era
          </h1>
          <div className="text-base sm:text-xl lg:text-2xl leading-tight sm:leading-[33.24px] font-['Maison_Neue']">
            <p className="mb-0">Get peak comfy-chic</p>
            <p>with new winter essentials.</p>
          </div>
        </div>
        
       
        <button className="bg-white text-neutral-800 px-6 sm:px-0 py-2.5 sm:py-3 w-48 sm:w-60 text-xs sm:text-sm tracking-[1.4px] font-normal hover:bg-gray-100 transition-colors font-['Maison_Neue']">
          SHOP NOW
        </button>
      </div>
    </section>
  );
}
