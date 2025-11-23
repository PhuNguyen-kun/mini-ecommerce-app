import { HiStar, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import testimonialImg from '../../../assets/landing/testimonial.png';

export default function Testimonials() {
  return (
    <section className="w-full py-[90px]">
      <div className="relative flex items-center">
        {/* Left Arrow */}
        <button className="absolute left-9 z-10 w-6 h-6 hover:opacity-70">
          <HiChevronLeft className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="w-full flex items-center justify-center gap-[74px] px-[133px]">
          {/* Text Content */}
          <div className="w-[530px] flex flex-col items-center justify-center py-[221px]">
            <h2 className="text-2xl font-normal mb-16 text-center">People Are Talking</h2>
            
            <div className="w-[406px] space-y-8 text-center">
              {/* Stars */}
              <div className="flex justify-center gap-4">
                {[...Array(5)].map((_, i) => (
                  <HiStar key={i} className="w-3.5 h-3.5 fill-black" />
                ))}
              </div>
              
              {/* Review */}
              <p className="text-base leading-relaxed">
                "Love this shirt! Fits perfectly and the fabric is thick without being stiff."
              </p>
              
              {/* Author */}
              <p className="text-sm text-gray-600">
                -- JonSnSF, The Heavyweight Overshirt
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="w-[530px] h-[695px] rounded-lg overflow-hidden">
            <img 
              src={testimonialImg} 
              alt="Testimonial" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Arrow */}
        <button className="absolute right-9 z-10 w-6 h-6 hover:opacity-70">
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
