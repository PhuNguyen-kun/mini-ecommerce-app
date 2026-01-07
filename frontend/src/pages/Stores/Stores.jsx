import seattle from '../../assets/stores/seattle.png';
import sanFrancisco from '../../assets/stores/san-francisco.png';
import paloAlto from '../../assets/stores/palo-alto.png';
import losAngeles from '../../assets/stores/los-angeles.png';
import boston from '../../assets/stores/boston.png';
import newYork from '../../assets/stores/new-york.png';
import brooklyn from '../../assets/stores/brooklyn.png';
import kingOfPrussia from '../../assets/stores/king-of-prussia.png';
import georgetown from '../../assets/stores/georgetown.png';

const StoreCard = ({ image, city, location }) => (
  <div className="flex-1 flex flex-col gap-2">
    <div className="w-full h-[280px]">
      <img src={image} alt={city} className="w-full h-full object-cover" />
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-[10px] tracking-[1px] leading-4">{city}</p>
      <p className="text-base tracking-[0.64px] leading-6">{location}</p>
    </div>
  </div>
);

const Stores = () => {
  const stores = [
    [
      { image: seattle, city: 'SEATTLE', location: 'University Village' },
      { image: sanFrancisco, city: 'SAN FRANCISCO', location: 'Valencia Street, San Francisco' },
      { image: paloAlto, city: 'PALO ALTO', location: 'Stanford' },
    ],
    [
      { image: losAngeles, city: 'LOS ANGELES', location: 'Abbot Kinney' },
      { image: boston, city: 'BOSTON', location: 'Seaport' },
      { image: newYork, city: 'NEW YORK', location: 'Prince Street, New York' },
    ],
    [
      { image: brooklyn, city: 'BROOKLYN', location: 'Williamsburg' },
      { image: kingOfPrussia, city: 'KING OF PRUSSIA', location: 'King of Prussia' },
      { image: georgetown, city: 'GEORGETOWN', location: 'Georgetown' },
    ],
  ];

  return (
    <div className="bg-white w-full">
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-[35px] py-6 sm:py-8 md:py-[30px]">
        {/* Header Section */}
        <div className="flex flex-col gap-3 sm:gap-4 items-center text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-[32px] leading-tight sm:leading-[40px] text-black">Cửa Hàng</h1>
          <p className="text-base tracking-[0.64px] leading-6 text-black">
            Tìm một trong 11 cửa hàng gần bạn nhất.
          </p>
        </div>

        {/* Store Rows */}
        <div className="flex flex-col gap-8 sm:gap-12 md:gap-16">
          {stores.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-[30px] w-full">
              {row.map((store, storeIndex) => (
                <StoreCard key={storeIndex} {...store} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stores;
