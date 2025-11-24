const Reviews = () => {
  const renderStars = (count, size = 22) => {
    return (
      <div className="flex gap-1">
        {[...Array(count)].map((_, i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className="text-black">
            <path d="M8 1.5l1.902 5.853h6.153l-4.975 3.615 1.902 5.853L8 13.206l-4.982 3.615 1.902-5.853L0 7.353h6.153z" />
          </svg>
        ))}
      </div>
    );
  };

  const reviews = [
    {
      id: 1,
      username: "ElizabethRBklyn",
      verified: true,
      height: "5'9\" - 5'11\"",
      weight: "161 - 180 lb",
      bodyType: "Petite",
      sizePurchased: "L",
      usualSize: "L",
      rating: 5,
      title: "Warm and very attractive on",
      comment: "Got this to keep my husband warm on those chilly late fall days. He loves it as it not only is pretty warm but he looks good in it and he knows it.",
      daysAgo: 14
    },
    {
      id: 2,
      username: "Anonymous",
      verified: true,
      height: "5'9\" - 5'11\"",
      weight: "161 - 180 lb",
      bodyType: "Petite",
      sizePurchased: "L",
      usualSize: "L",
      rating: 5,
      title: "Super comfy",
      comment: "Great quality, warm and super comfy. Got the XL cuz I have a large back and it fits perfect. It does run a bit oversized which is good.",
      daysAgo: 14
    }
  ];

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
            5.0 Overall Rating
          </p>
          {renderStars(5)}
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 flex flex-col gap-2">
          {[
            { stars: 5, count: 2, filled: true },
            { stars: 4, count: 0, filled: false },
            { stars: 3, count: 0, filled: false },
            { stars: 2, count: 0, filled: false },
            { stars: 1, count: 0, filled: false }
          ].map((rating) => (
            <div key={rating.stars} className="flex gap-1 items-center">
              <p className="text-xs text-neutral-500 tracking-[0.2px] font-['Maison_Neue']">
                {rating.stars}
              </p>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" className="text-black">
                <path d="M8 1.5l1.902 5.853h6.153l-4.975 3.615 1.902 5.853L8 13.206l-4.982 3.615 1.902-5.853L0 7.353h6.153z" />
              </svg>
              <div className={`flex-1 h-1.5 ${rating.filled ? 'bg-neutral-800' : 'bg-[#DDDBDC]'}`} />
              <p className="text-xs text-neutral-500 tracking-[0.2px] font-['Maison_Neue']">
                {rating.count}
              </p>
            </div>
          ))}
        </div>

        {/* Size Fit */}
        <div className="flex-1 flex flex-col">
          <p className="text-base font-semibold text-neutral-800 tracking-[0.2px] font-['Maison_Neue']">
            Runs slightly large
          </p>
          <div className="flex gap-1 items-center pt-4 pb-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`flex-1 h-2 ${index === 3 ? 'bg-neutral-800' : 'bg-[#DDDBDC]'}`}
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
