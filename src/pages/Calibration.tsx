import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Input, Modal } from '@/components/ui';
import { Wrench, Database, LineChart, AlertCircle, CheckCircle2, XCircle, Clock, Calendar, Edit2, User, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { useMonitorStore } from '@/store/useMonitorStore';
import type { BackgroundValue } from '@/types';

const resultConfig: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'notice' | 'default' }> = {
  pass: { label: '合格', variant: 'success' },
  fail: { label: '不合格', variant: 'danger' },
  conditional: { label: '条件合格', variant: 'notice' },
};

export default function Calibration() {
  const [activeTab, setActiveTab] = useState('calibration');
  const calibrationRecords = useMonitorStore((state) => state.calibrationRecords);
  const backgroundValues = useMonitorStore((state) => state.backgroundValues);
  const qualityControlReports = useMonitorStore((state) => state.qualityControlReports);
  const monitoringPoints = useMonitorStore((state) => state.monitoringPoints);
  const updateBackgroundValue = useMonitorStore((state) => state.updateBackgroundValue);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBg, setSelectedBg] = useState<BackgroundValue | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editOperator, setEditOperator] = useState('');

  const upcomingCalibrations = monitoringPoints
    .filter((p) => p.status !== 'offline')
    .map((p) => {
      const daysLeft = Math.ceil((new Date(p.nextCalibrationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const totalDays = 180;
      return { ...p, daysLeft, progress: Math.max(0, Math.min(100, (daysLeft / totalDays) * 100)) };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4);

  const handleEditBg = (bg: BackgroundValue) => {
    setSelectedBg(bg);
    setEditValue(String(bg.value));
    setEditOperator('');
    setEditModalOpen(true);
  };

  const handleSaveBg = () => {
    if (selectedBg && editValue && editOperator) {
      updateBackgroundValue(selectedBg.id, parseFloat(editValue), editOperator);
      setEditModalOpen(false);
      setSelectedBg(null);
    }
  };

  const bgTrendOption = selectedBg ? {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: selectedBg.history.map((h) => h.date),
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
    series: [{
      data: selectedBg.history.map((h) => h.value),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: 'var(--color-accent-primary)', width: 3 },
      itemStyle: { color: 'var(--color-accent-primary)' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(69,123,157,0.3)' }, { offset: 1, color: 'rgba(69,123,157,0)' }] } },
    }],
  } : null;

  const completenessOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: qualityControlReports.map((r) => r.date.slice(5)),
      axisLine: { lineStyle: { color: 'var(--color-border)' } },
      axisLabel: { color: 'var(--color-text-muted)' },
    },
    yAxis: {
      type: 'value',
      min: 95,
      max: 100,
      name: '%',
      nameTextStyle: { color: 'var(--color-text-muted)' },
      axisLine: { lineStyle: { color: 'var(--color-border)' } },
      axisLabel: { color: 'var(--color-text-muted)' },
      splitLine: { lineStyle: { color: 'var(--color-border)', type: 'dashed' } },
    },
    series: [{
      data: qualityControlReports.map((r) => r.completeness),
      type: 'bar',
      barWidth: '50%',
      itemStyle: {
        color: (params: any) => params.value >= 99 ? 'var(--color-accent-success)' : params.value >= 98 ? 'var(--color-accent-warning)' : 'var(--color-accent-danger)',
        borderRadius: [4, 4, 0, 0],
      },
    }],
  };

  const renderProgressRing = (progress: number, daysLeft: number) => {
    const circumference = 2 * Math.PI * 36;
    const offset = circumference - (progress / 100) * circumference;
    const color = daysLeft <= 7 ? 'var(--color-accent-danger)' : daysLeft <= 30 ? 'var(--color-accent-notice)' : 'var(--color-accent-success)';
    return (
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90">
          <circle cx="40" cy="40" r="36" stroke="var(--color-bg-tertiary)" strokeWidth="6" fill="none" />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{daysLeft}</span>
          <span className="text-[10px] text-[var(--color-text-muted)]">天</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">设备校准管理</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calibration">
            <Wrench className="w-4 h-4 mr-2" />
            校准管理
          </TabsTrigger>
          <TabsTrigger value="background">
            <Database className="w-4 h-4 mr-2" />
            本底值管理
          </TabsTrigger>
          <TabsTrigger value="quality">
            <LineChart className="w-4 h-4 mr-2" />
            数据质控
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calibration">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[var(--color-accent-notice)]" />
                  校准周期提醒
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {upcomingCalibrations.map((point) => (
                    <div key={point.id} className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
                      <div className="flex items-center gap-4">
                        {renderProgressRing(point.progress, point.daysLeft)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[var(--color-text-primary)] truncate text-sm">{point.name}</h4>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">{point.code}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-[var(--color-text-secondary)]">
                            <Calendar className="w-3 h-3" />
                            {point.nextCalibrationDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  校准记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>监测点</TableHead>
                      <TableHead>校准日期</TableHead>
                      <TableHead>操作人员</TableHead>
                      <TableHead>校准前值</TableHead>
                      <TableHead>校准后值</TableHead>
                      <TableHead>本底值</TableHead>
                      <TableHead>证书编号</TableHead>
                      <TableHead>结果</TableHead>
                      <TableHead>下次校准</TableHead>
                      <TableHead>备注</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calibrationRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.pointName}</TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">{record.calibrationDate}</TableCell>
                        <TableCell>{record.operator}</TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">{record.beforeValue}</TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">{record.afterValue}</TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">{record.backgroundValue}</TableCell>
                        <TableCell className="text-[var(--color-text-secondary)] font-mono text-xs">{record.certificateNumber}</TableCell>
                        <TableCell>
                          <Badge variant={resultConfig[record.result].variant}>{resultConfig[record.result].label}</Badge>
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">{record.nextCalibrationDate}</TableCell>
                        <TableCell className="text-[var(--color-text-muted)] text-xs max-w-[150px] truncate">{record.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="background">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  本底值列表
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {backgroundValues.map((bg) => (
                    <div
                      key={bg.id}
                      onClick={() => {
                        setSelectedBg(bg);
                      }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedBg?.id === bg.id
                          ? 'border-[var(--color-accent-primary)] bg-[var(--color-bg-tertiary)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-[var(--color-text-primary)]">{bg.pointName}</h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-[var(--color-text-muted)]">
                            <span>更新于 {bg.updatedAt}</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {bg.operator}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-2xl font-bold text-[var(--color-accent-primary)]">{bg.value}</span>
                            <span className="text-sm text-[var(--color-text-muted)] ml-1">{bg.unit}</span>
                          </div>
                          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleEditBg(bg); }}>
                            <Edit2 className="w-4 h-4" />
                            编辑
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[var(--color-accent-success)]" />
                  本底值变化趋势
                  {selectedBg && <span className="text-sm font-normal text-[var(--color-text-secondary)]">- {selectedBg.pointName}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bgTrendOption ? (
                  <div className="h-72">
                    <ReactECharts option={bgTrendOption} style={{ height: '100%', width: '100%' }} />
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-[var(--color-text-secondary)]">
                    <p>请从左侧选择一个监测点查看趋势</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality">
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-success)]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-success)]" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)]">平均完整率</p>
                      <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-0.5">
                        {(qualityControlReports.reduce((s, r) => s + r.completeness, 0) / qualityControlReports.length).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-warning)]/20 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-[var(--color-accent-warning)]" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)]">异常值总数</p>
                      <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-0.5">
                        {qualityControlReports.reduce((s, r) => s + r.abnormalCount, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-notice)]/20 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-[var(--color-accent-notice)]" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)]">缺失数据</p>
                      <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-0.5">
                        {qualityControlReports.reduce((s, r) => s + r.missingCount, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-primary)]/20 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-[var(--color-accent-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)]">已补全</p>
                      <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-0.5">
                        {qualityControlReports.reduce((s, r) => s + r.filledCount, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[var(--color-accent-primary)]" />
                    数据完整率统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ReactECharts option={completenessOption} style={{ height: '100%', width: '100%' }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[var(--color-accent-notice)]" />
                    异常值检测报告
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead>完整率</TableHead>
                        <TableHead>异常值</TableHead>
                        <TableHead>缺失</TableHead>
                        <TableHead>已补全</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qualityControlReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.date}</TableCell>
                          <TableCell>
                            <span className={report.completeness >= 99 ? 'text-[var(--color-accent-success)]' : report.completeness >= 98 ? 'text-[var(--color-accent-warning)]' : 'text-[var(--color-accent-danger)]'}>
                              {report.completeness}%
                            </span>
                          </TableCell>
                          <TableCell className="text-[var(--color-accent-warning)]">{report.abnormalCount}</TableCell>
                          <TableCell className="text-[var(--color-accent-notice)]">{report.missingCount}</TableCell>
                          <TableCell className="text-[var(--color-accent-success)]">{report.filledCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  缺失数据补全记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead>缺失数量</TableHead>
                      <TableHead>已补全</TableHead>
                      <TableHead>补全率</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qualityControlReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>{report.missingCount}</TableCell>
                        <TableCell>{report.filledCount}</TableCell>
                        <TableCell>{report.missingCount > 0 ? ((report.filledCount / report.missingCount) * 100).toFixed(1) : 100}%</TableCell>
                        <TableCell>
                          {report.filledCount >= report.missingCount ? (
                            <Badge variant="success">已完成</Badge>
                          ) : (
                            <Badge variant="notice">进行中</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="编辑本底值">
        <div className="space-y-4">
          {selectedBg && (
            <div className="p-3 rounded-md bg-[var(--color-bg-tertiary)]">
              <p className="font-medium text-[var(--color-text-primary)]">{selectedBg.pointName}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">当前值: {selectedBg.value} {selectedBg.unit}</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">本底值 (nSv/h)</label>
            <Input type="number" step="0.1" value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder="请输入本底值" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">操作人员</label>
            <Input value={editOperator} onChange={(e) => setEditOperator(e.target.value)} placeholder="请输入操作人员姓名" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>取消</Button>
            <Button variant="success" onClick={handleSaveBg} disabled={!editValue || !editOperator}>保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
