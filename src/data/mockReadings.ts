import type { RadiationReading } from '../types';
import { mockPoints } from './mockPoints';
import { getAlertLevelByDoseRate } from '../utils/format';

// 生成单个读数
function createReading(
  id: string,
  pointId: string,
  pointName: string,
  doseRate: number,
  timestamp: string
): RadiationReading {
  const alertLevel = getAlertLevelByDoseRate(doseRate);
  return {
    id,
    pointId,
    pointName,
    doseRate,
    unit: 'nSv/h',
    accumulatedDose: Number((doseRate * Math.random() * 0.5 + 800).toFixed(2)),
    temperature: Number((18 + Math.random() * 15).toFixed(1)),
    humidity: Number((30 + Math.random() * 50).toFixed(1)),
    timestamp,
    isAbnormal: doseRate >= 200,
    alertLevel,
  };
}

// 实时读数
const now = new Date();
export const mockCurrentReadings: RadiationReading[] = [
  createReading('R001', 'MP001', '朝阳CBD监测站', 85.3, now.toISOString()),
  createReading('R002', 'MP002', '海淀中关村监测站', 92.7, now.toISOString()),
  createReading('R003', 'MP003', '西城金融街监测站', 76.1, now.toISOString()),
  createReading('R004', 'MP004', '东城王府井监测站', 68.9, now.toISOString()),
  createReading('R005', 'MP005', '丰台科技园监测站', 245.6, now.toISOString()),
  createReading('R006', 'MP006', '石景山万达监测站', 0, now.toISOString()),
  createReading('R007', 'MP007', '通州副中心监测站', 88.4, now.toISOString()),
  createReading('R008', 'MP008', '昌平回龙观监测站', 105.2, now.toISOString()),
  createReading('R009', 'MP009', '大兴亦庄监测站', 478.9, now.toISOString()),
  createReading('R010', 'MP010', '顺义机场监测站', 112.6, now.toISOString()),
  createReading('R011', 'MP011', '房山良乡监测站', 318.3, now.toISOString()),
  createReading('R012', 'MP012', '门头沟新城监测站', 79.8, now.toISOString()),
];

// 生成历史数据（每个监测点24小时数据）
function generateHistoryReadings(): RadiationReading[] {
  const readings: RadiationReading[] = [];
  let idCounter = 100;

  mockPoints.forEach((point, pointIndex) => {
    const baseDoseRate = 60 + pointIndex * 8 + Math.random() * 30;
    const abnormalIndex = Math.floor(Math.random() * 24);

    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(now);
      date.setHours(date.getHours() - (23 - hour));
      date.setMinutes(0, 0, 0);

      let doseRate: number;
      if (hour === abnormalIndex) {
        doseRate = baseDoseRate + Math.random() * 300;
      } else {
        const variation = (Math.random() - 0.5) * 40;
        doseRate = Math.max(50, baseDoseRate + variation);
      }
      doseRate = Number(doseRate.toFixed(2));

      readings.push(
        createReading(
          `H${String(idCounter++).padStart(4, '0')}`,
          point.id,
          point.name,
          doseRate,
          date.toISOString()
        )
      );
    }
  });

  return readings;
}

export const mockHistoryReadings: RadiationReading[] = generateHistoryReadings();
