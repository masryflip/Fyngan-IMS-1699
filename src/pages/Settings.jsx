import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../components/EditProfileModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSave, FiBell, FiShield, FiDatabase, FiMail, FiUser, FiEdit } = FiIcons;

function Settings() {
  const { user } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [settings, setSettings] = useState({
    lowStockThreshold: 5,
    emailNotifications: true,
    smsNotifications: false,
    autoReorder: false,
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    backupFrequency: 'daily'
  });

  const handleSave = () => {
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    return `User ${user?.userId || 'Unknown'}`;
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.userId) {
      const userId = user.userId.toString();
      if (userId.includes('-')) {
        return userId.split('-')[0].substring(0, 2).toUpperCase();
      }
      return userId.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your inventory system preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiUser} className="w-5 h-5 text-coffee-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Information</h3>
              </div>
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-coffee-600 dark:text-coffee-400 hover:bg-coffee-50 dark:hover:bg-coffee-900/20 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiEdit} className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-xl">
                    {getUserInitials()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {getUserDisplayName()}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email || 'Email not provided'}
                </p>
                {user?.department && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {user.department}
                  </p>
                )}
                {user?.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {user.phone}
                  </p>
                )}
              </div>
            </div>
            
            {user?.bio && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">{user.bio}</p>
              </div>
            )}
          </motion.div>

          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <SafeIcon icon={FiShield} className="w-5 h-5 text-coffee-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">General Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.lowStockThreshold}
                  onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="EGP">EGP (ج.م)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="SAR">SAR (ر.س)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="Africa/Cairo">Cairo (GMT+2)</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="America/New_York">New York (EST)</option>
                  <option value="America/Los_Angeles">Los Angeles (PST)</option>
                  <option value="Asia/Dubai">Dubai (GST)</option>
                  <option value="Asia/Riyadh">Riyadh (AST)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <SafeIcon icon={FiBell} className="w-5 h-5 text-coffee-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Receive alerts via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 dark:peer-focus:ring-coffee-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">SMS Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Receive alerts via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 dark:peer-focus:ring-coffee-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Reorder</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Automatically create orders for low stock</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoReorder}
                    onChange={(e) => handleInputChange('autoReorder', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 dark:peer-focus:ring-coffee-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Data & Backup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <SafeIcon icon={FiDatabase} className="w-5 h-5 text-coffee-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Data & Backup</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Backup Frequency
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-sm text-coffee-600 dark:text-coffee-400 border border-coffee-300 dark:border-coffee-600 rounded-lg hover:bg-coffee-50 dark:hover:bg-coffee-900/20 transition-colors">
                  Export Data
                </button>
                <button className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Import Data
                </button>
              </div>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <SafeIcon icon={FiMail} className="w-5 h-5 text-coffee-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Support</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-sm text-coffee-600 dark:text-coffee-400 border border-coffee-300 dark:border-coffee-600 rounded-lg hover:bg-coffee-50 dark:hover:bg-coffee-900/20 transition-colors">
                  Contact Support
                </button>
                <button className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  View Documentation
                </button>
                <button className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Report Bug
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 bg-coffee-500 text-white rounded-lg hover:bg-coffee-600 transition-colors"
          >
            <SafeIcon icon={FiSave} className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </>
  );
}

export default Settings;