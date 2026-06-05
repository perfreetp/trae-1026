import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  ClipboardList,
  AlertTriangle,
  Server,
  CheckCircle,
  Clock,
  MapPin,
  ChevronRight,
  Train,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  trend?: string;
  color: string;
}) => (
  <div className="card p-5 card-hover">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
      </div>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { tasks, defects, devices, currentUser, trendData } = useStore();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const pendingTasks = tasks.filter(
      (t) => t.assigneeId === currentUser.id && t.status === 'pending'
    ).length;
    const todayTasks = tasks.filter((t) => t.scheduledDate === today).length;
    const openDefects = defects.filter((d) => d.status !== 'closed').length;
    const totalDevices = devices.length;
    const overdueTasks = tasks.filter((t) => t.status === 'overdue').length;
    const overdueDefects = defects.filter(
      (d) => d.deadline && new Date(d.deadline) < new Date() && d.status !== 'closed'
    ).length;

    return { pendingTasks, todayTasks, openDefects, totalDevices, overdueTasks, overdueDefects };
  }, [tasks, defects, devices, currentUser]);

  const myTasks = useMemo(
    () => tasks.filter((t) => t.assigneeId === currentUser.id && t.status !== 'completed'),
    [tasks, currentUser]
  );

  const openDefects = useMemo(() => defects.filter((d) => d.status !== 'closed'), [defects]);

  const trendChartOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: trendData.map((d) => d.date.slice(5)),
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
      },
      series: [
        {
          data: trendData.map((d) => d.value),
          type: 'line',
          smooth: true,
          lineStyle: { color: '#1E40AF', width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(30, 64, 175, 0.25)' },
                { offset: 1, color: 'rgba(30, 64, 175, 0.02)' },
              ],
            },
          },
          itemStyle: { color: '#1E40AF' },
        },
      ],
    }),
    [trendData]
  );

  const getStatusBadge = (status: string) => {
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

  const getLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      minor: 'bg-warning-50 text-warning-600',
      major: 'bg-orange-50 text-orange-600',
      critical: 'bg-danger-50 text-danger-600',
    };
    const labels: Record<string, string> = {
      minor: '一般',
      major: '较大',
      critical: '重大',
    };
    return (
      <span className={`status-badge ${styles[level] || 'bg-gray-100 text-gray-600'}`}>
        {labels[level] || level}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">首页看板</h1>
        <p className="text-sm text-gray-500 mt-1">欢迎回来，{currentUser.name}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardList}
          label="待办任务"
          value={stats.pendingTasks}
          trend={`今日 ${stats.todayTasks} 个任务`}
          color="bg-gradient-to-br from-primary-500 to-primary-700"
        />
        <StatCard
          icon={AlertTriangle}
          label="待处理缺陷"
          value={stats.openDefects}
          trend={`${defects.filter((d) => d.status === 'reported').length} 个待分派`}
          color="bg-gradient-to-br from-warning-500 to-orange-600"
        />
        <StatCard
          icon={Server}
          label="设备总数"
          value={stats.totalDevices}
          trend={`${devices.filter((d) => d.status === 'warning').length} 个预警`}
          color="bg-gradient-to-br from-success-500 to-emerald-600"
        />
        <StatCard
          icon={CheckCircle}
          label="本月完成率"
          value={92}
          trend="较上月提升 3.2%"
          color="bg-gradient-to-br from-violet-500 to-violet-700"
        />
      </div>

      {(stats.overdueTasks > 0 || stats.overdueDefects > 0) && (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-danger-700">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">超期提醒</span>
          </div>
          <div className="mt-2 flex gap-6">
            {stats.overdueTasks > 0 && (
              <Link to="/tasks" className="text-sm text-danger-600 hover:text-danger-700 underline">
              {stats.overdueTasks} 个任务已超期
            </Link>
            )}
            {stats.overdueDefects > 0 && (
              <Link to="/defects" className="text-sm text-danger-600 hover:text-danger-700 underline">
              {stats.overdueDefects} 个缺陷整改超期
            </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">缺陷趋势（近30天）</h3>
            <span className="text-xs text-gray-500">单位：个</span>
          </div>
          <ReactECharts option={trendChartOption} style={{ height: '280px' }} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">线路设备分布</h3>
          </div>
          <div className="space-y-4">
            {['京沪线', '京广线'].map((line) => {
              const lineDevices = devices.filter((d) => d.line === line);
              const normal = lineDevices.filter((d) => d.status === 'normal').length;
              const warning = lineDevices.filter((d) => d.status === 'warning').length;
              const fault = lineDevices.filter((d) => d.status === 'fault').length;
              return (
                <div key={line} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Train className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-gray-800 text-sm">{line}</span>
                    <span className="text-xs text-gray-500 ml-auto">{lineDevices.length} 台设备</span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success-500"></span>
                      正常 {normal}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-warning-500"></span>
                      预警 {warning}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-danger-500"></span>
                      故障 {fault}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700">
              <MapPin className="w-4 h-4" />
              <span>查看全部设备分布</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">我的待办任务</h3>
            <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {myTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{task.name}</p>
                  <p className="text-xs text-gray-500">{task.scheduledDate}</p>
                </div>
                {getStatusBadge(task.status)}
              </div>
            ))}
            {myTasks.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">暂无待办任务</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">最新缺陷</h3>
            <Link to="/defects" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {openDefects.slice(0, 4).map((defect) => {
              const device = devices.find((d) => d.id === defect.deviceId);
              return (
                <div key={defect.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    defect.level === 'critical' ? 'bg-danger-50' : defect.level === 'major' ? 'bg-orange-50' : 'bg-warning-50'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      defect.level === 'critical' ? 'text-danger-600' : defect.level === 'major' ? 'text-orange-600' : 'text-warning-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{defect.title}</p>
                    <p className="text-xs text-gray-500">{device?.name} · {defect.createdAt}</p>
                  </div>
                  {getLevelBadge(defect.level)}
                </div>
              );
            })}
            {openDefects.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">暂无待处理缺陷</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
