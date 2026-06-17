import type { AlertLevel, PointStatus, AlertStatus, CalibrationResult, ReportType } from '../types';

// 颜色常量
export const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  severe: '#dc2626',
  emergency: '#991b1b',
  info: '#06b6d4',
  offline: '#6b7280',
  maintenance: '#8b5cf6',
  fault: '#f97316',
  normal: '#22c55e',
  notice: '#eab308',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
};

// 预警级别配置
export const ALERT_LEVEL_CONFIG: Record<AlertLevel, { label: string; color: string; bgColor: string; threshold: number }> = {
  normal: {
    label: '正常',
    color: COLORS.normal,
    bgColor: '#dcfce7',
    threshold: 100,
  },
  notice: {
    label: '提示',
    color: COLORS.notice,
    bgColor: '#fef9c3',
    threshold: 200,
  },
  warning: {
    label: '警告',
    color: COLORS.warning,
    bgColor: '#fef3c7',
    threshold: 300,
  },
  severe: {
    label: '严重',
    color: COLORS.severe,
    bgColor: '#fee2e2',
    threshold: 400,
  },
  emergency: {
    label: '紧急',
    color: COLORS.emergency,
    bgColor: '#fecaca',
    threshold: 500,
  },
};

// 监测点状态映射
export const POINT_STATUS_CONFIG: Record<PointStatus, { label: string; color: string; bgColor: string }> = {
  online: {
    label: '在线',
    color: COLORS.success,
    bgColor: '#dcfce7',
  },
  offline: {
    label: '离线',
    color: COLORS.offline,
    bgColor: '#f1f5f9',
  },
  maintenance: {
    label: '维护',
    color: COLORS.maintenance,
    bgColor: '#ede9fe',
  },
  fault: {
    label: '故障',
    color: COLORS.fault,
    bgColor: '#ffedd5',
  },
};

// 预警状态映射
export const ALERT_STATUS_CONFIG: Record<AlertStatus, { label: string; color: string; bgColor: string }> = {
  pending: {
    label: '待处理',
    color: COLORS.warning,
    bgColor: '#fef3c7',
  },
  processing: {
    label: '处理中',
    color: COLORS.info,
    bgColor: '#cffafe',
  },
  resolved: {
    label: '已解决',
    color: COLORS.success,
    bgColor: '#dcfce7',
  },
  ignored: {
    label: '已忽略',
    color: COLORS.offline,
    bgColor: '#f1f5f9',
  },
};

// 校准结果映射
export const CALIBRATION_RESULT_CONFIG: Record<CalibrationResult, { label: string; color: string; bgColor: string }> = {
  pass: {
    label: '通过',
    color: COLORS.success,
    bgColor: '#dcfce7',
  },
  fail: {
    label: '失败',
    color: COLORS.danger,
    bgColor: '#fee2e2',
  },
  conditional: {
    label: '有条件通过',
    color: COLORS.warning,
    bgColor: '#fef3c7',
  },
};

// 报告类型映射
export const REPORT_TYPE_CONFIG: Record<ReportType, { label: string }> = {
  daily: { label: '日报' },
  weekly: { label: '周报' },
  monthly: { label: '月报' },
  yearly: { label: '年报' },
  custom: { label: '自定义报告' },
};

// 默认剂量率单位
export const DEFAULT_DOSE_UNIT = 'nSv/h';

// 剂量率阈值
export const DOSE_RATE_THRESHOLDS = {
  normal: 100,
  notice: 200,
  warning: 300,
  severe: 400,
  emergency: 500,
};

// 北京市中心坐标
export const BEIJING_CENTER = {
  lat: 39.9042,
  lng: 116.4074,
};
