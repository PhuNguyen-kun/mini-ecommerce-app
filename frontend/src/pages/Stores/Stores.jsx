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
      <div className="w-full px-[35px] py-[30px]">
        {/* Header Section */}
        <div className="flex flex-col gap-4 items-center text-center mb-16">
          <h1 className="text-[32px] leading-[40px] text-black">Stores</h1>
          <p className="text-base tracking-[0.64px] leading-6 text-black">
            Find one of our 11 stores nearest you.
          </p>
        </div>

        {/* Store Rows */}
        <div className="flex flex-col gap-16">
          {stores.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-[30px] w-full">
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
