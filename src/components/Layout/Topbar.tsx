import { Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Topbar() {
  const { isOnline, offlineData } = useStore();

  const pendingCount = useStore((state) => {
    const today = new Date().toISOString().split('T')[0];
    return state.tasks.filter((t) => t.scheduledDate === today && t.status === 'pending').length +
           state.defects.filter((d) => d.status === 'reported').length;
  });

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-60 z-20">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索设备、任务、缺陷..."
            className="w-72 h-9 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
          isOnline ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'
        }`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isOnline ? '在线' : '离线'}</span>
          {!isOnline && offlineData.length > 0 && (
            <span className="bg-warning-500 text-white px-1.5 py-0.5 rounded text-xs">
              {offlineData.length}
            </span>
          )}
        </div>

        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-gray-200" />

        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">铁路设备巡检管理系统</p>
          <p className="text-xs text-gray-500">
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
      </div>
    </header>
  );
}
