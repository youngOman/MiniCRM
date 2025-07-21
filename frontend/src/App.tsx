import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import { 
  CustomerOverview, 
  CustomerDemographics, 
  CustomerBehavior, 
  CustomerSegmentation,
  CustomerValueAnalytics
} from './components/customer_analytics/pages';
import OrderList from './components/OrderList';
import TransactionList from './components/TransactionList';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ProductForm from './components/ProductForm';
import ServiceTicketList from './components/ServiceTicketList';
import ServiceTicketDetail from './components/ServiceTicketDetail';
import ServiceTicketForm from './components/ServiceTicketForm';
import KnowledgeBaseList from './components/KnowledgeBaseList';
import FAQList from './components/FAQList';
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
            <Route path="customer-value-analytics" element={<CustomerValueAnalytics />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="transactions" element={<TransactionList />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm mode="create" />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="products/:id/edit" element={<ProductForm mode="edit" />} />
            
            {/* 客服系統路由 */}
            <Route path="service-tickets" element={<ServiceTicketList />} />
            <Route path="service-tickets/new" element={<ServiceTicketForm />} />
            <Route path="service-tickets/:id" element={<ServiceTicketDetail />} />
            <Route path="service-tickets/:id/edit" element={<ServiceTicketForm />} />
            <Route path="knowledge-base" element={<KnowledgeBaseList />} />
            <Route path="faq" element={<FAQList />} />
            
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
