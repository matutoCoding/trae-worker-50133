import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Input, Select, Progress } from '@/components/ui';
import { FileText, Users, Search, Calendar, Eye, Download, FileType2, ChevronRight, Plus, AlertTriangle, Filter, Download as DownloadIcon } from 'lucide-react';
import { useMonitorStore } from '@/store/useMonitorStore';
import type { ReportType } from '@/types';

const reportTypeConfig: Record<ReportType, { label: string }> = {
  daily: { label: '日报' },
  weekly: { label: '周报' },
  monthly: { label: '月报' },
  yearly: { label: '年报' },
  custom: { label: '自定义' },
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState('monitor');
  const reports = useMonitorStore((state) => state.reports);
  const personnelDoses = useMonitorStore((state) => state.personnelDoses);
  const monitoringPoints = useMonitorStore((state) => state.monitoringPoints);
  const historyReadings = useMonitorStore((state) => state.historyReadings);
  const addReport = useMonitorStore((state) => state.addReport);

  const [reportType, setReportType] = useState<ReportType>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [queryStartDate, setQueryStartDate] = useState('');
  const [queryEndDate, setQueryEndDate] = useState('');
  const [queryPoint, setQueryPoint] = useState('all');
  const [queryDataType, setQueryDataType] = useState('all');
  const [queryMinValue, setQueryMinValue] = useState('');
  const [queryMaxValue, setQueryMaxValue] = useState('');
  const [hasQueried, setHasQueried] = useState(false);

  const handleGenerateReport = () => {
    if (!startDate || !endDate) return;
    setIsGenerating(true);
    setTimeout(() => {
      const newReport = {
        id: `r${Date.now()}`,
        type: reportType,
        title: `核辐射环境监测${reportTypeConfig[reportType].label}-${startDate}`,
        startDate,
        endDate,
        generateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        generatedBy: '当前用户',
        summary: {
          totalReadings: Math.floor(Math.random() * 10000) + 1000,
          abnormalCount: Math.floor(Math.random() * 50),
          avgDoseRate: 70 + Math.random() * 20,
          maxDoseRate: 100 + Math.random() * 200,
          pointsOnline: 45 + Math.floor(Math.random() * 5),
          pointsTotal: 50,
        },
        status: 'draft' as const,
      };
      addReport(newReport);
      setIsGenerating(false);
      setStartDate('');
      setEndDate('');
    }, 1500);
  };

  type DataTypeKey = 'all' | 'doseRate' | 'accumulatedDose' | 'temperature' | 'humidity';

  const dataTypeConfig: Record<Exclude<DataTypeKey, 'all'>, {
    label: string;
    unit: string;
    minLabel: string;
    getValue: (r: any) => number;
    isAbnormal?: (r: any) => boolean;
  }> = {
    doseRate: {
      label: '剂量率',
      unit: 'nSv/h',
      minLabel: '剂量率范围',
      getValue: (r) => r.doseRate,
      isAbnormal: (r) => r.isAbnormal,
    },
    accumulatedDose: {
      label: '累积剂量',
      unit: 'mSv',
      minLabel: '累积剂量范围',
      getValue: (r) => r.accumulatedDose,
    },
    temperature: {
      label: '温度',
      unit: '°C',
      minLabel: '温度范围',
      getValue: (r) => r.temperature,
    },
    humidity: {
      label: '湿度',
      unit: '%',
      minLabel: '湿度范围',
      getValue: (r) => r.humidity,
    },
  };

  const queryResults = useMemo(() => {
    if (!hasQueried) return [];
    return historyReadings.filter((r) => {
      if (queryPoint !== 'all' && r.pointId !== queryPoint) return false;
      if (queryStartDate) {
        const startTs = new Date(queryStartDate).getTime();
        const ts = new Date(r.timestamp).getTime();
        if (ts < startTs) return false;
      }
      if (queryEndDate) {
        const endTs = new Date(queryEndDate).getTime();
        const ts = new Date(r.timestamp).getTime();
        if (ts > endTs) return false;
      }
      if (queryMinValue || queryMaxValue) {
        let val: number;
        if (queryDataType === 'all' || queryDataType === 'doseRate') val = r.doseRate;
        else if (queryDataType === 'accumulatedDose') val = r.accumulatedDose;
        else if (queryDataType === 'temperature') val = r.temperature;
        else if (queryDataType === 'humidity') val = r.humidity;
        else val = r.doseRate;
        if (queryMinValue && val < parseFloat(queryMinValue)) return false;
        if (queryMaxValue && val > parseFloat(queryMaxValue)) return false;
      }
      return true;
    });
  }, [hasQueried, historyReadings, queryPoint, queryStartDate, queryEndDate, queryMinValue, queryMaxValue, queryDataType]);

  const activeDataType = queryDataType !== 'all' ? queryDataType : 'doseRate';
  const activeDataTypeInfo = dataTypeConfig[activeDataType as keyof typeof dataTypeConfig];
  const minValueLabel = queryDataType === 'all' ? '最小值 (nSv/h)' : `${activeDataTypeInfo?.minLabel} 最小值 (${activeDataTypeInfo?.unit})`;
  const maxValueLabel = queryDataType === 'all' ? '最大值 (nSv/h)' : `${activeDataTypeInfo?.minLabel} 最大值 (${activeDataTypeInfo?.unit})`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">报告生成</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="monitor">
            <FileText className="w-4 h-4 mr-2" />
            监测报告
          </TabsTrigger>
          <TabsTrigger value="dose">
            <Users className="w-4 h-4 mr-2" />
            人员剂量档案
          </TabsTrigger>
          <TabsTrigger value="history">
            <Search className="w-4 h-4 mr-2" />
            历史数据查询
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  生成报告
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-text-secondary)]">报告类型</label>
                    <Select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className="w-36">
                      <option value="daily">日报</option>
                      <option value="weekly">周报</option>
                      <option value="monthly">月报</option>
                      <option value="yearly">年报</option>
                      <option value="custom">自定义</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-text-secondary)]">开始日期</label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-text-secondary)]">结束日期</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                  <Button onClick={handleGenerateReport} disabled={!startDate || !endDate || isGenerating}>
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <FileType2 className="w-4 h-4" />
                        生成报告
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  已生成报告
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>报告标题</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>时间范围</TableHead>
                      <TableHead>生成时间</TableHead>
                      <TableHead>生成人</TableHead>
                      <TableHead>数据摘要</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>
                          <Badge variant="primary">{reportTypeConfig[report.type].label}</Badge>
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)] text-xs">
                          {report.startDate} ~ {report.endDate}
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)] text-xs">{report.generateTime}</TableCell>
                        <TableCell>{report.generatedBy}</TableCell>
                        <TableCell className="text-xs text-[var(--color-text-secondary)]">
                          <div>读数: {report.summary.totalReadings.toLocaleString()}</div>
                          <div>异常: {report.summary.abnormalCount}</div>
                          <div>在线: {report.summary.pointsOnline}/{report.summary.pointsTotal}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={report.status === 'final' ? 'success' : 'default'}>
                            {report.status === 'final' ? '已归档' : '草稿'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                              预览
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                              PDF
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                              Word
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dose">
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-[var(--color-text-secondary)]">人员总数</p>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">{personnelDoses.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-[var(--color-text-secondary)]">超限人员</p>
                  <p className="text-3xl font-bold text-[var(--color-accent-danger)] mt-1">
                    {personnelDoses.filter((p) => p.yearlyDose > p.limit).length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-[var(--color-text-secondary)]">平均年限量</p>
                  <p className="text-3xl font-bold text-[var(--color-accent-success)] mt-1">
                    {(personnelDoses.reduce((s, p) => s + p.yearlyDose, 0) / personnelDoses.length).toFixed(1)}
                    <span className="text-sm font-normal text-[var(--color-text-muted)] ml-1">mSv</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-[var(--color-text-secondary)]">最高年限量</p>
                  <p className="text-3xl font-bold text-[var(--color-accent-notice)] mt-1">
                    {Math.max(...personnelDoses.map((p) => p.yearlyDose)).toFixed(1)}
                    <span className="text-sm font-normal text-[var(--color-text-muted)] ml-1">mSv</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  人员剂量档案
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>工号</TableHead>
                      <TableHead>部门</TableHead>
                      <TableHead>职位</TableHead>
                      <TableHead>月剂量</TableHead>
                      <TableHead>季剂量</TableHead>
                      <TableHead>年限量</TableHead>
                      <TableHead>总量</TableHead>
                      <TableHead>限值进度</TableHead>
                      <TableHead>更新时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personnelDoses.map((person) => {
                      const percentage = Math.min(100, (person.yearlyDose / person.limit) * 100);
                      const isOverLimit = person.yearlyDose > person.limit;
                      return (
                        <TableRow key={person.id} className={isOverLimit ? 'bg-[var(--color-accent-danger)]/10' : ''}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {person.name}
                              {isOverLimit && (
                                <Badge variant="danger">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  超限
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-[var(--color-text-secondary)] font-mono">{person.employeeId}</TableCell>
                          <TableCell>{person.department}</TableCell>
                          <TableCell className="text-[var(--color-text-secondary)]">{person.position}</TableCell>
                          <TableCell>{person.monthlyDose} {person.unit}</TableCell>
                          <TableCell>{person.quarterlyDose} {person.unit}</TableCell>
                          <TableCell className={isOverLimit ? 'text-[var(--color-accent-danger)] font-medium' : ''}>
                            {person.yearlyDose} {person.unit}
                          </TableCell>
                          <TableCell>{person.totalDose} {person.unit}</TableCell>
                          <TableCell className="min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={percentage}
                                className="flex-1"
                                indicatorClassName={isOverLimit ? 'bg-[var(--color-accent-danger)]' : percentage > 80 ? 'bg-[var(--color-accent-notice)]' : 'bg-[var(--color-accent-success)]'}
                              />
                              <span className={`text-xs font-medium whitespace-nowrap ${isOverLimit ? 'text-[var(--color-accent-danger)]' : 'text-[var(--color-text-secondary)]'}`}>
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[var(--color-text-secondary)] text-xs">{person.lastUpdated}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  高级筛选
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-text-secondary)]">开始时间</label>
                    <Input type="datetime-local" value={queryStartDate} onChange={(e) => setQueryStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-text-secondary)]">结束时间</label>
                    <Input type="datetime-local" value={queryEndDate} onChange={(e) => setQueryEndDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-text-secondary)]">监测点</label>
                    <Select value={queryPoint} onChange={(e) => setQueryPoint(e.target.value)}>
                      <option value="all">全部监测点</option>
                      {monitoringPoints.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-text-secondary)]">数据类型</label>
                    <Select value={queryDataType} onChange={(e) => setQueryDataType(e.target.value)}>
                      <option value="all">全部类型</option>
                      <option value="doseRate">剂量率</option>
                      <option value="accumulatedDose">累积剂量</option>
                      <option value="temperature">温度</option>
                      <option value="humidity">湿度</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-text-secondary)]">{minValueLabel}</label>
                    <Input type="number" placeholder="最小值" value={queryMinValue} onChange={(e) => setQueryMinValue(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-text-secondary)]">{maxValueLabel}</label>
                    <Input type="number" placeholder="最大值" value={queryMaxValue} onChange={(e) => setQueryMaxValue(e.target.value)} />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => {
                    setQueryStartDate('');
                    setQueryEndDate('');
                    setQueryPoint('all');
                    setQueryDataType('all');
                    setQueryMinValue('');
                    setQueryMaxValue('');
                    setHasQueried(false);
                  }}>
                    重置
                  </Button>
                  <Button onClick={() => setHasQueried(true)}>
                    <Search className="w-4 h-4" />
                    查询
                  </Button>
                </div>
              </CardContent>
            </Card>

            {hasQueried && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-[var(--color-accent-primary)]" />
                    查询结果
                    <Badge variant="default" className="ml-2">共 {queryResults.length} 条</Badge>
                  </CardTitle>
                  <Button variant="secondary" size="sm">
                    <DownloadIcon className="w-4 h-4" />
                    导出 Excel
                  </Button>
                </CardHeader>
                <CardContent>
                  {queryResults.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>时间</TableHead>
                          <TableHead>监测点</TableHead>
                          <TableHead>剂量率</TableHead>
                          <TableHead>累积剂量</TableHead>
                          <TableHead>温度</TableHead>
                          <TableHead>湿度</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>预警级别</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queryResults.map((reading) => {
                          const minVal = queryMinValue ? parseFloat(queryMinValue) : null;
                          const maxVal = queryMaxValue ? parseFloat(queryMaxValue) : null;
                          const checkOutOfRange = (v: number) => (minVal !== null && v < minVal) || (maxVal !== null && v > maxVal);
                          const getCellClass = (v: number, dataType: string) => {
                            const base = queryDataType === dataType ? 'bg-[var(--color-accent-primary)]/10 font-medium' : '';
                            const checkRange = (queryDataType === dataType || queryDataType === 'all' && dataType === 'doseRate');
                            const outOfRange = checkRange && checkOutOfRange(v);
                            return `${base} ${outOfRange ? 'text-[var(--color-accent-danger)]' : ''}`.trim();
                          };
                          return (
                            <TableRow key={reading.id}>
                              <TableCell className="text-[var(--color-text-secondary)]">{reading.timestamp}</TableCell>
                              <TableCell className="font-medium">{reading.pointName}</TableCell>
                              <TableCell className={getCellClass(reading.doseRate, 'doseRate')}>
                                {reading.doseRate} {reading.unit}
                              </TableCell>
                              <TableCell className={getCellClass(reading.accumulatedDose, 'accumulatedDose')}>
                                {reading.accumulatedDose} mSv
                              </TableCell>
                              <TableCell className={getCellClass(reading.temperature, 'temperature')}>
                                {reading.temperature}°C
                              </TableCell>
                              <TableCell className={getCellClass(reading.humidity, 'humidity')}>
                                {reading.humidity}%
                              </TableCell>
                              <TableCell>
                                {reading.isAbnormal ? (
                                  <Badge variant="danger">异常</Badge>
                                ) : (
                                  <Badge variant="success">正常</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {reading.alertLevel === 'normal' ? (
                                  <span className="text-[var(--color-text-muted)]">-</span>
                                ) : (
                                  <Badge variant={reading.alertLevel === 'emergency' ? 'danger' : reading.alertLevel === 'severe' ? 'notice' : reading.alertLevel === 'warning' ? 'warning' : 'primary'}>
                                    {reading.alertLevel === 'notice' ? '提示' : reading.alertLevel === 'warning' ? '警告' : reading.alertLevel === 'severe' ? '严重' : reading.alertLevel === 'emergency' ? '紧急' : reading.alertLevel}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-12 text-center text-[var(--color-text-secondary)]">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>暂无符合条件的数据</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
