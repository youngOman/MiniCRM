import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../types/product";
import { PaginatedResponse } from "../types/common";
import api from "../services/api";

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{id: number, name: string} | null>(null);

  // Debouncing effect for search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);


  const fetchProducts = async (url?: string) => {
    try {
      setLoading(true);
      const endpoint = url || `/products/products/${debouncedSearchTerm ? `?search=${debouncedSearchTerm}` : ""}`;
      const response = await api.get<PaginatedResponse<Product>>(endpoint);

      setProducts(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err: unknown) {
      setError("Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when debounced search term changes
  useEffect(() => {
    fetchProducts();
  }, [debouncedSearchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Force immediate search by setting debounced term
    setDebouncedSearchTerm(searchTerm);
  };

  const handlePrevious = () => {
    if (pagination.previous) {
      fetchProducts(pagination.previous);
    }
  };

  const handleNext = () => {
    if (pagination.next) {
      fetchProducts(pagination.next);
    }
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await api.delete(`/products/products/${deleteConfirm.id}/`);
      setDeleteConfirm(null);
      // 重新載入產品列表
      fetchProducts();
    } catch (error) {
      console.error('刪除產品失敗:', error);
      alert('刪除產品失敗，請稍後再試');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">產品管理</h1>
        <button 
          onClick={() => navigate('/products/new')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          新增產品
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋產品名稱、SKU..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm !== debouncedSearchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          搜尋
        </button>
      </form>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                產品資訊
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分類/品牌
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                價格
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                供應商
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {product.name}
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.category_name}</div>
                  <div className="text-sm text-gray-500">{product.brand_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">售價: ${product.base_price}</div>
                  <div className="text-sm text-gray-500">成本: ${product.cost_price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.supplier_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_active ? '啟用' : '停用'}
                  </span>
                  {product.is_digital && (
                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      數位商品
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    編輯
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id, product.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          顯示 {products.length} 項產品，總共 {pagination.count} 項
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevious}
            disabled={!pagination.previous}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一頁
          </button>
          <button
            onClick={handleNext}
            disabled={!pagination.next}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一頁
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">確認刪除</h3>
            <p className="text-gray-600 mb-6">
              您確定要刪除產品「{deleteConfirm.name}」嗎？此操作無法復原。
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;