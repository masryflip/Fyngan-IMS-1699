import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import LocationSelector from './LocationSelector';
import NotificationCenter from './NotificationCenter';
import UserProfileDropdown from './UserProfileDropdown';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMenu, FiSearch } = FiIcons;

function Header({ onMenuClick }) {
  const { state } = useInventory();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40 transition-colors duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 active:scale-95"
          >
            <SafeIcon icon={FiMenu} className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-gradient-to-br from-coffee-400 to-coffee-600 shadow-lg flex items-center justify-center"
            >
              <img
                src="/logo.png"
                alt="Fyngan IMS Logo"
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center" style={{ display: 'none' }}>
                <span className="text-white font-bold text-sm sm:text-lg">F</span>
              </div>
            </motion.div>

            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Fyngan IMS</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{state.locations.length} Locations</p>
            </div>

            <div className="block sm:hidden">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Fyngan</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:block">
            <LocationSelector />
          </div>

          <div className="relative hidden md:block">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-coffee-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <NotificationCenter
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onToggle={() => setShowNotifications(!showNotifications)}
            />
          </div>

          <UserProfileDropdown />
        </div>
      </div>

      {/* Mobile Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-3 block md:hidden"
      >
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-coffee-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </motion.div>

      {/* Mobile Location Selector */}
      <div className="mt-3 block sm:hidden">
        <LocationSelector />
      </div>
    </motion.header>
  );
}

export default Header;