import factoriesImage from '../../../assets/about/factories.png';

const FactoriesSection = () => {
  return (
    <div className="w-full flex bg-[#e6ded8] h-[733px]">
      <div className="flex-1 h-full">
        <img
          src={factoriesImage}
          alt="Our Factories"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 h-full flex flex-col items-center justify-center px-[70px] text-black">
        <div className="w-full mb-5">
          <p className="text-xs tracking-[0.2px] font-semibold mb-0">OUR FACTORIES</p>
          <p className="text-[40px] leading-[48px]">Our ethical approach.</p>
        </div>
        <p className="text-sm leading-[16.8px] tracking-[1.4px] w-full">
          We spend months finding the best factories around the world—the same ones that produce your favorite designer labels. We visit them often and build strong personal relationships with the owners. Each factory is given a compliance audit to evaluate factors like fair wages, reasonable hours, and environment. Our goal? A score of 90 or above for every factory.
        </p>
      </div>
    </div>
  );
};

export default FactoriesSection;
