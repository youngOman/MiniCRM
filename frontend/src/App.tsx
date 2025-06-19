import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import CustomerList from './components/CustomerList';
import OrderList from './components/OrderList';
import TransactionList from './components/TransactionList';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/auth';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/customers" replace />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="transactions" element={<TransactionList />} />
          </Route>
          <Route
            path="*"
            element={
              authService.isAuthenticated() ? (
                <Navigate to="/customers" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
