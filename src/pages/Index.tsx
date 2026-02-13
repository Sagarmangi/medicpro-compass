import { useState } from 'react';
import { DashboardTab } from '@/components/crm/DashboardTab';
import { LeadsTab } from '@/components/crm/LeadsTab';
import { PartnersTab } from '@/components/crm/PartnersTab';
import { BarChart3, Users, Handshake } from 'lucide-react';

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
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">MedicPro <span className="font-normal text-muted-foreground">CRM</span></span>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 -mb-px">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
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
