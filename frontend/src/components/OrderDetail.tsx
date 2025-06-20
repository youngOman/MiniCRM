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
      setError('無法取得訂單資料');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    
    const confirmed = window.confirm(`確定要刪除訂單 ${order.order_number} 嗎？此操作無法復原。`);
    if (!confirmed) return;

    try {
      await api.delete(`/orders/${order.id}/`);
      onBack();
    } catch (err: any) {
      setError('無法刪除訂單');
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
        <div className="text-red-600">找不到訂單</div>
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
                ← 返回訂單列表
              </button>
              <h1 className="text-2xl font-bold text-gray-900">訂單 {order.order_number}</h1>
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
                編輯
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                刪除
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{formatDate(order.order_date)}</div>
            <div className="text-sm text-gray-500">訂單日期</div>
          </div>
          <div className="text-center">
            <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
            <div className="text-sm text-gray-500 mt-1">狀態</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(order.total)}
            </div>
            <div className="text-sm text-gray-500">總金額</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {order.items?.length || 0}
            </div>
            <div className="text-sm text-gray-500">項目數量</div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">訂單詳情</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">客戶資訊</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">姓名</dt>
                  <dd className="text-sm text-gray-900">
                    {order.customer_info?.full_name || `Customer #${order.customer}`}
                  </dd>
                </div>
                {order.customer_info?.email && (
                  <div>
                    <dt className="text-sm text-gray-500">電子郵件</dt>
                    <dd className="text-sm text-gray-900">{order.customer_info.email}</dd>
                  </div>
                )}
                {order.customer_info?.phone && (
                  <div>
                    <dt className="text-sm text-gray-500">電話</dt>
                    <dd className="text-sm text-gray-900">{order.customer_info.phone}</dd>
                  </div>
                )}
                {order.customer_info?.company && (
                  <div>
                    <dt className="text-sm text-gray-500">公司</dt>
                    <dd className="text-sm text-gray-900">{order.customer_info.company}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Order Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">訂單資訊</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">訂單編號</dt>
                  <dd className="text-sm text-gray-900">{order.order_number}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">訂單日期</dt>
                  <dd className="text-sm text-gray-900">{formatDate(order.order_date)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">狀態</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </dd>
                </div>
                {order.notes && (
                  <div>
                    <dt className="text-sm text-gray-500">備註</dt>
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
          <h2 className="text-lg font-medium text-gray-900">訂單項目</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  產品
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  數量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  單價
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  小計
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
                <span className="text-gray-500">小計：</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              {parseFloat(order.tax_amount as string) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">稅金：</span>
                  <span className="text-gray-900">{formatCurrency(order.tax_amount)}</span>
                </div>
              )}
              {parseFloat(order.shipping_amount as string) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">運費：</span>
                  <span className="text-gray-900">{formatCurrency(order.shipping_amount)}</span>
                </div>
              )}
              {parseFloat(order.discount_amount as string) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">折扣：</span>
                  <span className="text-red-600">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-2">
                <span className="text-gray-900">總計：</span>
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
            <h2 className="text-lg font-medium text-gray-900">地址資訊</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {order.shipping_address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">配送地址</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {order.shipping_address}
                  </div>
                </div>
              )}
              {order.billing_address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">帳單地址</h3>
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
            <h2 className="text-lg font-medium text-gray-900">相關交易</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    交易編號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    類型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    付款方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
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