import { useState, useEffect } from 'react';
import { getLeadDetail, updateLeadInfo, Lead } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { X, Pencil, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  email: string;
  onClose: () => void;
  onSuccess: () => void;
  initialLead?: Lead;
}

export function EditLeadModal({ email, onClose, onSuccess, initialLead }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(!initialLead);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', company: '', position: '',
    industry: '', website: '', linkedin: '', phone: '', pain_point: '',
  });

  useEffect(() => {
    if (initialLead) {
      populateForm(initialLead);
      return;
    }
    (async () => {
      try {
        const res = await getLeadDetail(email);
        populateForm(res.data.lead);
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, [email]);

  const populateForm = (lead: Lead) => {
    setForm({
      first_name: lead.first_name || '',
      last_name: lead.last_name || '',
      company: lead.company || '',
      position: lead.position || '',
      industry: lead.industry || '',
      website: lead.website || '',
      linkedin: lead.linkedin || '',
      phone: lead.phone || '',
      pain_point: lead.pain_point || '',
    });
    setLoading(false);
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim()) {
      toast({ title: 'Validation', description: 'First name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await updateLeadInfo(email, form);
      toast({ title: 'Lead updated', description: 'Lead info has been saved.' });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl z-50 animate-fade-in max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" /> Edit Lead
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {/* Email (read-only) */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Email (cannot be changed)</label>
                  <input value={email} readOnly className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name *">
                    <input value={form.first_name} onChange={set('first_name')} placeholder="Jane" className={inputCls()} />
                  </Field>
                  <Field label="Last Name">
                    <input value={form.last_name} onChange={set('last_name')} placeholder="Smith" className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Company">
                    <input value={form.company} onChange={set('company')} placeholder="Acme Corp" className={inputCls()} />
                  </Field>
                  <Field label="Position">
                    <input value={form.position} onChange={set('position')} placeholder="Director" className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Industry">
                    <input value={form.industry} onChange={set('industry')} placeholder="Healthcare" className={inputCls()} />
                  </Field>
                  <Field label="Phone">
                    <input value={form.phone} onChange={set('phone')} placeholder="+44 7700 000000" className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Website">
                    <input value={form.website} onChange={set('website')} placeholder="acme.com" className={inputCls()} />
                  </Field>
                  <Field label="LinkedIn">
                    <input value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/jane" className={inputCls()} />
                  </Field>
                </div>
                <Field label="Pain Point / Notes">
                  <textarea value={form.pain_point} onChange={set('pain_point')} placeholder="E.g., needs UK accreditation..." rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none resize-none placeholder:text-muted-foreground" />
                </Field>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/20 shrink-0">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function inputCls() {
  return 'w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none placeholder:text-muted-foreground';
}
