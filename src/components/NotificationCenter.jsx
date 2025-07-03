import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiBell, FiAlertTriangle, FiPackage, FiTruck, FiClock, FiCheck, FiX, FiTrash2, FiEye, FiSettings } = FiIcons;

const notificationTypes = {
  'low-stock': { icon: FiAlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100', priority: 'high' },
  'out-of-stock': { icon: FiX, color: 'text-red-600', bgColor: 'bg-red-100', priority: 'critical' },
  'order-update': { icon: FiTruck, color: 'text-blue-600', bgColor: 'bg-blue-100', priority: 'medium' },
  'transfer-update': { icon: FiPackage, color: 'text-purple-600', bgColor: 'bg-purple-100', priority: 'medium' },
  'expiry-warning': { icon: FiClock, color: 'text-orange-600', bgColor: 'bg-orange-100', priority: 'high' },
  'system': { icon: FiSettings, color: 'text-gray-600', bgColor: 'bg-gray-100', priority: 'low' }
};

function NotificationCenter({ isOpen, onClose, onToggle }) {
  const { state } = useInventory();
  const [notifications, setNotifications] = useState(() => generateNotifications(state));
  const [filter, setFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when mobile modal is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  // Generate notifications based on current state
  function generateNotifications(state) {
    const notifications = [];
    const now = new Date();

    // Stock alerts for current location
    state.items.forEach(item => {
      const locationStock = item.locations[state.currentLocation];
      if (locationStock) {
        if (locationStock.status === 'out-of-stock') {
          notifications.push({
            id: `stock-${item.id}-${state.currentLocation}`,
            type: 'out-of-stock',
            title: 'Out of Stock Alert',
            message: `${item.name} is out of stock at ${state.locations.find(l => l.id === state.currentLocation)?.name}`,
            timestamp: now,
            read: false,
            itemId: item.id,
            locationId: state.currentLocation
          });
        } else if (locationStock.status === 'low-stock') {
          notifications.push({
            id: `stock-${item.id}-${state.currentLocation}`,
            type: 'low-stock',
            title: 'Low Stock Warning',
            message: `${item.name} is running low (${locationStock.quantity} ${item.unit}) at ${state.locations.find(l => l.id === state.currentLocation)?.name}`,
            timestamp: now,
            read: false,
            itemId: item.id,
            locationId: state.currentLocation
          });
        }
      }

      // Expiry warnings
      if (item.expiryDate) {
        const expiryDate = new Date(item.expiryDate);
        const daysUntilExpiry = differenceInDays(expiryDate, now);
        if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
          notifications.push({
            id: `expiry-${item.id}`,
            type: 'expiry-warning',
            title: 'Expiry Warning',
            message: `${item.name} expires ${daysUntilExpiry === 0 ? 'today' : `in ${daysUntilExpiry} days`}`,
            timestamp: now,
            read: false,
            itemId: item.id
          });
        }
      }
    });

    // Order updates
    state.orders.forEach(order => {
      if (order.status === 'delivered') {
        const orderDate = new Date(order.orderDate);
        if (differenceInDays(now, orderDate) <= 2) {
          notifications.push({
            id: `order-${order.id}`,
            type: 'order-update',
            title: 'Order Delivered',
            message: `Your order for ${order.itemName} has been delivered`,
            timestamp: orderDate,
            read: false,
            orderId: order.id
          });
        }
      }
    });

    // Transfer updates
    state.transfers.forEach(transfer => {
      if (transfer.status === 'completed') {
        const requestDate = new Date(transfer.requestDate);
        if (differenceInDays(now, requestDate) <= 1) {
          notifications.push({
            id: `transfer-${transfer.id}`,
            type: 'transfer-update',
            title: 'Transfer Completed',
            message: `Transfer of ${transfer.itemName} from ${transfer.fromLocationName} to ${transfer.toLocationName} completed`,
            timestamp: requestDate,
            read: false,
            transferId: transfer.id
          });
        }
      }
    });

    // Sort by priority and timestamp
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return notifications.sort((a, b) => {
      const aPriority = priorityOrder[notificationTypes[a.type]?.priority || 'low'];
      const bPriority = priorityOrder[notificationTypes[b.type]?.priority || 'low'];
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => notificationTypes[n.type]?.priority === 'critical').length;

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getNotificationConfig = (type) => {
    return notificationTypes[type] || notificationTypes.system;
  };

  const filterTabs = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'low-stock', label: 'Stock', count: notifications.filter(n => n.type.includes('stock')).length },
    { key: 'expiry-warning', label: 'Expiry', count: notifications.filter(n => n.type === 'expiry-warning').length }
  ];

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 relative"
      >
        <SafeIcon icon={FiBell} className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center shadow-lg font-medium ${
              criticalCount > 0 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Desktop Overlay */}
            {!isMobile && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={onClose}
              />
            )}

            {/* Mobile Full Screen Modal */}
            {isMobile ? (
              <>
                {/* Full Screen Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
                  onClick={onClose}
                />

                {/* Full Screen Modal */}
                <motion.div
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 flex flex-col"
                  style={{ 
                    height: '100vh',
                    height: '100dvh', // Dynamic viewport height for mobile
                    width: '100vw',
                    maxHeight: '100vh',
                    maxHeight: '100dvh'
                  }}
                >
                  {/* Mobile Header - Fixed */}
                  <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 safe-top">
                    <div className="px-4 py-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Notifications
                        </h2>
                        <button
                          onClick={onClose}
                          className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <SafeIcon icon={FiX} className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Mobile Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <span>{filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-coffee-600 dark:text-coffee-400 hover:text-coffee-700 dark:hover:text-coffee-300 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-coffee-50 dark:hover:bg-coffee-900/20"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Mobile Filter Tabs */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {filterTabs.map(tab => (
                          <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors flex-shrink-0 ${
                              filter === tab.key
                                ? 'bg-coffee-500 text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {tab.label}
                            {tab.count > 0 && (
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                filter === tab.key 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              }`}>
                                {tab.count}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Notifications List - Scrollable */}
                  <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    {filteredNotifications.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center p-8 min-h-full">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <SafeIcon icon={FiBell} className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No notifications</h3>
                          <p className="text-sm">You're all caught up!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredNotifications.map((notification, index) => {
                          const config = getNotificationConfig(notification.type);
                          return (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`p-4 hover:bg-white dark:hover:bg-gray-800 transition-colors ${
                                !notification.read ? 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-500' : 'bg-gray-50 dark:bg-gray-900'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                {/* Notification Icon */}
                                <div className={`w-12 h-12 rounded-full ${config.bgColor} dark:opacity-80 flex items-center justify-center flex-shrink-0`}>
                                  <SafeIcon icon={config.icon} className={`w-6 h-6 ${config.color}`} />
                                </div>
                                
                                {/* Notification Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className={`text-base font-medium leading-tight ${
                                      !notification.read 
                                        ? 'text-gray-900 dark:text-gray-100' 
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {notification.title}
                                    </h4>
                                    {!notification.read && (
                                      <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                      {formatTimestamp(notification.timestamp)}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      {!notification.read && (
                                        <button
                                          onClick={() => handleMarkAsRead(notification.id)}
                                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                          title="Mark as read"
                                        >
                                          <SafeIcon icon={FiEye} className="w-5 h-5" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteNotification(notification.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Delete notification"
                                      >
                                        <SafeIcon icon={FiTrash2} className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mobile Footer - Safe Area */}
                  <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-bottom">
                    <button
                      onClick={onClose}
                      className="w-full py-3 text-center text-base font-medium text-coffee-600 dark:text-coffee-400 hover:text-coffee-700 dark:hover:text-coffee-300 transition-colors bg-coffee-50 dark:bg-coffee-900/20 rounded-xl hover:bg-coffee-100 dark:hover:bg-coffee-900/30"
                    >
                      Close Notifications
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              /* Desktop Dropdown */
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-[600px]"
              >
                {/* Desktop Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-coffee-600 dark:text-coffee-400 hover:text-coffee-700 dark:hover:text-coffee-300 transition-colors px-2 py-1 rounded"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                      >
                        <SafeIcon icon={FiX} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Filter Tabs */}
                  <div className="flex gap-2">
                    {filterTabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          filter === tab.key
                            ? 'bg-coffee-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span className="ml-1">({tab.count})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop Notifications List */}
                <div className="overflow-y-auto max-h-96">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <SafeIcon icon={FiBell} className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">No notifications to show</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredNotifications.map((notification) => {
                        const config = getNotificationConfig(notification.type);
                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative ${
                              !notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {/* Notification Icon */}
                              <div className={`w-8 h-8 rounded-full ${config.bgColor} dark:opacity-80 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <SafeIcon icon={config.icon} className={`w-4 h-4 ${config.color}`} />
                              </div>
                              
                              {/* Notification Content */}
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${
                                      !notification.read 
                                        ? 'text-gray-900 dark:text-gray-100' 
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                      {formatTimestamp(notification.timestamp)}
                                    </p>
                                  </div>
                                  
                                  {/* Desktop Action Buttons */}
                                  <div className="flex items-center space-x-1 ml-2">
                                    {!notification.read && (
                                      <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded"
                                        title="Mark as read"
                                      >
                                        <SafeIcon icon={FiEye} className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteNotification(notification.id)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded"
                                      title="Delete notification"
                                    >
                                      <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Unread Indicator */}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full absolute right-2 top-1/2 transform -translate-y-1/2"></div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Desktop Footer */}
                {filteredNotifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                    <button
                      onClick={onClose}
                      className="w-full text-center text-sm text-coffee-600 dark:text-coffee-400 hover:text-coffee-700 dark:hover:text-coffee-300 transition-colors py-1"
                    >
                      Close Notifications
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationCenter;