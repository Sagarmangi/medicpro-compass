import { useState, useEffect, useCallback } from 'react';
import { getMetrics, MetricsData, formatStatus } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Mail, CalendarCheck, CheckCircle2, FileSignature, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const KPI_CONFIG = [
  { key: 'total_leads', label: 'Total Leads', icon: Users, gradient: 'kpi-gradient-1', color: 'text-kpi-1' },
  { key: 'emails_sent', label: 'Emails Sent', icon: Mail, gradient: 'kpi-gradient-2', color: 'text-kpi-2' },
  { key: 'meetings_booked', label: 'Meetings Booked', icon: CalendarCheck, gradient: 'kpi-gradient-3', color: 'text-kpi-3' },
  { key: 'meetings_done', label: 'Meetings Done', icon: CheckCircle2, gradient: 'kpi-gradient-4', color: 'text-kpi-4' },
  { key: 'deals_signed', label: 'Deals Signed', icon: FileSignature, gradient: 'kpi-gradient-5', color: 'text-kpi-5' },
  { key: 'conversion', label: 'Lead → Meeting', icon: TrendingUp, gradient: 'kpi-gradient-6', color: 'text-kpi-6' },
];

const PIPELINE_COLORS = [
  'hsl(213, 94%, 54%)', 'hsl(239, 84%, 67%)', 'hsl(271, 76%, 53%)',
  'hsl(38, 92%, 50%)', 'hsl(25, 95%, 53%)', 'hsl(160, 84%, 39%)',
  'hsl(152, 69%, 40%)', 'hsl(220, 10%, 60%)', 'hsl(0, 72%, 51%)',
];

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export function DashboardTab() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const defaults = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMetrics(dateFrom, dateTo);
      setMetrics(res.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const getKpiValue = (key: string): string => {
    if (!metrics) return '—';
    switch (key) {
      case 'total_leads': return metrics.pipeline.total_leads.toLocaleString();
      case 'emails_sent': return metrics.activity.total_emails_sent.toLocaleString();
      case 'meetings_booked': return metrics.pipeline.meetings_booked.toLocaleString();
      case 'meetings_done': return metrics.pipeline.meetings_done.toLocaleString();
      case 'deals_signed': return metrics.pipeline.deals_signed.toLocaleString();
      case 'conversion': return `${metrics.conversions.lead_to_meeting_rate}%`;
      default: return '—';
    }
  };

  const pipelineData = metrics
    ? Object.entries(metrics.pipeline.by_status).map(([name, value]) => ({
        name: formatStatus(name),
        value,
      }))
    : [];

  const emailTypeData = metrics
    ? Object.entries(metrics.activity.by_email_type).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value,
      }))
    : [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="bg-destructive/10 text-destructive rounded-lg p-6 max-w-md text-center">
          <p className="font-medium">Failed to load metrics</p>
          <p className="text-sm mt-1 opacity-80">{error}</p>
          <button onClick={fetchMetrics} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date Range Picker */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground">Date Range:</label>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {KPI_CONFIG.map(kpi => (
          <div key={kpi.key} className={`${kpi.gradient} border rounded-xl p-4 transition-all hover:shadow-md`}>
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className={`text-2xl font-bold ${kpi.color}`}>{getKpiValue(kpi.key)}</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Activity Chart */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Email Activity</h3>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : metrics?.activity.daily_chart.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={metrics.activity.daily_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 90%)', borderRadius: '8px', fontSize: 12 }}
                />
                <Bar dataKey="emails_sent" fill="hsl(239, 84%, 67%)" radius={[4, 4, 0, 0]} name="Emails Sent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No activity data</div>
          )}
        </div>

        {/* Pipeline Breakdown */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Pipeline Breakdown</h3>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : pipelineData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pipelineData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} width={120} />
                <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 90%)', borderRadius: '8px', fontSize: 12 }} />
                <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                  {pipelineData.map((_, i) => (
                    <Cell key={i} fill={PIPELINE_COLORS[i % PIPELINE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No pipeline data</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Types */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Email Types</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {emailTypeData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIPELINE_COLORS[i % PIPELINE_COLORS.length] }} />
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversion Rates */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Conversion Rates</h3>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : metrics ? (
            <div className="grid grid-cols-2 gap-6">
              <ConversionCard label="Lead → Meeting" value={metrics.conversions.lead_to_meeting_rate} color="hsl(239, 84%, 67%)" />
              <ConversionCard label="Meeting → Deal" value={metrics.conversions.meeting_to_deal_rate} color="hsl(152, 69%, 40%)" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ConversionCard({ label, value, color }: { label: string; value: number; color: string }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(220, 13%, 90%)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
          {value}%
        </span>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
