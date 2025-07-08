import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, ProductVariant, Inventory, StockMovement } from '../types/product';
import api from '../services/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'variants' | 'inventory' | 'movements'>('info');

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const [productRes, variantsRes, inventoryRes, movementsRes] = await Promise.all([
        api.get<Product>(`/products/products/${id}/`),
        api.get<ProductVariant[]>(`/products/products/${id}/variants/`),
        api.get<Inventory>(`/products/products/${id}/inventory/`),
        api.get<StockMovement[]>(`/products/stock-movements/?product=${id}`)
      ]);

      setProduct(productRes.data);
      setVariants(variantsRes.data);
      setInventory(inventoryRes.data || null);
      setStockMovements(movementsRes.data);
    } catch (err: unknown) {
      console.error('載入產品詳情失敗:', err);
      setError('載入產品詳情失敗');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const getMovementTypeText = (type: string) => {
    const types = {
      'inbound': '入庫',
      'outbound': '出庫',
      'adjustment': '調整'
    };
    return types[type as keyof typeof types] || type;
  };

  const getStockStatus = (inventory: Inventory) => {
    if (inventory.quantity_available <= 0) {
      return { text: '缺貨', color: 'text-red-600 bg-red-50' };
    } else if (inventory.quantity_available <= inventory.reorder_level) {
      return { text: '低庫存', color: 'text-orange-600 bg-orange-50' };
    } else {
      return { text: '充足', color: 'text-green-600 bg-green-50' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error || '找不到產品'}</p>
        <button
          onClick={() => navigate('/products')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          返回產品列表
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/products')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回產品列表
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.is_active ? '啟用' : '停用'}
          </span>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            編輯產品
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            複製產品
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'info', label: '基本資訊' },
            { key: 'variants', label: '產品款式變體' },
            { key: 'inventory', label: '庫存狀況' },
            { key: 'movements', label: '庫存異動' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {/* 基本資訊 */}
        {activeTab === 'info' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">產品資訊</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <p className="mt-1 text-sm text-gray-900">{product.sku}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">產品類型</label>
                    <p className="mt-1 text-sm text-gray-900">{product.is_digital ? '數位產品' : '實體產品'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">產品描述</label>
                  <p className="mt-1 text-sm text-gray-900">{product.description || '無描述'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">售價</label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">{formatPrice(product.base_price)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">成本價</label>
                    <p className="mt-1 text-sm text-gray-900">{formatPrice(product.cost_price)}</p>
                  </div>
                </div>

                {!product.is_digital && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">重量</label>
                      <p className="mt-1 text-sm text-gray-900">{product.weight || '未設定'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">尺寸</label>
                      <p className="mt-1 text-sm text-gray-900">{product.dimensions || '未設定'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">分類資訊</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">產品分類</label>
                  <p className="mt-1 text-sm text-gray-900">{product.category.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">品牌</label>
                  <p className="mt-1 text-sm text-gray-900">{product.brand.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">供應商</label>
                  <p className="mt-1 text-sm text-gray-900">{product.supplier.name}</p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">建立時間</h4>
                  <p className="text-sm text-gray-900">{formatDate(product.created_at)}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">最後更新</h4>
                  <p className="text-sm text-gray-900">{formatDate(product.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 產品款式變體 */}
        {activeTab === 'variants' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">產品款式變體</h3>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                新增變體
              </button>
            </div>
            
            {variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        變體名稱
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        售價
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        成本價
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
                    {variants.map((variant) => (
                      <tr key={variant.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {variant.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {variant.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(variant.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(variant.cost_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            variant.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {variant.is_active ? '啟用' : '停用'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900 mr-2">編輯</button>
                          <button className="text-red-600 hover:text-red-900">刪除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">此產品尚無變體</p>
                <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  新增第一個變體
                </button>
              </div>
            )}
          </div>
        )}

        {/* 庫存狀況 */}
        {activeTab === 'inventory' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">庫存狀況</h3>
            
            {inventory ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        庫存位置
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        現有庫存
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        預留庫存
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        可用庫存
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        補貨點
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        狀態
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      const status = getStockStatus(inventory);
                      return (
                        <tr key={inventory.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {inventory.location || '主倉庫'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {inventory.quantity_on_hand}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {inventory.quantity_reserved}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {inventory.quantity_available}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {inventory.reorder_level}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">尚無庫存記錄</p>
              </div>
            )}
          </div>
        )}

        {/* 庫存異動 */}
        {activeTab === 'movements' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">庫存異動記錄</h3>
            
            {stockMovements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日期
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        類型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        數量
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        參考資料
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        備註
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stockMovements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(movement.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            movement.movement_type === 'inbound' 
                              ? 'bg-green-100 text-green-800'
                              : movement.movement_type === 'outbound'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getMovementTypeText(movement.movement_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movement.movement_type === 'outbound' ? '-' : '+'}{movement.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movement.reference_type || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movement.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">尚無庫存異動記錄</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;