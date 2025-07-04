import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCoffee, FiShield, FiTrendingUp, FiUsers, FiMail, FiLock, FiEye, FiEyeOff, FiInfo } = FiIcons;

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, loading, isAuthenticated, user, debugInfo, forceLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [formData, setFormData] = useState({
    email: 'test@example.com', // Pre-fill for easier testing
    password: 'password123'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    console.log('Form submitted:', { email: formData.email });

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        console.error('Sign in error:', error);
        setError(error.message);
        setIsSubmitting(false);
      } else {
        console.log('Sign in successful:', data);
        // Wait a moment for auth state to update, then redirect
        setTimeout(() => {
          if (!isAuthenticated) {
            console.log('Forcing redirect to dashboard');
            navigate('/', { replace: true });
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleTestLogin = () => {
    setFormData({
      email: 'test@example.com',
      password: 'password123'
    });
  };

  const features = [
    {
      icon: FiCoffee,
      title: 'Multi-Location Management',
      description: 'Manage inventory across all your business locations from one dashboard'
    },
    {
      icon: FiTrendingUp,
      title: 'Real-Time Analytics',
      description: 'Get insights into your inventory performance with detailed reports'
    },
    {
      icon: FiShield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: FiUsers,
      title: 'Team Collaboration',
      description: 'Work together with your team with role-based access control'
    }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-coffee-50 via-white to-coffee-100">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coffee-500 via-coffee-600 to-coffee-700"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Fyngan IMS" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 flex items-center justify-center" style={{ display: 'none' }}>
                  <span className="text-white font-bold text-xl">F</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Fyngan IMS</h1>
                <p className="text-white/80 text-sm">Inventory Management System</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Welcome Back to Your
              <span className="block bg-gradient-to-r from-white to-coffee-100 bg-clip-text text-transparent">
                Inventory Hub
              </span>
            </h2>
            
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Streamline your inventory management across multiple locations with powerful analytics and real-time tracking.
            </p>

            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <SafeIcon icon={feature.icon} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-coffee-500 to-coffee-600 rounded-2xl flex items-center justify-center shadow-lg">
                <img 
                  src="/logo.png" 
                  alt="Fyngan IMS" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 flex items-center justify-center" style={{ display: 'none' }}>
                  <span className="text-white font-bold text-xl">F</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fyngan IMS</h1>
                <p className="text-gray-600 text-sm">Inventory Management</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">
              Access your inventory management dashboard
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            {/* Debug Toggle */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <SafeIcon icon={FiInfo} className="w-3 h-3" />
                <span>Debug Info</span>
              </button>
              <button
                onClick={handleTestLogin}
                className="text-xs text-coffee-600 hover:text-coffee-700 underline"
              >
                Use Test Credentials
              </button>
            </div>

            {/* Debug Panel */}
            {showDebug && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-bold text-gray-700 mb-2 text-sm">Debug Information:</h4>
                <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto font-mono">
                  {debugInfo.slice(-8).map((info, index) => (
                    <div key={index}>{info.message}</div>
                  ))}
                </div>
                <button
                  onClick={forceLogin}
                  className="mt-2 px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                >
                  🔧 Force Login
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <SafeIcon 
                    icon={FiMail} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                  />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <SafeIcon 
                    icon={FiLock} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-coffee-500 text-white rounded-lg hover:bg-coffee-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading || isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Test Account Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Test Account</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Email:</strong> test@example.com</p>
                <p><strong>Password:</strong> password123</p>
                <p className="text-xs text-blue-600 mt-2">Click "Use Test Credentials" to auto-fill</p>
              </div>
            </div>

            {/* Account Request Information */}
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Need an Account?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Accounts are created and managed by your system administrator.
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Contact your IT administrator for account creation</p>
                <p>• Provide your email address and required access level</p>
                <p>• You'll receive login credentials once your account is set up</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Secure authentication powered by Supabase
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;