const TransparentPricing = () => {
  const pricingItems = [
    {
      id: 1,
      name: "Materials",
      price: "$47.96",
      icon: "🧵"
    },
    {
      id: 2,
      name: "Hardware",
      price: "$5.74",
      icon: "🔩"
    },
    {
      id: 3,
      name: "Labor",
      price: "$13.75",
      icon: "👷"
    },
    {
      id: 4,
      name: "Duties",
      price: "$8.09",
      icon: "📋"
    },
    {
      id: 5,
      name: "Transport",
      price: "$1.53",
      icon: "🚚"
    }
  ];

  return (
    <div className="p-20 flex flex-col gap-4 items-center">
      {/* Header */}
      <div className="w-[684px] flex flex-col gap-4 items-center text-center text-neutral-800">
        <p className="text-2xl leading-[33.24px] font-semibold font-['Maison_Neue']">
          Transparent Pricing
        </p>
        <p className="text-sm tracking-[1.4px] leading-[16.8px] font-['Maison_Neue']">
          We publish what it costs us to make every one of our products. There are a lot of costs we can't neatly account for - like design, fittings, wear testing, rent on office and retail space - but we believe you deserve to know what goes into making the products you love.
        </p>
      </div>

      {/* Pricing Items */}
      <div className="w-[684px] flex items-start">
        {pricingItems.map((item) => (
          <div key={item.id} className="flex-1 p-6 flex flex-col gap-3 items-center">
            <div className="w-[58px] h-[59px] flex items-center justify-center text-4xl">
              {item.icon}
            </div>
            <div className="text-xs text-center text-neutral-800 tracking-[0.2px] font-['Maison_Neue']">
              <p>{item.name}</p>
              <p>{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransparentPricing;
