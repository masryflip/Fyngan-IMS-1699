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
      const { data, error } = await supabase
        .from('items_fyngan2024')
        .select(`
          *,
          category:categories_fyngan2024(id, name, color),
          supplier:suppliers_fyngan2024(id, name),
          locations:item_locations_fyngan2024(
            location_id,
            quantity,
            status,
            last_updated,
            location:locations_fyngan2024(id, name)
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async create(item) {
    try {
      const { data, error } = await supabase
        .from('items_fyngan2024')
        .insert([item])
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
        .from('items_fyngan2024')
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
        .from('items_fyngan2024')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateStock(itemId, locationId, quantity, reason = null) {
    try {
      const { data, error } = await supabase
        .from('item_locations_fyngan2024')
        .upsert({
          item_id: itemId,
          location_id: locationId,
          quantity: quantity
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
};

// Orders Service
export const orderService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('orders_fyngan2024')
        .select(`
          *,
          item:items_fyngan2024(id, name, unit),
          location:locations_fyngan2024(id, name),
          supplier:suppliers_fyngan2024(id, name),
          creator:users_fyngan2024(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async create(order) {
    try {
      const { data, error } = await supabase
        .from('orders_fyngan2024')
        .insert([order])
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
        .from('orders_fyngan2024')
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
        .from('orders_fyngan2024')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
};

// Transfers Service
export const transferService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('transfers_fyngan2024')
        .select(`
          *,
          item:items_fyngan2024(id, name, unit),
          from_location:from_location_id(locations_fyngan2024!transfers_fyngan2024_from_location_id_fkey(id, name)),
          to_location:to_location_id(locations_fyngan2024!transfers_fyngan2024_to_location_id_fkey(id, name)),
          creator:users_fyngan2024(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async create(transfer) {
    try {
      const { data, error } = await supabase
        .from('transfers_fyngan2024')
        .insert([transfer])
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
        .from('transfers_fyngan2024')
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

  async complete(id) {
    try {
      // Get transfer details
      const { data: transfer, error: fetchError } = await supabase
        .from('transfers_fyngan2024')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;

      // Update stock levels
      const { error: updateError } = await supabase.rpc('complete_transfer', {
        transfer_id: id,
        item_id: transfer.item_id,
        from_location: transfer.from_location_id,
        to_location: transfer.to_location_id,
        quantity: transfer.quantity
      });

      if (updateError) throw updateError;

      // Mark transfer as completed
      const { data, error } = await supabase
        .from('transfers_fyngan2024')
        .update({ 
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
};

// Users Service
export const userService = {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users_fyngan2024')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateProfile(userId, profile) {
    try {
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
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getAll() {
    try {
      const { data, error } = await supabase
        .from('users_fyngan2024')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
};

// Real-time subscriptions
export const subscribeToTable = (tableName, callback) => {
  const subscription = supabase
    .channel(`${tableName}_changes`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: tableName 
      }, 
      callback
    )
    .subscribe();

  return subscription;
};

// Analytics and Reports
export const analyticsService = {
  async getInventoryValue() {
    try {
      const { data, error } = await supabase
        .rpc('get_inventory_value_by_category');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getLowStockItems() {
    try {
      const { data, error } = await supabase
        .from('item_locations_fyngan2024')
        .select(`
          *,
          item:items_fyngan2024(id, name, min_stock, unit),
          location:locations_fyngan2024(id, name)
        `)
        .in('status', ['low-stock', 'out-of-stock']);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getExpiringItems(days = 30) {
    try {
      const { data, error } = await supabase
        .from('items_fyngan2024')
        .select(`
          *,
          locations:item_locations_fyngan2024(
            location_id,
            quantity,
            location:locations_fyngan2024(name)
          )
        `)
        .lte('expiry_date', new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString())
        .gte('expiry_date', new Date().toISOString());
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
};