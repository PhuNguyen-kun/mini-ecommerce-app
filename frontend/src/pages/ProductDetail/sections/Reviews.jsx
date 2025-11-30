import { useState, useEffect } from 'react';

const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    overallRating: 0,
    totalReviews: 0,
    distribution: [0, 0, 0, 0, 0],
    sizeFit: 2 // 0=runs small, 2=true to size, 4=runs large
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with API call when backend is ready
    // const fetchReviews = async () => {
    //   const response = await fetch(`/api/products/${productId}/reviews`);
    //   const data = await response.json();
    //   setReviews(data.reviews);
    //   setStats(data.stats);
    // };
    
    // Mock data for now
    const mockReviews = [
      {
        id: 1,
        username: "NguyenVanA",
        verified: true,
        height: "1m70 - 1m75",
        weight: "65 - 70 kg",
        bodyType: "Athletic",
        sizePurchased: "L",
        usualSize: "L",
        rating: 5,
        title: "Chất lượng tuyệt vời",
        comment: "Áo rất đẹp, chất liệu mềm mại và thoáng mát. Mặc rất thoải mái và vừa vặn. Sẽ ủng hộ shop tiếp.",
        daysAgo: 7
      },
      {
        id: 2,
        username: "ThiThiB",
        verified: true,
        height: "1m60 - 1m65",
        weight: "50 - 55 kg",
        bodyType: "Slim",
        sizePurchased: "M",
        usualSize: "M",
        rating: 4,
        title: "Đẹp nhưng hơi rộng",
        comment: "Áo đẹp, chất lượng ok. Tuy nhiên size hơi rộng một chút so với mong đợi. Nên order nhỏ hơn 1 size.",
        daysAgo: 14
      },
      {
        id: 3,
        username: "TranVanC",
        verified: true,
        height: "1m75 - 1m80",
        weight: "70 - 75 kg",
        bodyType: "Regular",
        sizePurchased: "XL",
        usualSize: "L",
        rating: 5,
        title: "Rất hài lòng",
        comment: "Giao hàng nhanh, đóng gói cẩn thận. Áo đẹp như hình, màu sắc chuẩn. Giá cả hợp lý.",
        daysAgo: 21
      }
    ];

    const mockStats = {
      overallRating: 4.7,
      totalReviews: 3,
      distribution: [0, 0, 0, 1, 2], // [1star, 2star, 3star, 4star, 5star]
      sizeFit: 3 // Runs slightly large
    };

    setTimeout(() => {
      setReviews(mockReviews);
      setStats(mockStats);
      setLoading(false);
    }, 300);
  }, [productId]);

  const renderStars = (rating, size = 22) => {
    const fullStars = Math.floor(rating);
    
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill={i < fullStars ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1" className="text-black">
            <path d="M8 1.5l1.902 5.853h6.153l-4.975 3.615 1.902 5.853L8 13.206l-4.982 3.615 1.902-5.853L0 7.353h6.153z" />
          </svg>
        ))}
      </div>
    );
  };

  const sizeFitLabels = ['Runs very small', 'Runs small', 'True to size', 'Runs large', 'Runs very large'];

  if (loading) {
    return (
      <div className="px-[196px] flex flex-col gap-10">
        <p className="text-2xl text-center text-neutral-800 leading-[33.24px] font-semibold font-['Maison_Neue']">
          Reviews
        </p>
        <div className="animate-pulse bg-gray-200 h-64" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="px-[196px] flex flex-col gap-10">
        <p className="text-2xl text-center text-neutral-800 leading-[33.24px] font-semibold font-['Maison_Neue']">
          Reviews
        </p>
        <p className="text-center text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="px-[196px] flex flex-col gap-10">
      {/* Title */}
      <p className="text-2xl text-center text-neutral-800 leading-[33.24px] font-semibold font-['Maison_Neue']">
        Reviews
      </p>

      {/* Overall Rating Section */}
      <div className="bg-[#F5F4F4] flex gap-[55px] items-start px-14 pt-9 pb-[84px]">
        {/* Overall Rating */}
        <div className="flex-1 flex flex-col gap-[15px]">
          <p className="text-base font-semibold text-neutral-800 tracking-[0.2px] font-['Maison_Neue']">
            {stats.overallRating.toFixed(1)} Overall Rating
          </p>
          {renderStars(stats.overallRating)}
          <p className="text-xs text-neutral-500">Based on {stats.totalReviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 flex flex-col gap-2">
          {[5, 4, 3, 2, 1].map((starNum) => {
            const count = stats.distribution[starNum - 1];
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            
            return (
              <div key={starNum} className="flex gap-1 items-center">
                <p className="text-xs text-neutral-500 tracking-[0.2px] font-['Maison_Neue']">
                  {starNum}
                </p>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" className="text-black">
                  <path d="M8 1.5l1.902 5.853h6.153l-4.975 3.615 1.902 5.853L8 13.206l-4.982 3.615 1.902-5.853L0 7.353h6.153z" />
                </svg>
                <div className="flex-1 h-1.5 bg-[#DDDBDC] relative">
                  <div 
                    className="absolute left-0 top-0 h-full bg-neutral-800" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 tracking-[0.2px] font-['Maison_Neue'] w-6 text-right">
                  {count}
                </p>
              </div>
            );
          })}
        </div>

        {/* Size Fit */}
        <div className="flex-1 flex flex-col">
          <p className="text-base font-semibold text-neutral-800 tracking-[0.2px] font-['Maison_Neue']">
            {sizeFitLabels[stats.sizeFit]}
          </p>
          <div className="flex gap-1 items-center pt-4 pb-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`flex-1 h-2 ${index === stats.sizeFit ? 'bg-neutral-800' : 'bg-[#DDDBDC]'}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-800 tracking-[0.2px] font-['Maison_Neue']">
            <p>Run small</p>
            <p className="text-right">Run large</p>
          </div>
        </div>
      </div>

      {/* Filter and Sort */}
      <div className="flex items-center justify-between">
        <div className="border border-[#DDDBDC] flex gap-2.5 items-center p-4 w-[240px]">
          <p className="flex-1 text-2xl text-black leading-[33.24px] font-semibold font-['Maison_Neue']">
            Filter
          </p>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="8" x2="20" y2="8"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="16" x2="20" y2="16"/>
          </svg>
        </div>
        <div className="border border-[#DDDBDC] flex gap-2.5 items-center p-4 w-[240px]">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-2xl text-black leading-[33.24px] font-semibold font-['Maison_Neue']">
              Sort by:
            </p>
            <p className="text-xs text-neutral-500 tracking-[0.2px] font-['Maison_Neue']">
              Highest to Lowest Rating
            </p>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Review List */}
      <div className="flex flex-col gap-px">
        {reviews.map((review, index) => (
          <div
            key={review.id}
            className={`flex gap-2.5 items-start ${
              index === 0 ? 'border-b border-[#DDDBDC] pb-[57px]' : 'pt-10 pb-[57px]'
            }`}
          >
            {/* User Info */}
            <div className="w-[230px] flex flex-col">
              <p className="text-base font-semibold text-black tracking-[0.2px] font-['Maison_Neue']">
                {review.username}
              </p>
              <div className="flex gap-1 items-center py-5 pb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <p className="flex-1 text-xs text-neutral-800 tracking-[0.2px] font-['Maison_Neue']">
                  Verified
                </p>
              </div>
              <div className="flex gap-1 items-center text-xs text-neutral-800 tracking-[0.2px]">
                <p className="font-semibold font-['Maison_Neue']">Height:</p>
                <p className="flex-1 font-['Maison_Neue']">{review.height}</p>
              </div>
              <div className="flex gap-1 items-center text-xs text-neutral-800 tracking-[0.2px]">
                <p className="font-semibold font-['Maison_Neue']">Weight (lbs):</p>
                <p className="flex-1 font-['Maison_Neue']">{review.weight}</p>
              </div>
              <div className="flex gap-1 items-center text-xs text-neutral-800 tracking-[0.2px]">
                <p className="font-semibold font-['Maison_Neue']">Body Type:</p>
                <p className="flex-1 font-['Maison_Neue']">{review.bodyType}</p>
              </div>
              <div className="flex gap-1 items-center text-xs text-neutral-800 tracking-[0.2px] opacity-0">
                <p className="font-semibold font-['Maison_Neue']">Body Type:</p>
                <p className="flex-1 font-['Maison_Neue']">{review.bodyType}</p>
              </div>
              <div className="flex gap-1 items-center text-xs text-neutral-800 tracking-[0.2px]">
                <p className="font-semibold font-['Maison_Neue']">Size Purchased:</p>
                <p className="flex-1 font-['Maison_Neue']">{review.sizePurchased}</p>
              </div>
              <div className="flex gap-1 items-center text-xs text-neutral-800 tracking-[0.2px]">
                <p className="font-semibold font-['Maison_Neue']">Usual Size:</p>
                <p className="flex-1 font-['Maison_Neue']">{review.usualSize}</p>
              </div>
            </div>

            {/* Review Content */}
            <div className="flex-1 flex flex-col gap-3">
              {renderStars(review.rating, 20)}
              <p className="text-base font-semibold text-black tracking-[0.2px] font-['Maison_Neue']">
                {review.title}
              </p>
              <p className="text-sm text-black tracking-[1.4px] leading-[16.8px] font-['Maison_Neue']">
                {review.comment}
              </p>
            </div>

            {/* Date */}
            <p className="text-xs text-neutral-500 tracking-[0.2px] font-['Maison_Neue']">
              {review.daysAgo} days ago
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
