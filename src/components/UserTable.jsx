import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiEdit, FiTrash2, FiMail, FiPhone, FiMapPin, FiCheck, FiX, FiShield, FiClock } = FiIcons;

const roleConfig = {
  admin: { color: 'text-red-800', bg: 'bg-red-100', icon: FiShield },
  manager: { color: 'text-blue-800', bg: 'bg-blue-100', icon: FiShield },
  staff: { color: 'text-green-800', bg: 'bg-green-100', icon: FiShield },
  viewer: { color: 'text-gray-800', bg: 'bg-gray-100', icon: FiShield }
};

function UserTable({ users, onEdit, onDelete }) {
  const { state } = useInventory();
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (userId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const getLocationNames = (locationIds) => {
    return locationIds
      .map(id => state.locations.find(loc => loc.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getLastLoginDisplay = (lastLogin) => {
    if (!lastLogin) return 'Never';
    return format(new Date(lastLogin), 'MMM d, yyyy');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
    >
      {/* Mobile Card View */}
      <div className="block lg:hidden">
        <div className="p-4 space-y-4">
          {users.map((user) => {
            const roleInfo = roleConfig[user.role] || roleConfig.staff;
            const isExpanded = expandedRows.has(user.id);

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.bg} ${roleInfo.color}`}>
                        <SafeIcon icon={roleInfo.icon} className="w-3 h-3 mr-1" />
                        {user.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <SafeIcon icon={user.isActive ? FiCheck : FiX} className="w-3 h-3 mr-1" />
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleRowExpansion(user.id)}
                  className="w-full text-left text-sm text-coffee-600 hover:text-coffee-700 transition-colors mb-3"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-3 border-t border-gray-100"
                  >
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiPhone} className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{user.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <SafeIcon icon={FiMapPin} className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">
                          {user.assignedLocations.length > 0 
                            ? getLocationNames(user.assignedLocations)
                            : 'No locations assigned'
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiClock} className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Last login: {getLastLoginDisplay(user.lastLogin)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEdit} className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Locations
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.map((user) => {
              const roleInfo = roleConfig[user.role] || roleConfig.staff;

              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleInfo.bg} ${roleInfo.color}`}>
                      <SafeIcon icon={roleInfo.icon} className="w-3 h-3 mr-1" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <SafeIcon icon={FiMail} className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <SafeIcon icon={FiPhone} className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {user.assignedLocations.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <SafeIcon icon={FiMapPin} className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{getLocationNames(user.assignedLocations)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">No locations assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <SafeIcon icon={user.isActive ? FiCheck : FiX} className="w-3 h-3 mr-1" />
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {getLastLoginDisplay(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: '#dbeafe' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(user)}
                        className="p-2 rounded-lg transition-all duration-200"
                        title="Edit User"
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4 text-blue-600" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: '#fee2e2' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(user.id)}
                        className="p-2 rounded-lg transition-all duration-200"
                        title="Delete User"
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

      {users.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiShield} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </motion.div>
  );
}

export default UserTable;