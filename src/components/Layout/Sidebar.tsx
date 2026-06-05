import { NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  AlertTriangle,
  Server,
  Package,
  BarChart3,
  Train,
  X,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: '首页看板' },
  { path: '/plans', icon: Calendar, label: '巡检计划' },
  { path: '/tasks', icon: ClipboardList, label: '任务执行' },
  { path: '/defects', icon: AlertTriangle, label: '缺陷管理' },
  { path: '/devices', icon: Server, label: '设备档案' },
  { path: '/spare-parts', icon: Package, label: '备件领用' },
  { path: '/statistics', icon: BarChart3, label: '统计评价' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const currentUser = useStore((state) => state.currentUser);
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 w-60 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center px-5 border-b border-gray-100 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">铁路巡检平台</h1>
              <p className="text-xs text-gray-500">设备管理系统</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.team}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
