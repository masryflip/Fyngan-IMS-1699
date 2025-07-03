import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiPlus, FiEdit, FiTrash2, FiTag } = FiIcons;

// Color options for categories
const categoryColors = [
  { name: 'Blue', value: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  { name: 'Green', value: 'green', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  { name: 'Red', value: 'red', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  { name: 'Teal', value: 'teal', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  { name: 'Gray', value: 'gray', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
];

function CategoryModal({ isOpen, onClose }) {
  const { dispatch, state } = useInventory();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('blue');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', color: 'blue' });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      dispatch({
        type: 'ADD_CATEGORY',
        payload: {
          name: newCategoryName.trim(),
          color: newCategoryColor
        }
      });
      setNewCategoryName('');
      setNewCategoryColor('blue');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category.name);
    setEditForm({ name: category.name, color: category.color || 'blue' });
  };

  const handleSaveEdit = () => {
    if (editForm.name.trim()) {
      dispatch({
        type: 'UPDATE_CATEGORY',
        payload: {
          oldName: editingCategory,
          newName: editForm.name.trim(),
          color: editForm.color
        }
      });
      setEditingCategory(null);
      setEditForm({ name: '', color: 'blue' });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditForm({ name: '', color: 'blue' });
  };

  const handleDeleteCategory = (categoryName) => {
    const itemsInCategory = state.items.filter(item => item.category === categoryName);
    
    if (itemsInCategory.length > 0) {
      const confirmed = window.confirm(
        `This category contains ${itemsInCategory.length} item(s). Deleting it will move these items to "Uncategorized". Continue?`
      );
      if (!confirmed) return;
    }

    dispatch({
      type: 'DELETE_CATEGORY',
      payload: categoryName
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose} 
        />

        {/* Modal content */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-[10000]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiTag} className="w-6 h-6 text-coffee-500" />
              <h3 className="text-lg font-medium text-gray-900">Manage Categories</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {/* Add New Category */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Add New Category</h4>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color Theme
                  </label>
                  <select
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  >
                    {categoryColors.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Preview:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    categoryColors.find(c => c.value === newCategoryColor)?.bg
                  } ${
                    categoryColors.find(c => c.value === newCategoryColor)?.text
                  }`}>
                    {newCategoryName || 'Category Name'}
                  </span>
                </div>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-coffee-500 text-white rounded-lg hover:bg-coffee-600 transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Categories */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Existing Categories</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {state.categories.map((category) => {
                const categoryData = typeof category === 'string' 
                  ? { name: category, color: 'blue' }
                  : category;
                
                const colorConfig = categoryColors.find(c => c.value === categoryData.color) || categoryColors[0];
                const itemCount = state.items.filter(item => item.category === categoryData.name).length;

                return (
                  <motion.div
                    key={categoryData.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg ${colorConfig.border} ${colorConfig.bg}/30 hover:${colorConfig.bg}/50 transition-colors`}
                  >
                    {editingCategory === categoryData.name ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                            autoFocus
                          />
                          <select
                            value={editForm.color}
                            onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                          >
                            {categoryColors.map(color => (
                              <option key={color.value} value={color.value}>
                                {color.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            categoryColors.find(c => c.value === editForm.color)?.bg
                          } ${
                            categoryColors.find(c => c.value === editForm.color)?.text
                          }`}>
                            {editForm.name || 'Category Name'}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorConfig.bg} ${colorConfig.text}`}>
                            {categoryData.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditCategory(categoryData)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <SafeIcon icon={FiEdit} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(categoryData.name)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              
              {state.categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <SafeIcon icon={FiTag} className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No categories created yet</p>
                  <p className="text-sm">Add your first category above</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryModal;