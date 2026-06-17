import { create } from 'zustand';
import type {
  MonitoringPoint,
  RadiationReading,
  Alert,
  AlertLevel,
  AlertStatus,
  CalibrationRecord,
  BackgroundValue,
  QualityControlReport,
  PersonnelDose,
  EmergencyRecord,
  MonitorReport,
  PointStatus,
  StepStatus,
} from '@/types';
import { mockPoints } from '@/data/mockPoints';
import { mockCurrentReadings, mockHistoryReadings } from '@/data/mockReadings';
import { mockAlerts } from '@/data/mockAlerts';
import { mockCalibrations } from '@/data/mockCalibrations';
import { mockPersonnel } from '@/data/mockPersonnel';
import { mockEmergencyRecords } from '@/data/mockEmergency';
import { mockReports } from '@/data/mockReports';
import { mockBackgroundValues } from '@/data/mockBackgroundValues';
import { mockQualityControlReports } from '@/data/mockQualityControl';

interface MonitorState {
  monitoringPoints: MonitoringPoint[];
  currentReadings: RadiationReading[];
  historyReadings: RadiationReading[];
  alerts: Alert[];
  calibrationRecords: CalibrationRecord[];
  backgroundValues: BackgroundValue[];
  qualityControlReports: QualityControlReport[];
  personnelDoses: PersonnelDose[];
  emergencyRecords: EmergencyRecord[];
  reports: MonitorReport[];
  selectedPointId: string | null;

  setSelectedPointId: (id: string | null) => void;

  getPointById: (id: string) => MonitoringPoint | undefined;
  getCurrentReadingByPointId: (pointId: string) => RadiationReading | undefined;
  getHistoryReadingsByPointId: (pointId: string) => RadiationReading[];

  getFilteredAlerts: (filters?: { level?: AlertLevel; status?: AlertStatus }) => Alert[];
  getStatistics: () => {
    totalPoints: number;
    onlinePoints: number;
    offlinePoints: number;
    maintenancePoints: number;
    faultPoints: number;
    pendingAlerts: number;
    processingAlerts: number;
    avgDoseRate: number;
  };

  updateAlertStatus: (id: string, status: AlertStatus, handler?: string, resolution?: string) => void;
  updateBackgroundValue: (id: string, value: number, operator: string) => void;
  addReport: (report: MonitorReport) => void;
  updateEmergencyStep: (recordId: string, stepId: string, status: StepStatus, operator?: string) => void;

  getCalibrationRecordsByPointId: (pointId: string) => CalibrationRecord[];

  getBackgroundValueByPointId: (pointId: string) => BackgroundValue | undefined;
  getFilteredPoints: (status?: PointStatus) => MonitoringPoint[];
}

export const useMonitorStore = create<MonitorState>((set, get) => ({
  monitoringPoints: mockPoints,
  currentReadings: mockCurrentReadings,
  historyReadings: mockHistoryReadings,
  alerts: mockAlerts,
  calibrationRecords: mockCalibrations,
  backgroundValues: mockBackgroundValues,
  qualityControlReports: mockQualityControlReports,
  personnelDoses: mockPersonnel,
  emergencyRecords: mockEmergencyRecords,
  reports: mockReports,
  selectedPointId: null,

  setSelectedPointId: (id) => set({ selectedPointId: id }),

  getPointById: (id) => get().monitoringPoints.find((p) => p.id === id),

  getCurrentReadingByPointId: (pointId) =>
    get().currentReadings.find((r) => r.pointId === pointId),

  getHistoryReadingsByPointId: (pointId) =>
    get()
      .historyReadings.filter((r) => r.pointId === pointId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),

  getFilteredAlerts: (filters) => {
    const { alerts } = get();
    if (!filters) return alerts;
    return alerts.filter((alert) => {
      if (filters.level && alert.level !== filters.level) return false;
      if (filters.status && alert.status !== filters.status) return false;
      return true;
    });
  },

  getStatistics: () => {
    const { monitoringPoints, alerts, currentReadings } = get();
    const totalPoints = monitoringPoints.length;
    const onlinePoints = monitoringPoints.filter((p) => p.status === 'online').length;
    const offlinePoints = monitoringPoints.filter((p) => p.status === 'offline').length;
    const maintenancePoints = monitoringPoints.filter((p) => p.status === 'maintenance').length;
    const faultPoints = monitoringPoints.filter((p) => p.status === 'fault').length;
    const pendingAlerts = alerts.filter((a) => a.status === 'pending').length;
    const processingAlerts = alerts.filter((a) => a.status === 'processing').length;

    const validReadings = currentReadings.filter((r) => r.doseRate > 0);
    const avgDoseRate =
      validReadings.length > 0
        ? validReadings.reduce((sum, r) => sum + r.doseRate, 0) / validReadings.length
        : 0;

    return {
      totalPoints,
      onlinePoints,
      offlinePoints,
      maintenancePoints,
      faultPoints,
      pendingAlerts,
      processingAlerts,
      avgDoseRate: Number(avgDoseRate.toFixed(2)),
    };
  },

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

  updateBackgroundValue: (id, value, operator) =>
    set((state) => ({
      backgroundValues: state.backgroundValues.map((bg) =>
        bg.id === id
          ? {
              ...bg,
              value,
              operator,
              updatedAt: new Date().toISOString().split('T')[0],
              history: [
                ...bg.history,
                { date: new Date().toISOString().slice(0, 7), value },
              ],
            }
          : bg
      ),
    })),

  addReport: (report) =>
    set((state) => ({
      reports: [report, ...state.reports],
    })),

  updateEmergencyStep: (recordId, stepId, status, operator) =>
    set((state) => ({
      emergencyRecords: state.emergencyRecords.map((record) =>
        record.id === recordId
          ? {
              ...record,
              steps: record.steps.map((step) =>
                step.id === stepId
                  ? {
                      ...step,
                      status,
                      operator: operator ?? step.operator,
                      completedAt:
                        status === 'completed'
                          ? new Date().toISOString()
                          : step.completedAt,
                    }
                  : step
              ),
            }
          : record
      ),
    })),

  getCalibrationRecordsByPointId: (pointId) =>
    get()
      .calibrationRecords.filter((r) => r.pointId === pointId)
      .sort(
        (a, b) =>
          new Date(b.calibrationDate).getTime() - new Date(a.calibrationDate).getTime()
      ),

  getBackgroundValueByPointId: (pointId) =>
    get().backgroundValues.find((bg) => bg.pointId === pointId),

  getFilteredPoints: (status) => {
    const { monitoringPoints } = get();
    if (!status) return monitoringPoints;
    return monitoringPoints.filter((p) => p.status === status);
  },
}));

export default useMonitorStore;
