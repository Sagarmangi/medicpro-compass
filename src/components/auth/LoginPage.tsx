import { useState } from 'react';
import { Activity, Mail, CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { requestMagicLink } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

type LoginState = 'email' | 'sending' | 'sent' | 'error';

export function LoginPage() {
  const { tokenError, clearTokenError } = useAuth();
  const [loginState, setLoginState] = useState<LoginState>(tokenError ? 'error' : 'email');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState(tokenError || '');
  const [sentEmail, setSentEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoginState('sending');
    try {
      await requestMagicLink(email.trim());
      setSentEmail(email.trim());
      setLoginState('sent');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setLoginState('error');
    }
  };

  const goToEmail = () => {
    clearTokenError();
    setLoginState('email');
    setErrorMsg('');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[420px] shadow-lg border-border/50">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20">
              <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground tracking-tight leading-tight">MedicPro</span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest leading-tight">CRM Dashboard</span>
            </div>
          </div>

          {/* Email Input State */}
          {loginState === 'email' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center space-y-1.5">
                <h1 className="text-xl font-semibold text-foreground">Sign in to MedicPro CRM</h1>
                <p className="text-sm text-muted-foreground">Enter your email to receive a login link</p>
              </div>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="h-11"
              />
              <Button type="submit" className="w-full h-11 font-medium" disabled={!email.trim()}>
                <Mail className="h-4 w-4 mr-2" />
                Send Login Link
              </Button>
              <p className="text-xs text-center text-muted-foreground">Only authorized team members can sign in</p>
            </form>
          )}

          {/* Sending State */}
          {loginState === 'sending' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Sending login link…</p>
            </div>
          )}

          {/* Success State */}
          {loginState === 'sent' && (
            <div className="text-center space-y-4 py-2">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-success" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold text-foreground">Check your email!</h2>
                <p className="text-sm text-muted-foreground">
                  We've sent a login link to <span className="font-medium text-foreground">{sentEmail}</span>. The link expires in 15 minutes.
                </p>
              </div>
              <button onClick={goToEmail} className="text-sm text-primary hover:underline inline-flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Try a different email
              </button>
            </div>
          )}

          {/* Error State */}
          {loginState === 'error' && (
            <div className="text-center space-y-4 py-2">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-destructive" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold text-foreground">Link expired or invalid</h2>
                <p className="text-sm text-muted-foreground">{errorMsg || 'This login link has expired or was already used.'}</p>
              </div>
              <Button onClick={goToEmail} variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Request a new link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
