import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QuestLogin } from '@questlabs/react-sdk';
import { useAuth } from '../context/AuthContext';
import questConfig from '../config/questConfig';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCoffee, FiShield, FiTrendingUp, FiUsers } = FiIcons;

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = ({ userId, token, newUser }) => {
    const userData = {
      userId,
      token,
      newUser
    };
    
    login(userData);
    
    if (newUser) {
      navigate('/onboarding');
    } else {
      navigate('/');
    }
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
            <p className="text-gray-600">Access your inventory management dashboard</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <QuestLogin
              onSubmit={handleLogin}
              email={true}
              google={false}
              accent={questConfig.PRIMARY_COLOR}
              style={{
                width: '100%',
                minHeight: '400px'
              }}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              New to Fyngan IMS? Your account will be created automatically upon first login.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;