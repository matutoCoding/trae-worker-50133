export type AlertLevel = 'notice' | 'warning' | 'severe' | 'emergency';
export type AlertStatus = 'pending' | 'processing' | 'resolved' | 'ignored';

export interface Alert {
  id: string;
  pointId: string;
  pointName: string;
  level: AlertLevel;
  value: number;
  threshold: number;
  unit: string;
  description: string;
  timestamp: string;
  status: AlertStatus;
  handler?: string;
  resolvedAt?: string;
  resolution?: string;
}

export type EmergencyStatus = 'active' | 'contained' | 'resolved';
export type StepStatus = 'pending' | 'in_progress' | 'completed';

export interface EmergencyStep {
  id: string;
  stepNumber: number;
  name: string;
  description: string;
  status: StepStatus;
  operator?: string;
  completedAt?: string;
}

export interface EmergencyRecord {
  id: string;
  alertId: string;
  title: string;
  level: AlertLevel;
  startTime: string;
  endTime?: string;
  status: EmergencyStatus;
  handler: string;
  team: string[];
  steps: EmergencyStep[];
  traceability: string;
  summary: string;
}

export interface CalibrationRecord {
  id: string;
  pointId: string;
  pointName: string;
  calibrationDate: string;
  operator: string;
  beforeValue: number;
  afterValue: number;
  backgroundValue: number;
  certificateNumber: string;
  result: 'pass' | 'fail' | 'conditional';
  remarks: string;
  nextCalibrationDate: string;
}

export interface BackgroundValue {
  id: string;
  pointId: string;
  pointName: string;
  value: number;
  unit: string;
  updatedAt: string;
  operator: string;
  history: { date: string; value: number }[];
}

export interface QualityControlReport {
  id: string;
  date: string;
  completeness: number;
  abnormalCount: number;
  missingCount: number;
  filledCount: number;
}

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type ReportStatus = 'draft' | 'final';

export interface MonitorReport {
  id: string;
  type: ReportType;
  title: string;
  startDate: string;
  endDate: string;
  generateTime: string;
  generatedBy: string;
  summary: {
    totalReadings: number;
    abnormalCount: number;
    avgDoseRate: number;
    maxDoseRate: number;
    pointsOnline: number;
    pointsTotal: number;
  };
  status: ReportStatus;
}

export interface PersonnelDose {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  monthlyDose: number;
  quarterlyDose: number;
  yearlyDose: number;
  totalDose: number;
  limit: number;
  unit: 'mSv';
  lastUpdated: string;
}

export interface MonitoringPoint {
  id: string;
  name: string;
  code: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    district: string;
  };
  device: {
    model: string;
    serialNumber: string;
    installDate: string;
    manufacturer: string;
  };
  status: 'online' | 'offline' | 'maintenance' | 'fault';
  batteryLevel: number;
  signalStrength: number;
  backgroundValue: number;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  createdAt: string;
}

export interface RadiationReading {
  id: string;
  pointId: string;
  pointName: string;
  doseRate: number;
  unit: 'nSv/h' | 'μGy/h';
  accumulatedDose: number;
  temperature: number;
  humidity: number;
  timestamp: string;
  isAbnormal: boolean;
  alertLevel: 'normal' | AlertLevel;
}
