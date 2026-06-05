import { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  X,
  Clock,
  User,
  XCircle,
  Eye,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { SparePartRequest } from '../../types';

export default function SpareParts() {
  const { spareParts, sparePartRequests, currentUser, addSparePartRequest, approveSparePartRequest, rejectSparePartRequest, users } = useStore();
  const [activeTab, setActiveTab] = useState<'stock' | 'requests'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showDetailModal, setShowDetailModal] = useState<SparePartRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedPartInfo = useMemo(() => {
    return spareParts.find((p) => p.id === selectedPart);
  }, [selectedPart, spareParts]);

  const quantityExceedsStock = useMemo(() => {
    if (!selectedPartInfo) return false;
    return quantity > selectedPartInfo.stock;
  }, [quantity, selectedPartInfo]);

  const filteredParts = useMemo(() => {
    if (!searchQuery) return spareParts;
    return spareParts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [spareParts, searchQuery]);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { text: '缺货', class: 'bg-danger-50 text-danger-600' };
    if (stock <= minStock) return { text: '库存不足', class: 'bg-warning-50 text-warning-600' };
    return { text: '库存充足', class: 'bg-success-50 text-success-600' };
  };

  const getRequestStatusBadge = (status: SparePartRequest['status']) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning-50 text-warning-600',
      approved: 'bg-success-50 text-success-600',
      rejected: 'bg-danger-50 text-danger-600',
    };
    const labels: Record<string, string> = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已驳回',
    };
    return (
      <span className={`status-badge ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const handleSubmitRequest = () => {
    if (!selectedPart || quantity <= 0 || !reason.trim()) return;
    const part = spareParts.find((p) => p.id === selectedPart);
    if (!part) return;
    if (quantity > part.stock) {
      setErrorMessage(`库存不足，当前库存：${part.stock} ${part.unit}`);
      return;
    }

    addSparePartRequest({
      partId: selectedPart,
      partName: part.name,
      quantity,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      reason: reason.trim(),
    });

    setShowRequestModal(false);
    setSelectedPart('');
    setQuantity(1);
    setReason('');
    setErrorMessage('');
  };

  const handleApprove = (requestId: string) => {
    const result = approveSparePartRequest(requestId, currentUser.id, currentUser.name);
    if (result && !result.success) {
      setErrorMessage(result.error || '审批失败');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleReject = (requestId: string) => {
    if (!rejectReason.trim()) {
      setErrorMessage('请填写驳回原因');
      return;
    }
    rejectSparePartRequest(requestId, currentUser.id, currentUser.name, rejectReason.trim());
    setShowRejectModal(null);
    setRejectReason('');
    setErrorMessage('');
  };

  const lowStockCount = spareParts.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">备件领用</h1>
          <p className="text-sm text-gray-500 mt-1">管理备件库存和领用申请</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          领用申请
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-warning-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">库存提醒</span>
          </div>
          <p className="text-sm text-warning-600 mt-1">
            有 {lowStockCount} 种备件库存不足，请及时补充
          </p>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'stock'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              备件库存
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              领用记录
              {sparePartRequests.filter((r) => r.status === 'pending').length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-warning-500 text-white text-xs rounded-full">
                  {sparePartRequests.filter((r) => r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
          {activeTab === 'stock' && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索备件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-9 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
              />
            </div>
          )}
        </div>

        {activeTab === 'stock' ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredParts.map((part) => {
              const stockStatus = getStockStatus(part.stock, part.minStock);
              return (
                <div key={part.id} className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className={`status-badge ${stockStatus.class}`}>{stockStatus.text}</span>
                  </div>
                  <h4 className="font-medium text-gray-900">{part.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{part.code}</p>
                  <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>当前库存</span>
                      <span className={`font-medium ${part.stock <= part.minStock ? 'text-danger-600' : 'text-gray-900'}`}>
                        {part.stock} {part.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>最低库存</span>
                      <span className="text-gray-600">{part.minStock} {part.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>存放位置</span>
                      <span className="text-gray-600">{part.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {errorMessage && (
              <div className="p-3 bg-danger-50 text-danger-600 text-sm text-center">
                {errorMessage}
              </div>
            )}
            {sparePartRequests.map((request) => (
              <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">{request.partName}</h4>
                      {getRequestStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      申请数量：{request.quantity} 件 · 申请原因：{request.reason}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {request.applicantName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {request.createdAt}
                      </span>
                      {request.approverName && (
                        <span>审批人：{request.approverName}</span>
                      )}
                      {request.approvedAt && (
                        <span>审批时间：{request.approvedAt}</span>
                      )}
                      {request.rejectReason && (
                        <span className="text-danger-600">驳回原因：{request.rejectReason}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <button
                      onClick={() => setShowDetailModal(request)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {request.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-3 py-1.5 bg-success-50 text-success-700 rounded-lg text-sm font-medium hover:bg-success-100 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          通过
                        </button>
                        <button
                          onClick={() => { setShowRejectModal(request.id); setErrorMessage(''); }}
                          className="px-3 py-1.5 bg-danger-50 text-danger-700 rounded-lg text-sm font-medium hover:bg-danger-100 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          驳回
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">领用申请</h3>
              <button
                onClick={() => { setShowRequestModal(false); setErrorMessage(''); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-danger-50 text-danger-600 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择备件</label>
                <select
                  value={selectedPart}
                  onChange={(e) => { setSelectedPart(e.target.value); setErrorMessage(''); }}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">请选择备件</option>
                  {spareParts.map((part) => (
                    <option key={part.id} value={part.id}>
                      {part.name} ({part.code}) - 库存：{part.stock} {part.unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">申请数量</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => { setQuantity(parseInt(e.target.value) || 1); setErrorMessage(''); }}
                  className={`w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${
                    quantityExceedsStock ? 'border-danger-300 focus:ring-danger-100' : 'border-gray-200'
                  }`}
                />
                {selectedPartInfo && (
                  <p className="text-xs text-gray-500 mt-1">
                    当前库存：{selectedPartInfo.stock} {selectedPartInfo.unit}
                  </p>
                )}
                {quantityExceedsStock && (
                  <p className="text-xs text-danger-600 mt-1">申请数量超过库存！</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">申请原因</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="请输入领用原因..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setShowRequestModal(false); setErrorMessage(''); }} className="btn btn-outline flex-1">
                取消
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!selectedPart || quantity <= 0 || !reason.trim() || quantityExceedsStock}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">驳回申请</h3>
              <button
                onClick={() => { setShowRejectModal(null); setErrorMessage(''); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {errorMessage && (
                <div className="p-3 bg-danger-50 text-danger-600 rounded-lg text-sm mb-4">
                  {errorMessage}
                </div>
              )}
              <label className="block text-sm font-medium text-gray-700 mb-2">驳回原因</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入驳回原因..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
              />
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setShowRejectModal(null); setErrorMessage(''); }} className="btn btn-outline flex-1">
                取消
              </button>
              <button onClick={() => handleReject(showRejectModal)} className="btn btn-primary flex-1">
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">申请详情</h3>
              <button
                onClick={() => setShowDetailModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">{showDetailModal.partName}</p>
                <div className="mt-1">{getRequestStatusBadge(showDetailModal.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">申请数量</p>
                  <p className="font-medium text-gray-900">{showDetailModal.quantity} 件</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">申请人</p>
                  <p className="font-medium text-gray-900">{showDetailModal.applicantName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">申请时间</p>
                  <p className="font-medium text-gray-900">{showDetailModal.createdAt}</p>
                </div>
                {showDetailModal.approverName && (
                  <div>
                    <p className="text-gray-500 text-xs">审批人</p>
                    <p className="font-medium text-gray-900">{showDetailModal.approverName}</p>
                  </div>
                )}
                {showDetailModal.approvedAt && (
                  <div>
                    <p className="text-gray-500 text-xs">审批时间</p>
                    <p className="font-medium text-gray-900">{showDetailModal.approvedAt}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">申请原因</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{showDetailModal.reason}</p>
              </div>
              {showDetailModal.rejectReason && (
                <div>
                  <p className="text-danger-500 text-xs mb-1">驳回原因</p>
                  <p className="text-sm text-danger-700 bg-danger-50 p-3 rounded-lg">{showDetailModal.rejectReason}</p>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              {showDetailModal.status === 'pending' ? (
                <>
                  <button
                    onClick={() => {
                      handleApprove(showDetailModal.id);
                      setShowDetailModal(null);
                    }}
                    className="btn btn-primary flex-1 flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    通过
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(showDetailModal.id);
                      setShowDetailModal(null);
                    }}
                    className="btn btn-outline flex-1 flex items-center justify-center gap-1 text-danger-600 border-danger-200 hover:bg-danger-50"
                  >
                    <XCircle className="w-4 h-4" />
                    驳回
                  </button>
                </>
              ) : (
                <button onClick={() => setShowDetailModal(null)} className="btn btn-outline w-full">
                  关闭
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
