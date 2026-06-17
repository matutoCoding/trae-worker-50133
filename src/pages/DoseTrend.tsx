import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Calendar, MapPin, BarChart3, Check } from 'lucide-react';
import { useMonitorStore } from '@/store/useMonitorStore';
import dayjs from 'dayjs';

type TimeRange = 'day' | 'week' | 'month' | 'year';
type DataType = 'cumulative' | 'doseRate';

const lineColors = ['#22d3ee', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'];

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function DoseTrend() {
  const { monitoringPoints, historyReadings, getPointById } = useMonitorStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [dataType, setDataType] = useState<DataType>('cumulative');
  const [selectedPointIds, setSelectedPointIds] = useState<string[]>(
    monitoringPoints.filter(p => p.status === 'online').slice(0, 3).map(p => p.id)
  );

  const togglePoint = (id: string) => {
    setSelectedPointIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const xAxisFormatter = (v: number) => {
    const d = dayjs(v);
    if (timeRange === 'day') return d.format('HH:00');
    if (timeRange === 'week') return d.format('MM-DD');
    if (timeRange === 'month') return d.format('MM-DD');
    return d.format('YYYY-MM');
  };

  const doseTrendData = useMemo(() => {
    const grouped = new Map<string, { pointId: string; pointName: string; data: { time: string; value: number }[] }>();

    historyReadings.forEach(reading => {
      const point = getPointById(reading.pointId);
      if (!point) return;

      if (!grouped.has(reading.pointId)) {
        grouped.set(reading.pointId, {
          pointId: reading.pointId,
          pointName: point.name,
          data: [],
        });
      }

      const group = grouped.get(reading.pointId)!;
      const value = dataType === 'cumulative' ? reading.accumulatedDose : reading.doseRate;
      group.data.push({ time: reading.timestamp, value });
    });

    return Array.from(grouped.values()).map(g => ({
      ...g,
      data: g.data.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
    }));
  }, [historyReadings, dataType, getPointById]);

  const selectedTrendData = useMemo(() => {
    return doseTrendData.filter(d => selectedPointIds.includes(d.pointId));
  }, [doseTrendData, selectedPointIds]);

  const mainChartOption = {
    backgroundColor: 'transparent',
    legend: {
      show: true,
      top: 0,
      right: 10,
      textStyle: { color: '#9ca3af' },
      itemWidth: 14,
      itemHeight: 8,
    },
    grid: { left: 60, right: 30, top: 50, bottom: 50 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(31, 41, 55, 0.95)',
      borderColor: '#374151',
      textStyle: { color: '#e5e7eb' },
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#4b5563' } },
      axisLabel: { color: '#9ca3af', formatter: xAxisFormatter },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: dataType === 'cumulative' ? '累积剂量 (mSv)' : '剂量率 (nSv/h)',
      nameTextStyle: { color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#4b5563' } },
      axisLabel: { color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    series: selectedTrendData.map((d, idx) => ({
      name: d.pointName,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: lineColors[idx % lineColors.length], width: 3 },
      itemStyle: { color: lineColors[idx % lineColors.length] },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: hexToRgba(lineColors[idx % lineColors.length], 0.3) },
            { offset: 1, color: hexToRgba(lineColors[idx % lineColors.length], 0) },
          ],
        },
      },
      data: d.data.map(p => [p.time, p.value]),
    })),
  };

  const rankingData = useMemo(() => {
    return doseTrendData
      .map(d => ({
        name: d.pointName,
        value: d.data.length > 0 ? d.data[d.data.length - 1].value : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [doseTrendData]);

  const barChartOption = {
    backgroundColor: 'transparent',
    grid: { left: 110, right: 30, top: 20, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(31, 41, 55, 0.95)',
      borderColor: '#374151',
      textStyle: { color: '#e5e7eb' },
      formatter: (params: any) => {
        const p = params[0];
        return `${p.name}<br/>累积剂量: <b>${p.value} mSv</b>`;
      },
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4b5563' } },
      axisLabel: { color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: rankingData.map(r => r.name).reverse(),
      axisLine: { lineStyle: { color: '#4b5563' } },
      axisLabel: { color: '#e5e7eb', fontSize: 12 },
    },
    series: [
      {
        type: 'bar',
        data: rankingData.map((r, idx) => ({
          value: r.value,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: lineColors[idx % lineColors.length] + '99' },
                { offset: 1, color: lineColors[idx % lineColors.length] },
              ],
            },
            borderRadius: [0, 4, 4, 0],
          },
        })).reverse(),
        barWidth: 16,
      },
    ],
  };

  const radarData = useMemo(() => {
    const indicators = monitoringPoints.slice(0, 6).map(p => ({
      name: p.name,
      max: 0.3,
    }));
    const values = monitoringPoints.slice(0, 6).map(p => p.backgroundValue);
    return { indicators, values };
  }, [monitoringPoints]);

  const radarChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(31, 41, 55, 0.95)',
      borderColor: '#374151',
      textStyle: { color: '#e5e7eb' },
    },
    radar: {
      indicator: radarData.indicators,
      axisName: { color: '#9ca3af', fontSize: 11 },
      splitLine: { lineStyle: { color: '#374151' } },
      splitArea: {
        areaStyle: {
          color: ['rgba(55, 65, 81, 0.3)', 'rgba(55, 65, 81, 0.1)'],
        },
      },
      axisLine: { lineStyle: { color: '#4b5563' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: radarData.values,
            name: '本底值 (nSv/h)',
            lineStyle: { color: '#22d3ee', width: 2 },
            itemStyle: { color: '#22d3ee' },
            areaStyle: {
              color: {
                type: 'radial',
                x: 0.5, y: 0.5, r: 0.5,
                colorStops: [
                  { offset: 0, color: 'rgba(34, 211, 238, 0.6)' },
                  { offset: 1, color: 'rgba(34, 211, 238, 0.1)' },
                ],
              },
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="text-text-primary">
      <h1 className="text-2xl font-bold mb-6">剂量趋势分析</h1>

      <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50 mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">时间范围：</span>
            <div className="flex bg-gray-900/50 rounded-lg p-0.5 border border-gray-700/50">
              {(['day', 'week', 'month', 'year'] as TimeRange[]).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {range === 'day' && '日'}
                  {range === 'week' && '周'}
                  {range === 'month' && '月'}
                  {range === 'year' && '年'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">数据类型：</span>
            <div className="flex bg-gray-900/50 rounded-lg p-0.5 border border-gray-700/50">
              {(['cumulative', 'doseRate'] as DataType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setDataType(type)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    dataType === type
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type === 'cumulative' ? '累积剂量' : '瞬时剂量率'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 flex-1 min-w-[300px]">
            <MapPin className="w-4 h-4 text-gray-400 mt-1.5" />
            <span className="text-sm text-gray-400 mt-1.5">监测点：</span>
            <div className="flex flex-wrap gap-2">
              {monitoringPoints.filter(p => p.status === 'online').map((point, idx) => {
                const isSelected = selectedPointIds.includes(point.id);
                return (
                  <button
                    key={point.id}
                    onClick={() => togglePoint(point.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors ${
                      isSelected
                        ? 'border-transparent text-white'
                        : 'border-gray-600 text-gray-400 hover:text-gray-300'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: hexToRgba(lineColors[idx % lineColors.length], 0.3), borderColor: lineColors[idx % lineColors.length] }
                        : {}
                    }
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {point.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          累积剂量趋势
          <span className="text-sm font-normal text-gray-400 ml-3">
            {selectedTrendData.length} 个监测点
          </span>
        </h3>
        {selectedTrendData.length > 0 ? (
          <ReactECharts option={mainChartOption} style={{ height: 400 }} />
        ) : (
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            请至少选择一个监测点
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4">剂量排名</h3>
          <ReactECharts option={barChartOption} style={{ height: 320 }} />
        </div>
        <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4">本底值对比</h3>
          <ReactECharts option={radarChartOption} style={{ height: 320 }} />
        </div>
      </div>
    </div>
  );
}
