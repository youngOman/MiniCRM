import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ServiceTicket, 
  ServiceNote, 
  ServiceNoteResponse,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  NOTE_TYPES 
} from '../types/customer-service';

const ServiceTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<ServiceTicket | null>(null);
  const [notes, setNotes] = useState<ServiceNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingNote, setAddingNote] = useState(false);
  
  // 新增記錄表單
  const [newNote, setNewNote] = useState({
    note_type: 'internal_note',
    content: '',
    is_visible_to_customer: false,
  });

  useEffect(() => {
    if (id) {
      fetchTicketDetail(parseInt(id));
      fetchNotes(parseInt(id));
    }
  }, [id]);

  const fetchTicketDetail = async (ticketId: number) => {
    try {
      const response = await api.get<ServiceTicket>(`/customer-service/tickets/${ticketId}/`);
      setTicket(response.data);
    } catch (err) {
      setError('載入工單詳情失敗');
      console.error('Error fetching ticket detail:', err);
    }
  };

  const fetchNotes = async (ticketId: number) => {
    try {
      const response = await api.get<ServiceNoteResponse>(`/customer-service/notes/?ticket=${ticketId}`);
      setNotes(response.data.results);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!ticket || !newNote.content.trim()) return;

    try {
      await api.post(`/customer-service/tickets/${ticket.id}/add_note/`, {
        note_type: newNote.note_type,
        content: newNote.content,
        is_visible_to_customer: newNote.is_visible_to_customer,
      });
      
      // 重新載入記錄
      await fetchNotes(ticket.id);
      
      // 清空表單
      setNewNote({
        note_type: 'internal_note',
        content: '',
        is_visible_to_customer: false,
      });
      setAddingNote(false);
    } catch (err) {
      console.error('Error adding note:', err);
      alert('新增記錄失敗');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'waiting_response': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNoteTypeColor = (noteType: string) => {
    switch (noteType) {
      case 'internal_note': return 'bg-gray-100 text-gray-800';
      case 'customer_response': return 'bg-blue-100 text-blue-800';
      case 'system_note': return 'bg-green-100 text-green-800';
      case 'solution': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (error || !ticket) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">{error || '工單不存在'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 標題列 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/service-tickets')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              ← 返回工單列表
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              工單詳情 - {ticket.ticket_number}
            </h1>
          </div>
          <button
            onClick={() => navigate(`/service-tickets/${ticket.id}/edit`)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            編輯工單
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：工單詳情 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本資訊 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">基本資訊</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {ticket.title}
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">分類</span>
                  <p className="text-gray-900">
                    {getLabelByValue(TICKET_CATEGORIES, ticket.category)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">客戶</span>
                  <p className="text-gray-900">
                    {ticket.customer_name || `客戶 #${ticket.customer}`}
                  </p>
                </div>
              </div>

              {ticket.tags && ticket.tags.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">標籤</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {ticket.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 客服記錄 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">客服記錄</h2>
              <button
                onClick={() => setAddingNote(!addingNote)}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
              >
                新增記錄
              </button>
            </div>
            
            {/* 新增記錄表單 */}
            {addingNote && (
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        記錄類型
                      </label>
                      <select
                        value={newNote.note_type}
                        onChange={(e) => setNewNote({ ...newNote, note_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {NOTE_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newNote.is_visible_to_customer}
                          onChange={(e) => setNewNote({ ...newNote, is_visible_to_customer: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">客戶可見</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      記錄內容
                    </label>
                    <textarea
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="輸入記錄內容..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setAddingNote(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      新增記錄
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 py-4">
              {notes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">尚無客服記錄</p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border-l-4 border-gray-200 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNoteTypeColor(note.note_type)}`}>
                            {getLabelByValue(NOTE_TYPES, note.note_type)}
                          </span>
                          {note.is_visible_to_customer && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              客戶可見
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {note.created_by_name} • {new Date(note.created_at).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側：狀態資訊 */}
        <div className="space-y-6">
          {/* 狀態卡片 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">狀態資訊</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">優先級</span>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {getLabelByValue(TICKET_PRIORITIES, ticket.priority)}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">狀態</span>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                    {getLabelByValue(TICKET_STATUSES, ticket.status)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">負責人</span>
                <p className="text-gray-900">{ticket.assigned_to_name || '未分配'}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">建立者</span>
                <p className="text-gray-900">{ticket.created_by_name || '系統'}</p>
              </div>
            </div>
          </div>

          {/* 時間軸 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">時間軸</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">建立時間</span>
                <span className="text-sm text-gray-900">
                  {new Date(ticket.created_at).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              {ticket.first_response_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">首次回應</span>
                  <span className="text-sm text-gray-900">
                    {new Date(ticket.first_response_at).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              
              {ticket.resolved_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">解決時間</span>
                  <span className="text-sm text-gray-900">
                    {new Date(ticket.resolved_at).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              
              {ticket.closed_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">關閉時間</span>
                  <span className="text-sm text-gray-900">
                    {new Date(ticket.closed_at).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 滿意度評分 */}
          {ticket.satisfaction_rating && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">客戶滿意度</h2>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl font-bold text-indigo-600">
                    {ticket.satisfaction_rating}
                  </span>
                  <span className="text-gray-500 ml-1">/5</span>
                </div>
                {ticket.satisfaction_comment && (
                  <p className="text-gray-700 text-sm">
                    {ticket.satisfaction_comment}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceTicketDetail;