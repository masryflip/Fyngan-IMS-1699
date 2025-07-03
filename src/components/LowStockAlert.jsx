import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiAlertTriangle, FiXCircle } = FiIcons;

function LowStockAlert({ items }) {
  const lowStockItems = items.filter(item => 
    item.status === 'low-stock' || item.status === 'out-of-stock'
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {lowStockItems.length} alerts
        </span>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <SafeIcon icon={FiAlertTriangle} className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No stock alerts at the moment</p>
          </div>
        ) : (
          lowStockItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                item.status === 'out-of-stock' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <SafeIcon 
                  icon={item.status === 'out-of-stock' ? FiXCircle : FiAlertTriangle} 
                  className={`w-5 h-5 ${
                    item.status === 'out-of-stock' ? 'text-red-500' : 'text-yellow-500'
                  }`} 
                />
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} {item.unit} remaining
                  </p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                item.status === 'out-of-stock' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status === 'out-of-stock' ? 'Out of Stock' : 'Low Stock'}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default LowStockAlert;