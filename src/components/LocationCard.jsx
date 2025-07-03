import React from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMapPin, FiPhone, FiUser, FiEdit, FiTrash2, FiCheck, FiAlertTriangle, FiX } = FiIcons;

function LocationCard({ location }) {
  const { state, dispatch } = useInventory();

  const getLocationStats = () => {
    const locationItems = state.items.map(item => ({
      ...item,
      quantity: item.locations[location.id]?.quantity || 0,
      status: item.locations[location.id]?.status || 'out-of-stock'
    }));

    const inStock = locationItems.filter(item => item.status === 'in-stock').length;
    const lowStock = locationItems.filter(item => item.status === 'low-stock').length;
    const outOfStock = locationItems.filter(item => item.status === 'out-of-stock').length;
    const totalValue = locationItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

    return { inStock, lowStock, outOfStock, totalValue };
  };

  const stats = getLocationStats();
  const isCurrentLocation = state.currentLocation === location.id;

  const handleSetCurrent = () => {
    dispatch({ type: 'SET_CURRENT_LOCATION', payload: location.id });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${location.name}? This will remove all inventory data for this location.`)) {
      dispatch({ type: 'DELETE_LOCATION', payload: location.id });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white p-6 rounded-xl shadow-sm border transition-all cursor-pointer ${
        isCurrentLocation ? 'border-coffee-500 ring-2 ring-coffee-200' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
            {isCurrentLocation && (
              <span className="text-xs font-medium text-coffee-600 bg-coffee-100 px-2 py-1 rounded-full">
                Current
              </span>
            )}
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiMapPin} className="w-4 h-4" />
              <span>{location.address}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiUser} className="w-4 h-4" />
              <span>{location.manager}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiPhone} className="w-4 h-4" />
              <span>{location.phone}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSetCurrent}
            className={`p-2 rounded-lg transition-colors ${
              isCurrentLocation 
                ? 'bg-coffee-100 text-coffee-600' 
                : 'text-gray-400 hover:text-coffee-600 hover:bg-coffee-50'
            }`}
            title="Set as Current Location"
          >
            <SafeIcon icon={FiCheck} className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit Location"
          >
            <SafeIcon icon={FiEdit} className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Location"
          >
            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Inventory Status</h4>
          <span className="text-sm font-bold text-gray-900">${stats.totalValue.toFixed(2)}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-900">{stats.inStock}</span>
            </div>
            <p className="text-xs text-gray-500">In Stock</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900">{stats.lowStock}</span>
            </div>
            <p className="text-xs text-gray-500">Low Stock</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <SafeIcon icon={FiX} className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-900">{stats.outOfStock}</span>
            </div>
            <p className="text-xs text-gray-500">Out of Stock</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default LocationCard;