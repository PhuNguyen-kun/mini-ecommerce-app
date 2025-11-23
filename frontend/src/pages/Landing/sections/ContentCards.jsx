import giftImg from '../../../assets/gift-picks.png';
import cleanerImg from '../../../assets/cleaner-fashion.png';

export default function ContentCards() {
  return (
    <section className="w-full px-[185px] py-[90px] flex gap-5">
      {/* Holiday Gift Picks */}
      <div className="w-[505px]">
        <h2 className="text-[34px] font-normal mb-[54px]">Our Holiday Gift Picks</h2>
        <div className="w-full h-[626px] rounded-lg overflow-hidden mb-5">
          <img 
            src={giftImg} 
            alt="Holiday Gift Picks" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <p className="text-[17px] mb-9">
          The best presents for everyone on your list.
        </p>
        <button className="w-full py-[15px] text-center text-xl hover:bg-gray-50 transition-colors border border-gray-200 rounded">
          Read More
        </button>
      </div>

      {/* Cleaner Fashion */}
      <div className="w-[505px]">
        <h2 className="text-[34px] font-normal mb-[54px]">Cleaner Fashion</h2>
        <div className="w-full h-[626px] rounded-lg overflow-hidden mb-5">
          <img 
            src={cleanerImg} 
            alt="Cleaner Fashion" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <p className="text-[17px] mb-9">
          See the sustainability efforts behind each of our products.
        </p>
        <button className="w-full py-[15px] text-center text-xl hover:bg-gray-50 transition-colors border border-gray-200 rounded">
          Learn More
        </button>
      </div>
    </section>
  );
}
