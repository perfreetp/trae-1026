import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Route,
  Users,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { InspectionPlan } from '../../types';

export default function Plans() {
  const { plans, routes, users } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [plans, searchQuery]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">巡检计划</h1>
          <p className="text-sm text-gray-500 mt-1">管理和制定巡检计划，安排巡检任务</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新建计划
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
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
          <div className="flex items-center gap-3">
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    计划名称
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    巡检路线
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间范围
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    负责人
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{plan.name}</div>
                      {plan.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{plan.description}</div>
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
                      <div className="text-sm text-gray-600">
                        {plan.startDate} ~ {plan.endDate}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        {getAssigneeNames(plan.assignees)}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(plan.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-danger-600 rounded hover:bg-gray-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="py-2 font-medium text-gray-500 text-xs">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 3;
                const hasPlan = day >= 1 && day <= 30 && [1, 2, 3, 5, 8, 10, 15, 20, 25].includes(day);
                return (
                  <div
                    key={i}
                    className={`h-20 p-1 rounded-lg border ${
                      day >= 1 && day <= 30
                        ? 'bg-white border-gray-100 hover:border-primary-200 cursor-pointer'
                        : 'bg-gray-50 border-gray-50'
                    }`}
                  >
                    {day >= 1 && day <= 30 && (
                      <>
                        <div className="text-xs text-gray-500">{day}</div>
                        {hasPlan && (
                          <div className="mt-1 space-y-1">
                            <div className="text-xs bg-primary-100 text-primary-700 rounded px-1.5 py-0.5 truncate">
                              周巡检
                            </div>
                          </div>
                        )}
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
        <div className="grid grid-cols-2 gap-4">
          {routes.map((route) => (
            <div key={route.id} className="p-4 border border-gray-100 rounded-xl hover:border-primary-200 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{route.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{route.line}</p>
                </div>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Route className="w-3.5 h-3.5" />
                  {route.distance} km
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  约 {route.estimatedTime} 分钟
                </span>
                <span>{route.checkpoints.length} 个检查点</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
