import dayjs from 'dayjs';
import type { AlertLevel, PointStatus, AlertStatus } from '../types';
import { ALERT_LEVEL_CONFIG, POINT_STATUS_CONFIG, ALERT_STATUS_CONFIG, DEFAULT_DOSE_UNIT } from './constants';

// 格式化剂量率
export function formatDoseRate(value: number, unit: string = DEFAULT_DOSE_UNIT): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  const formatted = formatNumber(value, 2);
  return `${formatted} ${unit}`;
}

// 格式化日期时间
export function formatDateTime(date: string | Date | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) {
    return '--';
  }
  return dayjs(date).format(format);
}

// 格式化日期
export function formatDate(date: string | Date | number, format: string = 'YYYY-MM-DD'): string {
  if (!date) {
    return '--';
  }
  return dayjs(date).format(format);
}

// 格式化时间
export function formatTime(date: string | Date | number, format: string = 'HH:mm:ss'): string {
  if (!date) {
    return '--';
  }
  return dayjs(date).format(format);
}

// 格式化数字
export function formatNumber(value: number, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// 格式化百分比
export function formatPercent(value: number, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return `${formatNumber(value * 100, decimals)}%`;
}

// 获取预警级别信息
export function getAlertLevelInfo(level: AlertLevel) {
  const config = ALERT_LEVEL_CONFIG[level];
  return {
    label: config.label,
    color: config.color,
    bgColor: config.bgColor,
  };
}

// 获取状态信息
export function getStatusInfo(status: PointStatus) {
  const config = POINT_STATUS_CONFIG[status];
  return {
    label: config.label,
    color: config.color,
    bgColor: config.bgColor,
  };
}

// 获取预警状态信息
export function getAlertStatusInfo(status: AlertStatus) {
  const config = ALERT_STATUS_CONFIG[status];
  return {
    label: config.label,
    color: config.color,
    bgColor: config.bgColor,
  };
}

// 格式化相对时间
export function formatRelativeTime(date: string | Date | number): string {
  if (!date) {
    return '--';
  }
  const target = dayjs(date);
  const now = dayjs();
  const diffMinutes = now.diff(target, 'minute');
  const diffHours = now.diff(target, 'hour');
  const diffDays = now.diff(target, 'day');

  if (diffMinutes < 1) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return formatDate(date);
  }
}

// 格式化电池电量
export function formatBatteryLevel(level: number): string {
  if (level === null || level === undefined || isNaN(level)) {
    return '--';
  }
  return `${Math.round(level)}%`;
}

// 格式化信号强度
export function formatSignalStrength(strength: number): string {
  if (strength === null || strength === undefined || isNaN(strength)) {
    return '--';
  }
  return `${Math.round(strength)}%`;
}

// 根据剂量率值获取预警级别
export function getAlertLevelByDoseRate(doseRate: number): AlertLevel {
  if (doseRate >= 500) return 'emergency';
  if (doseRate >= 400) return 'severe';
  if (doseRate >= 300) return 'warning';
  if (doseRate >= 200) return 'notice';
  return 'normal';
}
