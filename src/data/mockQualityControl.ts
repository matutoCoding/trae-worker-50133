import type { QualityControlReport } from '@/types';

function generateQualityControlReports(): QualityControlReport[] {
  const reports: QualityControlReport[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const completeness = Number((95 + Math.random() * 5).toFixed(1));
    const totalReadings = 288;
    const abnormalCount = Math.floor(Math.random() * 10) + 1;
    const missingCount = Math.floor(totalReadings * (1 - completeness / 100));
    const filledCount = Math.floor(missingCount * (0.6 + Math.random() * 0.3));

    reports.push({
      id: `QCR${String(7 - i).padStart(3, '0')}`,
      date: dateStr,
      completeness,
      abnormalCount,
      missingCount,
      filledCount,
    });
  }

  return reports;
}

export const mockQualityControlReports: QualityControlReport[] = generateQualityControlReports();
