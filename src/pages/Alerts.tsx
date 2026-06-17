import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Select, Modal } from '@/components/ui';
import { AlertTriangle, Search, Clock, MapPin, Activity, CheckCircle2, XCircle, Eye, RotateCcw, AlertOctagon, AlertCircle, Info, ExternalLink, TrendingUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMonitorStore } from '@/store/useMonitorStore';
import type { Alert, AlertLevel, AlertStatus } from '@/types';
import dayjs from 'dayjs';

const levelConfig: Record<AlertLevel, { color: string; label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'notice' | 'default'; icon: typeof AlertTriangle }> = {
  normal: { color: 'bg-[var(--color-accent-success)]', label: '正常', variant: 'success', icon: Info },
  notice: { color: 'bg-[var(--color-accent-primary)]', label: '注意', variant: 'primary', icon: Info },
  warning: { color: 'bg-[var(--color-accent-warning)]', label: '警告', variant: 'warning', icon: AlertCircle },
  severe: { color: 'bg-[var(--color-accent-notice)]', label: '严重', variant: 'notice', icon: AlertTriangle },
  emergency: { color: 'bg-[var(--color-accent-danger)]', label: '紧急', variant: 'danger', icon: AlertOctagon },
};

const statusConfig: Record<AlertStatus, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'notice' | 'default' }> = {
  pending: { label: '待处理', variant: 'danger' },
  processing: { label: '处理中', variant: 'primary' },
  resolved: { label: '已解决', variant: 'success' },
  ignored: { label: '已忽略', variant: 'default' },
};

export default function Alerts() {
  const alerts = useMonitorStore((state) => state.alerts);
  const updateAlertStatus = useMonitorStore((state) => state.updateAlertStatus);
  const monitoringPoints = useMonitorStore((state) => state.monitoringPoints);
  const historyReadings = useMonitorStore((state) => state.historyReadings);
  const emergencyRecords = useMonitorStore((state) => state.emergencyRecords);
  const getPointById = useMonitorStore((state) => state.getPointById);
  const getHistoryReadingsByPointId = useMonitorStore((state) => state.getHistoryReadingsByPointId);
  const navigate = useNavigate();

  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [handleModalOpen, setHandleModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [handler, setHandler] = useState('');
  const [resolution, setResolution] = useState('');

  const stats = useMemo(() => {
    return {
      emergency: alerts.filter((a) => a.level === 'emergency').length,
      severe: alerts.filter((a) => a.level === 'severe').length,
      warning: alerts.filter((a) => a.level === 'warning').length,
      notice: alerts.filter((a) => a.level === 'notice').length,
      pending: alerts.filter((a) => a.status === 'pending').length,
    };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (levelFilter !== 'all' && alert.level !== levelFilter) return false;
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
      if (searchQuery && !alert.pointName.includes(searchQuery) && !alert.description.includes(searchQuery)) return false;
      return true;
    });
  }, [alerts, levelFilter, statusFilter, searchQuery, timeRange]);

  const openHandleModal = (alert: Alert) => {
    setSelectedAlert(alert);
    setHandler('');
    setResolution('');
    setHandleModalOpen(true);
  };

  const openDetailModal = (alert: Alert) => {
    setSelectedAlert(alert);
    setDetailModalOpen(true);
  };

  const handleResolve = () => {
    if (selectedAlert && handler && resolution) {
      updateAlertStatus(selectedAlert.id, 'resolved', handler, resolution);
      setHandleModalOpen(false);
      setSelectedAlert(null);
    }
  };

  const handleIgnore = (alert: Alert) => {
    updateAlertStatus(alert.id, 'ignored', '系统', '手动忽略');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">异常预警管理</h1>
        <Badge variant="danger" className="text-base px-4 py-1">
          <AlertTriangle className="w-4 h-4 mr-1" />
          待处理: {stats.pending}
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {(['emergency', 'severe', 'warning', 'notice'] as AlertLevel[]).map((level) => {
          const config = levelConfig[level];
          const Icon = config.icon;
          return (
            <Card key={level} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">{config.label}预警</p>
                    <p className="text-3xl font-bold mt-1 text-[var(--color-text-primary)]">{stats[level]}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.color} bg-opacity-20`}>
                    <Icon className="w-6 h-6" style={{ color: config.color.includes('danger') ? 'var(--color-accent-danger)' : config.color.includes('notice') ? 'var(--color-accent-notice)' : config.color.includes('warning') ? 'var(--color-accent-warning)' : 'var(--color-accent-primary)' }} />
                  </div>
                </div>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${config.color}`} />
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-secondary)]">预警级别</label>
              <Select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="w-36">
                <option value="all">全部</option>
                <option value="emergency">紧急</option>
                <option value="severe">严重</option>
                <option value="warning">警告</option>
                <option value="notice">注意</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-secondary)]">处理状态</label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
                <option value="all">全部</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="resolved">已解决</option>
                <option value="ignored">已忽略</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-secondary)]">时间范围</label>
              <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="w-36">
                <option value="all">全部</option>
                <option value="today">今天</option>
                <option value="week">近7天</option>
                <option value="month">近30天</option>
              </Select>
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-sm text-[var(--color-text-secondary)]">搜索</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <Input
                  placeholder="搜索监测点名称或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const lc = levelConfig[alert.level];
          const sc = statusConfig[alert.status];
          return (
            <Card key={alert.id} className="relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${lc.color}`} />
              <CardContent className="p-5 pl-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={lc.variant} className="text-xs">
                        {lc.label}
                      </Badge>
                      <h3 className="font-semibold text-[var(--color-text-primary)] truncate">{alert.description}</h3>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {alert.pointName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4" />
                        当前值: <span className="text-[var(--color-accent-danger)] font-medium">{alert.value}</span> {alert.unit}
                        <span className="mx-1">/</span>
                        阈值: {alert.threshold} {alert.unit}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {alert.timestamp}
                      </span>
                      {alert.handler && (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          处理人: {alert.handler}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={sc.variant as 'secondary'} className="text-xs">
                      {sc.label}
                    </Badge>
                    {alert.status === 'pending' && (
                      <>
                        <Button size="sm" variant="default" onClick={() => openHandleModal(alert)}>
                          <CheckCircle2 className="w-4 h-4" />
                          处理
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleIgnore(alert)}>
                          <XCircle className="w-4 h-4" />
                          忽略
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => openDetailModal(alert)}>
                      <Eye className="w-4 h-4" />
                      详情
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-[var(--color-text-secondary)]">
              <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无符合条件的预警记录</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal open={handleModalOpen} onClose={() => setHandleModalOpen(false)} title="处理预警">
        <div className="space-y-4">
          {selectedAlert && (
            <div className="p-3 rounded-md bg-[var(--color-bg-tertiary)]">
              <p className="text-sm text-[var(--color-text-secondary)]">{selectedAlert.description}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {selectedAlert.pointName} · {selectedAlert.timestamp}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">处理人</label>
            <Input placeholder="请输入处理人姓名" value={handler} onChange={(e) => setHandler(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">处理措施</label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent-primary)]"
              placeholder="请详细描述处理措施..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setHandleModalOpen(false)}>
              取消
            </Button>
            <Button variant="success" onClick={handleResolve} disabled={!handler || !resolution}>
              确认处理
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="处置闭环视图" className="max-w-3xl">
        {selectedAlert && (() => {
          const point = getPointById(selectedAlert.pointId);
          const pointHistory = point ? getHistoryReadingsByPointId(selectedAlert.pointId) : [];
          const recentHistory = pointHistory
            .filter(r => dayjs(r.timestamp).isAfter(dayjs().subtract(24, 'hour')))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          const relatedEmergency = emergencyRecords.find(
            e => e.pointIds?.includes(selectedAlert.pointId) && e.status === 'active'
          );
          const trendOption = {
            backgroundColor: 'transparent',
            grid: { left: 50, right: 15, top: 15, bottom: 30 },
            tooltip: {
              trigger: 'axis',
              backgroundColor: 'rgba(31, 41, 55, 0.95)',
              borderColor: '#374151',
              textStyle: { color: '#e5e7eb' },
              formatter: (params: any) => {
                const p = params[0];
                return `${dayjs(p.value[0]).format('HH:mm')}<br/>剂量率: <b>${p.value[1]} nSv/h</b>`;
              },
            },
            xAxis: {
              type: 'time',
              axisLine: { lineStyle: { color: '#4b5563' } },
              axisLabel: { color: '#9ca3af', fontSize: 10, formatter: (v: number) => dayjs(v).format('HH:mm') },
            },
            yAxis: {
              type: 'value',
              name: 'nSv/h',
              nameTextStyle: { color: '#9ca3af', fontSize: 10 },
              axisLine: { lineStyle: { color: '#4b5563' } },
              axisLabel: { color: '#9ca3af', fontSize: 10 },
              splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
            },
            series: [{
              type: 'line',
              smooth: true,
              symbol: 'none',
              lineStyle: { color: '#22d3ee', width: 2 },
              areaStyle: {
                color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [{ offset: 0, color: 'rgba(34,211,238,0.3)' }, { offset: 1, color: 'rgba(34,211,238,0)' }]
                }
              },
              data: recentHistory.map(r => [r.timestamp, r.doseRate]),
            }],
          };
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={levelConfig[selectedAlert.level].variant}>{levelConfig[selectedAlert.level].label}</Badge>
                <Badge variant={statusConfig[selectedAlert.status].variant as 'secondary'}>{statusConfig[selectedAlert.status].label}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--color-text-muted)]">监测点</p>
                  <p className="text-[var(--color-text-primary)] font-medium">{selectedAlert.pointName}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">发生时间</p>
                  <p className="text-[var(--color-text-primary)] font-medium">{selectedAlert.timestamp}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">当前值 / 阈值</p>
                  <p className="font-medium">
                    <span className="text-[var(--color-accent-danger)]">{selectedAlert.value} {selectedAlert.unit}</span>
                    <span className="mx-1 text-[var(--color-text-muted)]">/</span>
                    {selectedAlert.threshold} {selectedAlert.unit}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">描述</p>
                  <p className="text-[var(--color-text-primary)]">{selectedAlert.description}</p>
                </div>
              </div>

              {point && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--color-accent-notice)]" />
                      关联监测点信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-[var(--color-text-muted)]">区域</p>
                      <p className="font-medium">{point.location.district}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-muted)]">设备型号</p>
                      <p className="font-medium">{point.device.model}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-muted)]">状态</p>
                      <p className="font-medium">{point.status === 'online' ? '在线' : point.status === 'offline' ? '离线' : '维护'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-muted)]">本底值</p>
                      <p className="font-mono">{point.backgroundValue} nSv/h</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-muted)]">最近校准</p>
                      <p className="font-medium">{dayjs(point.lastCalibrationDate).format('YYYY-MM-DD')}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-muted)]">电量/信号</p>
                      <p className="font-mono">{point.batteryLevel}% / {point.signalStrength}%</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {recentHistory.length > 0 && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[var(--color-accent-primary)]" />
                      近24小时剂量率趋势
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ReactECharts option={trendOption} style={{ height: 160 }} />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    处置状态
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {selectedAlert.handler ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--color-text-muted)]" />
                        <span className="text-[var(--color-text-muted)]">处理人:</span>
                        <span className="font-medium">{selectedAlert.handler}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                        <span className="text-[var(--color-text-muted)]">处理时间:</span>
                        <span className="font-medium">{selectedAlert.resolvedAt || '-'}</span>
                      </div>
                      {selectedAlert.resolution && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-success)] mt-0.5" />
                          <span className="text-[var(--color-text-muted)]">处理措施:</span>
                          <span>{selectedAlert.resolution}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[var(--color-text-muted)]">尚未指定处理人，请点击"处理"按钮分配</p>
                  )}
                </CardContent>
              </Card>

              {relatedEmergency && (
                <div className="p-3 rounded-lg border border-[var(--color-accent-primary)]/30 bg-[var(--color-accent-primary)]/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-[var(--color-accent-danger)]" />
                      <span className="text-sm font-medium">该预警已进入应急流程</span>
                      <Badge variant={levelConfig[relatedEmergency.level].variant}>{levelConfig[relatedEmergency.level].label}</Badge>
                    </div>
                    <Button size="sm" onClick={() => { setDetailModalOpen(false); navigate('/emergency'); }}>
                      <ExternalLink className="w-4 h-4" />
                      前往处置
                    </Button>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2">{relatedEmergency.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    负责人: {relatedEmergency.commander} · 进度: {relatedEmergency.steps.filter(s => s.status === 'completed').length}/{relatedEmergency.steps.length}
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
