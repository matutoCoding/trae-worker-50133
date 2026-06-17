import type { BackgroundValue } from '@/types';
import { mockPoints } from './mockPoints';

function generateHistory(baseValue: number): { date: string; value: number }[] {
  const history: { date: string; value: number }[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7);
    const variation = (Math.random() - 0.5) * 10;
    history.push({
      date: monthStr,
      value: Number((baseValue + variation).toFixed(2)),
    });
  }

  return history;
}

export const mockBackgroundValues: BackgroundValue[] = mockPoints.map(
  (point, index) => ({
    id: `BV${String(index + 1).padStart(3, '0')}`,
    pointId: point.id,
    pointName: point.name,
    value: point.backgroundValue,
    unit: 'nSv/h',
    updatedAt: point.lastCalibrationDate,
    operator: ['刘工程师', '陈工程师', '王工程师', '张工程师', '李工程师', '赵工程师', '周工程师', '吴工程师', '孙工程师', '钱工程师'][index % 10],
    history: generateHistory(point.backgroundValue),
  })
);
