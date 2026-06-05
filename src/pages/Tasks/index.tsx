import { useState, useMemo, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  Play,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Upload,
  X,
  AlertTriangle,
  Plus,
  Save,
  ClipboardList,
  User,
  Calendar,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { InspectionTask, Device } from '../../types';

interface ScanForm {
  deviceId: string;
  checkItems: string[];
  note: string;
  photos: string[];
}

const defaultCheckItems = [
  '外观完好无破损',
  '功能正常无异常',
  '清洁无锈蚀',
  '螺栓紧固无松动',
  '标识清晰完整',
];

export default function Tasks() {
  const {
    tasks,
    currentUser,
    devices,
    routes,
    updateTaskStatus,
    updateTaskProgress,
    addInspectionRecord,
    isOnline,
    saveOfflineData,
    openTaskDetailId,
    setOpenTaskDetailId,
  } = useStore();

  const [showScanModal, setShowScanModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanForm, setScanForm] = useState<ScanForm>({
    deviceId: '',
    checkItems: [],
    note: '',
    photos: [],
  });
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (openTaskDetailId) {
      const task = tasks.find((t) => t.id === openTaskDetailId);
      if (task) {
        setSelectedTask(task);
        setShowDetailModal(true);
        setHighlightedTaskId(openTaskDetailId);
        setTimeout(() => {
          const element = taskRefs.current[openTaskDetailId];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
      setOpenTaskDetailId(null);
    }
  }, [openTaskDetailId, tasks, setOpenTaskDetailId]);

  const myTasks = useMemo(() => {
    return tasks.filter((t) => t.assigneeId === currentUser.id);
  }, [tasks, currentUser]);

  const filteredTasks = useMemo(() => {
    let result = myTasks;
    if (filter !== 'all') {
      result = result.filter((t) => t.status === filter);
    }
    if (searchQuery) {
      result = result.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [myTasks, filter, searchQuery]);

  const getStatusBadge = (status: InspectionTask['status']) => {
    const styles: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-600',
      in_progress: 'bg-primary-50 text-primary-700',
      completed: 'bg-success-50 text-success-600',
      overdue: 'bg-danger-50 text-danger-600',
    };
    const labels: Record<string, string> = {
      pending: '待执行',
      in_progress: '进行中',
      completed: '已完成',
      overdue: '已超期',
    };
    return (
      <span className={`status-badge ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const handleStartTask = (taskId: string) => {
    updateTaskStatus(taskId, 'in_progress', 0);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map((_, i) => `photo_${Date.now()}_${i}`);
      setScanForm((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    }
  };

  const removePhoto = (index: number) => {
    setScanForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const getRouteName = (routeId: string) => {
    return routes.find((r) => r.id === routeId)?.name || '未分配路线';
  };

  const getCheckpoints = (routeId: string) => {
    return routes.find((r) => r.id === routeId)?.checkpoints || [];
  };

  const getDeviceName = (deviceId: string) => {
    return devices.find((d) => d.id === deviceId)?.name || '未知设备';
  };

  const toggleCheckItem = (item: string) => {
    setScanForm((prev) => ({
      ...prev,
      checkItems: prev.checkItems.includes(item)
        ? prev.checkItems.filter((i) => i !== item)
        : [...prev.checkItems, item],
    }));
  };

  const handleSubmitScan = () => {
    if (!selectedTask || !scanForm.deviceId) return;

    const device = devices.find((d) => d.id === scanForm.deviceId);
    const checkpoints = getCheckpoints(selectedTask.routeId);
    const currentProgress = selectedTask.progress;
    const progressIncrement = checkpoints.length > 0 ? Math.floor(100 / checkpoints.length) : 10;
    const newProgress = Math.min(currentProgress + progressIncrement, 100);

    const recordData = {
      taskId: selectedTask.id,
      taskName: selectedTask.name,
      deviceId: scanForm.deviceId,
      deviceName: device?.name || '未知设备',
      deviceCode: device?.code || '',
      inspectorId: currentUser.id,
      inspectorName: currentUser.name,
      checkItems: scanForm.checkItems,
      note: scanForm.note,
      photos: scanForm.photos,
      status: 'normal' as const,
    };

    if (isOnline) {
      addInspectionRecord(recordData);
    } else {
      saveOfflineData({ type: 'inspectionRecord', data: recordData });
    }

    updateTaskProgress(selectedTask.id, newProgress);
    if (newProgress >= 100) {
      updateTaskStatus(selectedTask.id, 'completed', 100);
    }

    setShowScanModal(false);
    setSelectedTask(null);
    setScanForm({
      deviceId: '',
      checkItems: [],
      note: '',
      photos: [],
    });
  };

  const openScanModal = (task: InspectionTask) => {
    setSelectedTask(task);
    setShowScanModal(true);
    setScanForm({
      deviceId: '',
      checkItems: [],
      note: '',
      photos: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">任务执行</h1>
          <p className="text-sm text-gray-500 mt-1">查看和执行分配给您的巡检任务</p>
        </div>
        {!isOnline && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-warning-50 text-warning-600 rounded-lg text-sm w-fit">
            <Clock className="w-4 h-4 flex-shrink-0" />
            离线模式 - 数据将在联网后同步
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {({ all: '全部', pending: '待执行', in_progress: '进行中', completed: '已完成' } as Record<string, string>)[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const checkpoints = getCheckpoints(task.routeId);
          const completedCount = Math.floor((task.progress / 100) * checkpoints.length);
          const isHighlighted = highlightedTaskId === task.id;
          return (
            <div
              key={task.id}
              ref={(el) => (taskRefs.current[task.id] = el)}
              className={`card p-5 card-hover cursor-pointer transition-all duration-300 ${
                isHighlighted ? 'ring-2 ring-primary-500 ring-offset-2 shadow-lg' : ''
              }`}
              onClick={() => {
                setSelectedTask(task);
                setShowDetailModal(true);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{task.name}</h3>
                    {getStatusBadge(task.status)}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {getRouteName(task.routeId)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      {task.scheduledDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">检查进度</span>
                  <span className="font-medium text-gray-700">
                    {completedCount} / {checkpoints.length} 检查点
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
                {task.status === 'pending' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStartTask(task.id); }}
                    className="btn btn-primary flex items-center gap-2 flex-1 min-w-[120px]"
                  >
                    <Play className="w-4 h-4 flex-shrink-0" />
                    开始巡检
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); openScanModal(task); }}
                      className="btn btn-primary flex items-center gap-2 flex-1 min-w-[120px]"
                    >
                      <QrCode className="w-4 h-4 flex-shrink-0" />
                      扫码登记
                    </button>
                    {task.progress >= 100 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'completed', 100); }}
                        className="btn btn-outline flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        提交完成
                      </button>
                    )}
                  </>
                )}
                {task.status === 'completed' && (
                  <span className="flex items-center gap-2 text-success-600 font-medium flex-1 justify-center">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    已完成
                  </span>
                )}
                {task.defectsCount && task.defectsCount > 0 && (
                  <span className="flex items-center gap-1 text-danger-600 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {task.defectsCount} 个缺陷
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-16">
          <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">暂无任务</p>
        </div>
      )}

      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedTask.name}</h3>
                <div className="mt-1">{getStatusBadge(selectedTask.status)}</div>
              </div>
              <button
                onClick={() => { setShowDetailModal(false); setHighlightedTaskId(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">巡检路线</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {getRouteName(selectedTask.routeId)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">计划日期</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {selectedTask.scheduledDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">负责人</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" />
                    {currentUser.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">检查进度</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedTask.progress}%
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">检查点列表</p>
                <div className="space-y-2">
                  {getCheckpoints(selectedTask.routeId).map((cp, i) => (
                    <div key={cp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{cp.name}</p>
                        <p className="text-xs text-gray-500">{cp.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => { setShowDetailModal(false); setHighlightedTaskId(null); }}
                className="btn btn-outline flex-1"
              >
                关闭
              </button>
              {selectedTask.status === 'pending' && (
                <button
                  onClick={() => {
                    handleStartTask(selectedTask.id);
                    setShowDetailModal(false);
                  }}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  开始巡检
                </button>
              )}
              {selectedTask.status === 'in_progress' && (
                <button
                  onClick={() => {
                    openScanModal(selectedTask);
                    setShowDetailModal(false);
                  }}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  扫码登记
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showScanModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">扫码登记设备</h3>
              <button
                onClick={() => setShowScanModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
                <div className="text-center text-white">
                  <QrCode className="w-20 h-20 mx-auto mb-3 opacity-50" />
                  <p className="text-sm opacity-70">将二维码扫描区域对准设备二维码</p>
                  <p className="text-xs opacity-50 mt-1">或手动选择下方设备</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择设备 <span className="text-danger-500">*</span>
                </label>
                <select
                  value={scanForm.deviceId}
                  onChange={(e) => setScanForm((prev) => ({ ...prev, deviceId: e.target.value }))}
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
                  检查项目
                </label>
                <div className="space-y-2">
                  {defaultCheckItems.map((item, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={scanForm.checkItems.includes(item)}
                        onChange={() => toggleCheckItem(item)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  现场照片
                </label>
                <div className="flex flex-wrap gap-2">
                  {scanForm.photos.map((_, index) => (
                    <div key={index} className="relative w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                      <button
                        onClick={() => removePhoto(index)}
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
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注
                </label>
                <textarea
                  rows={3}
                  placeholder="输入检查备注..."
                  value={scanForm.note}
                  onChange={(e) => setScanForm((prev) => ({ ...prev, note: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowScanModal(false)}
                className="btn btn-outline flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSubmitScan}
                disabled={!scanForm.deviceId}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                确认登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


