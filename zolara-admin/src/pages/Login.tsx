import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PersonIcon, 
  LockClosedIcon, 
  EyeOpenIcon, 
  EyeNoneIcon 
} from '@radix-ui/react-icons';
import { useAuth } from '../hooks/useAuth';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error: authError, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  // Redirect if already authenticated (only on mount or when actually authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Update errors when authError changes
  useEffect(() => {
    if (authError) {
      setErrors(prev => ({ ...prev, general: authError }));
    }
  }, [authError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (authError) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any form submission behavior
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors(prev => ({ ...prev, email: undefined, password: undefined }));
    clearError();

    const success = await login({
      email: formData.email,
      password: formData.password,
      deviceType: 'WEB',
      deviceName: 'Zolara Admin Dashboard'
    });

    if (!success) {
      setIsLoading(false);
    }
    // If successful, isAuthenticated will be true and useEffect will handle navigation
  };

  return (
    <div className="min-h-screen bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-linear-to-br from-purple-500 to-purple-700 p-4 rounded-2xl shadow-lg ring-4 ring-purple-200 ring-opacity-50">
              <img src="/logo.svg" alt="Zolara Logo" className="h-10 w-10" />
            </div>
          </div>
          <h1 className="mt-8 text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome to <span className="text-purple-600">Zolara</span>
          </h1>
          <p className="mt-3 text-base text-gray-600 font-medium">
            Sign in to access your admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 p-10 backdrop-blur-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                  <p className="text-sm font-semibold text-red-700">
                    {errors.general}
                  </p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Email Address
              </label>
              <div className="relative">
                <PersonIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-12 pr-4 py-2 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium ${
                    errors.email
                      ? "border-red-300 bg-red-50 focus:ring-red-200"
                      : "border-gray-200 bg-white hover:border-purple-300"
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-12 pr-14 py-2 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium ${
                    errors.password
                      ? "border-red-300 bg-red-50 focus:ring-red-200"
                      : "border-gray-200 bg-white hover:border-purple-300"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors p-1 rounded-md hover:bg-purple-50"
                >
                  {showPassword ? (
                    <EyeNoneIcon className="h-5 w-5" />
                  ) : (
                    <EyeOpenIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-2 border-gray-300 rounded bg-white"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  Remember me for 30 days
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-all duration-200"
                onClick={() =>
                  alert("Forgot password functionality not implemented")
                }
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white transition-all duration-200 transform ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:ring-4 focus:ring-purple-200 hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="h-px bg-linear-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
              <span className="font-medium">
                © 2025 Zolara Admin. All rights reserved.
              </span>
              <div className="h-px bg-linear-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;