import { useState } from 'react';
import { updateStatus, LeadStatus, LEAD_STATUSES, formatStatus, STATUS_COLORS } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronDown } from 'lucide-react';

// Color dot per status
const STATUS_DOTS: Record<string, string> = {
  First_Email_Sent: 'bg-info',
  Followup_1_Sent: 'bg-primary',
  Followup_2_Sent: 'bg-kpi-6',
  Meeting_Booked: 'bg-warning',
  Meeting_Reminder_Sent: 'bg-orange-400',
  Meeting_Done: 'bg-kpi-5',
  Deal_Signed: 'bg-success',
  Cold: 'bg-muted-foreground',
  Lost: 'bg-destructive',
};

const STATUS_LABELS: Record<string, string> = {
  First_Email_Sent: 'First Email Sent',
  Followup_1_Sent: 'Followup 1 Sent',
  Followup_2_Sent: 'Followup 2 Sent',
  Meeting_Booked: 'Meeting Booked',
  Meeting_Reminder_Sent: 'Reminder Sent',
  Meeting_Done: 'Meeting Done',
  Deal_Signed: 'Deal Signed',
  Cold: 'Cold',
  Lost: 'Lost',
};

interface Props {
  email: string;
  currentStatus: LeadStatus;
  onUpdated: (newStatus: LeadStatus) => void;
  compact?: boolean;
}

export function StatusDropdown({ email, currentStatus, onUpdated, compact = false }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleChange = async (status: LeadStatus) => {
    if (status === currentStatus) { setOpen(false); return; }
    setOpen(false);
    setLoading(true);
    try {
      await updateStatus(email, status);
      onUpdated(status);
      toast({ title: 'Status updated', description: `Marked as ${STATUS_LABELS[status]}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const colorCls = STATUS_COLORS[currentStatus] || 'bg-muted text-muted-foreground border-border';

  return (
    <div className="relative inline-block">
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all disabled:opacity-60 hover:shadow-sm ${colorCls} ${compact ? '' : 'pr-2'}`}
      >
        {loading
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOTS[currentStatus] || 'bg-muted-foreground'}`} />
        }
        <span>{STATUS_LABELS[currentStatus] || formatStatus(currentStatus)}</span>
        {!loading && <ChevronDown className="h-3 w-3 opacity-60" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-[70] min-w-[170px] bg-card border border-border rounded-xl shadow-lg py-1 animate-fade-in">
            {LEAD_STATUSES.map(s => (
              <button
                key={s}
                onClick={e => { e.stopPropagation(); handleChange(s); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-muted/60 ${s === currentStatus ? 'bg-primary/5 text-primary' : 'text-foreground'}`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOTS[s] || 'bg-muted-foreground'}`} />
                {STATUS_LABELS[s] || formatStatus(s)}
                {s === currentStatus && <span className="ml-auto text-primary text-[10px]">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
