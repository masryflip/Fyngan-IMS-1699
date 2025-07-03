import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiClock, FiTruck, FiCheck, FiX, FiTrash2, FiArrowRight, FiChevronDown, FiChevronRight, FiPackage, FiMapPin, FiCalendar } = FiIcons;

const statusConfig = {
  pending: { icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pending' },
  'in-transit': { icon: FiTruck, color: 'text-blue-600', bg: 'bg-blue-100', text: 'In Transit' },
  completed: { icon: FiCheck, color: 'text-green-600', bg: 'bg-green-100', text: 'Completed' },
  cancelled: { icon: FiX, color: 'text-red-600', bg: 'bg-red-100', text: 'Cancelled' }
};

function TransfersTable({ transfers }) {
  const { dispatch } = useInventory();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleRowExpansion = (transferId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(transferId)) {
      newExpanded.delete(transferId);
    } else {
      newExpanded.add(transferId);
    }
    setExpandedRows(newExpanded);
  };

  const handleStatusChange = (transferId, newStatus) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (transfer) {
      if (newStatus === 'completed') {
        dispatch({ type: 'COMPLETE_TRANSFER', payload: transferId });
      } else {
        dispatch({
          type: 'UPDATE_TRANSFER',
          payload: { ...transfer, status: newStatus }
        });
      }
    }
  };

  const handleDelete = (transferId) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      dispatch({ type: 'DELETE_TRANSFER', payload: transferId });
    }
  };

  if (transfers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8"
      >
        <div className="text-center py-12">
          <SafeIcon icon={FiTruck} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers found</h3>
          <p className="text-gray-500">Create your first stock transfer to get started</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 sm:space-y-0"
    >
      {/* Mobile Cards */}
      {isMobile ? (
        <div className="space-y-3">
          {transfers.map((transfer, index) => {
            const config = statusConfig[transfer.status] || statusConfig.pending;
            const isExpanded = expandedRows.has(transfer.id);
            
            return (
              <motion.div
                key={transfer.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden"
              >
                {/* Card Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleRowExpansion(transfer.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          #{transfer.id}
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex-shrink-0">
                          Transfer
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <SafeIcon icon={FiPackage} className="w-3 h-3" />
                        <span className="truncate">{transfer.itemName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                        <SafeIcon icon={config.icon} className="w-3 h-3 mr-1" />
                        {config.text}
                      </span>
                      
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SafeIcon icon={FiChevronRight} className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Transfer Route */}
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600 truncate max-w-24">
                      {transfer.fromLocationName}
                    </span>
                    <SafeIcon icon={FiArrowRight} className="w-4 h-4 text-coffee-500 flex-shrink-0" />
                    <span className="text-gray-600 truncate max-w-24">
                      {transfer.toLocationName}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                      <span>{format(new Date(transfer.requestDate), 'MMM d')}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {transfer.quantity} units
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-4 space-y-4">
                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Request Date</p>
                          <p className="text-gray-900">
                            {format(new Date(transfer.requestDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Expected Date</p>
                          <p className="text-gray-900">
                            {format(new Date(transfer.expectedDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 font-medium">Reason</p>
                          <p className="text-gray-900 capitalize">
                            {transfer.reason?.replace('-', ' ') || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      {/* Status Management */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Update Status
                          </label>
                          <select
                            value={transfer.status}
                            onChange={(e) => handleStatusChange(transfer.id, e.target.value)}
                            disabled={transfer.status === 'completed' || transfer.status === 'cancelled'}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-transit">In Transit</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(transfer.id);
                            }}
                            disabled={transfer.status === 'completed'}
                            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Desktop Table */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Transfer ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Expected Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {transfers.map((transfer) => {
                  const config = statusConfig[transfer.status] || statusConfig.pending;
                  return (
                    <motion.tr
                      key={transfer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      className="transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">#{transfer.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{transfer.itemName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="truncate max-w-20">{transfer.fromLocationName}</span>
                          <SafeIcon icon={FiArrowRight} className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-20">{transfer.toLocationName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{transfer.quantity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={transfer.status}
                          onChange={(e) => handleStatusChange(transfer.id, e.target.value)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} border-none`}
                          disabled={transfer.status === 'completed' || transfer.status === 'cancelled'}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-transit">In Transit</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {format(new Date(transfer.requestDate), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {format(new Date(transfer.expectedDate), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 capitalize">
                          {transfer.reason?.replace('-', ' ') || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#fee2e2' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(transfer.id)}
                            disabled={transfer.status === 'completed'}
                            className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Delete Transfer"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4 text-red-600" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default TransfersTable;