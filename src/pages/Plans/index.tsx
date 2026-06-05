import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Route,
  Users,
  Edit,
  Eye,
  Trash2,
  X,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { InspectionPlan } from '../../types';

type ModalMode = 'create' | 'view' | 'edit' | null;

export default function Plans() {
  const { plans, routes, users, addPlan, updatePlan, deletePlan, tasks } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedPlan, setSelectedPlan] = useState<InspectionPlan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [formData, setFormData] = useState({
    name: '',
    type: 'weekly' as InspectionPlan['type'],
    routeId: '',
    startDate: '',
    endDate: '',
    assignees: [] as string[],
    status: 'draft' as InspectionPlan['status'],
    description: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'weekly',
      routeId: '',
      startDate: '',
      endDate: '',
      assignees: [],
      status: 'draft',
      description: '',
    });
  };

  const openCreateModal = () => {
    resetForm();
    const defaultRoute = routes[0];
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFormData({
      name: '',
      type: 'weekly',
      routeId: defaultRoute?.id || '',
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      assignees: [],
      status: 'draft',
      description: '',
    });
    setModalMode('create');
  };

  const openViewModal = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
    setModalMode('view');
  };

  const openEditModal = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      type: plan.type,
      routeId: plan.routeId,
      startDate: plan.startDate,
      endDate: plan.endDate,
      assignees: plan.assignees,
      status: plan.status,
      description: plan.description || '',
    });
    setModalMode('edit');
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.routeId || !formData.startDate || !formData.endDate) return;
    addPlan({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    });
    setModalMode(null);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedPlan || !formData.name.trim()) return;
    updatePlan(selectedPlan.id, {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    });
    setModalMode(null);
    resetForm();
    setSelectedPlan(null);
  };

  const handleDelete = (planId: string) => {
    deletePlan(planId);
    setShowDeleteConfirm(null);
  };

  const toggleAssignee = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter((id) => id !== userId)
        : [...prev.assignees, userId],
    }));
  };

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [plans, searchQuery]);

  const calendarEvents = useMemo(() => {
    const events: Record<string, InspectionPlan[]> = {};
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    filteredPlans.forEach((plan) => {
      const start = new Date(plan.startDate);
      const end = new Date(plan.endDate);
      const current = new Date(start);

      while (current <= end) {
        if (current.getFullYear() === year && current.getMonth() === month) {
          const dateStr = current.toISOString().split('T')[0];
          if (!events[dateStr]) events[dateStr] = [];
          events[dateStr].push(plan);
        }
        current.setDate(current.getDate() + 1);
      }
    });
    return events;
  }, [filteredPlans, currentMonth]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekDay = firstDay.getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < startWeekDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getMonthLabel = () => {
    return `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;
  };

  const getTaskCount = (planId: string) => {
    return tasks.filter((t) => t.planId === planId).length;
  };

  const getTypeLabel = (type: InspectionPlan['type']) => {
    const labels: Record<string, string> = {
      daily: '日巡检',
      weekly: '周巡检',
      monthly: '月巡检',
      special: '专项检查',
    };
    return labels[type] || type;
  };

  const getTypeBadge = (type: InspectionPlan['type']) => {
    const styles: Record<string, string> = {
      daily: 'bg-blue-50 text-blue-700',
      weekly: 'bg-green-50 text-green-700',
      monthly: 'bg-purple-50 text-purple-700',
      special: 'bg-orange-50 text-orange-700',
    };
    return (
      <span className={`status-badge ${styles[type] || 'bg-gray-100 text-gray-600'}`}>
        {getTypeLabel(type)}
      </span>
    );
  };

  const getStatusBadge = (status: InspectionPlan['status']) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600',
      active: 'bg-success-50 text-success-600',
      completed: 'bg-primary-50 text-primary-700',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      active: '进行中',
      completed: '已完成',
    };
    return (
      <span className={`status-badge ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getAssigneeNames = (assigneeIds: string[]) => {
    return assigneeIds
      .map((id) => users.find((u) => u.id === id)?.name)
      .filter(Boolean)
      .join('、');
  };

  const getRouteName = (routeId: string) => {
    return routes.find((r) => r.id === routeId)?.name || '未分配路线';
  };

  const displayPlan = selectedPlan || formData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">巡检计划</h1>
          <p className="text-sm text-gray-500 mt-1">管理和制定巡检计划，安排巡检任务</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新建计划
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'list'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              计划列表
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              排期日历
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索计划..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-9 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
              />
            </div>
            <button className="btn btn-outline flex items-center gap-2 h-9">
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>
        </div>

        {activeTab === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">计划名称</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">巡检路线</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">时间范围</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">负责人</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{plan.name}</div>
                      {plan.description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{plan.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{getTypeBadge(plan.type)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Route className="w-4 h-4 text-gray-400" />
                        {getRouteName(plan.routeId)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{plan.startDate} ~ {plan.endDate}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        {getAssigneeNames(plan.assignees) || '未分配'}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(plan.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openViewModal(plan)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(plan.id)}
                          className="p-1.5 text-gray-400 hover:text-danger-600 rounded hover:bg-gray-100"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPlans.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      暂无巡检计划
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
                  {getMonthLabel()}
                </h3>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-sm">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="py-2 font-medium text-gray-500 text-xs">{day}</div>
              ))}
              {calendarDays.map((date, i) => {
                const dateStr = date ? date.toISOString().split('T')[0] : '';
                const dayEvents = date ? calendarEvents[dateStr] || [] : [];
                const today = isToday(date);
                return (
                  <div
                    key={i}
                    className={`min-h-[70px] sm:h-24 p-1 rounded-lg border text-left ${
                      date
                        ? `bg-white border-gray-100 hover:border-primary-200 cursor-pointer ${today ? 'ring-2 ring-primary-300' : ''}`
                        : 'bg-gray-50 border-gray-50'
                    }`}
                  >
                    {date && (
                      <>
                        <div className={`text-xs ${today ? 'text-primary-600 font-semibold' : 'text-gray-500'}`}>
                          {date.getDate()}
                        </div>
                        <div className="mt-0.5 space-y-0.5 overflow-hidden">
                          {dayEvents.slice(0, 2).map((plan) => (
                            <div
                              key={plan.id}
                              onClick={(e) => { e.stopPropagation(); openViewModal(plan); }}
                              className="text-xs bg-primary-100 text-primary-700 rounded px-1 py-0.5 truncate hover:bg-primary-200"
                              title={plan.name}
                            >
                              {plan.name.length > 6 ? plan.name.substring(0, 6) + '...' : plan.name}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400">+{dayEvents.length - 2}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">巡检路线管理</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {routes.map((route) => (
            <div key={route.id} className="p-4 border border-gray-100 rounded-xl hover:border-primary-200 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{route.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{route.line}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                <span className="flex items-center gap-1"><Route className="w-3.5 h-3.5" />{route.distance} km</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />约 {route.estimatedTime} 分钟</span>
                <span>{route.checkpoints.length} 个检查点</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalMode(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">
                {modalMode === 'create' ? '新建巡检计划' : modalMode === 'edit' ? '编辑巡检计划' : '计划详情'}
              </h3>
              <button onClick={() => { setModalMode(null); setSelectedPlan(null); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'view' && selectedPlan ? (
              <div className="p-5 space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedPlan.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    {getTypeBadge(selectedPlan.type)}
                    {getStatusBadge(selectedPlan.status)}
                  </div>
                </div>
                {selectedPlan.description && (
                  <p className="text-gray-600 text-sm">{selectedPlan.description}</p>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">巡检路线</span>
                    <p className="font-medium text-gray-900 mt-1">{getRouteName(selectedPlan.routeId)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">时间范围</span>
                    <p className="font-medium text-gray-900 mt-1">{selectedPlan.startDate} ~ {selectedPlan.endDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">负责人</span>
                    <p className="font-medium text-gray-900 mt-1">{getAssigneeNames(selectedPlan.assignees) || '未分配'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">关联任务</span>
                    <p className="font-medium text-gray-900 mt-1">{getTaskCount(selectedPlan.id)} 个</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button onClick={() => openEditModal(selectedPlan)} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />编辑
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">计划名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入计划名称"
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">计划类型 *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as InspectionPlan['type'] })}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="daily">日巡检</option>
                      <option value="weekly">周巡检</option>
                      <option value="monthly">月巡检</option>
                      <option value="special">专项检查</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as InspectionPlan['status'] })}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="draft">草稿</option>
                      <option value="active">进行中</option>
                      <option value="completed">已完成</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">巡检路线 *</label>
                  <select
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">请选择路线</option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>{route.name} ({route.checkpoints.length}个检查点)</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">开始日期 *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">结束日期 *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">负责人</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {users.filter((u) => u.role !== 'admin').map((user) => (
                      <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assignees.includes(user.id)}
                          onChange={() => toggleAssignee(user.id)}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <div>
                          <span className="text-sm text-gray-900">{user.name}</span>
                          <span className="text-xs text-gray-500 ml-2">{user.team}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">备注说明</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入计划说明..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button onClick={() => { setModalMode(null); setSelectedPlan(null); }} className="btn btn-outline flex-1">
                    取消
                  </button>
                  <button
                    onClick={modalMode === 'create' ? handleCreate : handleUpdate}
                    disabled={!formData.name.trim() || !formData.routeId || !formData.startDate || !formData.endDate}
                    className="btn btn-primary flex-1 disabled:opacity-50"
                  >
                    {modalMode === 'create' ? '创建计划' : '保存修改'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">确认删除</h3>
            <p className="text-gray-500 text-center text-sm mb-6">删除后该巡检计划将无法恢复，确定要删除吗？</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="btn btn-outline flex-1">取消</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="btn btn-primary flex-1 bg-danger-600 hover:bg-danger-700">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
