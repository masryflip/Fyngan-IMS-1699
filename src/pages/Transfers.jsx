import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import TransfersTable from '../components/TransfersTable';
import TransferModal from '../components/TransferModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiFilter, FiArrowRightLeft, FiSearch, FiRefreshCw } = FiIcons;

function Transfers() {
  const { state } = useInventory();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransfers = state.transfers.filter(transfer => {
    const matchesFilter = filter === 'all' || transfer.status === filter;
    const matchesSearch = 
      transfer.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.fromLocationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toLocationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleCreateTransfer = () => {
    // For now, we'll use the first item as a placeholder
    // In a real app, you'd have a proper item selection
    setSelectedItem(state.items[0]);
    setShowCreateModal(true);
  };

  // Calculate stats for mobile cards
  const transferStats = {
    total: state.transfers.length,
    pending: state.transfers.filter(t => t.status === 'pending').length,
    inTransit: state.transfers.filter(t => t.status === 'in-transit').length,
    completed: state.transfers.filter(t => t.status === 'completed').length,
    cancelled: state.transfers.filter(t => t.status === 'cancelled').length
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6 max-w-full overflow-hidden"
    >
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            Stock Transfers
          </h1>
          <div className="flex items-center space-x-2 mt-1">
            <SafeIcon icon={FiArrowRightLeft} className="w-3 h-3 sm:w-4 sm:h-4 text-coffee-500 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-600">
              Manage inventory transfers between locations
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <SafeIcon icon={FiRefreshCw} className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <button
            onClick={handleCreateTransfer}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-coffee-500 text-white rounded-lg hover:bg-coffee-600 transition-colors flex-shrink-0"
          >
            <SafeIcon icon={FiPlus} className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* Search Bar - Full Width on Mobile */}
      <div className="w-full">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transfers, items, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Filter - Mobile Optimized */}
      <div className="flex items-center space-x-2">
        <SafeIcon icon={FiFilter} className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
        >
          <option value="all">All Transfers</option>
          <option value="pending">Pending</option>
          <option value="in-transit">In Transit</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Stats Cards - Mobile Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200/50"
        >
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
              <SafeIcon icon={FiArrowRightLeft} className="w-4 h-4 text-blue-600" />
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{transferStats.total}</p>
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
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Pending</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-yellow-600">{transferStats.pending}</p>
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
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Transit</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-blue-600">{transferStats.inTransit}</p>
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
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Done</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-green-600">{transferStats.completed}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200/50"
        >
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Cancelled</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-red-600">{transferStats.cancelled}</p>
          </div>
        </motion.div>
      </div>

      {/* Results Count - Mobile */}
      {searchTerm && (
        <div className="text-sm text-gray-600 px-1">
          Found {filteredTransfers.length} transfer{filteredTransfers.length !== 1 ? 's' : ''}
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      )}

      {/* Transfers Table */}
      <TransfersTable transfers={filteredTransfers} />

      {/* Create Transfer Modal */}
      <TransferModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        item={selectedItem}
      />
    </motion.div>
  );
}

export default Transfers;