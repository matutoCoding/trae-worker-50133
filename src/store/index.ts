import { create } from 'zustand';
import type {
  Alert,
  EmergencyRecord,
  CalibrationRecord,
  BackgroundValue,
  QualityControlReport,
  MonitorReport,
  PersonnelDose,
  MonitoringPoint,
  RadiationReading,
} from '@/types';
import {
  mockAlerts,
  mockEmergencyRecords,
  mockCalibrationRecords,
  mockBackgroundValues,
  mockQualityControlReports,
  mockReports,
  mockPersonnelDoses,
  mockMonitoringPoints,
  mockRadiationReadings,
} from '@/data/mockData';

interface AppState {
  alerts: Alert[];
  emergencyRecords: EmergencyRecord[];
  calibrationRecords: CalibrationRecord[];
  backgroundValues: BackgroundValue[];
  qualityControlReports: QualityControlReport[];
  reports: MonitorReport[];
  personnelDoses: PersonnelDose[];
  monitoringPoints: MonitoringPoint[];
  radiationReadings: RadiationReading[];

  updateAlertStatus: (id: string, status: Alert['status'], handler?: string, resolution?: string) => void;
  updateBackgroundValue: (id: string, value: number, operator: string) => void;
  addReport: (report: MonitorReport) => void;
  updateEmergencyStep: (recordId: string, stepId: string, status: EmergencyRecord['steps'][0]['status'], operator?: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  alerts: mockAlerts,
  emergencyRecords: mockEmergencyRecords,
  calibrationRecords: mockCalibrationRecords,
  backgroundValues: mockBackgroundValues,
  qualityControlReports: mockQualityControlReports,
  reports: mockReports,
  personnelDoses: mockPersonnelDoses,
  monitoringPoints: mockMonitoringPoints,
  radiationReadings: mockRadiationReadings,

  updateAlertStatus: (id, status, handler, resolution) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              status,
              handler: handler ?? alert.handler,
              resolution: resolution ?? alert.resolution,
              resolvedAt: status === 'resolved' || status === 'ignored' ? new Date().toISOString().replace('T', ' ').slice(0, 19) : alert.resolvedAt,
            }
          : alert
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
              updatedAt: new Date().toISOString().slice(0, 10),
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
                      completedAt: status === 'completed' ? new Date().toISOString().replace('T', ' ').slice(0, 19) : step.completedAt,
                    }
                  : step
              ),
            }
          : record
      ),
    })),
}));
