import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  TrendingUp,
  CheckSquare,
  AlertTriangle,
  Users,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Statistics() {
  const { defects, inspectionTasks, inspectionPlans, teamPerformances, devices } = useStore();
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  const stats = useMemo(() => {
    const totalTasks = inspectionTasks.length;
    const completedTasks = inspectionTasks.filter((t) => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const pendingDefects = defects.filter((d) => d.status === 'pending').length;
    const fixedDefects = defects.filter((d) => d.status === 'closed').length;
    return { totalTasks, completedTasks, completionRate, pendingDefects, fixedDefects };
  }, [inspectionTasks, defects]);

  const taskTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['计划任务', '已完成'], right: 10 },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLine: { show: false },
      axisLabel: { color: '#6b7280' },
    },
    series: [
      {
        name: '计划任务',
        type: 'bar',
        data: [45, 52, 48, 60, 55, 58],
        itemStyle: { color: '#1e40af', borderRadius: [4, 4, 0, 0] },
        barWidth: 20,
      },
      {
        name: '已完成',
        type: 'bar',
        data: [42, 50, 45, 56, 53, 58],
        itemStyle: { color: '#059669', borderRadius: [4, 4, 0, 0] },
        barWidth: 20,
      },
    ],
  };

  const defectLevelOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 10 },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: defects.filter((d) => d.level === 'critical').length, name: '重大', itemStyle: { color: '#dc2626' } },
          { value: defects.filter((d) => d.level === 'major').length, name: '较大', itemStyle: { color: '#f97316' } },
          { value: defects.filter((d) => d.level === 'general').length, name: '一般', itemStyle: { color: '#eab308' } },
        ],
      },
    ],
  };

  const riskTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['重大风险', '较大风险', '一般风险'], right: 10 },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLine: { show: false },
      axisLabel: { color: '#6b7280' },
    },
    series: [
      {
        name: '重大风险',
        type: 'line',
        data: [2, 1, 3, 2, 1, 2],
        smooth: true,
        itemStyle: { color: '#dc2626' },
        areaStyle: { color: 'rgba(220, 38, 38, 0.1)' },
      },
      {
        name: '较大风险',
        type: 'line',
        data: [5, 4, 6, 5, 3, 4],
        smooth: true,
        itemStyle: { color: '#f97316' },
        areaStyle: { color: 'rgba(249, 115, 22, 0.1)' },
      },
      {
        name: '一般风险',
        type: 'line',
        data: [12, 15, 10, 13, 11, 9],
        smooth: true,
        itemStyle: { color: '#eab308' },
        areaStyle: { color: 'rgba(234, 179, 8, 0.1)' },
      },
    ],
  };

  const deviceCategoryOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['工务设备', '电务设备', '供电设备', '通信设备'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLine: { show: false },
      axisLabel: { color: '#6b7280' },
    },
    series: [
      {
        type: 'bar',
        data: [
          devices.filter((d) => d.category === 'track').length,
          devices.filter((d) => d.category === 'signal').length,
          devices.filter((d) => d.category === 'power').length,
          devices.filter((d) => d.category === 'communication').length,
        ],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#1e40af' },
              { offset: 1, color: '#3b82f6' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: 40,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">统计评价</h1>
          <p className="text-sm text-gray-500 mt-1">巡检数据分析和班组绩效评价</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['month', 'quarter', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === 'month' ? '本月' : range === 'quarter' ? '本季度' : '本年度'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">巡检任务</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTasks}</p>
              <p className="text-xs text-success-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                完成率 {stats.completionRate}%
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待处理缺陷</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingDefects}</p>
              <p className="text-xs text-warning-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                需及时处理
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已闭环缺陷</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.fixedDefects}</p>
              <p className="text-xs text-success-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                闭环率 85%
              </p>
            </div>
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">在役设备</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{devices.length}</p>
              <p className="text-xs text-primary-600 mt-2 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                设备完好率 96%
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <PieChart className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              巡检任务趋势
            </h3>
          </div>
          <div className="p-4 h-80">
            <ReactECharts option={taskTrendOption} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary-600" />
              缺陷等级分布
            </h3>
          </div>
          <div className="p-4 h-80">
            <ReactECharts option={defectLevelOption} style={{ height: '100%' }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              风险趋势分析
            </h3>
          </div>
          <div className="p-4 h-80">
            <ReactECharts option={riskTrendOption} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              设备分类统计
            </h3>
          </div>
          <div className="p-4 h-80">
            <ReactECharts option={deviceCategoryOption} style={{ height: '100%' }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            班组绩效排名
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">排名</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">班组</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">巡检完成率</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">缺陷闭环率</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">超时任务</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">综合得分</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">等级</th>
              </tr>
            </thead>
            <tbody>
              {teamPerformances.map((team, index) => (
                <tr key={team.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? 'bg-warning-500 text-white'
                          : index === 1
                          ? 'bg-gray-400 text-white'
                          : index === 2
                          ? 'bg-orange-400 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="font-medium text-gray-900">{team.teamName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${team.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{team.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success-500 rounded-full"
                          style={{ width: `${team.defectClosureRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{team.defectClosureRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm ${team.overdueTasks > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                      {team.overdueTasks} 个
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-lg font-bold text-gray-900">{team.score}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`status-badge ${
                        team.grade === 'A'
                          ? 'bg-success-50 text-success-700'
                          : team.grade === 'B'
                          ? 'bg-primary-50 text-primary-700'
                          : team.grade === 'C'
                          ? 'bg-warning-50 text-warning-700'
                          : 'bg-danger-50 text-danger-700'
                      }`}
                    >
                      {team.grade} 级
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
