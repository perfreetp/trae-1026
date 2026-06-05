import { useState, useMemo } from 'react';
import {
  Server,
  Search,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  FileText,
  Wrench,
  ClipboardList,
  User,
  Camera,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Device } from '../../types';

export default function Devices() {
  const { devices, maintenanceRecords, inspectionRecords } = useStore();
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

  const getDeviceInspectionRecords = (deviceId: string) => {
    return inspectionRecords.filter((r) => r.deviceId === deviceId);
  };

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      track: '工务设备',
      signal: '电务设备',
      power: '供电设备',
      communication: '通信设备',
    };
    return map[category] || category;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">设备档案</h1>
          <p className="text-sm text-gray-500 mt-1">管理铁路线路设备档案和维修记录</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                category === cat.value
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          <option value="all">全部状态</option>
          <option value="normal">正常</option>
          <option value="warning">预警</option>
          <option value="fault">故障</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{device.line} {device.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span>安装于 {device.installDate}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              {getStatusBadge(device.status)}
              <span className="text-xs text-gray-400">
                巡检 {getDeviceInspectionRecords(device.id).length} 次
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedDevice.name}</h3>
                <p className="text-sm text-gray-500">{selectedDevice.code}</p>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-100 flex-shrink-0">
              {[
                { key: 'info', label: '基本信息', icon: FileText },
                { key: 'inspection', label: '巡检记录', icon: ClipboardList },
                { key: 'maintenance', label: '维修记录', icon: Wrench },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <div className="w-full h-40 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center">
                      <Server className="w-16 h-16 text-primary-500" />
                    </div>
                  </div>
                  <InfoItem label="设备编号" value={selectedDevice.code} />
                  <InfoItem label="设备名称" value={selectedDevice.name} />
                  <InfoItem label="设备类型" value={getCategoryLabel(selectedDevice.category)} />
                  <InfoItem label="设备状态" value={selectedDevice.status === 'normal' ? '正常' : selectedDevice.status === 'warning' ? '预警' : '故障'} />
                  <InfoItem label="所属线路" value={selectedDevice.line} />
                  <InfoItem label="所在位置" value={selectedDevice.location} />
                  <InfoItem label="安装日期" value={selectedDevice.installDate} />
                  <InfoItem label="下次检修" value={selectedDevice.nextMaintenance} />
                  <div className="sm:col-span-2">
                    <InfoItem label="设备描述" value={selectedDevice.description} />
                  </div>
                </div>
              )}

              {activeTab === 'inspection' && (
                <div className="space-y-3">
                  {getDeviceInspectionRecords(selectedDevice.id).length > 0 ? (
                    getDeviceInspectionRecords(selectedDevice.id).map((record) => (
                      <div key={record.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                              <ClipboardList className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{record.taskName}</p>
                              <p className="text-xs text-gray-500">{record.checkedAt}</p>
                            </div>
                          </div>
                          <span className={`status-badge text-xs ${
                            record.status === 'normal' ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'
                          }`}>
                            {record.status === 'normal' ? '正常' : '异常'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <User className="w-3.5 h-3.5" />
                          <span>巡检员：{record.inspectorName}</span>
                        </div>
                        {record.checkItems && record.checkItems.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {record.checkItems.map((item, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                        {record.note && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                            备注：{record.note}
                          </p>
                        )}
                        {record.photos && record.photos.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                            <Camera className="w-3.5 h-3.5" />
                            <span>{record.photos.length} 张照片</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">暂无巡检记录</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div className="space-y-3">
                  {getDeviceMaintenanceRecords(selectedDevice.id).length > 0 ? (
                    getDeviceMaintenanceRecords(selectedDevice.id).map((record) => (
                      <div key={record.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
                              <Wrench className="w-5 h-5 text-warning-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{record.type}</p>
                              <p className="text-xs text-gray-500">{record.date}</p>
                            </div>
                          </div>
                          <span className={`status-badge text-xs ${
                            record.status === 'completed' ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600'
                          }`}>
                            {record.status === 'completed' ? '已完成' : '进行中'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <User className="w-3.5 h-3.5" />
                          <span>维修人：{record.technician}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          <span className="text-gray-500">问题描述：</span>{record.description}
                        </p>
                        {record.result && (
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="text-gray-500">处理结果：</span>{record.result}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Wrench className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">暂无维修记录</p>
                    </div>
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{value || '-'}</p>
    </div>
  );
}
