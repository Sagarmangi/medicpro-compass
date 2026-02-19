import { useState, useEffect, useCallback, useRef } from 'react';
import { getPartners, Partner, PaginationMeta, formatShortDate } from '@/lib/api';
import { AddPartnerModal } from './AddPartnerModal';
import { EditPartnerModal } from './EditPartnerModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight, Handshake, X, Mail, Building, Calendar, Plus, Pencil, Phone } from 'lucide-react';

export function PartnersTab() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchPartners = useCallback(async (s: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPartners({ search: s, page: p });
      setPartners(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners(search, page);
  }, [page, fetchPartners]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchPartners(val, 1);
    }, 300);
  };

  const refreshPartners = () => fetchPartners(search, page);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="bg-destructive/10 text-destructive rounded-lg p-6 max-w-md text-center">
          <p className="font-medium">Failed to load partners</p>
          <p className="text-sm mt-1 opacity-80">{error}</p>
          <button onClick={refreshPartners} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search partners..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-ring outline-none placeholder:text-muted-foreground shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">{meta.total} partners</span>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Partner
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Company</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Industry</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Partner Since</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Campaign</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className={`px-4 py-3 ${j === 1 || j === 6 ? 'hidden md:table-cell' : ''} ${j === 2 || j === 3 ? 'hidden lg:table-cell' : ''} ${j === 4 ? 'hidden xl:table-cell' : ''}`}>
                        <Skeleton className="h-5 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <Handshake className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No partners yet</p>
                    <p className="text-muted-foreground/70 text-xs mt-1">Partners will appear here once deals are signed</p>
                    <button onClick={() => setShowAddModal(true)} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                      <Plus className="h-4 w-4" /> Add Partner
                    </button>
                  </td>
                </tr>
              ) : (
                partners.map(p => (
                  <tr key={p.id || p.email} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedPartner(p)}>
                    <td className="px-4 py-3 font-medium text-foreground">{p.first_name} {p.last_name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.email}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.company}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.industry}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                      {p.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground/60" />
                          {p.phone}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatShortDate(p.partner_since)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.campaign_name}</td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => { e.stopPropagation(); setEditPartner(p); }}
                        title="Edit partner"
                        className="inline-flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {meta.page} of {meta.total_pages}</span>
            <button onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))} disabled={page >= meta.total_pages} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <>
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" onClick={() => setSelectedPartner(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl shadow-xl z-50 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Partner Details</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditPartner(selectedPartner); setSelectedPartner(null); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => setSelectedPartner(null)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xl font-bold text-foreground">{selectedPartner.first_name} {selectedPartner.last_name}</h4>
                <p className="text-sm text-muted-foreground">{selectedPartner.position} at {selectedPartner.company}</p>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><a href={`mailto:${selectedPartner.email}`} className="text-primary hover:underline">{selectedPartner.email}</a></div>
                <div className="flex items-center gap-2"><Building className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-foreground">{selectedPartner.industry}</span></div>
                {selectedPartner.phone && (
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><a href={`tel:${selectedPartner.phone}`} className="text-primary hover:underline">{selectedPartner.phone}</a></div>
                )}
              </div>

              <div className="bg-success/5 border border-success/20 rounded-lg p-4 space-y-2">
                <h5 className="text-sm font-semibold text-foreground flex items-center gap-2"><Calendar className="h-4 w-4 text-success" /> Journey</h5>
                <div className="text-sm space-y-1.5 text-muted-foreground">
                  <p>First contacted: {formatShortDate(selectedPartner.first_email_sent_at)}</p>
                  <p>Meeting held: {formatShortDate(selectedPartner.meeting_datetime)}</p>
                  <p>Deal signed: {formatShortDate(selectedPartner.deal_signed_at)}</p>
                  <p className="font-medium text-success">Partner since: {formatShortDate(selectedPartner.partner_since)}</p>
                </div>
              </div>

              {selectedPartner.partner_notes && (
                <div>
                  <h5 className="text-sm font-semibold text-foreground mb-1">Notes</h5>
                  <p className="text-sm text-muted-foreground">{selectedPartner.partner_notes}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <AddPartnerModal onClose={() => setShowAddModal(false)} onSuccess={refreshPartners} />
      )}

      {/* Edit Partner Modal */}
      {editPartner && (
        <EditPartnerModal
          partner={editPartner}
          onClose={() => setEditPartner(null)}
          onSuccess={refreshPartners}
        />
      )}
    </div>
  );
}
