import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    text: 'text-blue-600',
    bgLight: 'bg-blue-50',
    shadow: 'shadow-blue-500/20'
  },
  red: {
    bg: 'bg-gradient-to-br from-red-500 to-red-600',
    text: 'text-red-600',
    bgLight: 'bg-red-50',
    shadow: 'shadow-red-500/20'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    text: 'text-yellow-600',
    bgLight: 'bg-yellow-50',
    shadow: 'shadow-yellow-500/20'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-500 to-green-600',
    text: 'text-green-600',
    bgLight: 'bg-green-50',
    shadow: 'shadow-green-500/20'
  },
};

function StatsCard({ title, value, icon, color = 'blue', trend, trendValue }) {
  const colorConfig = colorClasses[color];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 ${colorConfig.shadow} hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <motion.p 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
          >
            {value}
          </motion.p>
          {trend && (
            <div className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center space-x-1`}>
              <span>{trend === 'up' ? '↗' : '↘'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${colorConfig.bg} flex items-center justify-center shadow-lg`}
        >
          <SafeIcon icon={icon} className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default StatsCard;