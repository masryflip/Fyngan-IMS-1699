import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiMapPin, FiPackage } = FiIcons;

const statusConfig = {
  'in-stock': {
    color: 'text-green-800',
    bg: 'bg-green-100',
    text: 'In Stock'
  },
  'low-stock': {
    color: 'text-yellow-800',
    bg: 'bg-yellow-100',
    text: 'Low Stock'
  },
  'out-of-stock': {
    color: 'text-red-800',
    bg: 'bg-red-100',
    text: 'Out of Stock'
  }
};

function ItemLocationModal({ isOpen, onClose, item }) {
  const { state } = useInventory();

  if (!item) return null;

  const totalQuantity = Object.values(item.locations).reduce((sum, loc) => sum + loc.quantity, 0);
  const totalValue = totalQuantity * item.cost;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Item Location Overview</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.category} • {item.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{totalQuantity} {item.unit}</p>
                    <p className="text-sm text-gray-600">${totalValue.toFixed(2)} total value</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <SafeIcon icon={FiMapPin} className="w-4 h-4 text-coffee-500" />
                  <span>Stock by Location</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.locations.map(location => {
                    const locationStock = item.locations[location.id] || { quantity: 0, status: 'out-of-stock' };
                    const locationValue = locationStock.quantity * item.cost;
                    
                    return (
                      <motion.div
                        key={location.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-gray-900">{location.name}</h5>
                            <p className="text-sm text-gray-500">{location.address}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{locationStock.quantity} {item.unit}</p>
                            <p className="text-sm text-gray-600">${locationValue.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[locationStock.status].bg} ${statusConfig[locationStock.status].color}`}>
                            {statusConfig[locationStock.status].text}
                          </span>
                          <div className="text-sm text-gray-500">
                            {((locationStock.quantity / totalQuantity) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                  <SafeIcon icon={FiPackage} className="w-4 h-4" />
                  <span>Summary</span>
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-600">Total Stock</p>
                    <p className="font-medium text-blue-900">{totalQuantity} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-blue-600">Total Value</p>
                    <p className="font-medium text-blue-900">${totalValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-blue-600">Avg per Location</p>
                    <p className="font-medium text-blue-900">{(totalQuantity / state.locations.length).toFixed(1)} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-blue-600">Cost per Unit</p>
                    <p className="font-medium text-blue-900">${item.cost.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ItemLocationModal;