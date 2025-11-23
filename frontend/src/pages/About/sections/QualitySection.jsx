import qualityImage from '../../../assets/quality.png';

const QualitySection = () => {
  return (
    <div className="w-full flex bg-[#e6ded8] h-[552px]">
      <div className="flex-1 h-full flex flex-col items-center justify-center px-[70px] text-black">
        <div className="w-full mb-5">
          <p className="text-xs tracking-[0.2px] font-semibold mb-0">OUR QUALITY</p>
          <div className="text-[40px] leading-[48px]">
            <div>Designed</div>
            <div>to last.</div>
          </div>
        </div>
        <p className="text-sm leading-[16.8px] tracking-[1.4px] w-full">
          At Everlane, we're not big on trends. We want you to wear our pieces for years, even decades, to come. That's why we source the finest materials and factories for our timeless products— like our Grade-A cashmere sweaters, Italian shoes, and Peruvian Pima tees.
        </p>
      </div>
      <div className="flex-1 h-full">
        <img
          src={qualityImage}
          alt="Our Quality"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default QualitySection;
