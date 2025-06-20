import React, { useState, useEffect } from 'react';
import { Order } from '../types/order';
import { PaginatedResponse } from '../types/common';
import api from '../services/api';
import OrderForm from './OrderForm';
import OrderDetail from './OrderDetail';

type ViewMode = 'list' | 'form' | 'detail';

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter]);

  const fetchOrders = async (url?: string) => {
    try {
      setLoading(true);
      let endpoint = '/orders/';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      if (params.toString()) {
        endpoint += '?' + params.toString();
      }
      
      const response = await api.get<PaginatedResponse<Order>>(url || endpoint);
      
      setOrders(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err: any) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function to force reload of current page
  const refreshOrders = async () => {
    console.log('Refreshing order list...');
    try {
      setError(''); // Clear any existing errors
      await fetchOrders();
      console.log('Order list refreshed successfully');
    } catch (err: any) {
      console.error('Error refreshing orders:', err);
      setError('Failed to refresh order list');
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      fetchOrders(pagination.next);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      fetchOrders(pagination.previous);
    }
  };

  const handleAddOrder = () => {
    setSelectedOrder(null);
    setViewMode('form');
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('form');
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setViewMode('detail');
  };

  const handleSaveOrder = async (order: Order) => {
    console.log('Order saved, refreshing list with updated data:', order);
    
    // Always refresh the entire order list to ensure all related data is properly loaded
    try {
      await refreshOrders();
      console.log('Successfully refreshed order list with complete data');
    } catch (error) {
      console.error('Error refreshing order list:', error);
      setError('Order saved but failed to refresh list. Please refresh the page to see updated data.');
    }
    
    setViewMode('list');
    setSelectedOrder(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedOrder(null);
    setSelectedOrderId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show form view
  if (viewMode === 'form') {
    return (
      <OrderForm
        order={selectedOrder || undefined}
        onSave={handleSaveOrder}
        onCancel={handleCancel}
      />
    );
  }

  // Show detail view
  if (viewMode === 'detail' && selectedOrderId) {
    return (
      <OrderDetail
        orderId={selectedOrderId}
        onEdit={handleEditOrder}
        onBack={handleCancel}
      />
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">訂單管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理和追蹤所有客戶訂單
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleAddOrder}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            新增訂單
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="搜尋訂單..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">所有狀態</option>
            <option value="pending">待處理</option>
            <option value="processing">處理中</option>
            <option value="shipped">已出貨</option>
            <option value="delivered">已送達</option>
            <option value="cancelled">已取消</option>
            <option value="refunded">已退款</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                訂單
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                客戶
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                總金額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                項目數
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {order.order_number}
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {order.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.customer_info ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer_info.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer_info.email}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      客戶編號: {order.customer}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(order.order_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total || '0').toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.items ? order.items.length : 0} 個項目
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditOrder(order)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    查看
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(pagination.next || pagination.previous) && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={!pagination.previous}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              上一頁
            </button>
            <button
              onClick={handleNextPage}
              disabled={!pagination.next}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                顯示 <span className="font-medium">{orders.length}</span> 筆，共{' '}
                <span className="font-medium">{pagination.count}</span> 筆資料
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.previous}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  上一頁
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.next}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  下一頁
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;