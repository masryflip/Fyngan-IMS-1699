import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { userService } from '../services/inventoryService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  // Debug logging function
  const addDebugInfo = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const debugEntry = `[${timestamp}] ${message}`;
    console.log(debugEntry, data || '');
    setDebugInfo(prev => [...prev.slice(-10), { message: debugEntry, data }]);
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    addDebugInfo('🔄 Starting authentication check...');

    // Set a maximum loading time
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        addDebugInfo('⚠️ Authentication check timed out');
        setLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
      }
    }, 10000); // Increased to 10 seconds

    // Get initial session
    const getInitialSession = async () => {
      try {
        addDebugInfo('🔍 Checking for existing session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          addDebugInfo('❌ Error getting session', error.message);
          throw error;
        }
        
        if (session && isMounted) {
          addDebugInfo('✅ Found existing session', session.user.email);
          setSession(session);
          setIsAuthenticated(true);
          
          // Create basic user immediately to unblock UI
          const basicUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.email?.split('@')[0] || 'User',
            role: 'staff'
          };
          setUser(basicUser);
          addDebugInfo('👤 Set basic user', basicUser.email);
          
          // Load full profile in background
          setTimeout(() => {
            loadUserProfile(session.user.id).catch(error => {
              addDebugInfo('⚠️ Profile loading failed, keeping basic user', error.message);
            });
          }, 100);
        } else {
          addDebugInfo('ℹ️ No existing session found');
        }
      } catch (error) {
        addDebugInfo('❌ Error in getInitialSession', error.message);
      } finally {
        if (isMounted) {
          addDebugInfo('✅ Setting loading to false');
          setLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        addDebugInfo(`🔄 Auth state changed: ${event}`, session?.user?.email);
        
        if (!isMounted) return;

        setSession(session);
        
        if (session?.user) {
          addDebugInfo('✅ User signed in', session.user.email);
          setIsAuthenticated(true);
          
          // Create basic user immediately
          const basicUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.email?.split('@')[0] || 'User',
            role: 'staff'
          };
          setUser(basicUser);
          addDebugInfo('👤 User object created', basicUser.email);
          
          // Load full profile in background
          setTimeout(() => {
            loadUserProfile(session.user.id).catch(error => {
              addDebugInfo('⚠️ Profile loading failed during auth change', error.message);
            });
          }, 100);
          
          // Ensure loading is false
          setLoading(false);
        } else {
          addDebugInfo('❌ User signed out');
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
      addDebugInfo('🧹 Cleanup completed');
    };
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      addDebugInfo('📋 Loading user profile...', userId);
      
      const profile = await userService.getProfile(userId);
      
      if (profile) {
        setUser(prev => ({
          ...prev,
          ...profile
        }));
        addDebugInfo('✅ Profile loaded successfully', profile.name);
      } else {
        addDebugInfo('ℹ️ No profile found, keeping basic user');
      }
    } catch (error) {
      addDebugInfo('❌ Error loading profile', error.message);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      addDebugInfo('🔐 Starting sign in process...', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        addDebugInfo('❌ Sign in failed', error.message);
        setLoading(false);
        throw error;
      }
      
      addDebugInfo('✅ Sign in successful', data.user?.email);
      return { data, error: null };
    } catch (error) {
      addDebugInfo('❌ Sign in error', error.message);
      setLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      addDebugInfo('🔓 Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setDebugInfo([]); // Clear debug info on logout
      
      addDebugInfo('✅ Sign out successful');
    } catch (error) {
      addDebugInfo('❌ Sign out error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      if (!user?.id) throw new Error('No authenticated user');
      
      addDebugInfo('📝 Updating user profile...');
      
      const updatedProfile = await userService.updateProfile(user.id, profileData);
      
      setUser(prev => ({
        ...prev,
        ...updatedProfile
      }));
      
      addDebugInfo('✅ Profile updated successfully');
      return updatedProfile;
    } catch (error) {
      addDebugInfo('❌ Error updating profile', error.message);
      throw error;
    }
  };

  // Debug method to force login (for testing)
  const forceLogin = () => {
    addDebugInfo('🔧 Force login triggered');
    setIsAuthenticated(true);
    setUser({
      id: 'debug-user',
      email: 'debug@test.com',
      name: 'Debug User',
      role: 'admin'
    });
    setLoading(false);
  };

  // Legacy compatibility methods
  const login = (userData) => {
    addDebugInfo('🔧 Legacy login called', userData);
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
    debugInfo,

    // Methods
    signIn,
    signOut,
    updateUserProfile,
    forceLogin,
    
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