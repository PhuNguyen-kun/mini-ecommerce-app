import { FiBarChart2, FiStar, FiImage } from 'react-icons/fi';

const ReviewStatsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Reviews */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-sm">Tổng đánh giá</p>
                        <p className="text-2xl font-bold mt-1">{stats.totalReviews || 0}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <FiBarChart2 className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Average Rating */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-sm">Điểm trung bình</p>
                        <p className="text-2xl font-bold mt-1">
                            {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}/5
                        </p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                        <FiStar className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
            </div>

            {/* Reviews with Images */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-sm">Có hình ảnh</p>
                        <p className="text-2xl font-bold mt-1">{stats.reviewsWithImages || 0}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                        <FiImage className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewStatsCards;
