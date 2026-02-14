import { Activity, Loader2 } from 'lucide-react';

export function LoadingScreen({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20">
        <Activity className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
