import { useEffect, useRef } from 'react';
import icon from '../../../assets/blog/icon-crafted.png';

const BannerSection = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 1;

    const scroll = () => {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
    };

    const intervalId = setInterval(scroll, 20);
    return () => clearInterval(intervalId);
  }, []);

  const textItems = ["Keep It Cool", "Keep It Clean", "Do right by people"];
  const repeatedItems = Array(15).fill(textItems).flat();

  return (
    <div className="w-full py-16 bg-white overflow-hidden">
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-hidden whitespace-nowrap gap-12"
        style={{ scrollBehavior: 'auto' }}
      >
        {repeatedItems.map((text, index) => (
          <>
            <span key={`text-${index}`} className="text-4xl font-semibold text-black">
              {text}
            </span>
            <img 
              key={`icon-${index}`}
              src={icon} 
              alt="scale" 
              className="h-9 w-auto"
              style={{ filter: 'brightness(0)' }}
            />
          </>
        ))}
      </div>
    </div>
  );
};

export default BannerSection;
