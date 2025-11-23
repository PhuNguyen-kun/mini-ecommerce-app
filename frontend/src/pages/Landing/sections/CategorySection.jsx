import shirtsImg from '../../../assets/category-shirts.png';
import denimImg from '../../../assets/category-denim.png';
import teesImg from '../../../assets/category-tees.png';
import pantsImg from '../../../assets/category-pants.png';
import sweatersImg from '../../../assets/category-sweaters.png';
import outerwearImg from '../../../assets/category-outerwear.png';

const categories = [
  { name: 'SHIRTS', image: shirtsImg },
  { name: 'DENIM', image: denimImg },
  { name: 'TEES', image: teesImg },
  { name: 'PANTS', image: pantsImg },
  { name: 'SWEATERS', image: sweatersImg },
  { name: 'OUTERWEAR', image: outerwearImg },
];

export default function CategorySection() {
  return (
    <section className="w-full px-10 py-[90px]">
      <h2 className="text-[34px] font-normal mb-[55px] text-center">
        Shop by Category
      </h2>
      
      <div className="grid grid-cols-6 gap-5">
        {categories.map((category, index) => (
          <div key={index} className="cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-full h-[263px] rounded-lg overflow-hidden mb-3">
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-center font-medium tracking-wide">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
