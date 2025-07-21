import React, { useState, useEffect, useCallback } from 'react';
import { Customer } from '../types/customer';
import { Order } from '../types/order';
import { Transaction } from '../types/transaction';
import { ApiError } from '../types/error';
import api from '../services/api';

interface CustomerDetailProps {
  customerId: number;
  onEdit: (customer: Customer) => void;
  onBack: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId, onEdit, onBack }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [error, setError] = useState('');

  const fetchCustomerData = useCallback(async () => {
    try {
      setLoading(true);
      const [customerResponse, ordersResponse, transactionsResponse] = await Promise.all([
        api.get<Customer>(`/customers/${customerId}/`),
        api.get<Order[]>(`/customers/${customerId}/orders/`),
        api.get<Transaction[]>(`/customers/${customerId}/transactions/`)
      ]);

      setCustomer(customerResponse.data);
      setOrders(ordersResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (err) {
      const error = err as ApiError;
      setError(error.response?.data?.detail || error.message || '無法取得客戶資料');
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId]); // 只有當 customerId 改變時才重新建立函數

  useEffect(() => {
    fetchCustomerData();
  }, [customerId, fetchCustomerData]);

  const handleDelete = async () => {
    if (!customer) return;
    
    const confirmed = window.confirm(`確定要刪除 ${customer.full_name} 嗎？此操作無法復原。`);
    if (!confirmed) return;

    try {
      await api.delete(`/customers/${customer.id}/`);
      onBack();
    } catch (err: unknown) {
      setError('無法刪除客戶');
      console.error('Error deleting customer:', err);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount || '0');
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">找不到客戶</div>
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
                ← 返回客戶列表
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{customer.full_name}</h1>
              <p className="text-gray-600">{customer.email}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onEdit(customer)}
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

        {/* Quick Stats */}
        <div className="px-6 py-4 grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{customer.total_orders}</div>
            <div className="text-sm text-gray-500">總訂單數</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(customer.total_spent)}
            </div>
            <div className="text-sm text-gray-500">總消費金額</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${customer.is_active ? 'text-green-600' : 'text-red-600'}`}>
              {customer.is_active ? '活躍' : '非活躍'}
            </div>
            <div className="text-sm text-gray-500">狀態</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { id: 'details', name: '詳細資料' },
              { id: 'orders', name: `訂單 (${orders.length})` },
              { id: 'transactions', name: `交易記錄 (${transactions.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">聯絡資訊</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">電子郵件</dt>
                    <dd className="text-sm text-gray-900">{customer.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">電話</dt>
                    <dd className="text-sm text-gray-900">{customer.phone || '未提供'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">公司</dt>
                    <dd className="text-sm text-gray-900">{customer.company || '未提供'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">來源</dt>
                    <dd className="text-sm text-gray-900">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {customer.source}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">地址資訊</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">地址</dt>
                    <dd className="text-sm text-gray-900">{customer.address || '未提供'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">城市</dt>
                    <dd className="text-sm text-gray-900">{customer.city || '未提供'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">州/省</dt>
                    <dd className="text-sm text-gray-900">{customer.state || '未提供'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">郵遞區號</dt>
                    <dd className="text-sm text-gray-900">{customer.zip_code || '未提供'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">國家</dt>
                    <dd className="text-sm text-gray-900">{customer.country}</dd>
                  </div>
                </dl>
              </div>

              {(customer.age || customer.gender || customer.product_categories_interest?.length || customer.seasonal_purchase_pattern) && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">個人偏好</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {customer.age && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">年齡</dt>
                        <dd className="text-sm text-gray-900">{customer.age} 歲</dd>
                      </div>
                    )}
                    {customer.gender && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">性別</dt>
                        <dd className="text-sm text-gray-900">
                          {customer.gender === 'male' && '男性'}
                          {customer.gender === 'female' && '女性'}
                          {customer.gender === 'other' && '其他'}
                          {customer.gender === 'prefer_not_to_say' && '不願透露'}
                        </dd>
                      </div>
                    )}
                    {customer.seasonal_purchase_pattern && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">購買季節偏好</dt>
                        <dd className="text-sm text-gray-900">
                          {customer.seasonal_purchase_pattern === 'spring' && '春季購買'}
                          {customer.seasonal_purchase_pattern === 'summer' && '夏季購買'}
                          {customer.seasonal_purchase_pattern === 'autumn' && '秋季購買'}
                          {customer.seasonal_purchase_pattern === 'winter' && '冬季購買'}
                          {customer.seasonal_purchase_pattern === 'year_round' && '全年均勻'}
                        </dd>
                      </div>
                    )}
                    {customer.product_categories_interest && customer.product_categories_interest.length > 0 && (
                      <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">產品類別興趣</dt>
                        <dd className="text-sm text-gray-900">
                          <div className="flex flex-wrap gap-1 mt-1">
                            {customer.product_categories_interest.map((category, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {(customer.tags || customer.notes) && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">其他資訊</h3>
                  <dl className="space-y-3">
                    {customer.tags && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">標籤</dt>
                        <dd className="text-sm text-gray-900">{customer.tags}</dd>
                      </div>
                    )}
                    {customer.notes && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">備註</dt>
                        <dd className="text-sm text-gray-900 whitespace-pre-wrap">{customer.notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  此客戶沒有訂單記錄。
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          訂單編號
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          日期
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          狀態
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          總計
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.order_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(order.order_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  此客戶沒有交易記錄。
                </div>
              ) : (
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
                        <tr key={transaction.id} className="hover:bg-gray-50">
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;