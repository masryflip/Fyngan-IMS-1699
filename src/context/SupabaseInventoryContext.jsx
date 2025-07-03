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

const SupabaseInventoryContext = createContext();

export function SupabaseInventoryProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  // State
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentLocationId, setCurrentLocationId] = useState(null);

  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id && !initialized) {
      console.log('User authenticated, loading inventory data...');
      loadAllData();
    } else if (!isAuthenticated) {
      // Clear data when user logs out
      console.log('User not authenticated, clearing data...');
      clearAllData();
    }
  }, [isAuthenticated, user?.id, initialized]);

  const clearAllData = () => {
    setLocations([]);
    setCategories([]);
    setSuppliers([]);
    setItems([]);
    setOrders([]);
    setTransfers([]);
    setUsers([]);
    setCurrentLocationId(null);
    setInitialized(false);
    setLoading(false);
    setError(null);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading all inventory data...');

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
        locationService.getAll().catch(err => { console.warn('Error loading locations:', err); return []; }),
        categoryService.getAll().catch(err => { console.warn('Error loading categories:', err); return []; }),
        supplierService.getAll().catch(err => { console.warn('Error loading suppliers:', err); return []; }),
        itemService.getAll().catch(err => { console.warn('Error loading items:', err); return []; }),
        orderService.getAll().catch(err => { console.warn('Error loading orders:', err); return []; }),
        transferService.getAll().catch(err => { console.warn('Error loading transfers:', err); return []; }),
        userService.getAll().catch(err => { console.warn('Error loading users:', err); return []; })
      ]);

      console.log('Data loaded:', {
        locations: locationsData.length,
        categories: categoriesData.length,
        suppliers: suppliersData.length,
        items: itemsData.length,
        orders: ordersData.length,
        transfers: transfersData.length,
        users: usersData.length
      });

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
        console.log('Set current location to:', locationsData[0].name);
      }

      setInitialized(true);
      console.log('Inventory data initialization complete');

      // Set up real-time subscriptions after data loads
      setupRealtimeSubscriptions();

    } catch (error) {
      console.error('Error loading inventory data:', error);
      setError(error.message);
      
      // Initialize with empty data on error
      setLocations([]);
      setCategories([]);
      setSuppliers([]);
      setItems([]);
      setOrders([]);
      setTransfers([]);
      setUsers([]);
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!isAuthenticated) return;
    
    console.log('Setting up real-time subscriptions...');
    
    try {
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

      console.log('Real-time subscriptions set up successfully');

      // Cleanup subscriptions on unmount
      return () => {
        console.log('Cleaning up real-time subscriptions...');
        subscriptions.forEach(sub => {
          try {
            sub.unsubscribe();
          } catch (err) {
            console.warn('Error unsubscribing:', err);
          }
        });
      };
    } catch (error) {
      console.warn('Error setting up real-time subscriptions:', error);
    }
  };

  // Real-time handlers
  const handleLocationChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    console.log('Location change:', eventType, newRecord?.name);
    
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
    console.log('Category change:', eventType, newRecord?.name);
    
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
    console.log('Supplier change:', eventType, newRecord?.name);
    
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
    console.log('Item change:', eventType, newRecord?.name);
    
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
    console.log('Item location change detected, refreshing items...');
    // Refresh items when stock levels change
    if (initialized) {
      loadItems();
    }
  };

  const handleOrderChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    console.log('Order change:', eventType, newRecord?.id);
    
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
    console.log('Transfer change:', eventType, newRecord?.id);
    
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
    console.log('User change:', eventType, newRecord?.name);
    
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
      console.log('Items reloaded:', data.length);
    } catch (error) {
      console.error('Error reloading items:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await orderService.getAll();
      setOrders(data);
      console.log('Orders reloaded:', data.length);
    } catch (error) {
      console.error('Error reloading orders:', error);
    }
  };

  const loadTransfers = async () => {
    try {
      const data = await transferService.getAll();
      setTransfers(data);
      console.log('Transfers reloaded:', data.length);
    } catch (error) {
      console.error('Error reloading transfers:', error);
    }
  };

  // CRUD operations
  const operations = {
    // Locations
    locations: {
      create: async (location) => {
        try {
          console.log('Creating location:', location.name);
          const data = await locationService.create(location);
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      update: async (id, updates) => {
        try {
          console.log('Updating location:', id);
          const data = await locationService.update(id, updates);
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          console.log('Deleting location:', id);
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
          console.log('Creating category:', category.name);
          const data = await categoryService.create(category);
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      update: async (id, updates) => {
        try {
          console.log('Updating category:', id);
          const data = await categoryService.update(id, updates);
          return data;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          console.log('Deleting category:', id);
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
          console.log('Creating item:', item.name);
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
          console.log('Updating item:', id);
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
          console.log('Deleting item:', id);
          await itemService.delete(id);
          return true;
        } catch (error) {
          setError(error.message);
          throw error;
        }
      },
      updateStock: async (itemId, locationId, quantity, reason) => {
        try {
          console.log('Updating stock:', { itemId, locationId, quantity });
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
          console.log('Creating order:', order);
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
          console.log('Updating order:', id);
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
          console.log('Deleting order:', id);
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
          console.log('Creating transfer:', transfer);
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
          console.log('Updating transfer:', id);
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
          console.log('Completing transfer:', id);
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
          console.log('Deleting transfer:', id);
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
          console.log('Updating user profile:', userId);
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
    initialized,

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