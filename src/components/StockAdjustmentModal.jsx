import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiPlus, FiMinus } = FiIcons;

function StockAdjustmentModal({ isOpen, onClose, item }) {
  const { dispatch, state } = useInventory();
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch({
      type: 'ADJUST_STOCK',
      payload: {
        id: item.id,
        locationId: state.currentLocation,
        adjustment: parseFloat(adjustment || 0),
        reason
      }
    });

    setAdjustment('');
    setReason('');
    onClose();
  };

  if (!item || !isOpen) return null;

  const currentLocationStock = item.locations[state.currentLocation]?.quantity || 0;
  const adjustmentValue = parseFloat(adjustment || 0);
  const newQuantity = Math.max(0, currentLocationStock + adjustmentValue);
  const currentLocationName = state.locations.find(loc => loc.id === state.currentLocation)?.name;

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

  const handleQuickAdjustment = (value) => {
    const currentAdjustment = parseFloat(adjustment || 0);
    const newAdjustment = currentAdjustment + value;
    setAdjustment(newAdjustment.toString());
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
            <h3 className="text-lg font-medium text-gray-900">Adjust Stock</h3>
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
              Current Stock at {currentLocationName}: {formatQuantity(currentLocationStock)} {item.unit}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjustment Amount
              </label>
              
              {/* Quick adjustment buttons */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-500">Quick adjust:</span>
                <button
                  type="button"
                  onClick={() => handleQuickAdjustment(-10)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjustment(-1)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjustment(1)}
                  className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjustment(10)}
                  className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                >
                  +10
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const stepValue = parseFloat(getStepValue());
                    handleQuickAdjustment(-stepValue);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiMinus} className="w-4 h-4" />
                </button>
                
                <input
                  type="number"
                  step={getStepValue()}
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-center"
                  placeholder={`0${getStepValue() === '0.01' ? '.00' : ''}`}
                  autoFocus
                />
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const stepValue = parseFloat(getStepValue());
                    handleQuickAdjustment(stepValue);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">New quantity:</span> {formatQuantity(newQuantity)} {item.unit}
                </p>
                {adjustmentValue > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Adding {formatQuantity(Math.abs(adjustmentValue))} {item.unit}
                  </p>
                )}
                {adjustmentValue < 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Removing {formatQuantity(Math.abs(adjustmentValue))} {item.unit}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (optional)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              >
                <option value="">Select reason...</option>
                <option value="received-shipment">Received Shipment</option>
                <option value="damaged-goods">Damaged Goods</option>
                <option value="expired-items">Expired Items</option>
                <option value="inventory-correction">Inventory Correction</option>
                <option value="used-in-production">Used in Production</option>
                <option value="customer-sale">Customer Sale</option>
                <option value="transfer-received">Transfer Received</option>
                <option value="transfer-sent">Transfer Sent</option>
                <option value="wastage">Wastage/Spillage</option>
                <option value="theft">Theft/Loss</option>
                <option value="other">Other</option>
              </select>
            </div>

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
                className="px-4 py-2 text-sm font-medium text-white bg-coffee-500 rounded-lg hover:bg-coffee-600 transition-colors"
              >
                Adjust Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StockAdjustmentModal;