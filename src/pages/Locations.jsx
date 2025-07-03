import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import LocationCard from '../components/LocationCard';
import AddLocationModal from '../components/AddLocationModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiMapPin } = FiIcons;

function Locations() {
  const { state } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fyngan IMS - Locations</h1>
          <p className="text-gray-600">Manage your business locations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-coffee-500 text-white rounded-lg hover:bg-coffee-600 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.locations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>

      <AddLocationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </motion.div>
  );
}

export default Locations;