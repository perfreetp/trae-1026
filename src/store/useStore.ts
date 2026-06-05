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
  InspectionRecord,
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

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('Failed to save to localStorage', key);
  }
};

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
  inspectionRecords: InspectionRecord[];
  trendData: TrendData[];
  selectedDevice: Device | null;
  selectedDefect: Defect | null;
  offlineData: Record<string, unknown>[];
  isOnline: boolean;

  setSelectedDevice: (device: Device | null) => void;
  setSelectedDefect: (defect: Defect | null) => void;
  addPlan: (plan: Omit<InspectionPlan, 'id' | 'createdAt'>) => void;
  updatePlan: (planId: string, updates: Partial<InspectionPlan>) => void;
  deletePlan: (planId: string) => void;
  updateTaskStatus: (taskId: string, status: InspectionTask['status'], progress?: number) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  addDefect: (defect: Omit<Defect, 'id' | 'createdAt'>) => void;
  updateDefectStatus: (defectId: string, status: Defect['status'], updates?: Partial<Defect>) => void;
  addInspectionRecord: (record: Omit<InspectionRecord, 'id' | 'checkedAt'>) => void;
  addSparePartRequest: (request: Omit<SparePartRequest, 'id' | 'createdAt' | 'status'>) => void;
  approveSparePartRequest: (requestId: string, approverId: string, approverName: string) => void;
  rejectSparePartRequest: (requestId: string, approverId: string, approverName: string, reason: string) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  saveOfflineData: (data: Record<string, unknown>) => void;
  syncOfflineData: () => void;
  loadStoredData: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  plans: loadFromStorage('plans', mockPlans),
  tasks: loadFromStorage('tasks', mockTasks),
  devices: mockDevices,
  defects: loadFromStorage('defects', mockDefects),
  spareParts: loadFromStorage('spareParts', mockSpareParts),
  sparePartRequests: loadFromStorage('sparePartRequests', mockSparePartRequests),
  teamPerformances: mockTeamPerformances,
  routes: mockRoutes,
  maintenanceRecords: mockMaintenanceRecords,
  inspectionRecords: loadFromStorage('inspectionRecords', []),
  trendData: generateTrendData(30),
  selectedDevice: null,
  selectedDefect: null,
  offlineData: loadFromStorage('offlineData', []),
  isOnline: loadFromStorage('isOnline', true),

  loadStoredData: () => {
    set({
      plans: loadFromStorage('plans', mockPlans),
      tasks: loadFromStorage('tasks', mockTasks),
      defects: loadFromStorage('defects', mockDefects),
      spareParts: loadFromStorage('spareParts', mockSpareParts),
      sparePartRequests: loadFromStorage('sparePartRequests', mockSparePartRequests),
      inspectionRecords: loadFromStorage('inspectionRecords', []),
      offlineData: loadFromStorage('offlineData', []),
      isOnline: loadFromStorage('isOnline', true),
    });
  },

  setSelectedDevice: (device) => set({ selectedDevice: device }),
  setSelectedDefect: (defect) => set({ selectedDefect: defect }),

  addPlan: (plan) =>
    set((state) => {
      const newPlan = {
        ...plan,
        id: `plan${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      } as InspectionPlan;
      const newPlans = [newPlan, ...state.plans];
      saveToStorage('plans', newPlans);
      return { plans: newPlans };
    }),

  updatePlan: (planId, updates) =>
    set((state) => {
      const newPlans = state.plans.map((plan) =>
        plan.id === planId ? { ...plan, ...updates } : plan
      );
      saveToStorage('plans', newPlans);
      return { plans: newPlans };
    }),

  deletePlan: (planId) =>
    set((state) => {
      const newPlans = state.plans.filter((plan) => plan.id !== planId);
      saveToStorage('plans', newPlans);
      return { plans: newPlans };
    }),

  addInspectionRecord: (record) =>
    set((state) => {
      const newRecord = {
        ...record,
        id: `rec${Date.now()}`,
        checkedAt: new Date().toLocaleString(),
      } as InspectionRecord;
      const newRecords = [newRecord, ...state.inspectionRecords];
      saveToStorage('inspectionRecords', newRecords);
      return { inspectionRecords: newRecords };
    }),

  updateTaskStatus: (taskId, status, progress) =>
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              progress: progress ?? task.progress,
              startedAt: status === 'in_progress' ? new Date().toLocaleString() : task.startedAt,
              completedAt: status === 'completed' ? new Date().toLocaleString() : task.completedAt,
            }
          : task
      );
      saveToStorage('tasks', newTasks);
      return { tasks: newTasks };
    }),

  updateTaskProgress: (taskId, progress) =>
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, progress } : task
      );
      saveToStorage('tasks', newTasks);
      return { tasks: newTasks };
    }),

  addDefect: (defect) =>
    set((state) => {
      const newDefect = {
        ...defect,
        id: `def${Date.now()}`,
        createdAt: new Date().toLocaleString(),
      } as Defect;
      const newDefects = [newDefect, ...state.defects];
      saveToStorage('defects', newDefects);
      return { defects: newDefects };
    }),

  updateDefectStatus: (defectId, status, updates = {}) =>
    set((state) => {
      const newDefects = state.defects.map((defect) =>
        defect.id === defectId
          ? {
              ...defect,
              status,
              ...updates,
              closedAt: status === 'closed' ? new Date().toLocaleString() : defect.closedAt,
            }
          : defect
      );
      saveToStorage('defects', newDefects);
      return { defects: newDefects };
    }),

  addSparePartRequest: (request) =>
    set((state) => {
      const newRequest = {
        ...request,
        id: `spr${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toLocaleString(),
      } as SparePartRequest;
      const newRequests = [newRequest, ...state.sparePartRequests];
      saveToStorage('sparePartRequests', newRequests);
      return { sparePartRequests: newRequests };
    }),

  approveSparePartRequest: (requestId, approverId, approverName) =>
    set((state) => {
      const request = state.sparePartRequests.find((r) => r.id === requestId);
      if (!request) return state;

      const newRequests = state.sparePartRequests.map((r) =>
        r.id === requestId
          ? { ...r, status: 'approved', approverId, approverName, approvedAt: new Date().toLocaleString() }
          : r
      );
      const newParts = state.spareParts.map((p) =>
        p.id === request.partId ? { ...p, stock: p.stock - request.quantity } : p
      );
      saveToStorage('sparePartRequests', newRequests);
      saveToStorage('spareParts', newParts);
      return { sparePartRequests: newRequests, spareParts: newParts };
    }),

  rejectSparePartRequest: (requestId, approverId, approverName, reason) =>
    set((state) => {
      const newRequests = state.sparePartRequests.map((r) =>
        r.id === requestId
          ? { ...r, status: 'rejected', approverId, approverName, rejectReason: reason }
          : r
      );
      saveToStorage('sparePartRequests', newRequests);
      return { sparePartRequests: newRequests };
    }),

  setOnlineStatus: (isOnline) => {
    saveToStorage('isOnline', isOnline);
    set({ isOnline });
  },

  saveOfflineData: (data) =>
    set((state) => {
      const newOfflineData = [...state.offlineData, data];
      saveToStorage('offlineData', newOfflineData);
      return { offlineData: newOfflineData };
    }),

  syncOfflineData: () => {
    const state = get();
    if (state.offlineData.length > 0 && state.isOnline) {
      state.offlineData.forEach((item) => {
        const type = item.type as string;
        if (type === 'inspectionRecord') {
          get().addInspectionRecord(item.data as Omit<InspectionRecord, 'id' | 'checkedAt'>);
        } else if (type === 'defect') {
          get().addDefect(item.data as Omit<Defect, 'id' | 'createdAt'>);
        }
      });
      localStorage.removeItem('offlineData');
      set({ offlineData: [] });
    }
  },
}));
