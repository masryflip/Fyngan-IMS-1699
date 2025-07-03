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
    let isMounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session && isMounted) {
          console.log('Initial session found:', session.user.id);
          setSession(session);
          setIsAuthenticated(true);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!isMounted) return;

        setSession(session);
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          setLoading(true);
          await loadUserProfile(session.user.id);
          setLoading(false);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      console.log('Loading user profile for:', userId);
      
      // Try to get existing profile
      let profile = await userService.getProfile(userId);
      
      // If no profile exists, create a basic one
      if (!profile) {
        console.log('No profile found, creating new profile');
        const { data: authUser } = await supabase.auth.getUser();
        
        const defaultProfile = {
          id: userId,
          email: authUser.user?.email || '',
          name: authUser.user?.user_metadata?.name || 
                authUser.user?.email?.split('@')[0] || 
                'User',
          role: 'staff',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        profile = await userService.updateProfile(userId, defaultProfile);
        console.log('Created new profile:', profile);
      }
      
      setUser({
        id: userId,
        ...profile
      });
      
      console.log('User profile loaded successfully:', profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // Create minimal user object if profile loading fails
      const fallbackUser = {
        id: userId,
        email: session?.user?.email || '',
        name: session?.user?.email?.split('@')[0] || 'User',
        role: 'staff'
      };
      
      setUser(fallbackUser);
      console.log('Using fallback user:', fallbackUser);
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      console.log('Attempting to sign up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name || email.split('@')[0]
          }
        }
      });
      
      if (error) throw error;
      
      console.log('Sign up successful:', data);
      
      // If we get a session immediately (email confirmation disabled)
      if (data.session) {
        console.log('Immediate session available');
        setSession(data.session);
        setIsAuthenticated(true);
        await loadUserProfile(data.user.id);
      }
      
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
      console.log('Attempting to sign in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log('Sign in successful:', data);
      
      // The onAuthStateChange will handle the rest
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
      console.log('Signing out user');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      if (!user?.id) throw new Error('No authenticated user');
      
      console.log('Updating user profile:', profileData);
      
      const updatedProfile = await userService.updateProfile(user.id, profileData);
      
      setUser(prev => ({
        ...prev,
        ...updatedProfile
      }));
      
      console.log('Profile updated successfully:', updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Legacy compatibility methods
  const login = (userData) => {
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