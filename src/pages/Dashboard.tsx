import ReactECharts from 'echarts-for-react';
import { Activity, AlertTriangle, Radio, Wrench, ChevronRight } from 'lucide-react';
import { useMonitorStore, type AlertLevel } from '@/store/useMonitorStore';
import dayjs from 'dayjs';

const alertLevelColors: Record<AlertLevel, string> = {
  normal: 'text-gray-400',
  hint: 'text-yellow-400',
  warning: 'text-orange-400',
  severe: 'text-red-300',
  urgent: 'text-red-500',
};

const alertLevelBgColors: Record<AlertLevel, string> = {
  normal: 'bg-gray-500/20',
  hint: 'bg-yellow-500/20',
  warning: 'bg-orange-500/20',
  severe: 'bg-red-400/20',
  urgent: 'bg-red-600/20',
};

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subValue && <p className="text-gray-500 text-xs mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    monitorPoints,
    alerts,
    hourlyTrend,
    getOnlineCount,
    getAverageDoseRate,
    getActiveAlertCount,
    getPendingCalibrationCount,
    getAlertLevelDistribution,
  } = useMonitorStore();

  const trendOption = {
    backgroundColor: 'transparent',
    grid: { left: 50, right: 20, top: 30, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(31, 41, 55, 0.95)',
      borderColor: '#374151',
      textStyle: { color: '#e5e7eb' },
      formatter: (params: any) => {
        const p = params[0];
        return `${dayjs(p.value[0]).format('HH:mm')}<br/>剂量率: <b>${p.value[1]} μSv/h</b>`;
      },
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#4b5563' } },
      axisLabel: { color: '#9ca3af', formatter: (v: number) => dayjs(v).format('HH:00') },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'μSv/h',
      nameTextStyle: { color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#4b5563' } },
      axisLabel: { color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#22d3ee', width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(34, 211, 238, 0.35)' },
              { offset: 1, color: 'rgba(34, 211, 238, 0)' },
            ],
          },
        },
        data: hourlyTrend.map(p => [p.time, p.value]),
      },
    ],
  };

  const distribution = getAlertLevelDistribution();
  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(31, 41, 55, 0.95)',
      borderColor: '#374151',
      textStyle: { color: '#e5e7eb' },
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#9ca3af' },
      itemWidth: 12,
      itemHeight: 12,
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          { value: distribution.hint, name: '提示', itemStyle: { color: '#fbbf24' } },
          { value: distribution.warning, name: '警告', itemStyle: { color: '#fb923c' } },
          { value: distribution.severe, name: '严重', itemStyle: { color: '#f87171' } },
          { value: distribution.urgent, name: '紧急', itemStyle: { color: '#dc2626' } },
        ].filter(d => d.value > 0),
      },
    ],
  };

  const recentAlerts = [...alerts].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 6);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">系统概览</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Radio}
          label="监测点总数 / 在线"
          value={`${monitorPoints.length} / ${getOnlineCount()}`}
          subValue={`离线 ${monitorPoints.length - getOnlineCount()} 台`}
          color="bg-cyan-500/20"
        />
        <StatCard
          icon={Activity}
          label="当前平均剂量率"
          value={`${getAverageDoseRate()} μSv/h`}
          subValue="正常范围: 0.05 ~ 0.30"
          color="bg-green-500/20"
        />
        <StatCard
          icon={AlertTriangle}
          label="活跃预警数"
          value={getActiveAlertCount()}
          subValue="待处理预警"
          color="bg-orange-500/20"
        />
        <StatCard
          icon={Wrench}
          label="待校准设备数"
          value={getPendingCalibrationCount()}
          subValue="超过3个月未校准"
          color="bg-purple-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">最近24小时剂量率趋势</h3>
            <span className="text-sm text-gray-400">单位: μSv/h</span>
          </div>
          <ReactECharts option={trendOption} style={{ height: 300 }} />
        </div>

        <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4">预警级别分布</h3>
          <ReactECharts option={pieOption} style={{ height: 300 }} />
        </div>
      </div>

      <div className="bg-gray-800/60 backdrop-blur rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold">最近预警</h3>
          <button className="text-cyan-400 text-sm flex items-center gap-1 hover:text-cyan-300 transition-colors">
            查看全部 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700/50">
                <th className="text-left py-3 px-5 font-medium">时间</th>
                <th className="text-left py-3 px-5 font-medium">监测点</th>
                <th className="text-left py-3 px-5 font-medium">级别</th>
                <th className="text-left py-3 px-5 font-medium">剂量率</th>
                <th className="text-left py-3 px-5 font-medium">描述</th>
                <th className="text-left py-3 px-5 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.map(alert => (
                <tr key={alert.id} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-5 text-gray-300 text-sm">{alert.time}</td>
                  <td className="py-3 px-5 text-white">{alert.pointName}</td>
                  <td className="py-3 px-5">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${alertLevelBgColors[alert.level]} ${alertLevelColors[alert.level]}`}>
                      {alert.level === 'hint' && '提示'}
                      {alert.level === 'warning' && '警告'}
                      {alert.level === 'severe' && '严重'}
                      {alert.level === 'urgent' && '紧急'}
                    </span>
                  </td>
                  <td className={`py-3 px-5 font-mono ${alertLevelColors[alert.level]}`}>{alert.doseRate} μSv/h</td>
                  <td className="py-3 px-5 text-gray-300 text-sm">{alert.message}</td>
                  <td className="py-3 px-5">
                    <span className={`text-xs ${alert.handled ? 'text-green-400' : 'text-yellow-400'}`}>
                      {alert.handled ? '已处理' : '待处理'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
