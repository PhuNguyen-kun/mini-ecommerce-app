const TransparentPricing = () => {
  const pricingItems = [
    {
      id: 1,
      name: "Nguyên liệu",
      price: "1.219.000₫",
      icon: "🧵"
    },
    {
      id: 2,
      name: "Phụ kiện",
      price: "146.000₫",
      icon: "🔩"
    },
    {
      id: 3,
      name: "Nhân công",
      price: "349.000₫",
      icon: "👷"
    },
    {
      id: 4,
      name: "Thuế",
      price: "205.000₫",
      icon: "📋"
    },
    {
      id: 5,
      name: "Vận chuyển",
      price: "39.000₫",
      icon: "🚚"
    }
  ];

  return (
    <div className="p-20 flex flex-col gap-4 items-center">
      {/* Header */}
      <div className="w-[684px] flex flex-col gap-4 items-center text-center text-neutral-800">
        <p className="text-2xl leading-[33.24px] font-semibold font-['Maison_Neue']">
          Giá Cả Minh Bạch
        </p>
        <p className="text-sm tracking-[1.4px] leading-[16.8px] font-['Maison_Neue']">
          Chúng tôi công khai chi phí sản xuất cho từng sản phẩm. Có nhiều chi phí không thể tính toán chính xác - như thiết kế, may mẫu, kiểm tra chất lượng, thuê văn phòng và cửa hàng - nhưng chúng tôi tin rằng bạn xứng đáng biết những gì tạo nên sản phẩm bạn yêu thích.
        </p>
      </div>

      {/* Pricing Items */}
      <div className="w-[684px] flex items-start">
        {pricingItems.map((item) => (
          <div key={item.id} className="flex-1 p-6 flex flex-col gap-3 items-center">
            <div className="w-[58px] h-[59px] flex items-center justify-center text-4xl">
              {item.icon}
            </div>
            <div className="text-xs text-center text-neutral-800 tracking-[0.2px] ">
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
