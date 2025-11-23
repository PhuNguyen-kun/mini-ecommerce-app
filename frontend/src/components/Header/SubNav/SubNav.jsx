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
    <div className="flex items-center justify-center gap-8 px-6 py-3 border-b border-gray-200">
      {navItems.map((item, index) => (
        <div key={index} className="cursor-pointer hover:opacity-70">
          <p className={`text-xs ${item.isSale ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}
