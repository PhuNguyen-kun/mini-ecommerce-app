export default function SubNav() {
  const navItems = [
    { text: 'Holiday Gifting', isSale: false },
    { text: 'New Arrivals', isSale: false },
    { text: 'Best-Sellers', isSale: false },
    { text: 'Clothing', isSale: false },
    { text: 'Tops & Sweaters', isSale: false },
    { text: 'Pants & Jeans', isSale: false },
    { text: 'Outerwear', isSale: false },
    { text: 'Shoes & Bags', isSale: false },
    { text: 'Sale', isSale: true },
  ];

  return (
    <div className="flex items-center justify-start lg:justify-center gap-4 md:gap-6 lg:gap-8 px-4 sm:px-6 py-2 sm:py-3 border-b border-gray-200 overflow-x-auto scrollbar-hide">
      {navItems.map((item, index) => (
        <div key={index} className="cursor-pointer hover:opacity-70 whitespace-nowrap flex-shrink-0">
          <p className={`text-[10px] sm:text-xs ${item.isSale ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}
