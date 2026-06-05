import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  User,
  Clock,
  CheckCircle,
  Send,
  X,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Defect, DefectLevel, DefectStatus } from '../../types';

export default function Defects() {
  const { defects, devices, users, updateDefectStatus } = useStore();
  const [levelFilter, setLevelFilter] = useState<DefectLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DefectStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetail, setShowDetail] = useState<Defect | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRectifyModal, setShowRectifyModal] = useState(false);
  const [showRecheckModal, setShowRecheckModal] = useState(false);

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

  const handleAssign = (defectId: string, assigneeId: string, deadline: string) => {
    updateDefectStatus(defectId, 'assigned', {
      assigneeId,
      deadline,
    });
    setShowAssignModal(false);
    setShowDetail(null);
  };

  const handleRectify = (defectId: string, description: string) => {
    updateDefectStatus(defectId, 'rechecking', {
      rectificationDesc: description,
    });
    setShowRectifyModal(false);
    setShowDetail(null);
  };

  const handleRecheck = (defectId: string, result: string, passed: boolean) => {
    if (passed) {
      updateDefectStatus(defectId, 'closed', {
        recheckResult: result,
      });
    } else {
      updateDefectStatus(defectId, 'rectifying', {
        recheckResult: result,
      });
    }
    setShowRecheckModal(false);
    setShowDetail(null);
  };

  const stats = useMemo(() => ({
    total: defects.length,
    open: defects.filter((d) => d.status !== 'closed').length,
    critical: defects.filter((d) => d.level === 'critical' && d.status !== 'closed').length,
    overdue: defects.filter((d) => isOverdue(d.deadline) && d.status !== 'closed').length,
  }), [defects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">缺陷管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理设备缺陷，跟踪整改闭环流程</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '缺陷总数', value: stats.total, color: 'from-blue-500 to-blue-700' },
          { label: '待处理', value: stats.open, color: 'from-warning-500 to-orange-600' },
          { label: '重大隐患', value: stats.critical, color: 'from-danger-500 to-red-700' },
          { label: '超期未整改', value: stats.overdue, color: 'from-rose-500 to-rose-700' },
        ].map((stat, i) => (
          <div key={i} className="card p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索缺陷..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">等级：</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as DefectLevel | 'all')}
                className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="all">全部</option>
                <option value="minor">一般</option>
                <option value="major">较大</option>
                <option value="critical">重大</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">状态：</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DefectStatus | 'all')}
                className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="all">全部</option>
                <option value="reported">已上报</option>
                <option value="assigned">已派单</option>
                <option value="rectifying">整改中</option>
                <option value="rechecking">待复查</option>
                <option value="closed">已闭环</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredDefects.map((defect) => (
            <div
              key={defect.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setShowDetail(defect)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isOverdue(defect.deadline) && defect.status !== 'closed' && (
                      <span className="px-1.5 py-0.5 bg-danger-100 text-danger-700 text-xs font-medium rounded">
                        已超期
                      </span>
                    )}
                    <h4 className="font-medium text-gray-900">{defect.title}</h4>
                    {getLevelBadge(defect.level)}
                    {getStatusBadge(defect.status)}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{defect.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {getDeviceName(defect.deviceId)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      上报人：{getUserName(defect.reporterId)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {defect.createdAt}
                    </span>
                    {defect.deadline && (
                      <span className="flex items-center gap-1">
                        截止：{defect.deadline}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">缺陷详情</h3>
              <button
                onClick={() => setShowDetail(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{showDetail.title}</h4>
                  {getLevelBadge(showDetail.level)}
                  {getStatusBadge(showDetail.status)}
                </div>
                <p className="text-gray-600">{showDetail.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">关联设备</span>
                  <p className="font-medium text-gray-900 mt-1">{getDeviceName(showDetail.deviceId)}</p>
                </div>
                <div>
                  <span className="text-gray-500">上报人</span>
                  <p className="font-medium text-gray-900 mt-1">{getUserName(showDetail.reporterId)}</p>
                </div>
                <div>
                  <span className="text-gray-500">上报时间</span>
                  <p className="font-medium text-gray-900 mt-1">{showDetail.createdAt}</p>
                </div>
                {showDetail.deadline && (
                  <div>
                    <span className="text-gray-500">整改期限</span>
                    <p className={`font-medium mt-1 ${isOverdue(showDetail.deadline) ? 'text-danger-600' : 'text-gray-900'}`}>
                      {showDetail.deadline}
                    </p>
                  </div>
                )}
                {showDetail.assigneeId && (
                  <div>
                    <span className="text-gray-500">整改责任人</span>
                    <p className="font-medium text-gray-900 mt-1">{getUserName(showDetail.assigneeId)}</p>
                  </div>
                )}
              </div>

              {showDetail.rectificationDesc && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h5 className="font-medium text-gray-900 mb-2">整改说明</h5>
                  <p className="text-sm text-gray-600">{showDetail.rectificationDesc}</p>
                </div>
              )}

              {showDetail.recheckResult && (
                <div className="p-4 bg-success-50 rounded-xl">
                  <h5 className="font-medium text-success-900 mb-2">复查结果</h5>
                  <p className="text-sm text-success-700">{showDetail.recheckResult}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {showDetail.status === 'reported' && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="btn btn-primary flex items-center gap-2 flex-1"
                  >
                    <Send className="w-4 h-4" />
                    派单整改
                  </button>
                )}
                {showDetail.status === 'assigned' && (
                  <button
                    onClick={() => setShowRectifyModal(true)}
                    className="btn btn-primary flex items-center gap-2 flex-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    提交整改
                  </button>
                )}
                {showDetail.status === 'rechecking' && (
                  <button
                    onClick={() => setShowRecheckModal(true)}
                    className="btn btn-primary flex items-center gap-2 flex-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    复查确认
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">分派整改</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">整改责任人</label>
                <select className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
                  {users.filter((u) => u.role !== 'admin').map((u) => (
                    <option key={u.id} value={u.id}>{u.name} - {u.team}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">整改期限</label>
                <input type="date" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowAssignModal(false)} className="btn btn-outline flex-1">取消</button>
              <button onClick={() => handleAssign(showDetail.id, 'u2', '2026-06-10')} className="btn btn-primary flex-1">确认派单</button>
            </div>
          </div>
        </div>
      )}

      {showRectifyModal && showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">提交整改</h3>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">整改说明</label>
              <textarea rows={4} placeholder="请描述整改措施和结果..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none" />
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowRectifyModal(false)} className="btn btn-outline flex-1">取消</button>
              <button onClick={() => handleRectify(showDetail.id, '已完成整改')} className="btn btn-primary flex-1">提交复查</button>
            </div>
          </div>
        </div>
      )}

      {showRecheckModal && showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">复查确认</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">复查结果</label>
                <textarea rows={3} placeholder="请输入复查意见..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="recheck" defaultChecked className="w-4 h-4 text-success-600" />
                  <span className="text-sm text-gray-700">整改合格，闭环</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="recheck" className="w-4 h-4 text-danger-600" />
                  <span className="text-sm text-gray-700">整改不合格，重新整改</span>
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowRecheckModal(false)} className="btn btn-outline flex-1">取消</button>
              <button onClick={() => handleRecheck(showDetail.id, '复查合格，同意闭环', true)} className="btn btn-primary flex-1">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
