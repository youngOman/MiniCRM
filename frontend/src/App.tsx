import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import { 
  CustomerOverview, 
  CustomerDemographics, 
  CustomerBehavior, 
  CustomerSegmentation 
} from './components/customer_analytics/pages';
import OrderList from './components/OrderList';
import TransactionList from './components/TransactionList';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customer-overview" element={<CustomerOverview />} />
            <Route path="customer-demographics" element={<CustomerDemographics />} />
            <Route path="customer-behavior" element={<CustomerBehavior />} />
            <Route path="customer-segmentation" element={<CustomerSegmentation />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="transactions" element={<TransactionList />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/:id" element={<ProductDetail />} />
            
          </Route>
          <Route
            path="*"
            element={
              authService.isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
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
