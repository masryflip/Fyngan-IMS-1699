import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setupWizard } from '../utils/setupWizard';
import { companyConfig } from '../config/companyConfig';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiCheck, 
  FiArrowRight, 
  FiBuilding, 
  FiMapPin, 
  FiUsers, 
  FiPackage,
  FiX
} = FiIcons;

function SetupWizard({ onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(setupWizard.getSetupProgress());

  useEffect(() => {
    if (setupWizard.isFirstTimeSetup()) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    setProgress(setupWizard.getSetupProgress());
  }, []);

  const handleComplete = () => {
    setupWizard.completeSetup();
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    const confirmSkip = window.confirm(
      'Are you sure you want to skip the setup? You can access it later in Settings.'
    );
    if (confirmSkip) {
      setIsOpen(false);
    }
  };

  const setupSteps = [
    {
      id: 'companyInfo',
      title: 'Company Information',
      description: 'Configure your company details and branding',
      icon: FiBuilding,
      action: () => window.open('/settings', '_blank')
    },
    {
      id: 'locations', 
      title: 'Business Locations',
      description: 'Add your stores, warehouses, or offices',
      icon: FiMapPin,
      action: () => window.open('/locations', '_blank')
    },
    {
      id: 'team',
      title: 'Team Members',
      description: 'Invite your team and assign roles',
      icon: FiUsers, 
      action: () => window.open('/team', '_blank')
    },
    {
      id: 'inventory',
      title: 'Initial Inventory',
      description: 'Add your products and set stock levels',
      icon: FiPackage,
      action: () => window.open('/inventory', '_blank')
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Welcome to Fyngan IMS! 🎉
                </h3>
                <p className="text-gray-600 mt-1">
                  Let's get your inventory management system set up
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Setup Progress</span>
                <span className="text-sm text-gray-500">{progress.percentage}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  className="bg-gradient-to-r from-coffee-500 to-coffee-600 h-2 rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Setup Steps */}
            <div className="space-y-4 mb-8">
              {setupSteps.map((step, index) => {
                const isCompleted = progress[step.id];
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer hover:bg-gray-50 ${
                      isCompleted 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 hover:border-coffee-300'
                    }`}
                    onClick={step.action}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <SafeIcon icon={FiCheck} className="w-5 h-5" />
                      ) : (
                        <SafeIcon icon={step.icon} className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>

                    <SafeIcon icon={FiArrowRight} className="w-4 h-4 text-gray-400" />
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Start Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Quick Start Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Start by adding your business locations</li>
                <li>• Invite team members and assign appropriate roles</li>
                <li>• Add your most important inventory items first</li>
                <li>• Set up low stock alerts to avoid shortages</li>
                <li>• Use the demo data as a reference, then clear it when ready</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={setupWizard.clearDemoData}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Demo Data
                </button>
                <button
                  onClick={setupWizard.exportConfig}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Export Config
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Skip for now
                </button>
                {progress.isComplete ? (
                  <button
                    onClick={handleComplete}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiCheck} className="w-4 h-4" />
                    <span>Complete Setup</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    Complete Remaining Steps
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default SetupWizard;