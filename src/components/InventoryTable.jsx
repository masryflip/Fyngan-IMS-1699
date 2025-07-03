import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiEdit, FiTrash2, FiArrowRightLeft, FiEye, FiMoreHorizontal, FiChevronDown, FiChevronRight, FiPackage, FiDollarSign } = FiIcons;

const statusConfig = {
  'in-stock': { color: 'text-emerald-800', bg: 'bg-emerald-100', text: 'In Stock', dot: 'bg-emerald-500' },
  'low-stock': { color: 'text-amber-800', bg: 'bg-amber-100', text: 'Low Stock', dot: 'bg-amber-500' },
  'out-of-stock': { color: 'text-red-800', bg: 'bg-red-100', text: 'Out of Stock', dot: 'bg-red-500' }
};

const categoryColors = {
  'blue': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', headerBg: 'bg-blue-50' },
  'green': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', headerBg: 'bg-green-50' },
  'purple': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', headerBg: 'bg-purple-50' },
  'orange': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', headerBg: 'bg-orange-50' },
  'pink': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', headerBg: 'bg-pink-50' },
  'yellow': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', headerBg: 'bg-yellow-50' },
  'indigo': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', headerBg: 'bg-indigo-50' },
  'red': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', headerBg: 'bg-red-50' },
  'teal': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', headerBg: 'bg-teal-50' },
  'gray': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', headerBg: 'bg-gray-50' }
};

function InventoryTable({ items, onStockAdjustment, onTransfer, onViewAllLocations }) {
  const { dispatch, state } = useInventory();
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedItems, setExpandedItems] = useState(new Set());

  const currentLocation = state.currentLocation;

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setEditForm(item);
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_ITEM', payload: editForm });
    setEditingItem(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const handleDelete = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item from all locations?')) {
      dispatch({ type: 'DELETE_ITEM', payload: itemId });
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: field === 'quantity' || field === 'minStock' || field === 'maxStock' || field === 'cost' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const toggleCategoryExpansion = (categoryName) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleItemExpansion = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Helper function to format quantities based on unit type
  const formatQuantity = (quantity, unit) => {
    const decimalUnits = ['kg', 'liters', 'gallons', 'pounds', 'tons', 'ml', 'grams'];
    if (decimalUnits.includes(unit)) {
      return parseFloat(quantity).toFixed(2);
    }
    return Math.round(quantity).toString();
  };

  const itemsWithLocationData = items.map(item => ({
    ...item,
    quantity: item.locations[currentLocation]?.quantity || 0,
    status: item.locations[currentLocation]?.status || 'out-of-stock',
    hasMultipleLocations: Object.keys(item.locations).length > 1
  }));

  // Group items by category
  const groupedItems = itemsWithLocationData.reduce((acc, item) => {
    const categoryName = item.category || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {});

  // Get category color configuration
  const getCategoryConfig = (categoryName) => {
    const category = state.categories.find(cat => 
      typeof cat === 'string' ? cat === categoryName : cat.name === categoryName
    );
    const colorKey = typeof category === 'string' ? 'blue' : (category?.color || 'blue');
    return categoryColors[colorKey] || categoryColors.blue;
  };

  // Calculate category stats
  const getCategoryStats = (categoryItems) => {
    const total = categoryItems.length;
    const inStock = categoryItems.filter(item => item.status === 'in-stock').length;
    const lowStock = categoryItems.filter(item => item.status === 'low-stock').length;
    const outOfStock = categoryItems.filter(item => item.status === 'out-of-stock').length;
    const totalValue = categoryItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    
    return { total, inStock, lowStock, outOfStock, totalValue };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {Object.entries(groupedItems).map(([categoryName, categoryItems]) => {
        const isExpanded = expandedCategories.has(categoryName);
        const categoryConfig = getCategoryConfig(categoryName);
        const stats = getCategoryStats(categoryItems);

        return (
          <motion.div
            key={categoryName}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border ${categoryConfig.border} overflow-hidden`}
          >
            {/* Category Header - Mobile Optimized */}
            <div 
              className={`${categoryConfig.headerBg} border-b ${categoryConfig.border} cursor-pointer`}
              onClick={() => toggleCategoryExpansion(categoryName)}
            >
              <div className="p-3 sm:p-4">
                {/* Mobile Layout - Stacked */}
                <div className="flex items-center justify-between mb-2 sm:mb-0">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SafeIcon icon={FiChevronRight} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </motion.div>
                    <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${categoryConfig.bg} ${categoryConfig.text}`}>
                      {categoryName}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600">
                      {stats.total} item{stats.total !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-bold text-gray-900">
                      ج.م {stats.totalValue.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {/* Stats Row - Mobile Optimized */}
                <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-xs sm:text-sm mt-2 sm:mt-0">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-gray-600">{stats.inStock}</span>
                    <span className="text-gray-500 hidden sm:inline">In Stock</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span className="text-gray-600">{stats.lowStock}</span>
                    <span className="text-gray-500 hidden sm:inline">Low</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-gray-600">{stats.outOfStock}</span>
                    <span className="text-gray-500 hidden sm:inline">Out</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Items - Mobile Optimized Cards */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-2 sm:p-4 space-y-2 sm:space-y-3"
                >
                  {categoryItems.map((item) => {
                    const isItemExpanded = expandedItems.has(item.id);
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                      >
                        {/* Item Header - Always Visible */}
                        <div 
                          className="p-3 sm:p-4 cursor-pointer"
                          onClick={() => toggleItemExpansion(item.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{item.name}</h3>
                                {item.hasMultipleLocations && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex-shrink-0">
                                    Multi
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <SafeIcon icon={FiPackage} className="w-3 h-3" />
                                  <span>{formatQuantity(item.quantity, item.unit)} {item.unit}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <SafeIcon icon={FiDollarSign} className="w-3 h-3" />
                                  <span>ج.م {item.cost.toFixed(2)}</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[item.status].bg} ${statusConfig[item.status].color}`}>
                                <span className={`w-2 h-2 rounded-full ${statusConfig[item.status].dot} mr-1`}></span>
                                <span className="hidden sm:inline">{statusConfig[item.status].text}</span>
                                <span className="sm:hidden">
                                  {item.status === 'in-stock' ? 'OK' : item.status === 'low-stock' ? 'Low' : 'Out'}
                                </span>
                              </span>
                              
                              <motion.div
                                animate={{ rotate: isItemExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <SafeIcon icon={FiChevronDown} className="w-4 h-4 text-gray-400" />
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Item Details */}
                        <AnimatePresence>
                          {isItemExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-gray-100"
                            >
                              <div className="p-3 sm:p-4 space-y-3">
                                {editingItem === item.id ? (
                                  /* Edit Mode */
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Item Name</label>
                                        <input
                                          type="text"
                                          value={editForm.name}
                                          onChange={(e) => handleInputChange('name', e.target.value)}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Cost (EGP)</label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={editForm.cost}
                                          onChange={(e) => handleInputChange('cost', e.target.value)}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
                                        <input
                                          type="text"
                                          value={editForm.supplier}
                                          onChange={(e) => handleInputChange('supplier', e.target.value)}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
                                        <input
                                          type="date"
                                          value={editForm.expiryDate || ''}
                                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-end space-x-2 pt-2">
                                      <button
                                        onClick={handleCancel}
                                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleSave}
                                        className="px-3 py-2 text-xs font-medium text-white bg-coffee-500 rounded-lg hover:bg-coffee-600 transition-colors"
                                      >
                                        Save Changes
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* View Mode */
                                  <div className="space-y-3">
                                    {/* Item Details Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                      <div>
                                        <p className="text-xs text-gray-500 font-medium">Supplier</p>
                                        <p className="text-gray-900 truncate">{item.supplier}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 font-medium">Expiry</p>
                                        <p className="text-gray-900">
                                          {item.expiryDate ? format(new Date(item.expiryDate), 'MMM d') : 'N/A'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 font-medium">Min Stock</p>
                                        <p className="text-gray-900">{formatQuantity(item.minStock, item.unit)}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 font-medium">Max Stock</p>
                                        <p className="text-gray-900">{formatQuantity(item.maxStock, item.unit)}</p>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onStockAdjustment(item);
                                        }}
                                        className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-white bg-coffee-500 rounded-lg hover:bg-coffee-600 transition-colors flex-1 justify-center"
                                      >
                                        <SafeIcon icon={FiEdit} className="w-3 h-3" />
                                        <span>Adjust Stock</span>
                                      </motion.button>
                                      
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onTransfer(item);
                                        }}
                                        className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex-1 justify-center"
                                      >
                                        <SafeIcon icon={FiArrowRightLeft} className="w-3 h-3" />
                                        <span>Transfer</span>
                                      </motion.button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onViewAllLocations(item);
                                        }}
                                        className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex-1 justify-center"
                                      >
                                        <SafeIcon icon={FiEye} className="w-3 h-3" />
                                        <span>All Locations</span>
                                      </motion.button>
                                      
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(item);
                                        }}
                                        className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors flex-1 justify-center"
                                      >
                                        <SafeIcon icon={FiEdit} className="w-3 h-3" />
                                        <span>Edit Item</span>
                                      </motion.button>
                                      
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(item.id);
                                        }}
                                        className="flex items-center space-x-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex-1 justify-center"
                                      >
                                        <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                                        <span>Delete</span>
                                      </motion.button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {items.length === 0 && (
        <div className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
          <SafeIcon icon={FiMoreHorizontal} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No inventory items found</p>
        </div>
      )}
    </motion.div>
  );
}

export default InventoryTable;