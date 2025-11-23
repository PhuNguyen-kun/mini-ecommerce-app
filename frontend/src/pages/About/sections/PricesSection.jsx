import pricesImage from '../../../assets/about/prices.png';

const PricesSection = () => {
  return (
    <div className="w-full flex h-[660px]">
      <div className="flex-1 h-full">
        <img
          src={pricesImage}
          alt="Our Prices"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex-1 h-full flex flex-col items-center justify-center px-[70px] text-black">
        <div className="w-full mb-5">
          <p className="text-xs tracking-[0.2px] font-semibold mb-0">OUR PRICES</p>
          <p className="text-[40px] leading-[48px]">Radically Transparent.</p>
        </div>
        <div className="text-sm leading-[16.8px] tracking-[1.4px] w-full">
          <p className="mb-0">
            We believe our customers have a right to know how much their clothes cost to make. We reveal the true costs behind all of our products—from materials to labor to transportation—then offer them to you, minus the traditional retail markup.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricesSection;
