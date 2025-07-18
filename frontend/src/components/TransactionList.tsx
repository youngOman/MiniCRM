import React, { useState, useEffect } from 'react';
import { Transaction } from '../types/transaction';
import { PaginatedResponse } from '../types/common';
import api from '../services/api';
import TransactionForm from './TransactionForm';
import TransactionDetail from './TransactionDetail';

type ViewMode = 'list' | 'form' | 'detail';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, statusFilter, typeFilter]);

  const fetchTransactions = async (url?: string) => {
    try {
      setLoading(true);
      let endpoint = '/transactions/';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('transaction_type', typeFilter);
      
      if (params.toString()) {
        endpoint += '?' + params.toString();
      }
      
      const response = await api.get<PaginatedResponse<Transaction>>(url || endpoint);
      
      setTransactions(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err: unknown) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function to force reload of current page
  const refreshTransactions = async () => {
    console.log('Refreshing transaction list...');
    try {
      setError(''); // Clear any existing errors
      await fetchTransactions();
      console.log('Transaction list refreshed successfully');
    } catch (err: unknown) {
      console.error('Error refreshing transactions:', err);
      setError('Failed to refresh transaction list');
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      fetchTransactions(pagination.next);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      fetchTransactions(pagination.previous);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setViewMode('form');
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setViewMode('form');
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransactionId(transaction.id);
    setViewMode('detail');
  };

  const handleSaveTransaction = async (transaction: Transaction) => {
    console.log('Transaction saved, refreshing list with updated data:', transaction);
    
    // Always refresh the entire transaction list to ensure all related data is properly loaded
    try {
      await refreshTransactions();
      console.log('Successfully refreshed transaction list with complete data');
    } catch (error) {
      console.error('Error refreshing transaction list:', error);
      setError('Transaction saved but failed to refresh list. Please refresh the page to see updated data.');
    }
    
    setViewMode('list');
    setSelectedTransaction(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedTransaction(null);
    setSelectedTransactionId(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-blue-100 text-blue-800';
      case 'refund':
        return 'bg-red-100 text-red-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'chargeback':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show form view
  if (viewMode === 'form') {
    return (
      <TransactionForm
        transaction={selectedTransaction || undefined}
        onSave={handleSaveTransaction}
        onCancel={handleCancel}
      />
    );
  }

  // Show detail view
  if (viewMode === 'detail' && selectedTransactionId) {
    return (
      <TransactionDetail
        transactionId={selectedTransactionId}
        onEdit={handleEditTransaction}
        onBack={handleCancel}
      />
    );
  }

  if (loading && transactions.length === 0) {
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
          <h1 className="text-2xl font-semibold text-gray-900">交易記錄</h1>
          <p className="mt-2 text-sm text-gray-700">
            追蹤所有財務交易和付款資料
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleAddTransaction}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            新增交易
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <input
            type="text"
            placeholder="搜尋交易記錄..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white group-hover:border-gray-300 text-sm"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="relative group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white group-hover:border-gray-300 text-sm appearance-none cursor-pointer"
          >
            <option value="">所有狀態</option>
            <option value="pending">待處理</option>
            <option value="completed">已完成</option>
            <option value="failed">失敗</option>
            <option value="cancelled">已取消</option>
            <option value="refunded">已退款</option>
          </select>
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="relative group">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white group-hover:border-gray-300 text-sm appearance-none cursor-pointer"
          >
            <option value="">所有類型</option>
            <option value="sale">銷售</option>
            <option value="refund">退款</option>
            <option value="payment">付款</option>
            <option value="chargeback">退單</option>
          </select>
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 3v1h6V3H9zm-2 3v12h10V6H7zm2 3a1 1 0 112 0v6a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V9z" />
            </svg>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                交易
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                客戶
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                類型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                付款方式
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    <button
                      onClick={() => handleViewTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {transaction.transaction_id}
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {transaction.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.customer_info ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customer_info.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.customer_info.email}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      客戶編號: {transaction.customer}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                      transaction.transaction_type
                    )}`}
                  >
                    {transaction.transaction_type.charAt(0).toUpperCase() + 
                     transaction.transaction_type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : parseFloat(transaction.amount || '0').toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    淨額: ${typeof transaction.net_amount === 'number' ? transaction.net_amount.toFixed(2) : parseFloat(transaction.net_amount || '0').toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.payment_method.replace('_', ' ').toUpperCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditTransaction(transaction)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    編輯
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
                顯示 <span className="font-medium">{transactions.length}</span> 筆，共{' '}
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

export default TransactionList;