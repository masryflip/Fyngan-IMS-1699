import React from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMapPin, FiAlertTriangle, FiCheck, FiX } = FiIcons;

function LocationOverview() {
  const { state, dispatch } = useInventory();
  const { locations, items } = state;

  const getLocationStats = (locationId) => {
    const locationItems = items.map(item => ({
      ...item,
      quantity: item.locations[locationId]?.quantity || 0,
      status: item.locations[locationId]?.status || 'out-of-stock'
    }));

    const lowStock = locationItems.filter(item => item.status === 'low-stock').length;
    const outOfStock = locationItems.filter(item => item.status === 'out-of-stock').length;
    const inStock = locationItems.filter(item => item.status === 'in-stock').length;
    const totalValue = locationItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

    return { lowStock, outOfStock, inStock, totalValue };
  };

  const handleLocationClick = (locationId) => {
    dispatch({ type: 'SET_CURRENT_LOCATION', payload: locationId });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">All Locations</h3>
        <SafeIcon icon={FiMapPin} className="w-5 h-5 text-coffee-500" />
      </div>

      <div className="space-y-4">
        {locations.map((location) => {
          const stats = getLocationStats(location.id);
          const isCurrentLocation = state.currentLocation === location.id;
          
          return (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isCurrentLocation 
                  ? 'border-coffee-500 bg-coffee-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleLocationClick(location.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{location.name}</h4>
                  <p className="text-sm text-gray-500">{location.address}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${stats.totalValue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Total Value</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{stats.inStock}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{stats.lowStock}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiX} className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">{stats.outOfStock}</span>
                  </div>
                </div>
                {isCurrentLocation && (
                  <span className="text-xs font-medium text-coffee-600 bg-coffee-100 px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default LocationOverview;