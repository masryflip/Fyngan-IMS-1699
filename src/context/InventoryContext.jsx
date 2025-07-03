import React, { createContext, useContext, useReducer, useEffect } from 'react';

const InventoryContext = createContext();

const initialState = {
  locations: [
    {
      id: 1,
      name: 'Downtown Branch',
      address: '123 Main St, Downtown, Cairo',
      manager: 'Ahmed Hassan',
      phone: '+20-10-123-4567'
    },
    {
      id: 2,
      name: 'Mall Location',
      address: '456 Shopping Mall, Level 2, Giza',
      manager: 'Fatima Ali',
      phone: '+20-11-234-5678'
    },
    {
      id: 3,
      name: 'Airport Terminal',
      address: '789 Airport Rd, Terminal 3, Cairo',
      manager: 'Omar Mahmoud',
      phone: '+20-12-345-6789'
    }
  ],
  users: [
    {
      id: 1,
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@fyngan.com',
      phone: '+20-10-123-4567',
      role: 'admin',
      assignedLocations: [1, 2, 3],
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLogin: '2024-01-15T10:30:00.000Z'
    },
    {
      id: 2,
      name: 'Fatima Ali',
      email: 'fatima.ali@fyngan.com',
      phone: '+20-11-234-5678',
      role: 'manager',
      assignedLocations: [2],
      isActive: true,
      createdAt: '2024-01-02T00:00:00.000Z',
      lastLogin: '2024-01-14T14:20:00.000Z'
    },
    {
      id: 3,
      name: 'Omar Mahmoud',
      email: 'omar.mahmoud@fyngan.com',
      phone: '+20-12-345-6789',
      role: 'manager',
      assignedLocations: [3],
      isActive: true,
      createdAt: '2024-01-03T00:00:00.000Z',
      lastLogin: '2024-01-13T09:15:00.000Z'
    }
  ],
  items: [
    {
      id: 1,
      name: 'Premium Coffee Beans',
      category: 'Coffee Beans',
      unit: 'kg',
      minStock: 5.0,
      maxStock: 50.0,
      cost: 125.50,
      supplier: 'Premium Coffee Co.',
      expiryDate: '2024-06-15',
      locations: {
        1: { quantity: 25.5, status: 'in-stock' },
        2: { quantity: 15.25, status: 'in-stock' },
        3: { quantity: 8.75, status: 'in-stock' }
      }
    },
    {
      id: 2,
      name: 'Local Coffee Beans',
      category: 'Coffee Beans',
      unit: 'kg',
      minStock: 5.0,
      maxStock: 30.0,
      cost: 87.50,
      supplier: 'Local Bean Supply',
      expiryDate: '2024-05-20',
      locations: {
        1: { quantity: 3.25, status: 'low-stock' },
        2: { quantity: 12.0, status: 'in-stock' },
        3: { quantity: 0, status: 'out-of-stock' }
      }
    },
    {
      id: 3,
      name: 'Fresh Milk',
      category: 'Dairy',
      unit: 'liters',
      minStock: 10.0,
      maxStock: 40.0,
      cost: 12.75,
      supplier: 'Fresh Dairy Farm',
      expiryDate: '2024-01-25',
      locations: {
        1: { quantity: 0, status: 'out-of-stock' },
        2: { quantity: 25.5, status: 'in-stock' },
        3: { quantity: 5.75, status: 'low-stock' }
      }
    },
    {
      id: 4,
      name: 'Paper Cups',
      category: 'Supplies',
      unit: 'pieces',
      minStock: 100,
      maxStock: 1000,
      cost: 0.25,
      supplier: 'Eco Pack Solutions',
      expiryDate: '',
      locations: {
        1: { quantity: 150, status: 'in-stock' },
        2: { quantity: 75, status: 'low-stock' },
        3: { quantity: 200, status: 'in-stock' }
      }
    }
  ],
  orders: [
    {
      id: 1,
      itemId: 2,
      itemName: 'Local Coffee Beans',
      locationId: 1,
      locationName: 'Downtown Branch',
      quantity: 10.5,
      status: 'pending',
      orderDate: '2024-01-16',
      expectedDelivery: '2024-01-20',
      supplier: 'Local Bean Supply',
      cost: 918.75
    }
  ],
  transfers: [
    {
      id: 1,
      itemId: 2,
      itemName: 'Local Coffee Beans',
      fromLocationId: 2,
      fromLocationName: 'Mall Location',
      toLocationId: 3,
      toLocationName: 'Airport Terminal',
      quantity: 5.25,
      status: 'pending',
      requestDate: '2024-01-17',
      expectedDate: '2024-01-18',
      reason: 'Stock shortage at Airport Terminal'
    }
  ],
  categories: [
    { name: 'Coffee Beans', color: 'blue' },
    { name: 'Dairy', color: 'green' },
    { name: 'Sweeteners', color: 'purple' },
    { name: 'Supplies', color: 'orange' },
    { name: 'Syrups', color: 'pink' }
  ],
  suppliers: ['Premium Coffee Co.', 'Local Bean Supply', 'Fresh Dairy Farm', 'Sweet Supply Co.', 'Eco Pack Solutions', 'Flavor Masters'],
  currentLocation: 1
};

function calculateItemStatus(quantity, minStock) {
  const numQuantity = parseFloat(quantity) || 0;
  const numMinStock = parseFloat(minStock) || 0;
  
  if (numQuantity === 0) return 'out-of-stock';
  if (numQuantity <= numMinStock) return 'low-stock';
  return 'in-stock';
}

function inventoryReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_LOCATION':
      return {
        ...state,
        currentLocation: action.payload
      };

    case 'ADD_LOCATION':
      return {
        ...state,
        locations: [...state.locations, { ...action.payload, id: Date.now() }]
      };

    case 'UPDATE_LOCATION':
      return {
        ...state,
        locations: state.locations.map(location =>
          location.id === action.payload.id ? action.payload : location
        )
      };

    case 'DELETE_LOCATION':
      return {
        ...state,
        locations: state.locations.filter(location => location.id !== action.payload),
        items: state.items.map(item => ({
          ...item,
          locations: Object.fromEntries(
            Object.entries(item.locations).filter(([locationId]) => locationId !== action.payload.toString())
          )
        }))
      };

    case 'ADD_USER':
      return {
        ...state,
        users: [...(state.users || []), action.payload]
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: (state.users || []).map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      };

    case 'DELETE_USER':
      return {
        ...state,
        users: (state.users || []).filter(user => user.id !== action.payload)
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };

    case 'UPDATE_CATEGORY':
      const { oldName, newName, color } = action.payload;
      return {
        ...state,
        categories: state.categories.map(cat =>
          (typeof cat === 'string' ? cat : cat.name) === oldName 
            ? { name: newName, color }
            : cat
        ),
        items: state.items.map(item =>
          item.category === oldName 
            ? { ...item, category: newName }
            : item
        )
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(cat =>
          (typeof cat === 'string' ? cat : cat.name) !== action.payload
        ),
        items: state.items.map(item =>
          item.category === action.payload 
            ? { ...item, category: 'Uncategorized' }
            : item
        )
      };

    case 'ADD_ITEM':
      const newItem = {
        ...action.payload,
        id: Date.now(),
        quantity: parseFloat(action.payload.quantity) || 0,
        minStock: parseFloat(action.payload.minStock) || 0,
        maxStock: parseFloat(action.payload.maxStock) || 0,
        cost: parseFloat(action.payload.cost) || 0,
        locations: state.locations.reduce((acc, location) => {
          const quantity = parseFloat(action.payload.quantity) || 0;
          acc[location.id] = {
            quantity: quantity,
            status: calculateItemStatus(quantity, parseFloat(action.payload.minStock) || 0)
          };
          return acc;
        }, {})
      };
      return {
        ...state,
        items: [...state.items, newItem]
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { 
                ...action.payload, 
                quantity: parseFloat(action.payload.quantity) || 0,
                minStock: parseFloat(action.payload.minStock) || 0,
                maxStock: parseFloat(action.payload.maxStock) || 0,
                cost: parseFloat(action.payload.cost) || 0,
                locations: item.locations 
              }
            : item
        )
      };

    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'ADD_ORDER':
      return {
        ...state,
        orders: [...state.orders, { 
          ...action.payload, 
          id: Date.now(),
          quantity: parseFloat(action.payload.quantity) || 0,
          cost: parseFloat(action.payload.cost) || 0
        }]
      };

    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id 
            ? { 
                ...action.payload,
                quantity: parseFloat(action.payload.quantity) || 0,
                cost: parseFloat(action.payload.cost) || 0
              } 
            : order
        )
      };

    case 'DELETE_ORDER':
      return {
        ...state,
        orders: state.orders.filter(order => order.id !== action.payload)
      };

    case 'ADJUST_STOCK':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? {
                ...item,
                locations: {
                  ...item.locations,
                  [action.payload.locationId]: {
                    quantity: Math.max(0, parseFloat(item.locations[action.payload.locationId].quantity) + parseFloat(action.payload.adjustment)),
                    status: calculateItemStatus(
                      Math.max(0, parseFloat(item.locations[action.payload.locationId].quantity) + parseFloat(action.payload.adjustment)),
                      parseFloat(item.minStock) || 0
                    )
                  }
                }
              }
            : item
        )
      };

    case 'ADD_TRANSFER':
      return {
        ...state,
        transfers: [...state.transfers, { 
          ...action.payload, 
          id: Date.now(),
          quantity: parseFloat(action.payload.quantity) || 0
        }]
      };

    case 'UPDATE_TRANSFER':
      return {
        ...state,
        transfers: state.transfers.map(transfer =>
          transfer.id === action.payload.id 
            ? { 
                ...action.payload,
                quantity: parseFloat(action.payload.quantity) || 0
              } 
            : transfer
        )
      };

    case 'COMPLETE_TRANSFER':
      const transfer = state.transfers.find(t => t.id === action.payload);
      if (!transfer) return state;

      const transferQuantity = parseFloat(transfer.quantity) || 0;

      return {
        ...state,
        transfers: state.transfers.map(t =>
          t.id === action.payload ? { ...t, status: 'completed' } : t
        ),
        items: state.items.map(item =>
          item.id === transfer.itemId
            ? {
                ...item,
                locations: {
                  ...item.locations,
                  [transfer.fromLocationId]: {
                    quantity: Math.max(0, parseFloat(item.locations[transfer.fromLocationId].quantity) - transferQuantity),
                    status: calculateItemStatus(
                      Math.max(0, parseFloat(item.locations[transfer.fromLocationId].quantity) - transferQuantity),
                      parseFloat(item.minStock) || 0
                    )
                  },
                  [transfer.toLocationId]: {
                    quantity: parseFloat(item.locations[transfer.toLocationId].quantity) + transferQuantity,
                    status: calculateItemStatus(
                      parseFloat(item.locations[transfer.toLocationId].quantity) + transferQuantity,
                      parseFloat(item.minStock) || 0
                    )
                  }
                }
              }
            : item
        )
      };

    case 'DELETE_TRANSFER':
      return {
        ...state,
        transfers: state.transfers.filter(transfer => transfer.id !== action.payload)
      };

    default:
      return state;
  }
}

export function InventoryProvider({ children }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const stateToSave = JSON.stringify(state);
      localStorage.setItem('multiLocationInventory', stateToSave);
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }, [state]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('multiLocationInventory');
      if (savedState && savedState !== 'undefined') {
        const parsed = JSON.parse(savedState);
        if (parsed && parsed.locations && parsed.items) {
          if (parsed.currentLocation) {
            dispatch({ type: 'SET_CURRENT_LOCATION', payload: parsed.currentLocation });
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved inventory:', error);
      // Clear corrupted data
      localStorage.removeItem('multiLocationInventory');
    }
  }, []);

  return (
    <InventoryContext.Provider value={{ state, dispatch }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}