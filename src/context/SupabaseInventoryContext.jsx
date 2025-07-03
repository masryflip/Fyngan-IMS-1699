import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  locationService, 
  categoryService, 
  supplierService, 
  itemService, 
  orderService, 
  transferService,
  userService,
  subscribeToTable 
} from '../services/inventoryService';
import { supabase } from '../lib/supabase';

const SupabaseInventoryContext = createContext();

export function SupabaseInventoryProvider({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentLocationId, setCurrentLocationId] = useState(null);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadAllData();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        locationsData,
        categoriesData,
        suppliersData,
        itemsData,
        ordersData,
        transfersData,
        usersData
      ] = await Promise.all([
        locationService.getAll(),
        categoryService.getAll(),
        supplierService.getAll(),
        itemService.getAll(),
        orderService.getAll(),
        transferService.getAll(),
        userService.getAll()
      ]);

      setLocations(locationsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setItems(itemsData);
      setOrders(ordersData);
      setTransfers(transfersData);
      setUsers(usersData);

      // Set first location as current if none selected
      if (locationsData.length > 0 && !currentLocationId) {
        setCurrentLocationId(locationsData[0].id);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to changes in all tables
    const subscriptions = [
      subscribeToTable('locations_fyngan2024', handleLocationChange),
      subscribeToTable('categories_fyngan2024', handleCategoryChange),
      subscribeToTable('suppliers_fyngan2024', handleSupplierChange),
      subscribeToTable('items_fyngan2024', handleItemChange),
      subscribeToTable('item_locations_fyngan2024', handleItemLocationChange),
      subscribeToTable('orders_fyngan2024', handleOrderChange),
      subscribeToTable('transfers_fyngan2024', handleTransferChange),
      subscribeToTable('users_fyngan2024', handleUserChange)
    ];

    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  };

  // Real-time handlers
  const handleLocationChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setLocations(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, newRecord];
        case 'UPDATE':
          return prev.map(item => item.id === newRecord.id ? newRecord : item);
        case 'DELETE':
          return prev.filter(item => item.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  };

  const handleCategoryChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setCategories(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, newRecord];
        case 'UPDATE':
          return prev.map(item => item.id === newRecord.id ? newRecord : item);
        case 'DELETE':
          return prev.filter(item => item.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  };

  const handleSupplierChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setSuppliers(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, newRecord];
        case 'UPDATE':
          return prev.map(item => item.id === newRecord.id ? newRecord : item);
        case 'DELETE':
          return prev.filter(item => item.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  };

  const handleItemChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setItems(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, newRecord];
        case 'UPDATE':
          return prev.map(item => item.id === newRecord.id ? { ...item, ...newRecord } : item);
        case 'DELETE':
          return prev.filter(item => item.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  };

  const handleItemLocationChange = (payload) => {
    // Refresh items when stock levels change
    loadItems();
  };

  const handleOrderChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setOrders(prev => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...prev];
        case 'UPDATE':
          return prev.map(item => item.id === newRecord.id ? newRecord : item);
        case 'DELETE':
          return prev.filter(item => item.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  };

  const handleTransferChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setTransfers(prev => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...prev];
        case 'UPDATE':
          return prev.map(item => item.id === newRecord.id ? newRecord : item);
        case 'DELETE':
          return prev.filter(item => item.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  };

  const handleUserChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setUsers(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, newRecord];
        case 'UPDATE':
          return prev.map(item => item.id === newRecord.id ? newRecord : item);
        case 'DELETE':
          return prev.filter(item => item.id !== oldRecord.id);
        default:
          return prev;
      }
    });
  };

  // Helper functions to reload specific data
  const loadItems = async () => {
    try {
      const data = await itemService.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadTransfers = async () => {
    try {
      const data = await transferService.getAll();
      setTransfers(data);
    } catch (error) {
      console.error('Error loading transfers:', error);
    }
  };

  // CRUD operations
  const operations = {
    // Locations
    locations: {
      create: async (location) => {
        try {
          const data = await locationService.create(location);
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      update: async (id, updates) => {
        try {
          const data = await locationService.update(id, updates);
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          await locationService.delete(id);
          return true;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      }
    },

    // Categories
    categories: {
      create: async (category) => {
        try {
          const data = await categoryService.create(category);
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      update: async (id, updates) => {
        try {
          const data = await categoryService.update(id, updates);
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          await categoryService.delete(id);
          return true;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      }
    },

    // Items
    items: {
      create: async (item) => {
        try {
          const data = await itemService.create(item);
          await loadItems(); // Reload to get full data with relations
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      update: async (id, updates) => {
        try {
          const data = await itemService.update(id, updates);
          await loadItems(); // Reload to get full data with relations
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          await itemService.delete(id);
          return true;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      updateStock: async (itemId, locationId, quantity, reason) => {
        try {
          const data = await itemService.updateStock(itemId, locationId, quantity, reason);
          await loadItems(); // Reload to get updated stock levels
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      }
    },

    // Orders
    orders: {
      create: async (order) => {
        try {
          const orderWithUser = {
            ...order,
            created_by: user?.id
          };
          const data = await orderService.create(orderWithUser);
          await loadOrders(); // Reload to get full data with relations
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      update: async (id, updates) => {
        try {
          const data = await orderService.update(id, updates);
          await loadOrders();
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          await orderService.delete(id);
          return true;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      }
    },

    // Transfers
    transfers: {
      create: async (transfer) => {
        try {
          const transferWithUser = {
            ...transfer,
            created_by: user?.id
          };
          const data = await transferService.create(transferWithUser);
          await loadTransfers(); // Reload to get full data with relations
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      update: async (id, updates) => {
        try {
          const data = await transferService.update(id, updates);
          await loadTransfers();
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      complete: async (id) => {
        try {
          const data = await transferService.complete(id);
          await loadTransfers();
          await loadItems(); // Reload items to get updated stock levels
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          await transferService.delete(id);
          return true;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      }
    },

    // Users
    users: {
      updateProfile: async (userId, profile) => {
        try {
          const data = await userService.updateProfile(userId, profile);
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      }
    }
  };

  const value = {
    // State
    locations,
    categories,
    suppliers,
    items,
    orders,
    transfers,
    users,
    currentLocationId,
    loading,
    error,

    // Actions
    setCurrentLocationId,
    setError,
    loadAllData,
    
    // CRUD Operations
    ...operations
  };

  return (
    <SupabaseInventoryContext.Provider value={value}>
      {children}
    </SupabaseInventoryContext.Provider>
  );
}

export function useSupabaseInventory() {
  const context = useContext(SupabaseInventoryContext);
  if (!context) {
    throw new Error('useSupabaseInventory must be used within a SupabaseInventoryProvider');
  }
  return context;
}