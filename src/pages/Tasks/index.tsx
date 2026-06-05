import { useState, useMemo } from 'react';
import {
  QrCode,
  Camera,
  Play,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Filter,
  Upload,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { InspectionTask } from '../../types';

export default function Tasks() {
  const { tasks, currentUser, devices, routes, updateTaskStatus, isOnline } = useStore();
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

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
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const getRouteName = (routeId: string) => {
    return routes.find((r) => r.id === routeId)?.name || '未分配路线';
  };

  const getCheckpoints = (routeId: string) => {
    return routes.find((r) => r.id === routeId)?.checkpoints || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">任务执行</h1>
          <p className="text-sm text-gray-500 mt-1">查看和执行分配给您的巡检任务</p>
        </div>
        {!isOnline && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-warning-50 text-warning-600 rounded-lg text-sm">
            <Clock className="w-4 h-4" />
            离线模式 - 数据将在联网后同步
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-50 text-primary-700'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {({ all: '全部', pending: '待执行', in_progress: '进行中', completed: '已完成' } as Record<string, string>)[f]}
          </button>
        ))}
        </div>
        <button className="btn btn-outline flex items-center gap-2">
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const checkpoints = getCheckpoints(task.routeId);
          const completedCount = Math.floor((task.progress / 100) * checkpoints.length);
          return (
            <div key={task.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{task.name}</h3>
                    {getStatusBadge(task.status)}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {getRouteName(task.routeId)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
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

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                {task.status === 'pending' && (
                  <button
                    onClick={() => handleStartTask(task.id)}
                    className="btn btn-primary flex items-center gap-2 flex-1"
                  >
                    <Play className="w-4 h-4" />
                    开始巡检
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowScanModal(true);
                      }}
                      className="btn btn-primary flex items-center gap-2 flex-1"
                    >
                      <QrCode className="w-4 h-4" />
                      扫码登记
                    </button>
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="btn btn-outline flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      提交
                    </button>
                  </>
                )}
                {task.status === 'completed' && (
                  <span className="flex items-center gap-2 text-success-600 font-medium flex-1 justify-center">
                    <CheckCircle className="w-5 h-5" />
                    已完成
                  </span>
                )}
                {task.defectsCount && task.defectsCount > 0 && (
                  <span className="flex items-center gap-1 text-danger-600 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {task.defectsCount} 个缺陷
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showScanModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">扫码登记设备</h3>
              <button
                onClick={() => setShowScanModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="aspect-square bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <QrCode className="w-24 h-24 mx-auto mb-3 opacity-50" />
                  <p className="text-sm opacity-70">将二维码扫描区域对准设备二维码</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    设备编号
                  </label>
                  <select className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300">
                    <option value="">选择或手动选择设备</option>
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    现场照片
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {photos.map((_, index) => (
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
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">上传照片</span>
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
                    检查结果
                  </label>
                  <div className="space-y-2">
                    {['外观完好', '功能正常', '清洁无锈蚀'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    备注
                  </label>
                  <textarea
                    rows={3}
                    placeholder="输入检查备注..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowScanModal(false)}
                className="btn btn-outline flex-1"
              >
                取消
              </button>
              <button
                onClick={() => setShowScanModal(false)}
                className="btn btn-primary flex-1"
              >
                确认登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
