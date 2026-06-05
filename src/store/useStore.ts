import { create } from 'zustand';
import type {
  User,
  InspectionPlan,
  InspectionTask,
  Device,
  Defect,
  SparePart,
  SparePartRequest,
  TeamPerformance,
  InspectionRoute,
  MaintenanceRecord,
  TrendData,
} from '../types';
import {
  mockUsers,
  mockPlans,
  mockTasks,
  mockDevices,
  mockDefects,
  mockSpareParts,
  mockSparePartRequests,
  mockTeamPerformances,
  mockRoutes,
  mockMaintenanceRecords,
  generateTrendData,
} from '../data/mockData';

interface AppState {
  currentUser: User;
  users: User[];
  plans: InspectionPlan[];
  tasks: InspectionTask[];
  devices: Device[];
  defects: Defect[];
  spareParts: SparePart[];
  sparePartRequests: SparePartRequest[];
  teamPerformances: TeamPerformance[];
  routes: InspectionRoute[];
  maintenanceRecords: MaintenanceRecord[];
  trendData: TrendData[];
  selectedDevice: Device | null;
  selectedDefect: Defect | null;
  offlineData: Record<string, unknown>[];
  isOnline: boolean;

  setSelectedDevice: (device: Device | null) => void;
  setSelectedDefect: (defect: Defect | null) => void;
  updateTaskStatus: (taskId: string, status: InspectionTask['status'], progress?: number) => void;
  addDefect: (defect: Omit<Defect, 'id' | 'createdAt'>) => void;
  updateDefectStatus: (defectId: string, status: Defect['status'], updates?: Partial<Defect>) => void;
  addSparePartRequest: (request: Omit<SparePartRequest, 'id' | 'createdAt' | 'status'>) => void;
  approveSparePartRequest: (requestId: string, approverId: string, approverName: string) => void;
  rejectSparePartRequest: (requestId: string, approverId: string, approverName: string, reason: string) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  saveOfflineData: (data: Record<string, unknown>) => void;
  syncOfflineData: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  plans: mockPlans,
  tasks: mockTasks,
  devices: mockDevices,
  defects: mockDefects,
  spareParts: mockSpareParts,
  sparePartRequests: mockSparePartRequests,
  teamPerformances: mockTeamPerformances,
  routes: mockRoutes,
  maintenanceRecords: mockMaintenanceRecords,
  trendData: generateTrendData(30),
  selectedDevice: null,
  selectedDefect: null,
  offlineData: [],
  isOnline: true,

  setSelectedDevice: (device) => set({ selectedDevice: device }),
  setSelectedDefect: (defect) => set({ selectedDefect: defect }),

  updateTaskStatus: (taskId, status, progress) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              progress: progress ?? task.progress,
              startedAt: status === 'in_progress' ? new Date().toLocaleString() : task.startedAt,
              completedAt: status === 'completed' ? new Date().toLocaleString() : task.completedAt,
            }
          : task
      ),
    })),

  addDefect: (defect) =>
    set((state) => ({
      defects: [
        {
          ...defect,
          id: `def${Date.now()}`,
          createdAt: new Date().toLocaleString(),
        } as Defect,
        ...state.defects,
      ],
    })),

  updateDefectStatus: (defectId, status, updates = {}) =>
    set((state) => ({
      defects: state.defects.map((defect) =>
        defect.id === defectId
          ? {
              ...defect,
              status,
              ...updates,
              closedAt: status === 'closed' ? new Date().toLocaleString() : defect.closedAt,
            }
          : defect
      ),
    })),

  addSparePartRequest: (request) =>
    set((state) => ({
      sparePartRequests: [
        {
          ...request,
          id: `spr${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toLocaleString(),
        } as SparePartRequest,
        ...state.sparePartRequests,
      ],
    })),

  approveSparePartRequest: (requestId, approverId, approverName) =>
    set((state) => {
      const request = state.sparePartRequests.find((r) => r.id === requestId);
      if (!request) return state;

      return {
        sparePartRequests: state.sparePartRequests.map((r) =>
          r.id === requestId
            ? { ...r, status: 'approved', approverId, approverName, approvedAt: new Date().toLocaleString() }
            : r
        ),
        spareParts: state.spareParts.map((p) =>
          p.id === request.partId ? { ...p, stock: p.stock - request.quantity } : p
        ),
      };
    }),

  rejectSparePartRequest: (requestId, approverId, approverName, reason) =>
    set((state) => ({
      sparePartRequests: state.sparePartRequests.map((r) =>
        r.id === requestId
          ? { ...r, status: 'rejected', approverId, approverName, rejectReason: reason }
          : r
      ),
    })),

  setOnlineStatus: (isOnline) => set({ isOnline }),

  saveOfflineData: (data) =>
    set((state) => {
      const newOfflineData = [...state.offlineData, data];
      localStorage.setItem('offlineData', JSON.stringify(newOfflineData));
      return { offlineData: newOfflineData };
    }),

  syncOfflineData: () => {
    const state = get();
    if (state.offlineData.length > 0 && state.isOnline) {
      console.log('Syncing offline data:', state.offlineData);
      localStorage.removeItem('offlineData');
      set({ offlineData: [] });
    }
  },
}));
