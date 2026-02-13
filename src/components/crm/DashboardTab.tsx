import { useState, useEffect, useCallback } from 'react';
import { getMetrics, MetricsData, formatStatus } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Mail, CalendarCheck, CheckCircle2, FileSignature, TrendingUp, CalendarDays, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Area, AreaChart } from 'recharts';

const KPI_CONFIG = [
  { key: 'total_leads', label: 'Total Leads', icon: Users, gradient: 'kpi-gradient-1', color: 'text-kpi-1', iconBg: 'bg-kpi-1/15' },
  { key: 'emails_sent', label: 'Emails Sent', icon: Mail, gradient: 'kpi-gradient-2', color: 'text-kpi-2', iconBg: 'bg-kpi-2/15' },
  { key: 'meetings_booked', label: 'Meetings Booked', icon: CalendarCheck, gradient: 'kpi-gradient-3', color: 'text-kpi-3', iconBg: 'bg-kpi-3/15' },
  { key: 'meetings_done', label: 'Meetings Done', icon: CheckCircle2, gradient: 'kpi-gradient-4', color: 'text-kpi-4', iconBg: 'bg-kpi-4/15' },
  { key: 'deals_signed', label: 'Deals Signed', icon: FileSignature, gradient: 'kpi-gradient-5', color: 'text-kpi-5', iconBg: 'bg-kpi-5/15' },
  { key: 'conversion', label: 'Lead → Meeting', icon: TrendingUp, gradient: 'kpi-gradient-6', color: 'text-kpi-6', iconBg: 'bg-kpi-6/15' },
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
  return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] };
}

export function DashboardTab() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const defaults = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await getMetrics(dateFrom, dateTo);
      setMetrics(res.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(() => fetchMetrics(), 60000);
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
    ? Object.entries(metrics.pipeline.by_status).map(([name, value]) => ({ name: formatStatus(name), value }))
    : [];

  const emailTypeData = metrics
    ? Object.entries(metrics.activity.by_email_type).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value,
      }))
    : [];

  const totalEmailsByType = emailTypeData.reduce((sum, i) => sum + i.value, 0);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="bg-destructive/10 text-destructive rounded-2xl p-8 max-w-md text-center border border-destructive/20">
          <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-5 w-5" />
          </div>
          <p className="font-semibold text-lg">Failed to load metrics</p>
          <p className="text-sm mt-2 opacity-80">{error}</p>
          <button onClick={() => fetchMetrics()} className="mt-5 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card rounded-xl border border-border p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent">
            <CalendarDays className="h-4 w-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">Period</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition-shadow"
          />
          <span className="text-muted-foreground text-xs font-medium">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition-shadow"
          />
        </div>
        <button
          onClick={() => fetchMetrics(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPI_CONFIG.map((kpi, idx) => (
          <div
            key={kpi.key}
            className={`${kpi.gradient} border rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group`}
            style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
          >
            <div className={`w-8 h-8 rounded-lg ${kpi.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className={`text-2xl font-extrabold tracking-tight ${kpi.color}`}>{getKpiValue(kpi.key)}</p>
            )}
            <span className="text-[11px] font-medium text-muted-foreground mt-0.5 block">{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Email Activity — Area Chart */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Email Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Sending volume over time</p>
            </div>
            {metrics && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {metrics.activity.total_emails_sent} total
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : metrics?.activity.daily_chart.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={metrics.activity.daily_chart}>
                <defs>
                  <linearGradient id="emailGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(220, 13%, 90%)',
                    borderRadius: '12px',
                    fontSize: 12,
                    boxShadow: '0 8px 30px -4px rgba(0,0,0,0.1)',
                  }}
                />
                <Area type="monotone" dataKey="emails_sent" stroke="hsl(239, 84%, 67%)" strokeWidth={2.5} fill="url(#emailGradient)" name="Emails Sent" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No activity data for this period" />
          )}
        </div>

        {/* Pipeline Breakdown */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Pipeline Breakdown</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Lead distribution by status</p>
            </div>
            {metrics && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-accent-foreground">
                {metrics.pipeline.total_leads} leads
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : pipelineData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pipelineData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }} width={115} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 90%)', borderRadius: '12px', fontSize: 12, boxShadow: '0 8px 30px -4px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" name="Leads" radius={[0, 6, 6, 0]} barSize={18}>
                  {pipelineData.map((_, i) => (
                    <Cell key={i} fill={PIPELINE_COLORS[i % PIPELINE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No pipeline data" />
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Email Types */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-1">Email Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">By email type</p>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-2.5">
              {emailTypeData.map((item, i) => {
                const pct = totalEmailsByType > 0 ? Math.round((item.value / totalEmailsByType) * 100) : 0;
                return (
                  <div key={item.name} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: PIPELINE_COLORS[i % PIPELINE_COLORS.length] }} />
                        <span className="text-xs font-medium text-foreground">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-foreground">{item.value} <span className="font-normal text-muted-foreground">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: PIPELINE_COLORS[i % PIPELINE_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Conversion Rates */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <h3 className="text-sm font-bold text-foreground mb-1">Conversion Rates</h3>
          <p className="text-xs text-muted-foreground mb-5">Funnel efficiency metrics</p>
          {loading ? (
            <Skeleton className="h-28 w-full rounded-xl" />
          ) : metrics ? (
            <div className="grid grid-cols-2 gap-8">
              <ConversionCard label="Lead → Meeting" value={metrics.conversions.lead_to_meeting_rate} color="hsl(239, 84%, 67%)" bgColor="bg-primary/5" />
              <ConversionCard label="Meeting → Deal" value={metrics.conversions.meeting_to_deal_rate} color="hsl(152, 69%, 40%)" bgColor="bg-success/5" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ConversionCard({ label, value, color, bgColor }: { label: string; value: number; color: string; bgColor: string }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`flex items-center gap-5 ${bgColor} rounded-xl p-4`}>
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(220, 13%, 92%)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-extrabold text-foreground">
          {value}%
        </span>
      </div>
      <div>
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <p className="text-xs text-muted-foreground mt-0.5">conversion rate</p>
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
      <BarChart3Icon className="h-10 w-10 opacity-20 mb-2" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

function BarChart3Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><rect x="7" y="10" width="3" height="8" rx="1" /><rect x="14" y="6" width="3" height="12" rx="1" />
    </svg>
  );
}
