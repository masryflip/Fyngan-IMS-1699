import React from 'react';
import { motion } from 'framer-motion';

function InventoryChart({ items }) {
  const categoryData = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.keys(categoryData);
  const maxCount = Math.max(...Object.values(categoryData));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Category</h3>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{category}</span>
            <div className="flex items-center space-x-3 flex-1 ml-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(categoryData[category] / maxCount) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="bg-coffee-500 h-2 rounded-full"
                />
              </div>
              <span className="text-sm text-gray-600 min-w-[2rem]">{categoryData[category]}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default InventoryChart;