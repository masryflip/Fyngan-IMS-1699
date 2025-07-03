import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OnBoarding } from '@questlabs/react-sdk';
import { useAuth } from '../context/AuthContext';
import questConfig from '../config/questConfig';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheckCircle, FiArrowRight, FiCoffee, FiTarget, FiUsers, FiTrendingUp } = FiIcons;

function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const getAnswers = () => {
    // Mark onboarding as completed
    localStorage.setItem('onboardingCompleted', 'true');
    // Navigate to main dashboard
    navigate('/');
  };

  const onboardingSteps = [
    {
      icon: FiTarget,
      title: 'Set Your Goals',
      description: 'Define what you want to achieve with Fyngan IMS'
    },
    {
      icon: FiCoffee,
      title: 'Configure Your Business',
      description: 'Tell us about your business type and inventory needs'
    },
    {
      icon: FiUsers,
      title: 'Team Setup',
      description: 'Set up your team and assign roles'
    },
    {
      icon: FiTrendingUp,
      title: 'Analytics Preferences',
      description: 'Choose your preferred reporting and analytics settings'
    }
  ];

  const benefits = [
    'Multi-location inventory tracking',
    'Real-time stock level monitoring',
    'Automated reorder alerts',
    'Comprehensive reporting dashboard',
    'Team collaboration tools',
    'Mobile-friendly interface'
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-coffee-50 via-white to-coffee-100">
      {/* Left Section - Welcome & Progress */}
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
              Let's Get You
              <span className="block bg-gradient-to-r from-white to-coffee-100 bg-clip-text text-transparent">
                Set Up!
              </span>
            </h2>
            
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              We'll help you configure Fyngan IMS to perfectly match your business needs. This will only take a few minutes.
            </p>

            {/* Onboarding Steps Progress */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-white/90">Setup Progress</h3>
              <div className="space-y-3">
                {onboardingSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      index <= currentStep 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : 'bg-white/5'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < currentStep 
                        ? 'bg-green-500' 
                        : index === currentStep 
                        ? 'bg-white/30' 
                        : 'bg-white/10'
                    }`}>
                      {index < currentStep ? (
                        <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-white" />
                      ) : (
                        <SafeIcon icon={step.icon} className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{step.title}</p>
                      <p className="text-sm text-white/70">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white/90">What You'll Get</h3>
              <div className="grid grid-cols-1 gap-2">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-green-400" />
                    <span className="text-white/90 text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Onboarding Component */}
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
                <p className="text-gray-600 text-sm">Setup & Configuration</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8 lg:hidden">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's Get Started!</h2>
            <p className="text-gray-600">We're setting up your inventory management system</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <OnBoarding
              userId={userId}
              token={token}
              questId={questConfig.QUEST_ONBOARDING_QUESTID}
              answer={answers}
              setAnswer={setAnswers}
              getAnswers={getAnswers}
              accent={questConfig.PRIMARY_COLOR}
              singleChoose="modal1"
              multiChoice="modal2"
              style={{
                width: '100%',
                minHeight: '400px'
              }}
            >
              <OnBoarding.Header />
              <OnBoarding.Content />
              <OnBoarding.Footer />
            </OnBoarding>
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>Complete setup to access your dashboard</span>
              <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default OnboardingPage;