import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userData = localStorage.getItem('userData');
      const userProfile = localStorage.getItem('userProfile');

      if (token && userId && token !== 'undefined' && userId !== 'undefined') {
        setIsAuthenticated(true);
        
        // Merge saved profile data with user data
        let combinedUserData = { userId };
        
        if (userData && userData !== 'undefined') {
          const parsedUserData = JSON.parse(userData);
          combinedUserData = { ...combinedUserData, ...parsedUserData };
        }
        
        if (userProfile && userProfile !== 'undefined') {
          const parsedProfile = JSON.parse(userProfile);
          combinedUserData = { ...combinedUserData, ...parsedProfile };
        }
        
        setUser(combinedUserData);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      // Clear corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
      localStorage.removeItem('userProfile');
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    try {
      if (userData && userData.userId && userData.token) {
        localStorage.setItem('userId', userData.userId);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const updateUserProfile = (profileData) => {
    try {
      // Update localStorage
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      
      // Update user state with merged data
      setUser(prev => ({
        ...prev,
        ...profileData
      }));
      
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userProfile');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUserProfile,
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