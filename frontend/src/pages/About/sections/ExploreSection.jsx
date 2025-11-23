import productsImage from '../../../assets/about/explore-products.png';
import storesImage from '../../../assets/about/explore-stores.png';
import careersImage from '../../../assets/about/explore-careers.png';

const ExploreSection = () => {
  return (
    <div className="w-full py-[82px] px-[200px]">
      <h2 className="text-[32px] leading-[40px] text-black text-center mb-5">
        More to Explore
      </h2>
      <div className="flex gap-5 w-full">
        <div className="flex-1 flex flex-col gap-2.5">
          <div className="w-full h-[195px]">
            <img
              src={productsImage}
              alt="Our Products"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center text-[#4c4c4b] text-base font-semibold">
            Our Products
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-2.5">
          <div className="w-full h-[195px]">
            <img
              src={storesImage}
              alt="Our Stores"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center text-[#4c4c4b] text-base font-semibold">
            Our Stores
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-2.5">
          <div className="w-full h-[195px]">
            <img
              src={careersImage}
              alt="Careers"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center text-[#4c4c4b] text-base font-semibold">
            Careers
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExploreSection;
