import { useState, useEffect } from 'react';
import { getLeadDetail, updateStatus, moveToPartner, Lead, EmailLog, LeadStatus, formatDate, formatStatus, EMAIL_TYPE_COLORS } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  X, Mail, Building, User, Globe, MapPin, Calendar, Clock, Link2,
  CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react';

interface Props {
  email: string;
  onClose: () => void;
  onRefresh: () => void;
}

const TIMELINE_STEPS = [
  { key: 'first_email_sent', label: 'First Email Sent', dateKey: 'first_email_sent_at' },
  { key: 'followup_1_sent', label: 'Followup 1 Sent', dateKey: 'followup_1_sent_at' },
  { key: 'followup_2_sent', label: 'Followup 2 Sent', dateKey: 'followup_2_sent_at' },
  { key: 'confirmation_email_sent', label: 'Confirmation Sent', dateKey: null },
  { key: 'meeting_reminder_sent', label: 'Meeting Reminder Sent', dateKey: null },
  { key: 'meeting_booked', label: 'Meeting Booked', dateKey: 'meeting_datetime' },
  { key: 'meeting_done', label: 'Meeting Done', dateKey: null },
  { key: 'deal_signed', label: 'Deal Signed', dateKey: null },
] as const;

export function LeadDetailDrawer({ email, onClose, onRefresh }: Props) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [emailHistory, setEmailHistory] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [partnerNotes, setPartnerNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getLeadDetail(email);
        setLead(res.data.lead);
        setEmailHistory(res.data.email_history);
      } catch (e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, [email]);

  const handleAction = async (status: LeadStatus) => {
    setActionLoading(true);
    try {
      await updateStatus(email, status);
      toast({ title: 'Status Updated', description: `Lead marked as ${formatStatus(status)}` });
      const res = await getLeadDetail(email);
      setLead(res.data.lead);
      onRefresh();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveToPartner = async () => {
    setActionLoading(true);
    try {
      await moveToPartner(email, partnerNotes);
      toast({ title: 'Success', description: 'Lead moved to active partners' });
      onRefresh();
      onClose();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border shadow-xl z-50 overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-foreground">Lead Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : lead ? (
            <>
              {/* Lead Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{lead.first_name} {lead.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{lead.position} at {lead.company}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <InfoRow icon={Mail} label="Email" value={lead.email} link={`mailto:${lead.email}`} />
                  <InfoRow icon={Building} label="Company" value={lead.company} />
                  <InfoRow icon={User} label="Industry" value={lead.industry} />
                  {lead.website && <InfoRow icon={Globe} label="Website" value={lead.website} link={lead.website} />}
                  {lead.pain_point && <InfoRow icon={MapPin} label="Pain Point" value={lead.pain_point} />}
                  <InfoRow icon={Mail} label="Campaign" value={lead.campaign_name} />
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Progress Timeline</h4>
                <div className="space-y-1">
                  {TIMELINE_STEPS.map(step => {
                    const done = !!(lead as any)[step.key];
                    const dateVal = step.dateKey ? (lead as any)[step.dateKey] : null;
                    return (
                      <div key={step.key} className="flex items-center gap-3 py-1.5">
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${done ? 'text-foreground' : 'text-muted-foreground/60'}`}>{step.label}</span>
                        {done && dateVal && (
                          <span className="text-xs text-muted-foreground ml-auto">{formatDate(dateVal)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Meeting Details */}
              {lead.meeting_booked && (
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-warning" /> Meeting Details
                  </h4>
                  <div className="text-sm space-y-1.5">
                    {lead.meeting_event_title && <p className="font-medium text-foreground">{lead.meeting_event_title}</p>}
                    {lead.meeting_datetime && <p className="text-muted-foreground"><Clock className="h-3.5 w-3.5 inline mr-1" />{formatDate(lead.meeting_datetime)}</p>}
                    {lead.meeting_location && <p className="text-muted-foreground"><MapPin className="h-3.5 w-3.5 inline mr-1" />{lead.meeting_location}</p>}
                    {lead.meeting_duration && <p className="text-muted-foreground">Duration: {lead.meeting_duration}</p>}
                    {lead.meeting_link && (
                      <a href={lead.meeting_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Link2 className="h-3.5 w-3.5" /> Join Meeting <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {(lead.status === 'Meeting_Booked' || lead.status === 'Meeting_Reminder_Sent') && (
                    <ActionBtn label="Mark Meeting Done" onClick={() => handleAction('Meeting_Done')} loading={actionLoading} variant="success" />
                  )}
                  {lead.status === 'Meeting_Done' && (
                    <ActionBtn label="Mark Deal Signed" onClick={() => handleAction('Deal_Signed')} loading={actionLoading} variant="success" />
                  )}
                  {lead.status === 'Deal_Signed' && (
                    <ActionBtn label="Move to Partners" onClick={() => setShowPartnerDialog(true)} loading={actionLoading} variant="primary" />
                  )}
                  <ActionBtn label="Mark Cold" onClick={() => handleAction('Cold')} loading={actionLoading} variant="secondary" />
                  <ActionBtn label="Mark Lost" onClick={() => handleAction('Lost')} loading={actionLoading} variant="destructive" />
                </div>
              </div>

              {/* Partner Dialog */}
              {showPartnerDialog && (
                <div className="bg-accent border border-border rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Add Partner Notes</h4>
                  <textarea
                    value={partnerNotes}
                    onChange={e => setPartnerNotes(e.target.value)}
                    placeholder="E.g., Signed partnership agreement on..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-ring outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleMoveToPartner} disabled={actionLoading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                      {actionLoading ? 'Moving...' : 'Confirm'}
                    </button>
                    <button onClick={() => setShowPartnerDialog(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Email History */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Email History ({emailHistory.length})</h4>
                <div className="space-y-2">
                  {emailHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No emails sent yet</p>
                  ) : (
                    emailHistory.map(em => (
                      <div key={em.id} className="border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedEmail(expandedEmail === em.id ? null : em.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                        >
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${EMAIL_TYPE_COLORS[em.email_type] || 'bg-muted text-muted-foreground'}`}>
                            {em.email_type.replace(/_/g, ' ')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{em.subject}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(em.sent_at)}</p>
                          </div>
                          {expandedEmail === em.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </button>
                        {expandedEmail === em.id && (
                          <div className="px-4 py-3 border-t border-border bg-muted/20 text-sm text-foreground prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: em.body_html }} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon: Icon, label, value, link }: { icon: any; label: string; value: string; link?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{value}</a>
      ) : (
        <span className="text-foreground truncate">{value}</span>
      )}
    </div>
  );
}

function ActionBtn({ label, onClick, loading, variant }: { label: string; onClick: () => void; loading: boolean; variant: 'primary' | 'success' | 'destructive' | 'secondary' }) {
  const styles = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    success: 'bg-success text-success-foreground hover:opacity-90',
    destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
    secondary: 'bg-muted text-muted-foreground hover:bg-muted/80',
  };
  return (
    <button onClick={onClick} disabled={loading} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${styles[variant]}`}>
      {label}
    </button>
  );
}
