import { useState } from 'react';
import { DashboardTab } from '@/components/crm/DashboardTab';
import { LeadsTab } from '@/components/crm/LeadsTab';
import { PartnersTab } from '@/components/crm/PartnersTab';
import { BarChart3, Users, Handshake, Activity, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type Tab = 'dashboard' | 'leads' | 'partners';

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'partners', label: 'Partners', icon: Handshake },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useAuth();

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';
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
            {/* Desktop: user menu */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-success">Live</span>
              </div>
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2.5 px-2 py-1.5 h-auto rounded-full hover:bg-muted/60">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:block text-sm font-medium text-foreground">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile: hamburger */}
            <div className="sm:hidden flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-medium text-success">Live</span>
              </div>
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <SheetHeader className="p-5 pb-3 border-b border-border">
                    <SheetTitle className="text-left text-base">Menu</SheetTitle>
                  </SheetHeader>
                  {user && (
                    <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/30">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </div>
                  )}
                  <nav className="flex flex-col p-2">
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false); }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                  <div className="mt-auto p-4 border-t border-border absolute bottom-0 left-0 right-0">
                    <Button
                      variant="ghost"
                      onClick={() => { logout(); setMobileNavOpen(false); }}
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Tabs — desktop only */}
          <nav className="hidden sm:flex gap-0.5 -mb-px">
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
