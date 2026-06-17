import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, List, Search, Filter, Battery, Wifi, Eye, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonitorStore, type MonitorPointStatus, type AlertLevel } from '@/store/useMonitorStore';

const statusColors: Record<MonitorPointStatus, string> = {
  online: '#22c55e',
  offline: '#6b7280',
  maintenance: '#eab308',
  fault: '#ef4444',
};

const statusLabels: Record<MonitorPointStatus, string> = {
  online: '在线',
  offline: '离线',
  maintenance: '维护',
  fault: '故障',
};

const statusBadgeColors: Record<MonitorPointStatus, string> = {
  online: 'bg-green-500/20 text-green-400 border-green-500/30',
  offline: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  maintenance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  fault: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function Badge({ status }: { status: MonitorPointStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusBadgeColors[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: statusColors[status] }} />
      {statusLabels[status]}
    </span>
  );
}

function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px ${color};
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

export default function MonitoringPoints() {
  const { monitorPoints, getRealtimeByPointId } = useMonitorStore();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<MonitorPointStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredPoints = useMemo(() => {
    return monitorPoints.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.code.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [monitorPoints, searchText, statusFilter]);

  const paginatedPoints = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPoints.slice(start, start + pageSize);
  }, [filteredPoints, page]);

  const totalPages = Math.max(1, Math.ceil(filteredPoints.length / pageSize));

  const center: [number, number] = [39.9042, 116.4074];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">监测点位管理</h1>
        <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg p-1 border border-gray-700/50">
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'map' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            地图视图
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            列表视图
          </button>
        </div>
      </div>

      {view === 'list' && (
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索监测点名称或编号..."
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as MonitorPointStatus | 'all'); setPage(1); }}
              className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="all">全部状态</option>
              <option value="online">在线</option>
              <option value="offline">离线</option>
              <option value="maintenance">维护</option>
              <option value="fault">故障</option>
            </select>
          </div>
        </div>
      )}

      {view === 'map' ? (
        <div className="bg-gray-800/60 backdrop-blur rounded-xl border border-gray-700/50 overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {monitorPoints.map(point => {
              const realtime = getRealtimeByPointId(point.id);
              return (
                <Marker
                  key={point.id}
                  position={[point.lat, point.lng]}
                  icon={createColoredIcon(statusColors[point.status])}
                >
                  <Popup>
                    <div className="text-gray-900 min-w-[220px]">
                      <h4 className="font-bold text-base mb-2">{point.name}</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-500">编号：</span>{point.code}</p>
                        <p><span className="text-gray-500">地址：</span>{point.address}</p>
                        <p><span className="text-gray-500">设备型号：</span>{point.deviceModel}</p>
                        <p><span className="text-gray-500">当前剂量率：</span>
                          <span className="font-mono font-semibold text-cyan-600">
                            {realtime ? `${realtime.doseRate} μSv/h` : '--'}
                          </span>
                        </p>
                        <p><span className="text-gray-500">状态：</span>{statusLabels[point.status]}</p>
                        <p className="flex items-center gap-1">
                          <Battery className="w-3.5 h-3.5" />
                          <span className="text-gray-500">电量：</span>{point.battery}%
                        </p>
                        <p className="flex items-center gap-1">
                          <Wifi className="w-3.5 h-3.5" />
                          <span className="text-gray-500">信号：</span>{point.signal}%
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      ) : (
        <div className="bg-gray-800/60 backdrop-blur rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700/50 bg-gray-800/40">
                  <th className="text-left py-3 px-5 font-medium">名称</th>
                  <th className="text-left py-3 px-5 font-medium">编号</th>
                  <th className="text-left py-3 px-5 font-medium">区域</th>
                  <th className="text-left py-3 px-5 font-medium">设备型号</th>
                  <th className="text-left py-3 px-5 font-medium">状态</th>
                  <th className="text-left py-3 px-5 font-medium">电量</th>
                  <th className="text-left py-3 px-5 font-medium">信号</th>
                  <th className="text-left py-3 px-5 font-medium">本底值</th>
                  <th className="text-left py-3 px-5 font-medium">上次校准</th>
                  <th className="text-left py-3 px-5 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPoints.map(point => (
                  <tr key={point.id} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-5 text-white font-medium">{point.name}</td>
                    <td className="py-3 px-5 text-gray-300 font-mono text-sm">{point.code}</td>
                    <td className="py-3 px-5 text-gray-300">{point.area}</td>
                    <td className="py-3 px-5 text-gray-300">{point.deviceModel}</td>
                    <td className="py-3 px-5"><Badge status={point.status} /></td>
                    <td className="py-3 px-5 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Battery className={`w-4 h-4 ${point.battery < 30 ? 'text-red-400' : point.battery < 60 ? 'text-yellow-400' : 'text-green-400'}`} />
                        <span>{point.battery}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-cyan-400" />
                        <span>{point.signal}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-gray-300 font-mono">{point.backgroundValue} μSv/h</td>
                    <td className="py-3 px-5 text-gray-300 text-sm">{point.lastCalibration}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-md bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300 transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedPoints.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-500">暂无匹配的监测点</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-700/50">
            <span className="text-sm text-gray-400">
              共 <span className="text-white font-medium">{filteredPoints.length}</span> 条记录
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-300 px-3">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
