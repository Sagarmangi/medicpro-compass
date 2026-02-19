import { useState, useEffect, useCallback, useRef } from 'react';
import { getLeads, Lead, PaginationMeta, LEAD_STATUSES, formatStatus, formatRelativeTime, LeadStatus, toggleWhatsapp } from '@/lib/api';
import { StatusDropdown } from './StatusDropdown';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { AddLeadModal } from './AddLeadModal';
import { EditLeadModal } from './EditLeadModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Search, ChevronLeft, ChevronRight, Eye, Users, Plus, Pencil, Phone } from 'lucide-react';

// WhatsApp icon SVG component
function WhatsAppIcon({ active, className }: { active: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={active ? '#25D366' : 'currentColor'}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [togglingWa, setTogglingWa] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { toast } = useToast();

  const fetchLeads = useCallback(async (s: string, status: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLeads({ search: s, status, page: p });
      setLeads(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(search, statusFilter, page);
  }, [statusFilter, page, fetchLeads]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchLeads(val, statusFilter, 1);
    }, 300);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleStatusUpdated = (email: string, newStatus: LeadStatus) => {
    setLeads(ls => ls.map(l => l.email === email ? { ...l, status: newStatus } : l));
  };

  const handleToggleWa = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setTogglingWa(lead.email);
    try {
      const newVal = !lead.whatsapp_sent;
      await toggleWhatsapp(lead.email, newVal);
      setLeads(ls => ls.map(l => l.email === lead.email ? { ...l, whatsapp_sent: newVal, whatsapp_sent_at: newVal ? new Date().toISOString() : null } : l));
      toast({ title: newVal ? 'WhatsApp marked sent' : 'WhatsApp unmarked', description: lead.email });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setTogglingWa(null);
    }
  };

  const refreshLeads = () => fetchLeads(search, statusFilter, page);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="bg-destructive/10 text-destructive rounded-lg p-6 max-w-md text-center">
          <p className="font-medium">Failed to load leads</p>
          <p className="text-sm mt-1 opacity-80">{error}</p>
          <button onClick={refreshLeads} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search by name, email, company..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-ring outline-none placeholder:text-muted-foreground shadow-sm transition-shadow focus:shadow-md"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => handleStatusChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-ring outline-none shadow-sm transition-shadow cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {LEAD_STATUSES.map(s => (
              <option key={s} value={s}>{formatStatus(s)}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {leads.length} of {meta.total} leads
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Company</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Campaign</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Updated</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">WA</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className={`px-4 py-3 ${j === 1 || j === 6 ? 'hidden md:table-cell' : ''} ${j === 2 || j === 5 ? 'hidden lg:table-cell' : ''} ${j === 3 ? 'hidden xl:table-cell' : ''}`}>
                        <Skeleton className="h-5 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No leads found</p>
                    <p className="text-muted-foreground/70 text-xs mt-1">Try adjusting your search or filter</p>
                    <button onClick={() => setShowAddModal(true)} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                      <Plus className="h-4 w-4" /> Add First Lead
                    </button>
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id || lead.email} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedLead(lead.email)}>
                    <td className="px-4 py-3 font-medium text-foreground">{lead.first_name} {lead.last_name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{lead.email}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.company}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                      {lead.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground/60" />
                          {lead.phone}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <StatusDropdown
                        email={lead.email}
                        currentStatus={lead.status}
                        onUpdated={newStatus => handleStatusUpdated(lead.email, newStatus)}
                        compact
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.campaign_name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatRelativeTime(lead.updated_at)}</td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => handleToggleWa(e, lead)}
                        disabled={togglingWa === lead.email}
                        title={lead.whatsapp_sent ? `WhatsApp sent${lead.whatsapp_sent_at ? ' on ' + new Date(lead.whatsapp_sent_at).toLocaleDateString('en-GB') : ''}` : 'Click to mark WhatsApp sent'}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        <WhatsAppIcon active={!!lead.whatsapp_sent} className="w-4 h-4 text-muted-foreground/40" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); setEditLead(lead); }}
                          title="Edit lead"
                          className="inline-flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedLead(lead.email); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Eye className="h-3 w-3" /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.total_pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))}
              disabled={page >= meta.total_pages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedLead && (
        <LeadDetailDrawer
          email={selectedLead}
          onClose={() => setSelectedLead(null)}
          onRefresh={refreshLeads}
        />
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <AddLeadModal onClose={() => setShowAddModal(false)} onSuccess={refreshLeads} />
      )}

      {/* Edit Lead Modal */}
      {editLead && (
        <EditLeadModal
          email={editLead.email}
          initialLead={editLead}
          onClose={() => setEditLead(null)}
          onSuccess={refreshLeads}
        />
      )}
    </div>
  );
}
