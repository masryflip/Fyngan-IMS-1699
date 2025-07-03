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
    let timeoutId;
    
    if (isAuthenticated && user?.id && !initialized) {
      console.log('User authenticated, loading inventory data...');
      
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        console.warn('Data loading timed out, initializing with empty data');
        setLoading(false);
        setInitialized(true);
        setError('Data loading timed out, but you can still use the app');
      }, 15000);
      
      loadAllData().finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    } else if (!isAuthenticated) {
      // Clear data when user logs out
      console.log('User not authenticated, clearing data...');
      clearAllData();
    } else if (!user?.id) {
      // No user ID available, but not loading auth anymore
      console.log('No user ID available, using offline mode');
      setLoading(false);
      setInitialized(true);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
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

      // Create promises with individual timeouts
      const createTimeoutPromise = (promise, name, timeout = 5000) => {
        return Promise.race([
          promise.catch(err => { 
            console.warn(`Error loading ${name}:`, err); 
            return []; 
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`${name} loading timeout`)), timeout)
          )
        ]).catch(err => {
          console.warn(`${name} failed with timeout:`, err);
          return [];
        });
      };

      // Load all data with timeouts
      const [
        locationsData,
        categoriesData,
        suppliersData,
        itemsData,
        ordersData,
        transfersData,
        usersData
      ] = await Promise.all([
        createTimeoutPromise(locationService.getAll(), 'locations'),
        createTimeoutPromise(categoryService.getAll(), 'categories'),
        createTimeoutPromise(supplierService.getAll(), 'suppliers'),
        createTimeoutPromise(itemService.getAll(), 'items', 8000), // Items might take longer
        createTimeoutPromise(orderService.getAll(), 'orders'),
        createTimeoutPromise(transferService.getAll(), 'transfers'),
        createTimeoutPromise(userService.getAll(), 'users')
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

      // Set data even if some failed to load
      setLocations(Array.isArray(locationsData) ? locationsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setTransfers(Array.isArray(transfersData) ? transfersData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);

      // Set first location as current if none selected and locations exist
      if (locationsData && locationsData.length > 0 && !currentLocationId) {
        setCurrentLocationId(locationsData[0].id);
        console.log('Set current location to:', locationsData[0].name);
      }

      setInitialized(true);
      console.log('Inventory data initialization complete');

      // Set up real-time subscriptions after data loads (but don't wait for it)
      setTimeout(() => {
        try {
          setupRealtimeSubscriptions();
        } catch (err) {
          console.warn('Failed to setup real-time subscriptions:', err);
        }
      }, 1000);

    } catch (error) {
      console.error('Error loading inventory data:', error);
      setError('Failed to load some data, but you can still use the app');
      
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
    if (!isAuthenticated) {
      console.log('Not setting up subscriptions - user not authenticated');
      return;
    }
    
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
      ].filter(Boolean); // Remove any null subscriptions

      console.log(`Set up ${subscriptions.length} real-time subscriptions`);

      // Cleanup subscriptions on unmount
      return () => {
        console.log('Cleaning up real-time subscriptions...');
        subscriptions.forEach(sub => {
          try {
            if (sub && sub.unsubscribe) {
              sub.unsubscribe();
            }
          } catch (err) {
            console.warn('Error unsubscribing:', err);
          }
        });
      };
    } catch (error) {
      console.warn('Error setting up real-time subscriptions:', error);
    }
  };

  // Real-time handlers with error protection
  const handleLocationChange = (payload) => {
    try {
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
    } catch (error) {
      console.error('Error handling location change:', error);
    }
  };

  const handleCategoryChange = (payload) => {
    try {
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
    } catch (error) {
      console.error('Error handling category change:', error);
    }
  };

  const handleSupplierChange = (payload) => {
    try {
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
    } catch (error) {
      console.error('Error handling supplier change:', error);
    }
  };

  const handleItemChange = (payload) => {
    try {
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
    } catch (error) {
      console.error('Error handling item change:', error);
    }
  };

  const handleItemLocationChange = (payload) => {
    try {
      console.log('Item location change detected, refreshing items...');
      // Refresh items when stock levels change
      if (initialized) {
        loadItems();
      }
    } catch (error) {
      console.error('Error handling item location change:', error);
    }
  };

  const handleOrderChange = (payload) => {
    try {
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
    } catch (error) {
      console.error('Error handling order change:', error);
    }
  };

  const handleTransferChange = (payload) => {
    try {
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
    } catch (error) {
      console.error('Error handling transfer change:', error);
    }
  };

  const handleUserChange = (payload) => {
    try {
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
    } catch (error) {
      console.error('Error handling user change:', error);
    }
  };

  // Helper functions to reload specific data
  const loadItems = async () => {
    try {
      const data = await itemService.getAll();
      setItems(Array.isArray(data) ? data : []);
      console.log('Items reloaded:', data.length);
    } catch (error) {
      console.error('Error reloading items:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await orderService.getAll();
      setOrders(Array.isArray(data) ? data : []);
      console.log('Orders reloaded:', data.length);
    } catch (error) {
      console.error('Error reloading orders:', error);
    }
  };

  const loadTransfers = async () => {
    try {
      const data = await transferService.getAll();
      setTransfers(Array.isArray(data) ? data : []);
      console.log('Transfers reloaded:', data.length);
    } catch (error) {
      console.error('Error reloading transfers:', error);
    }
  };

  // CRUD operations with error handling
  const operations = {
    // Locations
    locations: {
      create: async (location) => {
        try {
          console.log('Creating location:', location.name);
          const data = await locationService.create(location);
          return data;
        } catch (error) {
          const errorMsg = error.message || 'Failed to create location';
          setError(errorMsg);
          throw error;
        }
      },
      update: async (id, updates) => {
        try {
          console.log('Updating location:', id);
          const data = await locationService.update(id, updates);
          return data;
        } catch (error) {
          const errorMsg = error.message || 'Failed to update location';
          setError(errorMsg);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          console.log('Deleting location:', id);
          await locationService.delete(id);
          return true;
        } catch (error) {
          const errorMsg = error.message || 'Failed to delete location';
          setError(errorMsg);
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
          const errorMsg = error.message || 'Failed to create category';
          setError(errorMsg);
          throw error;
        }
      },
      update: async (id, updates) => {
        try {
          console.log('Updating category:', id);
          const data = await categoryService.update(id, updates);
          return data;
        } catch (error) {
          const errorMsg = error.message || 'Failed to update category';
          setError(errorMsg);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          console.log('Deleting category:', id);
          await categoryService.delete(id);
          return true;
        } catch (error) {
          const errorMsg = error.message || 'Failed to delete category';
          setError(errorMsg);
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
          const errorMsg = error.message || 'Failed to create item';
          setError(errorMsg);
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
          const errorMsg = error.message || 'Failed to update item';
          setError(errorMsg);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          console.log('Deleting item:', id);
          await itemService.delete(id);
          return true;
        } catch (error) {
          const errorMsg = error.message || 'Failed to delete item';
          setError(errorMsg);
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
          const errorMsg = error.message || 'Failed to update stock';
          setError(errorMsg);
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
          const errorMsg = error.message || 'Failed to create order';
          setError(errorMsg);
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
          const errorMsg = error.message || 'Failed to update order';
          setError(errorMsg);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          console.log('Deleting order:', id);
          await orderService.delete(id);
          return true;
        } catch (error) {
          const errorMsg = error.message || 'Failed to delete order';
          setError(errorMsg);
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
          const errorMsg = error.message || 'Failed to create transfer';
          setError(errorMsg);
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
          const errorMsg = error.message || 'Failed to update transfer';
          setError(errorMsg);
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
          const errorMsg = error.message || 'Failed to complete transfer';
          setError(errorMsg);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          console.log('Deleting transfer:', id);
          await transferService.delete(id);
          return true;
        } catch (error) {
          const errorMsg = error.message || 'Failed to delete transfer';
          setError(errorMsg);
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
          const errorMsg = error.message || 'Failed to update profile';
          setError(errorMsg);
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