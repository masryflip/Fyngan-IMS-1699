import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMapPin, FiChevronDown, FiCheck } = FiIcons;

function LocationSelector() {
  const { state, dispatch } = useInventory();
  const [isOpen, setIsOpen] = useState(false);
  const currentLocationData = state.locations.find(loc => loc.id === state.currentLocation);

  const handleLocationChange = (locationId) => {
    dispatch({ type: 'SET_CURRENT_LOCATION', payload: parseInt(locationId) });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 min-w-0"
      >
        <SafeIcon icon={FiMapPin} className="w-4 h-4 text-coffee-500 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-700 truncate block">
            {currentLocationData?.name}
          </span>
          <span className="text-xs text-gray-500 truncate block sm:hidden">
            {currentLocationData?.address}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <SafeIcon icon={FiChevronDown} className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
            >
              <div className="p-2">
                {state.locations.map((location) => {
                  const isSelected = location.id === state.currentLocation;
                  return (
                    <motion.button
                      key={location.id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLocationChange(location.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        isSelected ? 'bg-coffee-50 border border-coffee-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm font-medium truncate ${
                              isSelected ? 'text-coffee-700' : 'text-gray-900'
                            }`}>
                              {location.name}
                            </p>
                            {isSelected && (
                              <SafeIcon icon={FiCheck} className="w-4 h-4 text-coffee-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{location.address}</p>
                          <p className="text-xs text-gray-400 mt-1">Manager: {location.manager}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LocationSelector;