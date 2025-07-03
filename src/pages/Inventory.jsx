import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import InventoryTable from '../components/InventoryTable';
import AddItemModal from '../components/AddItemModal';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import TransferModal from '../components/TransferModal';
import ItemLocationModal from '../components/ItemLocationModal';
import CategoryModal from '../components/CategoryModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiFilter, FiDownload, FiMapPin, FiTag, FiGrid, FiSearch } = FiIcons;

function Inventory() {
  const { state } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const currentLocationData = state.locations.find(loc => loc.id === state.currentLocation);

  // Transform items to include current location data
  const itemsWithLocationData = state.items.map(item => ({
    ...item,
    quantity: item.locations[state.currentLocation]?.quantity || 0,
    status: item.locations[state.currentLocation]?.status || 'out-of-stock'
  }));

  const filteredItems = itemsWithLocationData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const handleStockAdjustment = (item) => {
    setSelectedItem(item);
    setShowAdjustModal(true);
  };

  const handleTransfer = (item) => {
    setSelectedItem(item);
    setShowTransferModal(true);
  };

  const handleViewAllLocations = (item) => {
    setSelectedItem(item);
    setShowLocationModal(true);
  };

  // Get all categories for filter dropdown
  const allCategories = [...new Set(state.items.map(item => item.category))];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6 max-w-full overflow-hidden"
    >
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Fyngan IMS</h1>
          <div className="flex items-center space-x-2 mt-1">
            <SafeIcon icon={FiMapPin} className="w-3 h-3 sm:w-4 sm:h-4 text-coffee-500 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-600 truncate">{currentLocationData?.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <SafeIcon icon={FiTag} className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Categories</span>
          </button>
          
          <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
            <SafeIcon icon={FiDownload} className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-coffee-500 text-white rounded-lg hover:bg-coffee-600 transition-colors flex-shrink-0"
          >
            <SafeIcon icon={FiPlus} className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Search Bar - Full Width on Mobile */}
      <div className="w-full">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items, categories, suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Filters - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <SafeIcon icon={FiFilter} className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 flex-1">
          <SafeIcon icon={FiGrid} className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {allCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats - Mobile Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200/50"
        >
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
              <SafeIcon icon={FiGrid} className="w-4 h-4 text-blue-600" />
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{filteredItems.length}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200/50"
        >
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">In Stock</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-green-600">
              {filteredItems.filter(item => item.status === 'in-stock').length}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200/50"
        >
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Low</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-amber-600">
              {filteredItems.filter(item => item.status === 'low-stock').length}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200/50"
        >
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Out</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-red-600">
              {filteredItems.filter(item => item.status === 'out-of-stock').length}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Results Count - Mobile */}
      {searchTerm && (
        <div className="text-sm text-gray-600 px-1">
          Found {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} 
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      )}

      {/* Inventory Table */}
      <InventoryTable
        items={filteredItems}
        onStockAdjustment={handleStockAdjustment}
        onTransfer={handleTransfer}
        onViewAllLocations={handleViewAllLocations}
      />

      {/* Modals */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <StockAdjustmentModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        item={selectedItem}
      />

      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        item={selectedItem}
      />

      <ItemLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        item={selectedItem}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />
    </motion.div>
  );
}

export default Inventory;