import { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  User,
  Clock,
  CheckCircle,
  Send,
  X,
  XCircle,
  Plus,
  Save,
  Camera,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Defect, DefectLevel, DefectStatus } from '../../types';

interface NewDefectForm {
  title: string;
  deviceId: string;
  level: DefectLevel;
  description: string;
  photos: string[];
}

export default function Defects() {
  const { defects, devices, users, updateDefectStatus, currentUser, addDefect, isOnline, saveOfflineData, openDefectDetailId, setOpenDefectDetailId } = useStore();
  const [levelFilter, setLevelFilter] = useState<DefectLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DefectStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetail, setShowDetail] = useState<Defect | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRectifyModal, setShowRectifyModal] = useState(false);
  const [showRecheckModal, setShowRecheckModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    if (openDefectDetailId) {
      const defect = defects.find((d) => d.id === openDefectDetailId);
      if (defect) {
        setShowDetail(defect);
      }
      setOpenDefectDetailId(null);
    }
  }, [openDefectDetailId, defects, setOpenDefectDetailId]);

  const [assignAssignee, setAssignAssignee] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [rectificationDesc, setRectificationDesc] = useState('');
  const [recheckResult, setRecheckResult] = useState('');
  const [recheckPassed, setRecheckPassed] = useState(true);
  const [newDefect, setNewDefect] = useState<NewDefectForm>({
    title: '',
    deviceId: '',
    level: 'minor',
    description: '',
    photos: [],
  });

  const filteredDefects = useMemo(() => {
    let result = defects;
    if (levelFilter !== 'all') {
      result = result.filter((d) => d.level === levelFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (searchQuery) {
      result = result.filter((d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [defects, levelFilter, statusFilter, searchQuery]);

  const getLevelBadge = (level: DefectLevel) => {
    const styles: Record<DefectLevel, string> = {
      minor: 'bg-warning-50 text-warning-600',
      major: 'bg-orange-50 text-orange-600',
      critical: 'bg-danger-50 text-danger-600',
    };
    const labels: Record<DefectLevel, string> = {
      minor: '一般',
      major: '较大',
      critical: '重大',
    };
    return (
      <span className={`status-badge ${styles[level]}`}>
        {labels[level]}
      </span>
    );
  };

  const getStatusBadge = (status: DefectStatus) => {
    const styles: Record<DefectStatus, string> = {
      reported: 'bg-gray-100 text-gray-600',
      assigned: 'bg-blue-50 text-blue-600',
      rectifying: 'bg-warning-50 text-warning-600',
      rechecking: 'bg-purple-50 text-purple-600',
      closed: 'bg-success-50 text-success-600',
    };
    const labels: Record<DefectStatus, string> = {
      reported: '已上报',
      assigned: '已派单',
      rectifying: '整改中',
      rechecking: '待复查',
      closed: '已闭环',
    };
    return (
      <span className={`status-badge ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getDeviceName = (deviceId: string) => {
    return devices.find((d) => d.id === deviceId)?.name || '未知设备';
  };

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || '未知';
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const handleAssign = () => {
    if (!showDetail || !assignAssignee || !assignDeadline) return;
    updateDefectStatus(showDetail.id, 'assigned', {
      assigneeId: assignAssignee,
      assigneeName: getUserName(assignAssignee),
      deadline: assignDeadline,
    });
    setShowAssignModal(false);
    setOpenDefectDetailId(null);
    const updated = defects.find((d) => d.id === showDetail.id);
    if (updated) {
      setShowDetail({ ...updated, status: 'assigned', assigneeId: assignAssignee, assigneeName: getUserName(assignAssignee), deadline: assignDeadline });
    }
    setAssignAssignee('');
    setAssignDeadline('');
  };

  const handleRectify = () => {
    if (!showDetail || !rectificationDesc.trim()) return;
    updateDefectStatus(showDetail.id, 'rechecking', {
      rectificationDesc: rectificationDesc.trim(),
      rectifierId: currentUser.id,
      rectifierName: currentUser.name,
      rectifiedAt: new Date().toLocaleString(),
    });
    setShowRectifyModal(false);
    setRectificationDesc('');
    setOpenDefectDetailId(null);
    const updated = defects.find((d) => d.id === showDetail.id);
    if (updated) {
      setShowDetail({
        ...updated,
        status: 'rechecking',
        rectificationDesc: rectificationDesc.trim(),
        rectifierId: currentUser.id,
        rectifierName: currentUser.name,
      });
    }
  };

  const handleRecheck = () => {
    if (!showDetail || !recheckResult.trim()) return;
    const newStatus = recheckPassed ? 'closed' : 'rectifying';
    updateDefectStatus(showDetail.id, newStatus, {
      recheckResult: recheckResult.trim(),
      recheckerId: currentUser.id,
      recheckerName: currentUser.name,
      recheckedAt: new Date().toLocaleString(),
    });
    setShowRecheckModal(false);
    setRecheckResult('');
    setRecheckPassed(true);
    setOpenDefectDetailId(null);
    const updated = defects.find((d) => d.id === showDetail.id);
    if (updated) {
      setShowDetail({
        ...updated,
        status: newStatus,
        recheckResult: recheckResult.trim(),
        recheckerId: currentUser.id,
        recheckerName: currentUser.name,
      });
    }
  };

  const handleNewDefectPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map((_, i) => `defect_photo_${Date.now()}_${i}`);
      setNewDefect((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    }
  };

  const removeNewDefectPhoto = (index: number) => {
    setNewDefect((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitNewDefect = () => {
    if (!newDefect.title.trim() || !newDefect.deviceId || !newDefect.description.trim()) return;

    const device = devices.find((d) => d.id === newDefect.deviceId);
    const defectData = {
      title: newDefect.title.trim(),
      deviceId: newDefect.deviceId,
      deviceName: device?.name || '未知设备',
      deviceCode: device?.code || '',
      level: newDefect.level,
      description: newDefect.description.trim(),
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      photos: newDefect.photos,
      status: 'reported' as const,
      taskId: '',
    };

    if (isOnline) {
      addDefect(defectData);
    } else {
      saveOfflineData({ type: 'defect', data: defectData });
    }

    setShowNewModal(false);
    setNewDefect({
      title: '',
      deviceId: '',
      level: 'minor',
      description: '',
      photos: [],
    });
  };

  const openAssignModal = (defect: Defect) => {
    setShowDetail(defect);
    setShowAssignModal(true);
    setAssignAssignee('');
    setAssignDeadline('');
  };

  const openRectifyModal = (defect: Defect) => {
    setShowDetail(defect);
    setShowRectifyModal(true);
    setRectificationDesc('');
  };

  const openRecheckModal = (defect: Defect) => {
    setShowDetail(defect);
    setShowRecheckModal(true);
    setRecheckResult('');
    setRecheckPassed(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">缺陷管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理设备缺陷的上报、派单、整改和复查</p>
        </div>
        <div className="flex items-center gap-3">
          {!isOnline && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning-50 text-warning-600 rounded-lg text-sm">
              <Clock className="w-4 h-4 flex-shrink-0" />
              离线模式
            </div>
          )}
          <button
            onClick={() => setShowNewModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            上报缺陷
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索缺陷标题、描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DefectStatus | 'all')}
            className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="all">全部状态</option>
            <option value="reported">已上报</option>
            <option value="assigned">已派单</option>
            <option value="rectifying">整改中</option>
            <option value="rechecking">待复查</option>
            <option value="closed">已闭环</option>
          </select>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as DefectLevel | 'all')}
            className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="all">全部等级</option>
            <option value="minor">一般</option>
            <option value="major">较大</option>
            <option value="critical">重大</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDefects.map((defect) => (
          <div
            key={defect.id}
            className="card p-5 card-hover cursor-pointer"
            onClick={() => setShowDetail(defect)}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{defect.title}</h3>
                  {getStatusBadge(defect.status)}
                  {getLevelBadge(defect.level)}
                  {defect.deadline && isOverdue(defect.deadline) && defect.status !== 'closed' && (
                    <span className="status-badge bg-danger-50 text-danger-600">已超期</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{defect.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>设备：{defect.deviceName}</span>
                  <span>上报人：{defect.reporterName}</span>
                  {defect.assigneeName && <span>责任人：{defect.assigneeName}</span>}
                  <span>{defect.createdAt}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {defect.status === 'reported' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openAssignModal(defect); }}
                    className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    派单
                  </button>
                )}
                {defect.status === 'assigned' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openRectifyModal(defect); }}
                    className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    提交整改
                  </button>
                )}
                {defect.status === 'rectifying' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openRectifyModal(defect); }}
                    className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    提交整改
                  </button>
                )}
                {defect.status === 'rechecking' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openRecheckModal(defect); }}
                    className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    复查确认
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDefects.length === 0 && (
        <div className="text-center py-16">
          <AlertTriangle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">暂无缺陷记录</p>
        </div>
      )}

      {showDetail && !showAssignModal && !showRectifyModal && !showRecheckModal && !showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">缺陷详情</h3>
              <button
                onClick={() => { setShowDetail(null); setOpenDefectDetailId(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">{showDetail.title}</h2>
                  {getStatusBadge(showDetail.status)}
                  {getLevelBadge(showDetail.level)}
                </div>
                <p className="text-sm text-gray-600">{showDetail.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoItem label="设备名称" value={showDetail.deviceName} />
                <InfoItem label="设备编号" value={showDetail.deviceCode || '-'} />
                <InfoItem label="上报人" value={showDetail.reporterName} />
                <InfoItem label="上报时间" value={showDetail.createdAt} />
                {showDetail.assigneeName && <InfoItem label="责任人" value={showDetail.assigneeName} />}
                {showDetail.deadline && <InfoItem label="整改期限" value={showDetail.deadline} />}
                {showDetail.rectifierName && <InfoItem label="整改人" value={showDetail.rectifierName} />}
                {showDetail.rectifiedAt && <InfoItem label="整改时间" value={showDetail.rectifiedAt} />}
                {showDetail.recheckerName && <InfoItem label="复查人" value={showDetail.recheckerName} />}
                {showDetail.recheckedAt && <InfoItem label="复查时间" value={showDetail.recheckedAt} />}
              </div>

              {showDetail.rectificationDesc && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">整改说明</p>
                  <p className="text-sm text-gray-700">{showDetail.rectificationDesc}</p>
                </div>
              )}

              {showDetail.recheckResult && (
                <div className={`rounded-xl p-4 ${showDetail.status === 'closed' ? 'bg-success-50' : 'bg-warning-50'}`}>
                  <p className="text-xs font-medium text-gray-500 mb-2">复查意见</p>
                  <p className="text-sm text-gray-700">{showDetail.recheckResult}</p>
                </div>
              )}

              {showDetail.photos && showDetail.photos.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">现场照片</p>
                  <div className="flex flex-wrap gap-2">
                    {showDetail.photos.map((_, i) => (
                      <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                {showDetail.status === 'reported' && (
                  <button onClick={() => openAssignModal(showDetail)} className="btn btn-primary flex-1 min-w-[120px]">
                    <Send className="w-4 h-4" /> 派单
                  </button>
                )}
                {(showDetail.status === 'assigned' || showDetail.status === 'rectifying') && (
                  <button onClick={() => openRectifyModal(showDetail)} className="btn btn-primary flex-1 min-w-[120px]">
                    <CheckCircle className="w-4 h-4" /> 提交整改
                  </button>
                )}
                {showDetail.status === 'rechecking' && (
                  <button onClick={() => openRecheckModal(showDetail)} className="btn btn-primary flex-1 min-w-[120px]">
                    <CheckCircle className="w-4 h-4" /> 复查确认
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">上报缺陷</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  缺陷标题 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="请输入缺陷标题"
                  value={newDefect.title}
                  onChange={(e) => setNewDefect((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择设备 <span className="text-danger-500">*</span>
                </label>
                <select
                  value={newDefect.deviceId}
                  onChange={(e) => setNewDefect((prev) => ({ ...prev, deviceId: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
                >
                  <option value="">请选择设备</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  缺陷等级 <span className="text-danger-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['minor', 'major', 'critical'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNewDefect((prev) => ({ ...prev, level }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        newDefect.level === level
                          ? level === 'minor'
                            ? 'bg-warning-100 text-warning-700 ring-2 ring-warning-200'
                            : level === 'major'
                            ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200'
                            : 'bg-danger-100 text-danger-700 ring-2 ring-danger-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {level === 'minor' ? '一般' : level === 'major' ? '较大' : '重大'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  缺陷描述 <span className="text-danger-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="请详细描述缺陷情况..."
                  value={newDefect.description}
                  onChange={(e) => setNewDefect((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  现场照片
                </label>
                <div className="flex flex-wrap gap-2">
                  {newDefect.photos.map((_, index) => (
                    <div key={index} className="relative w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => removeNewDefectPhoto(index)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <Plus className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">添加照片</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleNewDefectPhotoUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowNewModal(false)}
                className="btn btn-outline flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSubmitNewDefect}
                disabled={!newDefect.title.trim() || !newDefect.deviceId || !newDefect.description.trim()}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                提交上报
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">缺陷派单</h3>
              <button
                onClick={() => { setShowAssignModal(false); setShowDetail(null); setOpenDefectDetailId(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择责任人 <span className="text-danger-500">*</span>
                </label>
                <select
                  value={assignAssignee}
                  onChange={(e) => setAssignAssignee(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
                >
                  <option value="">请选择责任人</option>
                  {users.filter((u) => u.role === 'inspector' || u.role === 'technician').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.team}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  整改期限 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="date"
                  value={assignDeadline}
                  onChange={(e) => setAssignDeadline(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { setShowAssignModal(false); setShowDetail(null); setOpenDefectDetailId(null); }}
                className="btn btn-outline flex-1"
              >
                取消
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignAssignee || !assignDeadline}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认派单
              </button>
            </div>
          </div>
        </div>
      )}

      {showRectifyModal && showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">提交整改</h3>
              <button
                onClick={() => { setShowRectifyModal(false); setShowDetail(null); setOpenDefectDetailId(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                整改说明 <span className="text-danger-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="请详细描述整改措施和结果..."
                value={rectificationDesc}
                onChange={(e) => setRectificationDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 resize-none"
              />
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { setShowRectifyModal(false); setShowDetail(null); setOpenDefectDetailId(null); }}
                className="btn btn-outline flex-1"
              >
                取消
              </button>
              <button
                onClick={handleRectify}
                disabled={!rectificationDesc.trim()}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交整改
              </button>
            </div>
          </div>
        </div>
      )}

      {showRecheckModal && showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">复查确认</h3>
              <button
                onClick={() => { setShowRecheckModal(false); setShowDetail(null); setOpenDefectDetailId(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  复查结果 <span className="text-danger-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecheckPassed(true)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      recheckPassed
                        ? 'bg-success-100 text-success-700 ring-2 ring-success-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    合格
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecheckPassed(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      !recheckPassed
                        ? 'bg-danger-100 text-danger-700 ring-2 ring-danger-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    不合格
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  复查意见 <span className="text-danger-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="请输入复查意见..."
                  value={recheckResult}
                  onChange={(e) => setRecheckResult(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { setShowRecheckModal(false); setShowDetail(null); setOpenDefectDetailId(null); }}
                className="btn btn-outline flex-1"
              >
                取消
              </button>
              <button
                onClick={handleRecheck}
                disabled={!recheckResult.trim()}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认复查
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{value || '-'}</p>
    </div>
  );
}
