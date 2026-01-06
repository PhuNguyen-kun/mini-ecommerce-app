import { HiStar, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import testimonialImg from '../../../assets/landing/testimonial.png';

export default function Testimonials() {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-[90px]">
      <div className="relative flex items-center">
        {/* Left Arrow */}
        <button className="hidden lg:block absolute left-9 z-10 w-6 h-6 hover:opacity-70">
          <HiChevronLeft className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-[74px] px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[133px]">
          {/* Text Content */}
          <div className="w-full lg:w-[530px] flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 lg:py-[221px]">
            <h2 className="text-xl sm:text-2xl font-normal mb-8 sm:mb-12 md:mb-16 text-center">People Are Talking</h2>
            
            <div className="w-full max-w-[406px] space-y-6 sm:space-y-8 text-center px-4">
              {/* Stars */}
              <div className="flex justify-center gap-3 sm:gap-4">
                {[...Array(5)].map((_, i) => (
                  <HiStar key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black" />
                ))}
              </div>
              
              {/* Review */}
              <p className="text-sm sm:text-base leading-relaxed">
                "Love this shirt! Fits perfectly and the fabric is thick without being stiff."
              </p>
              
              {/* Author */}
              <p className="text-sm text-gray-600">
                -- JonSnSF, The Heavyweight Overshirt
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="w-full lg:w-[530px] h-[400px] sm:h-[500px] md:h-[600px] lg:h-[695px] rounded-lg overflow-hidden">
            <img 
              src={testimonialImg} 
              alt="Testimonial" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Arrow */}
        <button className="hidden lg:block absolute right-9 z-10 w-6 h-6 hover:opacity-70">
          <HiChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Divider & Indicator */}
      {/* Indicator */}
      <div className="flex justify-center gap-2 mt-12">
        <div className="w-2 h-2 rounded-full bg-black"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
      </div>
    </section>
  );
}
