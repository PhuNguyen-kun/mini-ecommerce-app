import { Link } from 'react-router-dom';

const RecommendedProducts = ({ currentProductId }) => {
  // Mock recommended products - lọc bỏ sản phẩm hiện tại
  const allProducts = [
    {
      id: 1,
      name: "The Cloud Relaxed Cardigan",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=600&fit=crop",
      originalPrice: 188,
      salePrice: 132,
      color: "Black"
    },
    {
      id: 2,
      name: "The Organic Cotton Long-Sleeve Turtleneck",
      image: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=500&h=600&fit=crop",
      originalPrice: 50,
      salePrice: 40,
      color: "Black"
    },
    {
      id: 3,
      name: "The Wool Flannel Pant",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop",
      originalPrice: 130,
      salePrice: 97,
      color: "Charcoal"
    },
    {
      id: 4,
      name: "The Waffle Long-Sleeve Crew",
      image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=600&fit=crop",
      originalPrice: 60,
      salePrice: 60,
      color: "Bone"
    },
    {
      id: 5,
      name: "The Essential Organic Crew",
      image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=500&h=600&fit=crop",
      originalPrice: 40,
      salePrice: 30,
      color: "White"
    }
  ];

  // Lọc bỏ sản phẩm hiện tại và lấy 4 sản phẩm đầu
  const recommendedProducts = allProducts
    .filter(p => p.id !== currentProductId)
    .slice(0, 4);

  return (
    <div className="px-[196px] py-16 flex flex-col gap-2">
      <p className="text-base font-semibold text-neutral-800 tracking-[0.2px] font-['Maison_Neue']">
        Recommended Products
      </p>
      <div className="flex gap-6">
        {recommendedProducts.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`} className="flex-1 flex flex-col gap-2.5 group cursor-pointer">
            <div className="h-[392px] w-full relative overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col gap-[3px]">
              <div className="py-2 flex gap-3 items-start">
                <p className="flex-1 text-xs text-neutral-800 tracking-[0.2px] font-['Maison_Neue'] group-hover:underline">
                  {product.name}
                </p>
                <div className="flex gap-1 items-center text-xs text-right tracking-[0.2px]">
                  <p className="text-neutral-500 line-through font-['Maison_Neue']">
                    ${product.originalPrice}
                  </p>
                  <p className="text-neutral-800 font-semibold font-['Maison_Neue']">
                    ${product.salePrice}
                  </p>
                </div>
              </div>
              <p className="h-4 text-xs text-neutral-500 tracking-[0.2px] font-['Maison_Neue']">
                {product.color}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
