export interface User {
  id: string;
  name: string;
  role: 'inspector' | 'leader' | 'admin' | 'technician';
  team: string;
  phone?: string;
}

export type UserRole = User['role'];

export interface InspectionPlan {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  routeId: string;
  startDate: string;
  endDate: string;
  assignees: string[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  description?: string;
}

export interface InspectionRoute {
  id: string;
  name: string;
  line: string;
  checkpoints: Checkpoint[];
  distance: number;
  estimatedTime: number;
}

export interface Checkpoint {
  id: string;
  name: string;
  deviceId: string;
  sequence: number;
  location: string;
}

export interface InspectionTask {
  id: string;
  planId: string;
  name: string;
  routeId: string;
  assigneeId: string;
  scheduledDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  defectsCount?: number;
}

export interface InspectionRecord {
  id: string;
  taskId: string;
  taskName: string;
  deviceId: string;
  deviceName: string;
  deviceCode?: string;
  inspectorId: string;
  inspectorName: string;
  checkedAt: string;
  checkItems: string[];
  note?: string;
  photos: string[];
  status: 'normal' | 'abnormal';
}

export interface InspectionItem {
  id: string;
  name: string;
  result: 'normal' | 'abnormal' | 'na';
  remark?: string;
}

export interface Device {
  id: string;
  name: string;
  code: string;
  type: string;
  category: 'track' | 'signal' | 'power' | 'communication';
  line: string;
  location: string;
  installDate: string;
  status: 'normal' | 'warning' | 'fault';
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  nextMaintenance?: string;
  manufacturer?: string;
  model?: string;
  description?: string;
}

export interface MaintenanceRecord {
  id: string;
  deviceId: string;
  type: string;
  date: string;
  description: string;
  parts?: string[];
  operatorId: string;
  technician: string;
  status: 'completed' | 'in_progress';
  result?: string;
  cost?: number;
}

export type DefectLevel = 'minor' | 'major' | 'critical';
export type DefectStatus = 'reported' | 'assigned' | 'rectifying' | 'rechecking' | 'closed';

export interface Defect {
  id: string;
  taskId: string;
  deviceId: string;
  deviceName: string;
  deviceCode?: string;
  title: string;
  description: string;
  level: DefectLevel;
  status: DefectStatus;
  photos: string[];
  reporterId: string;
  reporterName: string;
  assigneeId?: string;
  assigneeName?: string;
  deadline?: string;
  createdAt: string;
  rectificationDesc?: string;
  rectificationPhotos?: string[];
  rectifierId?: string;
  rectifierName?: string;
  rectifiedAt?: string;
  recheckResult?: string;
  recheckerId?: string;
  recheckerName?: string;
  recheckedAt?: string;
  closedAt?: string;
}

export interface SparePart {
  id: string;
  name: string;
  code: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  location: string;
  specs?: string;
}

export interface SparePartRequest {
  id: string;
  partId: string;
  partName: string;
  quantity: number;
  applicantId: string;
  applicantName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approverName?: string;
  rejectReason?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface TeamPerformance {
  id: string;
  teamId: string;
  teamName: string;
  tasksCompleted: number;
  tasksTotal: number;
  completionRate: number;
  defectsClosed: number;
  defectsTotal: number;
  rectificationRate: number;
  avgCompletionTime: number;
  defectClosureRate?: number;
  overdueTasks?: number;
  score?: number;
  grade?: string;
}

export interface TrendData {
  date: string;
  value: number;
}

export interface DefectStats {
  byLevel: Record<DefectLevel, number>;
  byStatus: Record<DefectStatus, number>;
  byType: Record<string, number>;
  trend: TrendData[];
}
