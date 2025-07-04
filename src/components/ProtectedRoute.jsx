import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user, debugInfo, forceLogin } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute state:', { 
      isAuthenticated, 
      loading, 
      user: user?.id,
      userEmail: user?.email 
    });
  }, [isAuthenticated, loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-50 to-coffee-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <div className="w-16 h-16 border-4 border-coffee-200 border-t-coffee-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coffee-600 font-medium">Loading your dashboard...</p>
          <p className="text-coffee-500 text-sm mt-2">Setting up your inventory system</p>
          
          {/* Debug Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="mt-4 p-4 bg-white/70 rounded-lg text-left"
          >
            <h4 className="font-bold text-coffee-700 mb-2">Debug Info:</h4>
            <div className="text-xs text-coffee-600 space-y-1 max-h-32 overflow-y-auto">
              {debugInfo.slice(-5).map((info, index) => (
                <div key={index} className="font-mono">
                  {info.message}
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Emergency buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
            className="mt-4 space-y-2"
          >
            <button
              onClick={forceLogin}
              className="block w-full px-4 py-2 bg-coffee-500 text-white rounded-lg hover:bg-coffee-600 transition-colors text-sm"
            >
              🔧 Force Login (Debug Mode)
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="block w-full px-4 py-2 border border-coffee-300 text-coffee-600 rounded-lg hover:bg-coffee-50 transition-colors text-sm"
            >
              🔄 Go to Login Page
            </button>
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              ↻ Reload Page
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