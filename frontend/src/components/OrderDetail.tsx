import React, { useState, useEffect } from 'react';
import { Order } from '../types/order';
import { Transaction } from '../types/transaction';
import api from '../services/api';

interface OrderDetailProps {
  orderId: number;
  onEdit: (order: Order) => void;
  onBack: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onEdit, onBack }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const [orderResponse, transactionsResponse] = await Promise.all([
        api.get<Order>(`/orders/${orderId}/`),
        api.get<Transaction[]>(`/transactions/?order=${orderId}`)
      ]);

      setOrder(orderResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (err: any) {
      setError('Failed to fetch order data');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete order ${order.order_number}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.delete(`/orders/${order.id}/`);
      onBack();
    } catch (err: any) {
      setError('Failed to delete order');
      console.error('Error deleting order:', err);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount || '0');
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">Order not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Orders
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
              <p className="text-gray-600">
                {order.customer_info?.full_name || `Customer #${order.customer}`}
                {order.customer_info?.email && ` (${order.customer_info.email})`}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onEdit(order)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{formatDate(order.order_date)}</div>
            <div className="text-sm text-gray-500">Order Date</div>
          </div>
          <div className="text-center">
            <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Status</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(order.total)}
            </div>
            <div className="text-sm text-gray-500">Total Amount</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {order.items?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Items</div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">
                    {order.customer_info?.full_name || `Customer #${order.customer}`}
                  </dd>
                </div>
                {order.customer_info?.email && (
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{order.customer_info.email}</dd>
                  </div>
                )}
                {order.customer_info?.phone && (
                  <div>
                    <dt className="text-sm text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">{order.customer_info.phone}</dd>
                  </div>
                )}
                {order.customer_info?.company && (
                  <div>
                    <dt className="text-sm text-gray-500">Company</dt>
                    <dd className="text-sm text-gray-900">{order.customer_info.company}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Order Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Order Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Order Number</dt>
                  <dd className="text-sm text-gray-900">{order.order_number}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Order Date</dt>
                  <dd className="text-sm text-gray-900">{formatDate(order.order_date)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </dd>
                </div>
                {order.notes && (
                  <div>
                    <dt className="text-sm text-gray-500">Notes</dt>
                    <dd className="text-sm text-gray-900 whitespace-pre-wrap">{order.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.product_sku || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Totals */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              {parseFloat(order.tax_amount as string) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax:</span>
                  <span className="text-gray-900">{formatCurrency(order.tax_amount)}</span>
                </div>
              )}
              {parseFloat(order.shipping_amount as string) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping:</span>
                  <span className="text-gray-900">{formatCurrency(order.shipping_amount)}</span>
                </div>
              )}
              {parseFloat(order.discount_amount as string) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount:</span>
                  <span className="text-red-600">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-2">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses */}
      {(order.shipping_address || order.billing_address) && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Addresses</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {order.shipping_address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {order.shipping_address}
                  </div>
                </div>
              )}
              {order.billing_address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Billing Address</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {order.billing_address}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Related Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Related Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.transaction_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.transaction_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;