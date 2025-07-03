import React from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import StatsCard from '../components/StatsCard';
import LocationOverview from '../components/LocationOverview';
import LowStockAlert from '../components/LowStockAlert';
import RecentOrders from '../components/RecentOrders';
import * as FiIcons from 'react-icons/fi';

const { FiPackage, FiAlertTriangle, FiShoppingCart, FiDollarSign, FiMapPin } = FiIcons;

function Dashboard() {
  const { state } = useInventory();
  const { items, orders, locations, currentLocation } = state;

  const currentLocationData = locations.find(loc => loc.id === currentLocation);

  // Calculate stats for current location
  const currentLocationItems = items.map(item => ({
    ...item,
    quantity: item.locations[currentLocation]?.quantity || 0,
    status: item.locations[currentLocation]?.status || 'out-of-stock'
  }));

  const totalItems = currentLocationItems.length;
  const lowStockItems = currentLocationItems.filter(
    item => item.status === 'low-stock' || item.status === 'out-of-stock'
  ).length;
  const pendingOrders = orders.filter(
    order => order.locationId === currentLocation && order.status === 'pending'
  ).length;
  const totalValue = currentLocationItems.reduce(
    (sum, item) => sum + (item.quantity * item.cost),
    0
  );

  // Calculate network-wide stats
  const networkStats = {
    totalLocations: locations.length,
    totalNetworkValue: items.reduce((sum, item) => {
      const totalQuantity = Object.values(item.locations).reduce(
        (q, loc) => q + loc.quantity,
        0
      );
      return sum + (totalQuantity * item.cost);
    }, 0),
    totalNetworkAlerts: items.reduce((total, item) => {
      return total + Object.values(item.locations).filter(
        loc => loc.status === 'low-stock' || loc.status === 'out-of-stock'
      ).length;
    }, 0)
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Fyngan IMS Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview for{' '}
            <span className="font-medium text-coffee-600 dark:text-coffee-400">
              {currentLocationData?.name}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Network Total</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ${networkStats.totalNetworkValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Current Location Stats */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Current Location Stats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Items"
            value={totalItems}
            icon={FiPackage}
            color="blue"
          />
          <StatsCard
            title="Low Stock Alerts"
            value={lowStockItems}
            icon={FiAlertTriangle}
            color="red"
          />
          <StatsCard
            title="Pending Orders"
            value={pendingOrders}
            icon={FiShoppingCart}
            color="yellow"
          />
          <StatsCard
            title="Location Value"
            value={`$${totalValue.toFixed(2)}`}
            icon={FiDollarSign}
            color="green"
          />
        </div>
      </motion.div>

      {/* Network Overview */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Network Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Locations"
            value={networkStats.totalLocations}
            icon={FiMapPin}
            color="blue"
          />
          <StatsCard
            title="Network Alerts"
            value={networkStats.totalNetworkAlerts}
            icon={FiAlertTriangle}
            color="red"
          />
          <StatsCard
            title="Network Value"
            value={`$${networkStats.totalNetworkValue.toFixed(2)}`}
            icon={FiDollarSign}
            color="green"
          />
        </div>
      </motion.div>

      {/* Location Overview and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <LocationOverview />
        </motion.div>
        <motion.div variants={itemVariants}>
          <LowStockAlert items={currentLocationItems} />
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div variants={itemVariants}>
        <RecentOrders
          orders={orders.filter(order => order.locationId === currentLocation)}
        />
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;