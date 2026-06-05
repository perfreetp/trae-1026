import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Wifi, WifiOff, X, MonitorSmartphone, ClipboardList, AlertTriangle, Settings } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface SearchResult {
  id: string;
  type: 'device' | 'task' | 'defect';
  title: string;
  subtitle: string;
  url: string;
}

export default function Topbar() {
  const navigate = useNavigate();
  const { isOnline, offlineData, devices, tasks, defects, setOnlineStatus, syncOfflineData, setOpenDeviceDetailId, setOpenDefectDetailId, setOpenTaskDetailId } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const pendingCount = useStore((state) => {
    const today = new Date().toISOString().split('T')[0];
    return state.tasks.filter((t) => t.scheduledDate === today && t.status === 'pending').length +
           state.defects.filter((d) => d.status === 'reported').length;
  });

  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    devices.forEach((d) => {
      if (d.name.toLowerCase().includes(query) || d.code.toLowerCase().includes(query)) {
        results.push({
          id: d.id,
          type: 'device',
          title: `${d.name} (${d.code})`,
          subtitle: `${d.line} ${d.location}`,
          url: '/devices',
        });
      }
    });

    tasks.forEach((t) => {
      if (t.name.toLowerCase().includes(query)) {
        results.push({
          id: t.id,
          type: 'task',
          title: t.name,
          subtitle: `状态：${t.status === 'pending' ? '待执行' : t.status === 'in_progress' ? '进行中' : '已完成'}`,
          url: '/tasks',
        });
      }
    });

    defects.forEach((d) => {
      if (d.title.toLowerCase().includes(query) || d.description.toLowerCase().includes(query)) {
        results.push({
          id: d.id,
          type: 'defect',
          title: d.title,
          subtitle: `等级：${d.level === 'critical' ? '重大' : d.level === 'major' ? '较大' : '一般'}`,
          url: '/defects',
        });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, devices, tasks, defects]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'device') {
      setOpenDeviceDetailId(result.id);
    } else if (result.type === 'defect') {
      setOpenDefectDetailId(result.id);
    } else if (result.type === 'task') {
      setOpenTaskDetailId(result.id);
    }
    navigate(result.url);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const toggleOnline = () => {
    const newStatus = !isOnline;
    setOnlineStatus(newStatus);
    if (newStatus && offlineData.length > 0) {
      setTimeout(() => {
        syncOfflineData();
      }, 1000);
    }
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'device': return <MonitorSmartphone className="w-4 h-4 text-primary-500" />;
      case 'task': return <ClipboardList className="w-4 h-4 text-success-500" />;
      case 'defect': return <AlertTriangle className="w-4 h-4 text-warning-500" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'device': return '设备';
      case 'task': return '任务';
      case 'defect': return '缺陷';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 fixed top-0 right-0 left-0 lg:left-60 z-20">
      <div className="flex items-center gap-4 flex-1">
        <div ref={searchRef} className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索设备编号、设备名称、任务名称或缺陷标题..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full h-9 pl-9 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {showSearchResults && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="p-1">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {getTypeLabel(result.type)}
                          </span>
                          <span className="text-sm font-medium text-gray-900 truncate">{result.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{result.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400 text-sm">
                  未找到相关结果
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <button
          onClick={toggleOnline}
          className={`flex items-center gap-1.5 px-2 lg:px-2.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
            isOnline ? 'bg-success-50 text-success-600 hover:bg-success-100' : 'bg-warning-50 text-warning-600 hover:bg-warning-100'
          }`}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isOnline ? '在线' : '离线'}</span>
          {!isOnline && offlineData.length > 0 && (
            <span className="bg-warning-500 text-white px-1.5 py-0.5 rounded text-xs">
              {offlineData.length}
            </span>
          )}
        </button>

        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>

        <div className="hidden sm:block h-8 w-px bg-gray-200" />

        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">铁路设备巡检管理系统</p>
          <p className="text-xs text-gray-500">
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
        </div>
      </div>
    </header>
  );
}
