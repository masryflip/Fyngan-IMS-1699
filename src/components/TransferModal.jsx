import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiArrowRight } = FiIcons;

function TransferModal({ isOpen, onClose, item }) {
  const { dispatch, state } = useInventory();
  const [formData, setFormData] = useState({
    fromLocationId: state.currentLocation,
    toLocationId: '',
    quantity: '',
    reason: '',
    expectedDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const fromLocation = state.locations.find(loc => loc.id === parseInt(formData.fromLocationId));
    const toLocation = state.locations.find(loc => loc.id === parseInt(formData.toLocationId));

    const newTransfer = {
      itemId: item.id,
      itemName: item.name,
      fromLocationId: parseInt(formData.fromLocationId),
      fromLocationName: fromLocation.name,
      toLocationId: parseInt(formData.toLocationId),
      toLocationName: toLocation.name,
      quantity: parseFloat(formData.quantity),
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      expectedDate: formData.expectedDate,
      reason: formData.reason
    };

    dispatch({ type: 'ADD_TRANSFER', payload: newTransfer });

    setFormData({
      fromLocationId: state.currentLocation,
      toLocationId: '',
      quantity: '',
      reason: '',
      expectedDate: ''
    });
    onClose();
  };

  if (!item || !isOpen) return null;

  const availableLocations = state.locations.filter(loc => loc.id !== parseInt(formData.fromLocationId));
  const fromLocationStock = item.locations[formData.fromLocationId]?.quantity || 0;
  const maxTransferQuantity = fromLocationStock;

  // Determine step value based on unit
  const getStepValue = () => {
    const decimalUnits = ['kg', 'liters', 'gallons', 'pounds', 'tons', 'ml', 'grams'];
    return decimalUnits.includes(item.unit) ? '0.01' : '1';
  };

  const formatQuantity = (value) => {
    const decimalUnits = ['kg', 'liters', 'gallons', 'pounds', 'tons', 'ml', 'grams'];
    if (decimalUnits.includes(item.unit)) {
      return parseFloat(value).toFixed(2);
    }
    return Math.round(value).toString();
  };

  const getMinValue = () => {
    return getStepValue();
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
        />

        {/* Modal content */}
        <div 
          className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-[10000]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Transfer Stock</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{item.name}</h4>
            <p className="text-sm text-gray-600">
              Available for transfer: {formatQuantity(maxTransferQuantity)} {item.unit}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Location
                </label>
                <select
                  value={formData.fromLocationId}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    fromLocationId: parseInt(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  autoFocus
                >
                  {state.locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({formatQuantity(item.locations[location.id]?.quantity || 0)} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Location
                </label>
                <select
                  required
                  value={formData.toLocationId}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    toLocationId: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                >
                  <option value="">Select destination...</option>
                  {availableLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({formatQuantity(item.locations[location.id]?.quantity || 0)} {item.unit})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Transfer
              </label>
              <input
                type="number"
                min={getMinValue()}
                max={maxTransferQuantity}
                step={getStepValue()}
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  quantity: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                placeholder={`0${getStepValue() === '0.01' ? '.00' : ''}`}
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum: {formatQuantity(maxTransferQuantity)} {item.unit}
              </p>
              {getStepValue() === '0.01' && (
                <p className="text-xs text-blue-600 mt-1">
                  Decimal quantities allowed (e.g., 2.5, 10.75)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Transfer Date
              </label>
              <input
                type="date"
                required
                value={formData.expectedDate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  expectedDate: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Transfer
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  reason: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              >
                <option value="">Select reason...</option>
                <option value="stock-shortage">Stock Shortage</option>
                <option value="excess-inventory">Excess Inventory</option>
                <option value="location-closure">Location Closure</option>
                <option value="seasonal-demand">Seasonal Demand</option>
                <option value="customer-request">Customer Request</option>
                <option value="quality-control">Quality Control</option>
                <option value="other">Other</option>
              </select>
            </div>

            {formData.fromLocationId && formData.toLocationId && (
              <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <span>{state.locations.find(l => l.id === parseInt(formData.fromLocationId))?.name}</span>
                  <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
                  <span>{state.locations.find(l => l.id === parseInt(formData.toLocationId))?.name}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={maxTransferQuantity === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-coffee-500 rounded-lg hover:bg-coffee-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Transfer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TransferModal;