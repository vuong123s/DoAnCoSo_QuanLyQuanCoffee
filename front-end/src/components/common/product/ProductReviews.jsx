import React, { useState, useEffect } from 'react';
import { FiStar, FiThumbsUp, FiUser, FiEdit3, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    customerName: ''
  });

  // Mock reviews data (in real app, this would come from API)
  const mockReviews = [
    {
      id: 1,
      customerName: 'Nguyễn Văn A',
      rating: 5,
      comment: 'Cà phê rất ngon, hương vị đậm đà. Nhân viên phục vụ nhiệt tình. Sẽ quay lại lần sau!',
      date: '2024-01-15',
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      customerName: 'Trần Thị B',
      rating: 4,
      comment: 'Món ăn ngon, không gian thoải mái. Giá cả hợp lý. Chỉ có điều phải chờ hơi lâu.',
      date: '2024-01-10',
      helpful: 8,
      verified: true
    },
    {
      id: 3,
      customerName: 'Lê Minh C',
      rating: 5,
      comment: 'Tuyệt vời! Đây là quán cà phê yêu thích của tôi. Cà phê thơm ngon, bánh ngọt cũng rất tốt.',
      date: '2024-01-08',
      helpful: 15,
      verified: false
    },
    {
      id: 4,
      customerName: 'Phạm Thị D',
      rating: 3,
      comment: 'Cà phê bình thường, không có gì đặc biệt. Giá hơi cao so với chất lượng.',
      date: '2024-01-05',
      helpful: 3,
      verified: true
    }
  ];

  useEffect(() => {
    // In real app, fetch reviews from API based on productId
    setReviews(mockReviews);
  }, [productId]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!newReview.customerName.trim()) {
      toast.error('Vui lòng nhập tên của bạn');
      return;
    }
    
    if (!newReview.comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    // In real app, submit to API
    const review = {
      id: Date.now(),
      customerName: newReview.customerName,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      verified: false
    };

    setReviews([review, ...reviews]);
    setNewReview({ rating: 5, comment: '', customerName: '' });
    setShowReviewForm(false);
    toast.success('Cảm ơn bạn đã đánh giá!');
  };

  const handleHelpful = (reviewId) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
    toast.success('Cảm ơn phản hồi của bạn!');
  };

  const renderStars = (rating, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`${size} ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const averageRating = calculateAverageRating();

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
        >
          <FiEdit3 className="w-4 h-4" />
          <span>Viết đánh giá</span>
        </button>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {averageRating}
          </div>
          <div className="flex items-center justify-center mb-2">
            {renderStars(Math.round(averageRating), 'w-6 h-6')}
          </div>
          <p className="text-gray-600">
            Dựa trên {reviews.length} đánh giá
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-8">{rating} sao</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{
                    width: `${reviews.length > 0 ? (ratingDistribution[rating] / reviews.length) * 100 : 0}%`
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8">
                {ratingDistribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Viết đánh giá của bạn
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên của bạn
              </label>
              <input
                type="text"
                value={newReview.customerName}
                onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Nhập tên của bạn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating })}
                    className="p-1"
                  >
                    <FiStar
                      className={`w-6 h-6 ${
                        rating <= newReview.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung đánh giá
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Gửi đánh giá
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có đánh giá nào
            </h3>
            <p className="text-gray-600">
              Hãy là người đầu tiên đánh giá sản phẩm này!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-gray-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {review.customerName}
                      </h4>
                      {review.verified && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Đã xác thực
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    {renderStars(review.rating)}
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleHelpful(review.id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <FiThumbsUp className="w-4 h-4" />
                      <span className="text-sm">Hữu ích ({review.helpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
