import { create } from 'zustand';
import type {
  MonitoringPoint,
  RadiationReading,
  Alert,
  CalibrationRecord,
  PersonnelDose,
  EmergencyRecord,
  MonitorReport,
  PointStatus,
  AlertLevel,
  AlertStatus,
} from '../types';
import { mockPoints } from '../data/mockPoints';
import { mockCurrentReadings, mockHistoryReadings } from '../data/mockReadings';
import { mockAlerts } from '../data/mockAlerts';
import { mockCalibrations } from '../data/mockCalibrations';
import { mockPersonnel } from '../data/mockPersonnel';
import { mockEmergencyRecords } from '../data/mockEmergency';
import { mockReports } from '../data/mockReports';

interface MonitorState {
  monitoringPoints: MonitoringPoint[];
  currentReadings: RadiationReading[];
  historyReadings: RadiationReading[];
  alerts: Alert[];
  calibrationRecords: CalibrationRecord[];
  personnelDoses: PersonnelDose[];
  emergencyRecords: EmergencyRecord[];
  reports: MonitorReport[];

  selectedPointId: string | null;
  alertFilters: {
    level?: AlertLevel;
    status?: AlertStatus;
  };
  pointStatusFilter?: PointStatus;

  setSelectedPointId: (id: string | null) => void;
  setAlertFilters: (filters: { level?: AlertLevel; status?: AlertStatus }) => void;
  setPointStatusFilter: (status?: PointStatus) => void;

  updateMonitoringPoint: (point: MonitoringPoint) => void;
  addMonitoringPoint: (point: MonitoringPoint) => void;
  removeMonitoringPoint: (id: string) => void;

  updateCurrentReading: (reading: RadiationReading) => void;
  addHistoryReading: (reading: RadiationReading) => void;
  getHistoryReadingsByPointId: (pointId: string) => RadiationReading[];

  addAlert: (alert: Alert) => void;
  updateAlert: (alert: Alert) => void;
  updateAlertStatus: (id: string, status: AlertStatus, handler?: string, resolution?: string) => void;
  getFilteredAlerts: () => Alert[];

  addCalibrationRecord: (record: CalibrationRecord) => void;
  getCalibrationRecordsByPointId: (pointId: string) => CalibrationRecord[];

  addPersonnelDose: (dose: PersonnelDose) => void;
  updatePersonnelDose: (dose: PersonnelDose) => void;

  addEmergencyRecord: (record: EmergencyRecord) => void;
  updateEmergencyRecord: (record: EmergencyRecord) => void;

  addReport: (report: MonitorReport) => void;

  getFilteredPoints: () => MonitoringPoint[];
  getPointById: (id: string) => MonitoringPoint | undefined;
  getCurrentReadingByPointId: (pointId: string) => RadiationReading | undefined;
  getStatistics: () => {
    totalPoints: number;
    onlinePoints: number;
    offlinePoints: number;
    maintenancePoints: number;
    faultPoints: number;
    pendingAlerts: number;
    processingAlerts: number;
    averageDoseRate: number;
  };
}

export const useMonitorStore = create<MonitorState>((set, get) => ({
  monitoringPoints: mockPoints,
  currentReadings: mockCurrentReadings,
  historyReadings: mockHistoryReadings,
  alerts: mockAlerts,
  calibrationRecords: mockCalibrations,
  personnelDoses: mockPersonnel,
  emergencyRecords: mockEmergencyRecords,
  reports: mockReports,

  selectedPointId: null,
  alertFilters: {},
  pointStatusFilter: undefined,

  setSelectedPointId: (id) => set({ selectedPointId: id }),

  setAlertFilters: (filters) => set({ alertFilters: filters }),

  setPointStatusFilter: (status) => set({ pointStatusFilter: status }),

  updateMonitoringPoint: (point) =>
    set((state) => ({
      monitoringPoints: state.monitoringPoints.map((p) =>
        p.id === point.id ? point : p
      ),
    })),

  addMonitoringPoint: (point) =>
    set((state) => ({
      monitoringPoints: [...state.monitoringPoints, point],
    })),

  removeMonitoringPoint: (id) =>
    set((state) => ({
      monitoringPoints: state.monitoringPoints.filter((p) => p.id !== id),
    })),

  updateCurrentReading: (reading) =>
    set((state) => ({
      currentReadings: state.currentReadings.map((r) =>
        r.pointId === reading.pointId ? reading : r
      ),
    })),

  addHistoryReading: (reading) =>
    set((state) => ({
      historyReadings: [...state.historyReadings, reading],
    })),

  getHistoryReadingsByPointId: (pointId) =>
    get()
      .historyReadings.filter((r) => r.pointId === pointId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),

  updateAlert: (alert) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alert.id ? alert : a)),
    })),

  updateAlertStatus: (id, status, handler, resolution) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              handler: handler ?? a.handler,
              resolution: resolution ?? a.resolution,
              resolvedAt:
                status === 'resolved' || status === 'ignored'
                  ? new Date().toISOString()
                  : a.resolvedAt,
            }
          : a
      ),
    })),

  getFilteredAlerts: () => {
    const { alerts, alertFilters } = get();
    return alerts.filter((alert) => {
      if (alertFilters.level && alert.level !== alertFilters.level) return false;
      if (alertFilters.status && alert.status !== alertFilters.status) return false;
      return true;
    });
  },

  addCalibrationRecord: (record) =>
    set((state) => ({
      calibrationRecords: [...state.calibrationRecords, record],
    })),

  getCalibrationRecordsByPointId: (pointId) =>
    get()
      .calibrationRecords.filter((r) => r.pointId === pointId)
      .sort(
        (a, b) =>
          new Date(b.calibrationDate).getTime() - new Date(a.calibrationDate).getTime()
      ),

  addPersonnelDose: (dose) =>
    set((state) => ({
      personnelDoses: [...state.personnelDoses, dose],
    })),

  updatePersonnelDose: (dose) =>
    set((state) => ({
      personnelDoses: state.personnelDoses.map((d) =>
        d.id === dose.id ? dose : d
      ),
    })),

  addEmergencyRecord: (record) =>
    set((state) => ({
      emergencyRecords: [...state.emergencyRecords, record],
    })),

  updateEmergencyRecord: (record) =>
    set((state) => ({
      emergencyRecords: state.emergencyRecords.map((r) =>
        r.id === record.id ? record : r
      ),
    })),

  addReport: (report) =>
    set((state) => ({
      reports: [...state.reports, report],
    })),

  getFilteredPoints: () => {
    const { monitoringPoints, pointStatusFilter } = get();
    if (!pointStatusFilter) return monitoringPoints;
    return monitoringPoints.filter((p) => p.status === pointStatusFilter);
  },

  getPointById: (id) => get().monitoringPoints.find((p) => p.id === id),

  getCurrentReadingByPointId: (pointId) =>
    get().currentReadings.find((r) => r.pointId === pointId),

  getStatistics: () => {
    const { monitoringPoints, alerts, currentReadings } = get();
    const onlinePoints = monitoringPoints.filter((p) => p.status === 'online').length;
    const offlinePoints = monitoringPoints.filter((p) => p.status === 'offline').length;
    const maintenancePoints = monitoringPoints.filter(
      (p) => p.status === 'maintenance'
    ).length;
    const faultPoints = monitoringPoints.filter((p) => p.status === 'fault').length;
    const pendingAlerts = alerts.filter((a) => a.status === 'pending').length;
    const processingAlerts = alerts.filter((a) => a.status === 'processing').length;

    const validReadings = currentReadings.filter(
      (r) => r.doseRate > 0 && r.pointId !== 'MP006'
    );
    const averageDoseRate =
      validReadings.length > 0
        ? validReadings.reduce((sum, r) => sum + r.doseRate, 0) / validReadings.length
        : 0;

    return {
      totalPoints: monitoringPoints.length,
      onlinePoints,
      offlinePoints,
      maintenancePoints,
      faultPoints,
      pendingAlerts,
      processingAlerts,
      averageDoseRate: Number(averageDoseRate.toFixed(2)),
    };
  },
}));
