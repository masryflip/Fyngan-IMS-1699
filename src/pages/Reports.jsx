import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDownload, FiTrendingUp, FiBarChart3, FiPieChart } = FiIcons;

function Reports() {
  const { state } = useInventory();
  const [selectedReport, setSelectedReport] = useState('inventory-value');

  const getInventoryValueData = () => {
    return {
      title: {
        text: 'Inventory Value by Category (EGP)',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ج.م {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: 'Value',
          type: 'pie',
          radius: '50%',
          data: Object.entries(
            state.items.reduce((acc, item) => {
              const value = item.quantity * item.cost;
              acc[item.category] = (acc[item.category] || 0) + value;
              return acc;
            }, {})
          ).map(([category, value]) => ({
            name: category,
            value
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };

  const getStockLevelsData = () => {
    const categories = [...new Set(state.items.map(item => item.category))];
    
    return {
      title: {
        text: 'Stock Levels by Category',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Current Stock', 'Min Stock', 'Max Stock']
      },
      xAxis: {
        type: 'category',
        data: categories
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Current Stock',
          type: 'bar',
          data: categories.map(category =>
            state.items
              .filter(item => item.category === category)
              .reduce((sum, item) => sum + item.quantity, 0)
          ),
          itemStyle: { color: '#d2691e' }
        },
        {
          name: 'Min Stock',
          type: 'bar',
          data: categories.map(category =>
            state.items
              .filter(item => item.category === category)
              .reduce((sum, item) => sum + item.minStock, 0)
          ),
          itemStyle: { color: '#fbbf24' }
        },
        {
          name: 'Max Stock',
          type: 'bar',
          data: categories.map(category =>
            state.items
              .filter(item => item.category === category)
              .reduce((sum, item) => sum + item.maxStock, 0)
          ),
          itemStyle: { color: '#10b981' }
        }
      ]
    };
  };

  const getOrderTrendsData = () => {
    const monthlyOrders = state.orders.reduce((acc, order) => {
      const month = new Date(order.orderDate).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return {
      title: {
        text: 'Order Trends',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: Object.keys(monthlyOrders)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Orders',
          type: 'line',
          data: Object.values(monthlyOrders),
          smooth: true,
          itemStyle: { color: '#d2691e' }
        }
      ]
    };
  };

  const reports = {
    'inventory-value': {
      title: 'Inventory Value Analysis',
      component: <ReactECharts option={getInventoryValueData()} style={{ height: '400px' }} />
    },
    'stock-levels': {
      title: 'Stock Levels Report',
      component: <ReactECharts option={getStockLevelsData()} style={{ height: '400px' }} />
    },
    'order-trends': {
      title: 'Order Trends',
      component: <ReactECharts option={getOrderTrendsData()} style={{ height: '400px' }} />
    }
  };

  const totalValue = state.items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
  const lowStockItems = state.items.filter(item => item.status === 'low-stock').length;
  const outOfStockItems = state.items.filter(item => item.status === 'out-of-stock').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fyngan IMS - Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Analyze your inventory performance</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <SafeIcon icon={FiDownload} className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">ج.م {totalValue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lowStockItems}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiBarChart3} className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{outOfStockItems}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiPieChart} className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Report Selection */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analytics Dashboard</h3>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="inventory-value">Inventory Value</option>
            <option value="stock-levels">Stock Levels</option>
            <option value="order-trends">Order Trends</option>
          </select>
        </div>

        <motion.div
          key={selectedReport}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {reports[selectedReport].component}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Reports;