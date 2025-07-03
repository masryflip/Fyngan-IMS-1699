import { supabase, handleSupabaseError } from '../lib/supabase';

// Locations Service
export const locationService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('locations_fyngan2024')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async create(location) {
    try {
      const { data, error } = await supabase
        .from('locations_fyngan2024')
        .insert([location])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('locations_fyngan2024')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('locations_fyngan2024')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
};

// Categories Service
export const categoryService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('categories_fyngan2024')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async create(category) {
    try {
      const { data, error } = await supabase
        .from('categories_fyngan2024')
        .insert([category])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('categories_fyngan2024')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('categories_fyngan2024')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
};

// Suppliers Service
export const supplierService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('suppliers_fyngan2024')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async create(supplier) {
    try {
      const { data, error } = await supabase
        .from('suppliers_fyngan2024')
        .insert([supplier])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
};

// Items Service
export const itemService = {
  async getAll() {
    try {
      console.log('Fetching all items from database...');
      
      // First get items with basic relations
      const { data: items, error: itemsError } = await supabase
        .from('items_fyngan2024')
        .select(`
          *,
          category:category_id(id, name, color),
          supplier:supplier_id(id, name)
        `)
        .order('name');
      
      if (itemsError) {
        console.error('Error fetching items:', itemsError);
        throw itemsError;
      }

      // Then get stock levels for each item
      const { data: stockLevels, error: stockError } = await supabase
        .from('item_locations_fyngan2024')
        .select(`
          item_id,
          location_id,
          quantity,
          status,
          last_updated,
          location:location_id(id, name)
        `);

      if (stockError) {
        console.error('Error fetching stock levels:', stockError);
        // Don't throw error, just use items without stock data
      }

      // Combine items with their stock levels
      const itemsWithStock = items.map(item => {
        const itemStockLevels = stockLevels?.filter(stock => stock.item_id === item.id) || [];
        
        // Convert stock levels to locations object
        const locations = {};
        itemStockLevels.forEach(stock => {
          locations[stock.location_id] = {
            quantity: stock.quantity || 0,
            status: stock.status || 'out-of-stock',
            last_updated: stock.last_updated
          };
        });

        return {
          ...item,
          locations
        };
      });

      console.log(`Loaded ${itemsWithStock.length} items with stock data`);
      return itemsWithStock;
    } catch (error) {
      console.error('Error in itemService.getAll:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async create(item) {
    try {
      console.log('Creating new item:', item.name);
      
      const { data, error } = await supabase
        .from('items_fyngan2024')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Item created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async update(id, updates) {
    try {
      console.log('Updating item:', id);
      
      const { data, error } = await supabase
        .from('items_fyngan2024')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Item updated successfully:', id);
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async delete(id) {
    try {
      console.log('Deleting item:', id);
      
      const { error } = await supabase
        .from('items_fyngan2024')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('Item deleted successfully:', id);
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateStock(itemId, locationId, quantity, reason = null) {
    try {
      console.log('Updating stock:', { itemId, locationId, quantity });
      
      const { data, error } = await supabase
        .from('item_locations_fyngan2024')
        .upsert({
          item_id: itemId,
          location_id: locationId,
          quantity: quantity,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Stock updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw new Error(handleSupabaseError(error));
    }
  }
};

// Orders Service
export const orderService = {
  async getAll() {
    try {
      console.log('Fetching all orders...');
      
      const { data, error } = await supabase
        .from('orders_fyngan2024')
        .select(`
          *,
          item:item_id(id, name, unit),
          location:location_id(id, name),
          supplier:supplier_id(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log(`Loaded ${data?.length || 0} orders`);
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async create(order) {
    try {
      console.log('Creating new order:', order);
      
      const { data, error } = await supabase
        .from('orders_fyngan2024')
        .insert([{
          ...order,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Order created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async update(id, updates) {
    try {
      console.log('Updating order:', id);
      
      const { data, error } = await supabase
        .from('orders_fyngan2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Order updated successfully:', id);
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async delete(id) {
    try {
      console.log('Deleting order:', id);
      
      const { error } = await supabase
        .from('orders_fyngan2024')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('Order deleted successfully:', id);
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw new Error(handleSupabaseError(error));
    }
  }
};

// Transfers Service
export const transferService = {
  async getAll() {
    try {
      console.log('Fetching all transfers...');
      
      const { data, error } = await supabase
        .from('transfers_fyngan2024')
        .select(`
          *,
          item:item_id(id, name, unit),
          from_location:from_location_id(id, name),
          to_location:to_location_id(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log(`Loaded ${data?.length || 0} transfers`);
      return data || [];
    } catch (error) {
      console.error('Error fetching transfers:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async create(transfer) {
    try {
      console.log('Creating new transfer:', transfer);
      
      const { data, error } = await supabase
        .from('transfers_fyngan2024')
        .insert([{
          ...transfer,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Transfer created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async update(id, updates) {
    try {
      console.log('Updating transfer:', id);
      
      const { data, error } = await supabase
        .from('transfers_fyngan2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Transfer updated successfully:', id);
      return data;
    } catch (error) {
      console.error('Error updating transfer:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async complete(id) {
    try {
      console.log('Completing transfer:', id);
      
      // Get transfer details
      const { data: transfer, error: fetchError } = await supabase
        .from('transfers_fyngan2024')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;

      // Update stock levels manually (since we don't have the RPC function)
      const { data: fromStock, error: fromError } = await supabase
        .from('item_locations_fyngan2024')
        .select('quantity')
        .eq('item_id', transfer.item_id)
        .eq('location_id', transfer.from_location_id)
        .single();

      if (fromError && fromError.code !== 'PGRST116') throw fromError;

      const { data: toStock, error: toError } = await supabase
        .from('item_locations_fyngan2024')
        .select('quantity')
        .eq('item_id', transfer.item_id)
        .eq('location_id', transfer.to_location_id)
        .single();

      if (toError && toError.code !== 'PGRST116') throw toError;

      // Update from location (subtract)
      const newFromQuantity = Math.max(0, (fromStock?.quantity || 0) - transfer.quantity);
      await supabase
        .from('item_locations_fyngan2024')
        .upsert({
          item_id: transfer.item_id,
          location_id: transfer.from_location_id,
          quantity: newFromQuantity,
          last_updated: new Date().toISOString()
        });

      // Update to location (add)
      const newToQuantity = (toStock?.quantity || 0) + transfer.quantity;
      await supabase
        .from('item_locations_fyngan2024')
        .upsert({
          item_id: transfer.item_id,
          location_id: transfer.to_location_id,
          quantity: newToQuantity,
          last_updated: new Date().toISOString()
        });

      // Mark transfer as completed
      const { data, error } = await supabase
        .from('transfers_fyngan2024')
        .update({ 
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Transfer completed successfully:', id);
      return data;
    } catch (error) {
      console.error('Error completing transfer:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async delete(id) {
    try {
      console.log('Deleting transfer:', id);
      
      const { error } = await supabase
        .from('transfers_fyngan2024')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('Transfer deleted successfully:', id);
      return true;
    } catch (error) {
      console.error('Error deleting transfer:', error);
      throw new Error(handleSupabaseError(error));
    }
  }
};

// Users Service
export const userService = {
  async getProfile(userId) {
    try {
      console.log('Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users_fyngan2024')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      console.log('User profile fetched:', data ? 'found' : 'not found');
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateProfile(userId, profile) {
    try {
      console.log('Updating user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users_fyngan2024')
        .upsert({
          id: userId,
          ...profile,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('User profile updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async getAll() {
    try {
      console.log('Fetching all users...');
      
      const { data, error } = await supabase
        .from('users_fyngan2024')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      console.log(`Loaded ${data?.length || 0} users`);
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(handleSupabaseError(error));
    }
  }
};

// Real-time subscriptions
export const subscribeToTable = (tableName, callback) => {
  try {
    console.log('Setting up subscription for table:', tableName);
    
    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: tableName 
        }, 
        (payload) => {
          console.log('Real-time update received for', tableName, ':', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status for', tableName, ':', status);
      });

    return subscription;
  } catch (error) {
    console.error('Error setting up subscription for', tableName, ':', error);
    return null;
  }
};

// Analytics and Reports
export const analyticsService = {
  async getInventoryValue() {
    try {
      console.log('Fetching inventory value data...');
      
      // Since we don't have the RPC function, calculate manually
      const items = await itemService.getAll();
      const categoryValues = {};
      
      items.forEach(item => {
        const categoryName = item.category?.name || 'Uncategorized';
        const totalQuantity = Object.values(item.locations).reduce((sum, loc) => sum + (loc.quantity || 0), 0);
        const itemValue = totalQuantity * (item.cost || 0);
        
        categoryValues[categoryName] = (categoryValues[categoryName] || 0) + itemValue;
      });
      
      const result = Object.entries(categoryValues).map(([category, value]) => ({
        category,
        value
      }));
      
      console.log('Inventory value calculated:', result);
      return result;
    } catch (error) {
      console.error('Error calculating inventory value:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async getLowStockItems() {
    try {
      console.log('Fetching low stock items...');
      
      const { data, error } = await supabase
        .from('item_locations_fyngan2024')
        .select(`
          *,
          item:item_id(id, name, min_stock, unit),
          location:location_id(id, name)
        `)
        .in('status', ['low-stock', 'out-of-stock']);
      
      if (error) throw error;
      
      console.log(`Found ${data?.length || 0} low stock items`);
      return data || [];
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async getExpiringItems(days = 30) {
    try {
      console.log('Fetching expiring items...');
      
      const { data, error } = await supabase
        .from('items_fyngan2024')
        .select(`
          *,
          locations:item_locations_fyngan2024(
            location_id,
            quantity,
            location:location_id(name)
          )
        `)
        .lte('expiry_date', new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString())
        .gte('expiry_date', new Date().toISOString());
      
      if (error) throw error;
      
      console.log(`Found ${data?.length || 0} expiring items`);
      return data || [];
    } catch (error) {
      console.error('Error fetching expiring items:', error);
      throw new Error(handleSupabaseError(error));
    }
  }
};