import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiSettings, FiLogOut, FiChevronDown, FiEdit, FiShield, FiHelpCircle, FiBell, FiMoon, FiSun } = FiIcons;

function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileEdit = () => {
    setIsOpen(false);
    setShowEditProfile(true);
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  // Get user initials for avatar
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

  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    return `User ${user?.userId || 'Unknown'}`;
  };

  const menuItems = [
    {
      icon: FiEdit,
      label: 'Edit Profile',
      action: handleProfileEdit,
      description: 'Update your personal information'
    },
    {
      icon: FiSettings,
      label: 'Settings',
      action: handleSettingsClick,
      description: 'System preferences and configuration'
    },
    {
      icon: FiBell,
      label: 'Notification Settings',
      action: () => {
        setIsOpen(false);
        navigate('/settings');
      },
      description: 'Manage your notification preferences'
    },
    {
      icon: FiHelpCircle,
      label: 'Help & Support',
      action: () => {
        setIsOpen(false);
        window.open('https://help.fyngan.com', '_blank');
      },
      description: 'Get help and documentation'
    }
  ];

  return (
    <>
      <div className="relative">
        {/* User Avatar Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-medium text-sm">
                {getUserInitials()}
              </span>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="hidden sm:block"
          >
            <SafeIcon icon={FiChevronDown} className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </motion.div>
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay */}
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

              {/* Dropdown Panel */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                {/* User Info Header */}
                <div className="p-4 bg-gradient-to-r from-coffee-50 to-coffee-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {getUserInitials()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {getUserDisplayName()}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {user?.email || 'Fyngan IMS User'}
                      </p>
                      {user?.department && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.department}
                        </p>
                      )}
                      <div className="flex items-center space-x-1 mt-1">
                        <SafeIcon icon={FiShield} className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={item.action}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-start space-x-3"
                    >
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <SafeIcon icon={item.icon} className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                      </div>
                    </motion.button>
                  ))}

                  {/* Dark Mode Toggle */}
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <SafeIcon icon={isDarkMode ? FiMoon : FiSun} className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark theme</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isDarkMode}
                          onChange={toggleDarkMode}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 dark:peer-focus:ring-coffee-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Logout Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                  <motion.button
                    whileHover={{ backgroundColor: isDarkMode ? '#7f1d1d' : '#fef2f2' }}
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                      <SafeIcon icon={FiLogOut} className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sign Out</p>
                      <p className="text-xs text-red-500 dark:text-red-400">Logout from Fyngan IMS</p>
                    </div>
                  </motion.button>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Fyngan IMS v1.0.0
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </>
  );
}

export default UserProfileDropdown;