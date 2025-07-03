import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiClock, FiCheck, FiTruck } = FiIcons;

const statusConfig = {
  pending: {
    icon: FiClock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    text: 'Pending'
  },
  delivered: {
    icon: FiCheck,
    color: 'text-green-600',
    bg: 'bg-green-100',
    text: 'Delivered'
  },
  shipped: {
    icon: FiTruck,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    text: 'Shipped'
  }
};

function RecentOrders({ orders }) {
  const recentOrders = orders.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
      
      <div className="space-y-4">
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <SafeIcon icon={FiTruck} className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No recent orders</p>
          </div>
        ) : (
          recentOrders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                    <SafeIcon icon={config.icon} className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{order.itemName}</h4>
                    <p className="text-sm text-gray-600">
                      {order.quantity} units • {format(new Date(order.orderDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                    {config.text}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">${order.cost.toFixed(2)}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

export default RecentOrders;