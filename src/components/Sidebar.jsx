import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHome, FiPackage, FiShoppingCart, FiBarChart3, FiSettings, FiX, FiMapPin, FiArrowRightLeft, FiUsers } = FiIcons;

const navigation = [
  { name: 'Dashboard', href: '/', icon: FiHome },
  { name: 'Inventory', href: '/inventory', icon: FiPackage },
  { name: 'Orders', href: '/orders', icon: FiShoppingCart },
  { name: 'Transfers', href: '/transfers', icon: FiArrowRightLeft },
  { name: 'Locations', href: '/locations', icon: FiMapPin },
  { name: 'Team', href: '/team', icon: FiUsers },
  { name: 'Reports', href: '/reports', icon: FiBarChart3 },
  { name: 'Settings', href: '/settings', icon: FiSettings },
];

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: -320,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const navigationVariants = {
    open: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    closed: {
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 }
      }
    },
    closed: {
      y: 20,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 }
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        initial="closed"
        className="fixed left-0 top-0 h-full w-72 sm:w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl z-50 lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200/50 dark:lg:border-gray-700/50 lg:bg-white dark:lg:bg-gray-800 transition-colors duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-coffee-400 to-coffee-600 shadow-lg flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Fyngan IMS Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-8 h-8 flex items-center justify-center" style={{ display: 'none' }}>
                <span className="text-white font-bold">F</span>
              </div>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">Fyngan IMS</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Inventory Management</p>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>
        </div>

        {/* Navigation */}
        <motion.nav variants={navigationVariants} className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <motion.div key={item.name} variants={itemVariants}>
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-coffee-500 to-coffee-600 text-white shadow-lg shadow-coffee-500/25'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-coffee-600 dark:hover:text-coffee-400'
                  }`}
                >
                  <SafeIcon
                    icon={item.icon}
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'text-white' : 'group-hover:scale-110'
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </motion.nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p>© 2024 Fyngan IMS</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default Sidebar;