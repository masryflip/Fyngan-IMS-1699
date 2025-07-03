import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute state:', { isAuthenticated, loading, user: user?.id });
  }, [isAuthenticated, loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-50 to-coffee-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-coffee-200 border-t-coffee-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coffee-600 font-medium">Loading your dashboard...</p>
          <p className="text-coffee-500 text-sm mt-2">Setting up your inventory system</p>
          
          {/* Add timeout indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
            className="mt-4 text-xs text-coffee-400"
          >
            If this takes too long, try refreshing the page
          </motion.div>
          
          {/* Emergency bypass button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 8 }}
            className="mt-4"
          >
            <button
              onClick={() => window.location.href = '/login'}
              className="text-xs text-coffee-600 underline hover:text-coffee-700"
            >
              Go to Login Page
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('User authenticated, rendering protected content');
  return children;
}

export default ProtectedRoute;