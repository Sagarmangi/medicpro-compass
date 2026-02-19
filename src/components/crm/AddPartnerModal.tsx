import { useState } from 'react';
import { addPartner } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPartnerModal({ onClose, onSuccess }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    first_name: '', email: '', company: '', last_name: '', position: '',
    industry: '', website: '', linkedin: '', phone: '', campaign_name: '', partner_notes: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.company.trim()) errs.company = 'Company is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await addPartner({ ...form });
      toast({ title: 'Partner added', description: `${form.first_name} ${form.last_name} has been added.` });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl z-50 animate-fade-in max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Plus className="h-5 w-5 text-success" /> Add New Partner
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name *" error={errors.first_name}>
                <input value={form.first_name} onChange={set('first_name')} placeholder="Mark" className={inputCls(errors.first_name)} />
              </Field>
              <Field label="Last Name">
                <input value={form.last_name} onChange={set('last_name')} placeholder="Wilson" className={inputCls()} />
              </Field>
            </div>
            <Field label="Email *" error={errors.email}>
              <input type="email" value={form.email} onChange={set('email')} placeholder="mark@company.com" className={inputCls(errors.email)} />
            </Field>
            <Field label="Company *" error={errors.company}>
              <input value={form.company} onChange={set('company')} placeholder="Wilson Training Academy" className={inputCls(errors.company)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Position">
                <input value={form.position} onChange={set('position')} placeholder="Director" className={inputCls()} />
              </Field>
              <Field label="Industry">
                <input value={form.industry} onChange={set('industry')} placeholder="Nursing" className={inputCls()} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <input value={form.phone} onChange={set('phone')} placeholder="+44 7700 555666" className={inputCls()} />
              </Field>
              <Field label="Website">
                <input value={form.website} onChange={set('website')} placeholder="wilsontraining.com" className={inputCls()} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="LinkedIn">
                <input value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/mark" className={inputCls()} />
              </Field>
              <Field label="Campaign Name">
                <input value={form.campaign_name} onChange={set('campaign_name')} placeholder="UK Campaign Q1" className={inputCls()} />
              </Field>
            </div>
            <Field label="Partner Notes">
              <textarea value={form.partner_notes} onChange={set('partner_notes')} placeholder="E.g., met at education expo..." rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none resize-none placeholder:text-muted-foreground" />
            </Field>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/20 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</> : 'Add Partner'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full px-3 py-2 rounded-lg border ${error ? 'border-destructive' : 'border-border'} bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none placeholder:text-muted-foreground`;
}
