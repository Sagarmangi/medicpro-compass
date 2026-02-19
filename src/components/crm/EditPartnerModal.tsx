import { useState } from 'react';
import { updatePartner, Partner } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { X, Pencil, Loader2 } from 'lucide-react';

interface Props {
  partner: Partner;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPartnerModal({ partner, onClose, onSuccess }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: partner.first_name || '',
    last_name: partner.last_name || '',
    company: partner.company || '',
    position: partner.position || '',
    industry: partner.industry || '',
    website: partner.website || '',
    linkedin: partner.linkedin || '',
    phone: partner.phone || '',
    campaign_name: partner.campaign_name || '',
    partner_notes: partner.partner_notes || '',
  });

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
      await updatePartner(partner.email, form);
      toast({ title: 'Partner updated', description: 'Partner info has been saved.' });
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
            <Pencil className="h-5 w-5 text-primary" /> Edit Partner
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            {/* Email (read-only) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email (cannot be changed)</label>
              <input value={partner.email} readOnly className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name *">
                <input value={form.first_name} onChange={set('first_name')} className={inputCls()} />
              </Field>
              <Field label="Last Name">
                <input value={form.last_name} onChange={set('last_name')} className={inputCls()} />
              </Field>
            </div>
            <Field label="Company">
              <input value={form.company} onChange={set('company')} className={inputCls()} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Position">
                <input value={form.position} onChange={set('position')} className={inputCls()} />
              </Field>
              <Field label="Industry">
                <input value={form.industry} onChange={set('industry')} className={inputCls()} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <input value={form.phone} onChange={set('phone')} placeholder="+44 7700 000000" className={inputCls()} />
              </Field>
              <Field label="Website">
                <input value={form.website} onChange={set('website')} className={inputCls()} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="LinkedIn">
                <input value={form.linkedin} onChange={set('linkedin')} className={inputCls()} />
              </Field>
              <Field label="Campaign Name">
                <input value={form.campaign_name} onChange={set('campaign_name')} className={inputCls()} />
              </Field>
            </div>
            <Field label="Partner Notes">
              <textarea value={form.partner_notes} onChange={set('partner_notes')} rows={3}
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
