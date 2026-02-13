// CRM API Service — all calls go through a single POST endpoint

const API_URL = import.meta.env.VITE_API_URL || '';

// Types
export interface Lead {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  position: string;
  industry: string;
  website: string;
  linkedin?: string;
  pain_point?: string;
  status: LeadStatus;
  campaign_name: string;
  first_email_sent: boolean;
  first_email_sent_at: string | null;
  first_email_subject?: string;
  first_email_body?: string;
  followup_1_sent: boolean;
  followup_1_sent_at: string | null;
  followup_1_subject?: string;
  followup_1_body?: string;
  followup_2_sent: boolean;
  followup_2_sent_at: string | null;
  followup_2_subject?: string;
  followup_2_body?: string;
  confirmation_email_sent: boolean;
  meeting_reminder_sent: boolean;
  meeting_booked: boolean;
  meeting_datetime: string | null;
  meeting_event_title: string;
  meeting_location?: string;
  meeting_link?: string;
  meeting_duration?: string;
  meeting_done: boolean;
  deal_signed: boolean;
  created_at: string;
  updated_at: string;
}

export type LeadStatus =
  | 'First_Email_Sent'
  | 'Followup_1_Sent'
  | 'Followup_2_Sent'
  | 'Meeting_Booked'
  | 'Meeting_Reminder_Sent'
  | 'Meeting_Done'
  | 'Deal_Signed'
  | 'Cold'
  | 'Lost';

export const LEAD_STATUSES: LeadStatus[] = [
  'First_Email_Sent', 'Followup_1_Sent', 'Followup_2_Sent',
  'Meeting_Booked', 'Meeting_Reminder_Sent', 'Meeting_Done',
  'Deal_Signed', 'Cold', 'Lost',
];

export function formatStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

export interface EmailLog {
  id: string;
  lead_email: string;
  lead_name: string;
  company: string;
  email_type: string;
  subject: string;
  body_html: string;
  status: string;
  campaign_name: string;
  sent_at: string;
}

export interface Partner {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  position: string;
  industry: string;
  website: string;
  campaign_name: string;
  partner_since: string;
  partner_notes: string;
  deal_signed_at: string;
  first_email_sent_at: string;
  meeting_datetime: string;
  meeting_done_at?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface MetricsData {
  pipeline: {
    total_leads: number;
    by_status: Record<string, number>;
    meetings_booked: number;
    meetings_done: number;
    deals_signed: number;
    cold_leads: number;
  };
  conversions: {
    lead_to_meeting_rate: number;
    meeting_to_deal_rate: number;
  };
  activity: {
    period: { from: string; to: string };
    new_leads: number;
    total_emails_sent: number;
    by_email_type: Record<string, number>;
    daily_chart: { date: string; label: string; emails_sent: number }[];
  };
}

// Core API call
async function apiCall<T = any>(action: string, params: Record<string, any> = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('API URL not configured. Set the VITE_API_URL environment variable.');
  }
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'API request failed');
  return data;
}

// API methods
export async function getLeads(params: { status?: string; search?: string; page?: number; limit?: number }) {
  return apiCall<{ data: Lead[]; meta: PaginationMeta }>('get_leads', {
    status: params.status || 'all',
    search: params.search || '',
    page: params.page || 1,
    limit: params.limit || 20,
  });
}

export async function getLeadDetail(email: string) {
  return apiCall<{ data: { lead: Lead; email_history: EmailLog[]; stats: any } }>('get_lead_detail', { email });
}

export async function getPartners(params: { search?: string; page?: number; limit?: number }) {
  return apiCall<{ data: Partner[]; meta: PaginationMeta }>('get_partners', {
    search: params.search || '',
    page: params.page || 1,
    limit: params.limit || 20,
  });
}

export async function getMetrics(dateFrom: string, dateTo: string) {
  return apiCall<{ data: MetricsData }>('get_metrics', { date_from: dateFrom, date_to: dateTo });
}

export async function updateStatus(email: string, status: LeadStatus, notes?: string) {
  return apiCall<{ message: string }>('update_status', { email, status, notes: notes || '' });
}

export async function moveToPartner(email: string, partnerNotes: string) {
  return apiCall<{ message: string }>('move_to_partner', { email, partner_notes: partnerNotes });
}

// Helpers
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const STATUS_COLORS: Record<string, string> = {
  First_Email_Sent: 'bg-info/15 text-info border-info/25',
  Followup_1_Sent: 'bg-primary/15 text-primary border-primary/25',
  Followup_2_Sent: 'bg-kpi-6/15 text-kpi-6 border-kpi-6/25',
  Meeting_Booked: 'bg-warning/15 text-warning border-warning/25',
  Meeting_Reminder_Sent: 'bg-warning/20 text-warning border-warning/30',
  Meeting_Done: 'bg-kpi-5/15 text-kpi-5 border-kpi-5/25',
  Deal_Signed: 'bg-success/15 text-success border-success/25',
  Cold: 'bg-muted text-muted-foreground border-border',
  Lost: 'bg-destructive/15 text-destructive border-destructive/25',
};

export const EMAIL_TYPE_COLORS: Record<string, string> = {
  cold_email: 'bg-info/15 text-info',
  followup_1: 'bg-primary/15 text-primary',
  followup_2: 'bg-kpi-6/15 text-kpi-6',
  confirmation: 'bg-success/15 text-success',
  meeting_reminder: 'bg-warning/15 text-warning',
};
