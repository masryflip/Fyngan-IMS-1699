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
    let timeoutId;

    // Set a maximum loading time of 10 seconds
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Authentication check timed out, proceeding with no auth');
        setLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
      }
    }, 10000);

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Checking for existing session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }
        
        if (session && isMounted) {
          console.log('Found existing session for user:', session.user.id);
          setSession(session);
          setIsAuthenticated(true);
          await loadUserProfile(session.user.id);
        } else {
          console.log('No existing session found');
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // Don't throw, just continue without auth
      } finally {
        if (isMounted) {
          console.log('Setting loading to false');
          setLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
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
          try {
            await loadUserProfile(session.user.id);
          } catch (error) {
            console.error('Error loading user profile during auth change:', error);
            // Create a basic user object as fallback
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.email?.split('@')[0] || 'User',
              role: 'staff'
            });
          }
          setLoading(false);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      console.log('Loading user profile for:', userId);
      
      // Try to get existing profile with timeout
      const profilePromise = userService.getProfile(userId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 5000)
      );
      
      let profile;
      try {
        profile = await Promise.race([profilePromise, timeoutPromise]);
      } catch (error) {
        console.warn('Profile loading failed or timed out:', error);
        profile = null;
      }
      
      // If no profile exists or loading failed, create a basic one
      if (!profile) {
        console.log('Creating basic user profile...');
        
        try {
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
          
          // Try to create profile in database, but don't fail if it doesn't work
          try {
            profile = await userService.updateProfile(userId, defaultProfile);
            console.log('Created new profile in database:', profile);
          } catch (dbError) {
            console.warn('Failed to create profile in database, using local profile:', dbError);
            profile = defaultProfile;
          }
        } catch (authError) {
          console.error('Failed to get auth user data:', authError);
          // Use minimal profile
          profile = {
            id: userId,
            email: 'user@example.com',
            name: 'User',
            role: 'staff'
          };
        }
      }
      
      setUser({
        id: userId,
        ...profile
      });
      
      console.log('User profile loaded successfully:', profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // Create minimal user object as final fallback
      const fallbackUser = {
        id: userId,
        email: session?.user?.email || 'user@example.com',
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