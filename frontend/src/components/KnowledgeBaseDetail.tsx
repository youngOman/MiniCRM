import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { KnowledgeBase, KNOWLEDGE_CONTENT_TYPES } from '../types/customer-service';
import { ApiError } from '../types/error';

const KnowledgeBaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<KnowledgeBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticleDetail(parseInt(id));
    }
  }, [id]);

  const fetchArticleDetail = async (articleId: number) => {
    try {
      setLoading(true);
      const response = await api.get<KnowledgeBase>(`/customer-service/knowledge-base/${articleId}/`);
      setArticle(response.data);
    } catch (err) {
      const error = err as ApiError;
      setError(error.response?.data?.detail || error.message || '載入文章失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (!article || feedbackSent) return;

    try {
      const endpoint = isHelpful ? 'mark_helpful' : 'mark_not_helpful';
      await api.post(`/customer-service/knowledge-base/${article.id}/${endpoint}/`);
      setFeedbackSent(true);
      
      // 更新文章數據
      if (isHelpful) {
        setArticle(prev => prev ? { ...prev, helpful_count: prev.helpful_count + 1 } : null);
      } else {
        setArticle(prev => prev ? { ...prev, not_helpful_count: prev.not_helpful_count + 1 } : null);
      }
    } catch (err) {
      console.error('Error sending feedback:', err);
    }
  };

  const getLabelByValue = (options: Array<{value: string, label: string}>, value: string) => {
    return options.find(option => option.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">{error || '找不到此文章'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 標題列 */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/knowledge-base')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← 返回知識庫
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/knowledge-base/${article.id}/edit`)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              編輯文章
            </button>
          </div>
        </div>
      </div>

      {/* 文章內容 */}
      <div className="bg-white shadow rounded-lg">
        {/* 文章標頭 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h1>
              
              {article.summary && (
                <p className="text-gray-600 mb-4">{article.summary}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span>內容類型：{getLabelByValue(KNOWLEDGE_CONTENT_TYPES, article.content_type)}</span>
                {article.category_name && (
                  <span>分類：{article.category_name}</span>
                )}
                <span>瀏覽次數：{article.view_count}</span>
                <span>更新時間：{new Date(article.updated_at).toLocaleString('zh-TW')}</span>
              </div>

              {/* 標籤 */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 狀態標籤 */}
              <div className="flex items-center space-x-2 mt-3">
                {article.is_featured && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    精選
                  </span>
                )}
                {article.is_public && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    公開
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 文章內容 */}
        <div className="px-6 py-6">
          <div className="prose max-w-none">
            <div
              className="text-gray-900 leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {article.content}
            </div>
          </div>
        </div>

        {/* 回饋區域 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>有用次數：{article.helpful_count}</span>
              <span>無用次數：{article.not_helpful_count}</span>
              {article.helpful_count + article.not_helpful_count > 0 && (
                <span>
                  有用率：{Math.round((article.helpful_count / (article.helpful_count + article.not_helpful_count)) * 100)}%
                </span>
              )}
            </div>

            {!feedbackSent && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">這篇文章對您有幫助嗎？</span>
                <button
                  onClick={() => handleFeedback(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                >
                  👍 有用
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                >
                  👎 無用
                </button>
              </div>
            )}

            {feedbackSent && (
              <div className="text-sm text-green-600">
                感謝您的回饋！
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseDetail;