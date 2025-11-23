import sweaters from '../../../assets/search-sweaters.png';
import bottom from '../../../assets/search-bottom.png';
import boots from '../../../assets/search-boots.png';
import bestsellers from '../../../assets/search-bestsellers.png';

const categories = [
  { name: "Women's Sweaters", image: sweaters },
  { name: "Women's Bottom", image: bottom },
  { name: "Women's Boots", image: boots },
  { name: "Men's Best Sellers", image: bestsellers },
];

export default function PopularCategories() {
  return (
    <section className="w-full px-[156px] py-8 border-t border-[#dddbdc]">
      <h2 className="text-sm leading-[16.8px] tracking-[1.4px] text-[#4c4c4b] mb-4">
        Popular Categories
      </h2>
      
      <div className="grid grid-cols-4 gap-5">
        {categories.map((category, index) => (
          <div key={index} className="flex flex-col gap-2.5 cursor-pointer group">
            <div className="w-full h-[340px] overflow-hidden">
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-base leading-6 tracking-[0.64px] text-[#4c4c4b] underline hover:text-neutral-800">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
