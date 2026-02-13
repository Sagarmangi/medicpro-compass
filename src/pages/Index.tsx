import { useState } from 'react';
import { DashboardTab } from '@/components/crm/DashboardTab';
import { LeadsTab } from '@/components/crm/LeadsTab';
import { PartnersTab } from '@/components/crm/PartnersTab';
import { BarChart3, Users, Handshake, Activity } from 'lucide-react';

type Tab = 'dashboard' | 'leads' | 'partners';

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'partners', label: 'Partners', icon: Handshake },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20">
                <Activity className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-foreground tracking-tight leading-tight">MedicPro</span>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest leading-tight">CRM Dashboard</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-success">Live</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-0.5 -mb-px">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'leads' && <LeadsTab />}
        {activeTab === 'partners' && <PartnersTab />}
      </main>
    </div>
  );
};

export default Index;
