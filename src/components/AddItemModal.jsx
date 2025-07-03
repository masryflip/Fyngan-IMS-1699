import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiPlus } = FiIcons;

function AddItemModal({ isOpen, onClose }) {
  const { dispatch, state } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: 'kg',
    minStock: 5,
    maxStock: 50,
    cost: 0,
    supplier: '',
    expiryDate: ''
  });
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If adding a new category, add it first
    if (showNewCategoryInput && newCategoryName.trim()) {
      dispatch({
        type: 'ADD_CATEGORY',
        payload: {
          name: newCategoryName.trim(),
          color: 'blue' // Default color for new categories
        }
      });
      formData.category = newCategoryName.trim();
    }

    dispatch({ type: 'ADD_ITEM', payload: formData });
    
    // Reset form
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      unit: 'kg',
      minStock: 5,
      maxStock: 50,
      cost: 0,
      supplier: '',
      expiryDate: ''
    });
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'quantity' || field === 'minStock' || field === 'maxStock' || field === 'cost' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleCategoryChange = (value) => {
    if (value === 'add-new') {
      setShowNewCategoryInput(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setShowNewCategoryInput(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  // Determine step value based on unit
  const getStepValue = () => {
    const decimalUnits = ['kg', 'liters', 'gallons', 'pounds', 'tons', 'ml', 'grams'];
    return decimalUnits.includes(formData.unit) ? '0.01' : '1';
  };

  const getMinValue = () => {
    return formData.unit === 'pieces' ? '1' : '0';
  };

  // Get category names for dropdown
  const categoryNames = state.categories.map(cat => 
    typeof cat === 'string' ? cat : cat.name
  );

  // Don't render anything if not open
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
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-[10000]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add New Item</h3>
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
                Item Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                placeholder="Enter item name"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                {showNewCategoryInput ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                      placeholder="New category name"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategoryInput(false);
                        setNewCategoryName('');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category...</option>
                    {categoryNames.map(categoryName => (
                      <option key={categoryName} value={categoryName}>{categoryName}</option>
                    ))}
                    <option value="add-new" className="text-coffee-600 font-medium">
                      + Add New Category
                    </option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                >
                  <option value="kg">kg (kilograms)</option>
                  <option value="grams">grams</option>
                  <option value="pounds">pounds</option>
                  <option value="tons">tons</option>
                  <option value="liters">liters</option>
                  <option value="ml">ml (milliliters)</option>
                  <option value="gallons">gallons</option>
                  <option value="pieces">pieces</option>
                  <option value="bottles">bottles</option>
                  <option value="boxes">boxes</option>
                  <option value="packs">packs</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Quantity
                </label>
                <input
                  type="number"
                  min={getMinValue()}
                  step={getStepValue()}
                  required
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.unit === 'pieces' ? 'Whole numbers only' : 'Decimals allowed'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Stock
                </label>
                <input
                  type="number"
                  min={getMinValue()}
                  step={getStepValue()}
                  required
                  value={formData.minStock}
                  onChange={(e) => handleInputChange('minStock', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="5.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Stock
                </label>
                <input
                  type="number"
                  min={getMinValue()}
                  step={getStepValue()}
                  required
                  value={formData.maxStock}
                  onChange={(e) => handleInputChange('maxStock', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="50.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per Unit (EGP)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <select
                required
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              >
                <option value="">Select a supplier...</option>
                {state.suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
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
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddItemModal;