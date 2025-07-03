import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiUser, FiShield, FiMail, FiPhone, FiMapPin } = FiIcons;

const roles = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access',
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Location management',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Basic inventory operations',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    color: 'bg-gray-100 text-gray-800'
  }
];

const permissions = {
  admin: ['create', 'read', 'update', 'delete', 'manage_users', 'manage_locations', 'view_reports'],
  manager: ['create', 'read', 'update', 'delete', 'view_reports'],
  staff: ['create', 'read', 'update'],
  viewer: ['read']
};

function UserRoleModal({ isOpen, onClose, user, isEdit = false }) {
  const { dispatch, state } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    assignedLocations: [],
    isActive: true
  });

  // Initialize form data when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      if (user && isEdit) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'staff',
          assignedLocations: user.assignedLocations || [],
          isActive: user.isActive !== undefined ? user.isActive : true
        });
      } else {
        // Reset form for new user
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: 'staff',
          assignedLocations: [],
          isActive: true
        });
      }
    }
  }, [isOpen, user, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isEdit && user) {
      dispatch({
        type: 'UPDATE_USER',
        payload: { ...user, ...formData }
      });
    } else {
      dispatch({
        type: 'ADD_USER',
        payload: {
          ...formData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          lastLogin: null
        }
      });
    }
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationToggle = (locationId) => {
    setFormData(prev => ({
      ...prev,
      assignedLocations: prev.assignedLocations.includes(locationId)
        ? prev.assignedLocations.filter(id => id !== locationId)
        : [...prev.assignedLocations, locationId]
    }));
  };

  if (!isOpen) return null;

  const selectedRole = roles.find(role => role.id === formData.role);
  const rolePermissions = permissions[formData.role] || [];

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
          className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-[10000]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {isEdit ? 'Edit User' : 'Add New User'}
            </h3>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="John Doe"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Information */}
            {selectedRole && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Role Details</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedRole.color}`}>
                    {selectedRole.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{selectedRole.description}</p>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h5>
                  <div className="flex flex-wrap gap-2">
                    {rolePermissions.map(permission => (
                      <span
                        key={permission}
                        className="px-2 py-1 text-xs bg-coffee-100 text-coffee-800 rounded-full"
                      >
                        {permission.replace('_', ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Location Access */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assigned Locations
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {state.locations.map(location => (
                  <div
                    key={location.id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`location-${location.id}`}
                      checked={formData.assignedLocations.includes(location.id)}
                      onChange={() => handleLocationToggle(location.id)}
                      className="w-4 h-4 text-coffee-600 border-gray-300 rounded focus:ring-coffee-500"
                    />
                    <label htmlFor={`location-${location.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiMapPin} className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{location.name}</p>
                          <p className="text-xs text-gray-500">{location.address}</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Account Status</p>
                <p className="text-xs text-gray-500">
                  {formData.isActive ? 'User can access the system' : 'User access is disabled'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500"></div>
              </label>
            </div>

            {/* Actions */}
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
                {isEdit ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserRoleModal;