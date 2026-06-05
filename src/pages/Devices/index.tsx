import { useState, useMemo } from 'react';
import {
  Server,
  Search,
  Filter,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  FileText,
  Wrench,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Device } from '../../types';

export default function Devices() {
  const { devices, maintenanceRecords } = useStore();
  const [category, setCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'inspection' | 'maintenance'>('info');

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'track', label: '工务设备' },
    { value: 'signal', label: '电务设备' },
    { value: 'power', label: '供电设备' },
    { value: 'communication', label: '通信设备' },
  ];

  const filteredDevices = useMemo(() => {
    let result = devices;
    if (category !== 'all') {
      result = result.filter((d) => d.category === category);
    }
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (searchQuery) {
      result = result.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [devices, category, statusFilter, searchQuery]);

  const getStatusBadge = (status: Device['status']) => {
    const styles: Record<string, string> = {
      normal: 'bg-success-50 text-success-600',
      warning: 'bg-warning-50 text-warning-600',
      fault: 'bg-danger-50 text-danger-600',
    };
    const labels: Record<string, string> = {
      normal: '正常',
      warning: '预警',
      fault: '故障',
    };
    return (
      <span className={`status-badge ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getStatusIcon = (status: Device['status']) => {
    const icons = {
      normal: <CheckCircle className="w-5 h-5 text-success-500" />,
      warning: <AlertTriangle className="w-5 h-5 text-warning-500" />,
      fault: <AlertTriangle className="w-5 h-5 text-danger-500" />,
    };
    return icons[status] || null;
  };

  const getDeviceMaintenanceRecords = (deviceId: string) => {
    return maintenanceRecords.filter((r) => r.deviceId === deviceId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">设备档案</h1>
          <p className="text-sm text-gray-500 mt-1">管理铁路线路设备档案和维修记录</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索设备名称、编号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300"
          />
        </div>
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat.value
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">状态：</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="all">全部</option>
            <option value="normal">正常</option>
            <option value="warning">预警</option>
            <option value="fault">故障</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredDevices.map((device) => (
          <div
            key={device.id}
            className="card p-5 card-hover cursor-pointer"
            onClick={() => setSelectedDevice(device)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Server className="w-6 h-6 text-primary-600" />
              </div>
              {getStatusIcon(device.status)}
            </div>
            <h4 className="font-semibold text-gray-900">{device.name}</h4>
            <p className="text-sm text-gray-500 mt-0.5">{device.code}</p>
            <div className="mt-3 space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                {device.line} {device.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                安装：{device.installDate}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              {getStatusBadge(device.status)}
              <span className="text-xs text-gray-400">{device.type}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDevice(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedDevice.name}</h3>
                  <p className="text-xs text-gray-500">{selectedDevice.code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-b border-gray-100">
              <div className="flex">
                {[
                  { key: 'info', label: '基本信息', icon: FileText },
                  { key: 'inspection', label: '巡检记录', icon: Calendar },
                  { key: 'maintenance', label: '维修记录', icon: Wrench },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {activeTab === 'info' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-500">设备名称</span>
                      <p className="font-medium text-gray-900 mt-1">{selectedDevice.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">设备编号</span>
                      <p className="font-medium text-gray-900 mt-1">{selectedDevice.code}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">设备类型</span>
                      <p className="font-medium text-gray-900 mt-1">{selectedDevice.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">设备状态</span>
                      <div className="mt-1">{getStatusBadge(selectedDevice.status)}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-500">所属线路</span>
                      <p className="font-medium text-gray-900 mt-1">{selectedDevice.line}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">安装位置</span>
                      <p className="font-medium text-gray-900 mt-1">{selectedDevice.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">安装日期</span>
                      <p className="font-medium text-gray-900 mt-1">{selectedDevice.installDate}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">生产厂家</span>
                      <p className="font-medium text-gray-900 mt-1">{selectedDevice.manufacturer || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">设备型号</span>
                      <p className="font-medium text-gray-900 mt-1">{selectedDevice.model || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'inspection' && (
                <div className="space-y-3">
                  {[
                    { date: '2026-06-03', inspector: '张工', result: '正常', remark: '设备运行正常' },
                    { date: '2026-05-27', inspector: '李工', result: '正常', remark: '无异常' },
                    { date: '2026-05-20', inspector: '张工', result: '正常', remark: '-' },
                    { date: '2026-05-13', inspector: '李工', result: '预警', remark: '发现轻微磨损，已记录跟踪' },
                  ].map((record, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{record.date}</span>
                          <span className={`status-badge ${
                            record.result === '正常' ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'
                          }`}>
                            {record.result}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">巡检人：{record.inspector}</p>
                        {record.remark && record.remark !== '-' && (
                          <p className="text-xs text-gray-400 mt-1">{record.remark}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div className="space-y-3">
                  {getDeviceMaintenanceRecords(selectedDevice.id).length > 0 ? (
                    getDeviceMaintenanceRecords(selectedDevice.id).map((record) => (
                      <div key={record.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{record.date}</span>
                            <span className="status-badge bg-blue-50 text-blue-600">
                              {{ repair: '维修', maintenance: '保养', replacement: '更换' }[record.type]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{record.description}</p>
                          {record.cost && (
                            <p className="text-xs text-gray-400 mt-1">费用：¥{record.cost}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">暂无维修记录</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
