import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { AlertTriangle, Users, Activity, MapPin, Clock, CheckCircle2, Circle, CircleDot, ChevronRight, AlertOctagon, User, FileText } from 'lucide-react';
import { useAppStore } from '@/store';
import type { EmergencyRecord, EmergencyStep, AlertLevel } from '@/types';

const levelConfig: Record<AlertLevel, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'notice' | 'default' }> = {
  emergency: { label: '紧急', variant: 'danger' },
  severe: { label: '严重', variant: 'notice' },
  warning: { label: '警告', variant: 'warning' },
  notice: { label: '注意', variant: 'primary' },
};

const stepStatusConfig: Record<EmergencyStep['status'], { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'notice' | 'default'; icon: typeof Circle }> = {
  pending: { label: '未开始', variant: 'default', icon: Circle },
  in_progress: { label: '进行中', variant: 'primary', icon: CircleDot },
  completed: { label: '已完成', variant: 'success', icon: CheckCircle2 },
};

export default function Emergency() {
  const emergencyRecords = useAppStore((state) => state.emergencyRecords);
  const updateEmergencyStep = useAppStore((state) => state.updateEmergencyStep);
  const [selectedRecord, setSelectedRecord] = useState<EmergencyRecord>(emergencyRecords[0]);

  const activeRecords = emergencyRecords.filter((r) => r.status === 'active');
  const historyRecords = emergencyRecords.filter((r) => r.status !== 'active');

  const handleStepClick = (stepId: string) => {
    const step = selectedRecord.steps.find((s) => s.id === stepId);
    if (!step) return;
    if (step.status === 'pending') {
      updateEmergencyStep(selectedRecord.id, stepId, 'in_progress', '当前操作员');
    } else if (step.status === 'in_progress') {
      updateEmergencyStep(selectedRecord.id, stepId, 'completed', '当前操作员');
    }
  };

  const traceChartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['当前监测点', '周边监测点A', '周边监测点B'],
      textStyle: { color: 'var(--color-text-secondary)' },
      top: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['08:00', '08:10', '08:20', '08:30', '08:40', '08:50', '09:00'],
      axisLine: { lineStyle: { color: 'var(--color-border)' } },
      axisLabel: { color: 'var(--color-text-muted)' },
    },
    yAxis: {
      type: 'value',
      name: 'nSv/h',
      nameTextStyle: { color: 'var(--color-text-muted)' },
      axisLine: { lineStyle: { color: 'var(--color-border)' } },
      axisLabel: { color: 'var(--color-text-muted)' },
      splitLine: { lineStyle: { color: 'var(--color-border)', type: 'dashed' } },
    },
    series: [
      {
        name: '当前监测点',
        type: 'line',
        smooth: true,
        data: [85, 120, 280, 850, 620, 450, 380],
        lineStyle: { color: 'var(--color-accent-danger)', width: 2 },
        itemStyle: { color: 'var(--color-accent-danger)' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(230,57,70,0.3)' }, { offset: 1, color: 'rgba(230,57,70,0)' }] } },
      },
      {
        name: '周边监测点A',
        type: 'line',
        smooth: true,
        data: [72, 75, 78, 82, 79, 76, 74],
        lineStyle: { color: 'var(--color-accent-primary)', width: 2 },
        itemStyle: { color: 'var(--color-accent-primary)' },
      },
      {
        name: '周边监测点B',
        type: 'line',
        smooth: true,
        data: [68, 69, 70, 72, 71, 70, 69],
        lineStyle: { color: 'var(--color-accent-success)', width: 2 },
        itemStyle: { color: 'var(--color-accent-success)' },
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">应急处置</h1>
        <Badge variant="danger" className="text-base px-4 py-1">
          <AlertTriangle className="w-4 h-4 mr-1" />
          活跃事件: {activeRecords.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-[var(--color-accent-danger)]" />
                活跃事件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeRecords.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedRecord.id === record.id
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-bg-tertiary)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={levelConfig[record.level].variant}>{levelConfig[record.level].label}</Badge>
                          <Badge variant="danger">进行中</Badge>
                          <h3 className="font-semibold text-[var(--color-text-primary)] truncate">{record.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {record.handler}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {record.team.join('、')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {record.startTime}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0" />
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1.5">
                        <span>处置进度</span>
                        <span>{record.steps.filter((s) => s.status === 'completed').length}/{record.steps.length}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-accent-primary)] rounded-full transition-all"
                          style={{ width: `${(record.steps.filter((s) => s.status === 'completed').length / record.steps.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {activeRecords.length === 0 && (
                  <div className="p-8 text-center text-[var(--color-text-secondary)]">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-[var(--color-accent-success)] opacity-60" />
                    <p>暂无活跃应急事件</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[var(--color-accent-primary)]" />
                应急响应流程
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-[var(--color-border)]" />
                <div className="space-y-1">
                  {selectedRecord?.steps.map((step, index) => {
                    const sc = stepStatusConfig[step.status];
                    const Icon = sc.icon;
                    return (
                      <div
                        key={step.id}
                        onClick={() => handleStepClick(step.id)}
                        className={`relative flex gap-4 p-4 rounded-lg transition-all cursor-pointer ${
                          step.status === 'in_progress' ? 'bg-[var(--color-bg-tertiary)]' : 'hover:bg-[var(--color-bg-tertiary)]/50'
                        }`}
                      >
                        <div className="relative z-10">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center ${
                              step.status === 'completed'
                                ? 'bg-[var(--color-accent-success)] text-black'
                                : step.status === 'in_progress'
                                ? 'bg-[var(--color-accent-primary)] text-white animate-pulse'
                                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[var(--color-text-primary)]">
                              步骤{step.stepNumber}: {step.name}
                            </span>
                            <Badge variant={sc.variant}>{sc.label}</Badge>
                          </div>
                          {step.description && (
                            <p className="text-sm text-[var(--color-text-secondary)] mb-1">{step.description}</p>
                          )}
                          {(step.operator || step.completedAt) && (
                            <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
                              {step.operator && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {step.operator}
                                </span>
                              )}
                              {step.completedAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {step.completedAt}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--color-accent-notice)]" />
                异常溯源分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">相关监测点数据对比</h4>
                <div className="h-56">
                  <ReactECharts option={traceChartOption} style={{ height: '100%', width: '100%' }} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">可能来源分析</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-[var(--color-bg-tertiary)]">
                    <span className="text-sm text-[var(--color-text-primary)]">监测点设备异常</span>
                    <Badge variant="danger">高概率</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-[var(--color-bg-tertiary)]">
                    <span className="text-sm text-[var(--color-text-primary)]">周边临时作业</span>
                    <Badge variant="notice">中概率</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-[var(--color-bg-tertiary)]">
                    <span className="text-sm text-[var(--color-text-primary)]">气象因素</span>
                    <Badge variant="default">低概率</Badge>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">影响范围评估</h4>
                <div className="p-3 rounded-md bg-[var(--color-bg-tertiary)]">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[var(--color-text-muted)]">预估半径</p>
                      <p className="text-[var(--color-text-primary)] font-medium">500米</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-muted)]">涉及监测点</p>
                      <p className="text-[var(--color-text-primary)] font-medium">3个</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-muted)]">影响人口</p>
                      <p className="text-[var(--color-text-primary)] font-medium">约2000人</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-muted)]">风险等级</p>
                      <p className="text-[var(--color-accent-danger)] font-medium">较高</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
            历史处置记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>事件名称</TableHead>
                <TableHead>级别</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>结束时间</TableHead>
                <TableHead>负责人</TableHead>
                <TableHead>处置时长</TableHead>
                <TableHead>溯源结论</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.title}</TableCell>
                  <TableCell>
                    <Badge variant={levelConfig[record.level].variant}>{levelConfig[record.level].label}</Badge>
                  </TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{record.startTime}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{record.endTime}</TableCell>
                  <TableCell>{record.handler}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">3小时35分钟</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)] max-w-[200px] truncate">{record.traceability}</TableCell>
                  <TableCell>
                    <Badge variant="success">已完成</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {historyRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[var(--color-text-secondary)]">
                    暂无历史处置记录
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
