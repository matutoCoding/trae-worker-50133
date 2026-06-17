import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { Thermometer, Droplets, Activity, Clock, AlertTriangle } from 'lucide-react';
import { useMonitorStore } from '@/store/useMonitorStore';
import type { AlertLevel, MonitoringPoint } from '@/types';
import dayjs from 'dayjs';

const alertLevelBgColors: Record<AlertLevel | 'normal', string> = {
  normal: 'bg-gray-800/80 border-gray-700/50',
  notice: 'bg-yellow-900/30 border-yellow-600/50',
  warning: 'bg-orange-900/40 border-orange-600/60',
  severe: 'bg-red-900/50 border-red-500/60',
  emergency: 'bg-red-950/70 border-red-600/80',
};

const alertLevelTextColors: Record<AlertLevel | 'normal', string> = {
  normal: 'text-gray-200',
  notice: 'text-yellow-300',
  warning: 'text-orange-300',
  severe: 'text-red-300',
  emergency: 'text-red-400',
};

const alertLevelLabels: Record<AlertLevel | 'normal', string> = {
  normal: '正常',
  notice: '提示',
  warning: '警告',
  severe: '严重',
  emergency: '紧急',
};

function DataCard({
  point,
  selected,
  onClick,
}: {
  point: MonitoringPoint;
  selected: boolean;
  onClick: () => void;
}) {
  const { getCurrentReadingByPointId } = useMonitorStore();
  const realtime = getCurrentReadingByPointId(point.id);
  if (!realtime) return null;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl p-4 cursor-pointer border transition-all duration-300 ${alertLevelBgColors[realtime.alertLevel]} ${
        selected ? 'ring-2 ring-cyan-400 scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
    >
      {realtime.alertLevel !== 'normal' && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            animation: 'pulse 2s ease-in-out infinite',
            boxShadow: `0 0 20px ${realtime.alertLevel === 'emergency' ? 'rgba(220, 38, 38, 0.5)' :
              realtime.alertLevel === 'severe' ? 'rgba(248, 113, 113, 0.4)' :
              realtime.alertLevel === 'warning' ? 'rgba(251, 146, 60, 0.4)' :
              'rgba(251, 191, 36, 0.3)'}`,
          }}
        />
      )}
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-medium text-sm">{point.name}</h3>
          <span className={`text-xs px-1.5 py-0.5 rounded ${realtime.alertLevel !== 'normal' ? 'bg-black/30' : 'bg-gray-700/50'} ${alertLevelTextColors[realtime.alertLevel]}`}>
            {alertLevelLabels[realtime.alertLevel]}
          </span>
        </div>
        <div className={`text-3xl font-bold font-mono mb-1 ${alertLevelTextColors[realtime.alertLevel]}`}>
          {realtime.doseRate}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{realtime.unit}</span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {dayjs(realtime.timestamp).format('HH:mm:ss')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RealtimeData() {
  const {
    monitoringPoints,
    currentReadings,
    historyReadings,
    alerts,
    selectedPointId,
    setSelectedPointId,
    getPointById,
    getCurrentReadingByPointId,
    getHistoryReadingsByPointId,
  } = useMonitorStore();

  const [, setTick] = useState(0);
  const abnormalListRef = useRef<HTMLDivElement>(null);
  const abnormalItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (monitoringPoints.length > 0 && !selectedPointId) {
      const onlinePoint = monitoringPoints.find(p => p.status === 'online');
      if (onlinePoint) setSelectedPointId(onlinePoint.id);
    }
  }, [monitoringPoints, selectedPointId, setSelectedPointId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedPointId) {
      const el = abnormalItemRefs.current.get(selectedPointId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedPointId]);

  const handleChartClick = useCallback((params: any) => {
    if (params?.data && params.data[2] && selectedPointId) {
      const el = abnormalItemRefs.current.get(selectedPointId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedPointId]);

  const selectedPoint = selectedPointId ? getPointById(selectedPointId) : null;
  const selectedRealtime = selectedPointId ? getCurrentReadingByPointId(selectedPointId) : null;

  const trendData = useMemo(() => {
    if (!selectedPointId) return { readings: [], abnormalPoints: [] };
    const history = getHistoryReadingsByPointId(selectedPointId);
    const now = dayjs();
    const twentyFourHoursAgo = now.subtract(24, 'hour');
    const recentReadings = history
      .filter(r => dayjs(r.timestamp).isAfter(twentyFourHoursAgo))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const abnormalPoints = recentReadings
      .filter(r => r.isAbnormal || r.alertLevel !== 'normal')
      .map(r => ({
        time: r.timestamp,
        value: r.doseRate,
        alertLevel: r.alertLevel,
        unit: r.unit,
        pointId: r.pointId,
      }));

    return { readings: recentReadings, abnormalPoints };
  }, [selectedPointId, historyReadings, getHistoryReadingsByPointId]);

  const miniTrendOption = useMemo(() => {
    const markPointData = trendData.abnormalPoints.map(p => ({
      coord: [p.time, p.value],
      value: alertLevelLabels[p.alertLevel] || '异常',
      itemStyle: {
        color: p.alertLevel === 'emergency' || p.alertLevel === 'severe' ? '#ef4444'
          : p.alertLevel === 'warning' ? '#f59e0b' : '#eab308',
      },
    }));

    return {
      backgroundColor: 'transparent',
      grid: { left: 60, right: 20, top: 20, bottom: 40 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        borderColor: '#374151',
        textStyle: { color: '#e5e7eb' },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';
          const p = params[0];
          const isAbnormal = p.data[2];
          const alertLabel = p.data[3];
          return `${dayjs(p.value[0]).format('YYYY-MM-DD HH:mm')}<br/>
                  剂量率: <b>${p.value[1]} nSv/h</b>${isAbnormal ? `<br/><span style="color:#ef4444">⚠ ${alertLabel}</span>` : ''}`;
        },
      },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: '#4b5563' } },
        axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => dayjs(v).format('HH:mm') },
        name: '时间',
        nameTextStyle: { color: '#9ca3af', fontSize: 11 },
        nameLocation: 'middle',
        nameGap: 25,
      },
      yAxis: {
        type: 'value',
        name: 'nSv/h',
        nameTextStyle: { color: '#9ca3af', fontSize: 11 },
        nameLocation: 'end',
        nameGap: 10,
        axisLine: { lineStyle: { color: '#4b5563' } },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: (val: number[]) => (val[2] ? 8 : 3),
          lineStyle: { color: '#22d3ee', width: 2 },
          itemStyle: {
            color: (params: any) => {
              const isAbnormal = params.data[2];
              if (!isAbnormal) return '#22d3ee';
              const level = params.data[3];
              return level === 'emergency' || level === 'severe' ? '#ef4444'
                : level === 'warning' ? '#f59e0b' : '#eab308';
            },
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(34, 211, 238, 0.35)' },
                { offset: 1, color: 'rgba(34, 211, 238, 0.02)' },
              ],
            },
          },
          markPoint: {
            symbol: 'pin',
            symbolSize: 35,
            label: { show: true, color: '#fff', fontSize: 10 },
            data: markPointData,
            animation: true,
          },
          data: trendData.readings.map(r => [
            r.timestamp,
            r.doseRate,
            r.isAbnormal || r.alertLevel !== 'normal',
            r.alertLevel,
          ]),
        },
      ],
    };
  }, [trendData]);

  const abnormalData = currentReadings
    .filter(r => r.alertLevel !== 'normal')
    .map(r => ({ ...r, point: getPointById(r.pointId) }))
    .filter(r => r.point);

  const activeAlerts = alerts.filter(a => a.status === 'pending' || a.status === 'processing');

  return (
    <div className="text-text-primary">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">实时数据大屏</h1>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <span className="text-sm text-gray-400">实时更新中</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {monitoringPoints.map(point => (
          <DataCard
            key={point.id}
            point={point}
            selected={selectedPointId === point.id}
            onClick={() => setSelectedPointId(point.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gray-800/60 backdrop-blur rounded-xl border border-gray-700/50 p-5">
          <h3 className="text-lg font-semibold mb-4">
            {selectedPoint ? selectedPoint.name : '选择监测点查看详情'}
          </h3>
          {selectedPoint && selectedRealtime ? (
            <>
              <div className="flex items-end gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">当前剂量率</p>
                  <p className={`text-5xl font-bold font-mono ${alertLevelTextColors[selectedRealtime.alertLevel]}`}>
                    {selectedRealtime.doseRate}
                  </p>
                  <p className="text-gray-500 mt-1">{selectedRealtime.unit}</p>
                </div>
                <div className="flex items-center gap-1 pb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${alertLevelBgColors[selectedRealtime.alertLevel]} ${alertLevelTextColors[selectedRealtime.alertLevel]} border`}>
                    {alertLevelLabels[selectedRealtime.alertLevel]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Thermometer className="w-4 h-4" />
                    温度
                  </div>
                  <p className="text-2xl font-semibold font-mono">{selectedRealtime.temperature}°C</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Droplets className="w-4 h-4" />
                    湿度
                  </div>
                  <p className="text-2xl font-semibold font-mono">{selectedRealtime.humidity}%</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Activity className="w-4 h-4" />
                    累积剂量
                  </div>
                  <p className="text-2xl font-semibold font-mono">{selectedRealtime.accumulatedDose} mSv</p>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-2">近24小时趋势</p>
              <ReactECharts option={miniTrendOption} style={{ height: 200 }} onEvents={{ click: handleChartClick }} />
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              请从上方选择一个监测点
            </div>
          )}
        </div>

        <div className="bg-gray-800/60 backdrop-blur rounded-xl border border-gray-700/50 p-5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            异常数据列表
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {abnormalData.length > 0 ? (
              abnormalData.map(item => (
                <div
                  key={item.pointId}
                  ref={(el) => { if (el) abnormalItemRefs.current.set(item.pointId, el); }}
                  onClick={() => setSelectedPointId(item.pointId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${alertLevelBgColors[item.alertLevel]} ${selectedPointId === item.pointId ? 'ring-2 ring-cyan-400' : ''}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-white text-sm font-medium">{item.point?.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${alertLevelTextColors[item.alertLevel]}`}>
                      {alertLevelLabels[item.alertLevel]}
                    </span>
                  </div>
                  <div className={`text-xl font-bold font-mono mb-1 ${alertLevelTextColors[item.alertLevel]}`}>
                    {item.doseRate} {item.unit}
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无异常数据</p>
              </div>
            )}
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                ref={(el) => { if (el) abnormalItemRefs.current.set(alert.pointId, el); }}
                onClick={() => setSelectedPointId(alert.pointId)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${alertLevelBgColors[alert.level]} ${selectedPointId === alert.pointId ? 'ring-2 ring-cyan-400' : ''}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-white text-sm font-medium">{alert.pointName}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${alertLevelTextColors[alert.level]}`}>
                    {alertLevelLabels[alert.level]}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mb-1">{alert.description}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {dayjs(alert.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
