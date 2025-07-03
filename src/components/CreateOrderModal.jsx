import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX } = FiIcons;

function CreateOrderModal({ isOpen, onClose }) {
  const { dispatch, state } = useInventory();
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: 0,
    expectedDelivery: '',
    supplier: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedItem = state.items.find(item => item.id === parseInt(formData.itemId));
    if (selectedItem) {
      const newOrder = {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        quantity: parseInt(formData.quantity),
        status: 'pending',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: formData.expectedDelivery,
        supplier: formData.supplier,
        cost: selectedItem.cost * parseInt(formData.quantity)
      };
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
    }

    setFormData({
      itemId: '',
      quantity: 0,
      expectedDelivery: '',
      supplier: ''
    });
    onClose();
  };

  const selectedItem = state.items.find(item => item.id === parseInt(formData.itemId));

  if (!isOpen) return null;

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
            <h3 className="text-lg font-medium text-gray-900">Create New Order</h3>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item
              </label>
              <select
                required
                value={formData.itemId}
                onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                autoFocus
              >
                <option value="">Select an item...</option>
                {state.items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Current: {item.locations[state.currentLocation]?.quantity || 0} {item.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <select
                required
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              >
                <option value="">Select supplier...</option>
                {state.suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                required
                value={formData.expectedDelivery}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              />
            </div>

            {selectedItem && formData.quantity > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Estimated Cost: ج.م {(selectedItem.cost * parseInt(formData.quantity || 0)).toFixed(2)}
                </p>
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
                className="px-4 py-2 text-sm font-medium text-white bg-coffee-500 rounded-lg hover:bg-coffee-600 transition-colors"
              >
                Create Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateOrderModal;