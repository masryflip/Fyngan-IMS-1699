import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { userService } from '../services/inventoryService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          setSession(session);
          setIsAuthenticated(true);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      // Try to get existing profile
      let profile = await userService.getProfile(userId);
      
      // If no profile exists, create a basic one
      if (!profile) {
        const { data: authUser } = await supabase.auth.getUser();
        profile = await userService.updateProfile(userId, {
          email: authUser.user?.email || '',
          name: authUser.user?.user_metadata?.name || authUser.user?.email?.split('@')[0] || 'User',
          role: 'staff' // Default role
        });
      }
      
      setUser({
        id: userId,
        ...profile
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Create minimal user object if profile loading fails
      setUser({
        id: userId,
        email: session?.user?.email || '',
        name: session?.user?.email?.split('@')[0] || 'User'
      });
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      if (!user?.id) throw new Error('No authenticated user');
      
      const updatedProfile = await userService.updateProfile(user.id, profileData);
      
      setUser(prev => ({
        ...prev,
        ...updatedProfile
      }));
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Legacy compatibility methods
  const login = (userData) => {
    // This is for compatibility with Quest Login
    // The actual auth will be handled by Supabase
    console.log('Legacy login called with:', userData);
  };

  const logout = () => {
    signOut();
  };

  const value = {
    // State
    isAuthenticated,
    user,
    session,
    loading,

    // Methods
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    
    // Legacy compatibility
    login,
    logout,
    setIsAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}