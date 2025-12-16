import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import authService from '../../services/authService';
import { VALIDATION_MESSAGES, SUCCESS_MESSAGES } from '../../constants/messages';
import product1 from '../../assets/landing/product-1.png';
import product2 from '../../assets/landing/product-2.png';
import product3 from '../../assets/landing/product-3.png';
import product4 from '../../assets/landing/product-4.png';
import product5 from '../../assets/landing/product-5.png';
import grid1 from '../../assets/landing/grid-1.png';
import grid2 from '../../assets/landing/grid-2.png';
import grid3 from '../../assets/landing/grid-3.png';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = VALIDATION_MESSAGES.FULL_NAME_REQUIRED;
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = VALIDATION_MESSAGES.FULL_NAME_MIN_LENGTH;
    } else if (formData.full_name.trim().length > 255) {
      newErrors.full_name = VALIDATION_MESSAGES.FULL_NAME_MAX_LENGTH;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = VALIDATION_MESSAGES.EMAIL_REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = VALIDATION_MESSAGES.PASSWORD_REQUIRED;
    } else if (formData.password.length < 6) {
      newErrors.password = VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = VALIDATION_MESSAGES.CONFIRM_PASSWORD_MISMATCH;
    }

    // Phone validation (required)
    if (!formData.phone.trim()) {
      newErrors.phone = VALIDATION_MESSAGES.PHONE_REQUIRED;
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.trim())) {
      newErrors.phone = VALIDATION_MESSAGES.PHONE_INVALID;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for API (exclude confirmPassword)
      const { confirmPassword, ...registerData } = formData;
      const requestData = {
        ...registerData,
        phone: formData.phone.trim(),
      };
      const response = await authService.register(requestData);

      if (response.success) {
        message.success(SUCCESS_MESSAGES.REGISTER_SUCCESS);
        // Redirect to login page
        navigate('/login');
      }
    } catch (error) {
      // Handle different error types - only show error message, no notification
      let errorMessage = VALIDATION_MESSAGES.REGISTER_FAILED;
      
      // Map common API error messages to Vietnamese
      if (error.message) {
        const lowerMessage = error.message.toLowerCase();
        if (lowerMessage.includes('email already exists') || lowerMessage.includes('email đã tồn tại')) {
          errorMessage = VALIDATION_MESSAGES.EMAIL_ALREADY_EXISTS;
        } else if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
          errorMessage = VALIDATION_MESSAGES.NETWORK_ERROR;
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({
        submit: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Left side - Image Gallery */}
        <div className="hidden lg:flex lg:w-[60%] relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10 z-10"></div>
          
          {/* Gallery Container */}
          <div className="relative w-full h-full p-6 pt-12 flex items-start justify-center">
            <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
              {/* Small image - top left */}
              <div className="col-span-1 row-span-1 relative group animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent rounded-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-full h-full animate-float-fast">
                  <img
                    src={product4}
                    alt="Product"
                    className="w-full h-full object-cover rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                  />
                </div>
              </div>
              
              {/* Medium image - top middle */}
              <div className="col-span-1 row-span-1 relative group animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent rounded-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-full h-full animate-float-medium">
                  <img
                    src={product5}
                    alt="Product"
                    className="w-full h-full object-cover rounded-xl shadow-lg transform group-hover:scale-110 group-hover:-rotate-1 transition-all duration-700 ease-out"
                  />
                </div>
              </div>
              
              {/* Large featured image - top right */}
              <div className="col-span-1 row-span-2 relative group animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent rounded-2xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-full h-full animate-float-slow">
                  <img
                    src={product2}
                    alt="Featured Product"
                    className="w-full h-full object-cover rounded-2xl shadow-xl transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 ease-out"
                  />
                </div>
              </div>
              
              {/* Large featured image - bottom left */}
              <div className="col-span-2 row-span-2 relative group animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent rounded-2xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-full h-full animate-float-slow">
                  <img
                    src={product3}
                    alt="Featured Product"
                    className="w-full h-full object-cover rounded-2xl shadow-xl transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-700 ease-out"
                  />
                </div>
              </div>
              
              {/* Small image - bottom right */}
              <div className="col-span-1 row-span-1 relative group animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent rounded-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-full h-full animate-float-medium">
                  <img
                    src={grid3}
                    alt="Product"
                    className="w-full h-full object-cover rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                  />
                </div>
              </div>
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute top-12 right-12 w-32 h-32 bg-black/5 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute bottom-12 left-12 w-40 h-40 bg-black/5 rounded-full blur-3xl animate-float-medium" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Add custom styles for animations */}
          <style>{`
            @keyframes fade-in-up {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes float-slow {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-20px);
              }
            }
            
            @keyframes float-medium {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-15px);
              }
            }
            
            @keyframes float-fast {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-10px);
              }
            }
            
            .animate-fade-in-up {
              animation: fade-in-up 0.8s ease-out;
            }
            
            .animate-float-slow {
              animation: float-slow 6s ease-in-out infinite;
            }
            
            .animate-float-medium {
              animation: float-medium 4s ease-in-out infinite;
            }
            
            .animate-float-fast {
              animation: float-fast 3s ease-in-out infinite;
            }
          `}</style>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 lg:w-[40%] flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Đăng ký</h1>
              <p className="text-gray-600">
                Tạo tài khoản mới để bắt đầu mua sắm.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full name field */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors`}
                  placeholder="Nguyễn Văn A"
                  disabled={isLoading}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors`}
                  placeholder="email@example.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors`}
                  placeholder="0912345678"
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm password field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Error message - above button */}
              {errors.submit && (
                <p className="text-red-500 text-sm text-center">{errors.submit}</p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className="text-black font-medium hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

